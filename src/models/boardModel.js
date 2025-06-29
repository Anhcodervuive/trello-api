import Joi from 'joi';
import { ObjectId } from 'mongodb';
import { GET_DB } from '~/config/mongodb';
import { BOARD_TYPES } from '~/utils/constants';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';
import { columnModel } from './columnModel';
import { cardModel } from './cardModel';
import { pagingSkipValue } from '~/utils/algorithms';

const BOARD_COLLECTION_NAME = 'boards';
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  description : Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(...Object.values(BOARD_TYPES)).required(),
  slug: Joi.string().required().min(3).trim().strict(),
  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false),
});

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
}

const createNew = async (userId, data) => {
  try {
    const validData = await validateBeforeCreate(data);
    const newBoardToAdd = {
      ...validData,
      ownerIds: [new ObjectId(userId)]
    }
    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(newBoardToAdd);
    return createdBoard;
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const board = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(id),
    });
    return board;
  }
  catch (error) {
    throw new Error(error)
  }
}

const getDetails = async (userId, boardId) => {
  try {
    const queryConditions = [
      { _id: new ObjectId(boardId), },
      { _destroy: false },
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]

    const board = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      {
        $match: { $and: queryConditions }
      },
      {
        $lookup: {
          from: columnModel.COLUMN_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'columns',
        }
      },
      {
        $lookup: {
          from: cardModel.CARD_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'cards',
        }
      }
    ]).toArray();
    return board[0] || null;
  }
  catch (error) {
    throw new Error(error)
  }
}

// Nhiệm vụ là push giá trị columnId vào mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(column.boardId)
      },
      {
        $push : {
          columnOrderIds: new ObjectId(column._id)
        }
      },
      {
        returnDocument : 'after'
      }
    )

    return result;
  } catch (error) {
    throw new Error(error)
  }
}

// Lấy 1 phần tử columnId ra khỏi mảng columnOrderIds
const pullColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(column.boardId)
      },
      {
        $pull : {
          columnOrderIds: new ObjectId(column._id)
        }
      },
      {
        returnDocument : 'after'
      }
    )

    return result;
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, updatedData) => {
  try {
    Object.keys(updatedData).forEach(field => {
      if (INVALID_UPDATE_FIELDS.includes(field)) {
        delete updatedData[field]
      }
    })
    if (updatedData.columnOrderIds) {
      updatedData.columnOrderIds = updatedData.columnOrderIds.map(_id => (new ObjectId(_id)))
    }
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(boardId)
      },
      {
        $set: updatedData
      },
      {
        returnDocument : 'after'
      }
    )

    return result;
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemPerPage) => {
  try {
    const queryConditions = [
      // Điều kiện 1: Board chưa bị xóa
      { _destroy: false },
      // Điều kiện 02: cái thằng userId đang thực hiện request này nó phải thuộc vào một trong 2 cái mảng ownerIds hoặc memberIds,
      // sử dụng toán tử $all của mongodb
      { $or: [
        { ownerIds: { $all: [new ObjectId(userId)] } },
        { memberIds: { $all: [new ObjectId(userId)] } }
      ] }
    ]

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } },
        // sort title của board theo A-Z (mặc định sẽ bị chữ B hoa đứng trước chữ a thường (theo chuẩn bảng mã ASCII)
        { $sort: { title: 1, } },
        // $facet để sử lý nhiều luồng trong 1 query
        { $facet: {
        // Luồng 01: query boards
          'queryBoards' : [
            { $skip: pagingSkipValue(page, itemPerPage) },
            { $limit: itemPerPage }
          ],
          // Luồng 02: query đếm tổng số lượng bảng ghi board trong db rồi trả về. Hứng kết quả vào countedAllBoards
          'queryTotalBoards': [{ $count: 'countedAllBoards' }]
        } }
      ],
      // Khai báo thêm thuộc tính collation locale 'en' để fix vụ chữ B hoa và a thường ở trên
      { collation: { locale: 'en' } }
    ).toArray()

    const res = query[0]

    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  pullColumnOrderIds,
  update,
  getBoards
}