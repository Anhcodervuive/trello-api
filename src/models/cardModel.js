import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),

  cover: Joi.string().default(null),

  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  // Dữ liệu comments của Card chúng ta sẽ học cách nhúng – embedded vào bản ghi Card luôn như dưới đây
  comments: Joi.array().items({
    userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    userAvatar: Joi.string(),
    userDisplayName: Joi.string(),
    content: Joi.string(),
    // Chỗ này lưu ý vì dùng hàm $push để thêm comment nên không set default Date.now luôn giống như khi create được.
    commentedAt: Joi.date().timestamp()
  }).default([]),


  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'boardId']

const validateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);
    const newCardToAdd = {
      ...validData,
      boardId: new ObjectId(validData.boardId),
      columnId: new ObjectId(validData.columnId),
    }
    const createdCard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne(newCardToAdd);
    return createdCard;
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const column = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({
      _id: new ObjectId(id),
    });
    return column;
  }
  catch (error) {
    throw new Error(error)
  }
}

const update = async (cardId, updatedData) => {
  try {
    Object.keys(updatedData).forEach(field => {
      if (INVALID_UPDATE_FIELDS.includes(field)) {
        delete updatedData[field]
      }
    })

    // Biến đổi những dữ liệu liên quan đến objectId
    if (updatedData.columnId) {
      updatedData.columnId = new ObjectId(updatedData.columnId)
    }

    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(cardId)
      },
      {
        $set: updatedData
      },
      {
        returnDocument : 'after' // Sẽ trả về kết quả mới sau khi cập nhật
      }
    )

    return result;
  } catch (error) {
    throw new Error(error)
  }
}

const deleteManyByColumnId = async (columnId) => {
  try {
    const column = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany(
      { columnId: new ObjectId(columnId) }
    )
    return column;
  }
  catch (error) {
    throw new Error(error)
  }
}

/**
 * Đây một phần tử comment vào đầu mảng comments!
 * – Trong JS, ngược lại với push (thêm phần tử vào cuối mảng) sẽ là unshift (thêm phần tử vào đầu mảng)
 * – Nhưng trong mongodb hiện tại chỉ có $push – mặc định đẩy phần tử vào cuối mảng.
 * * Dĩ nhiên cứ lưu comment mới vào cuối cũng được, nhưng nay sẽ học cách để thêm phần tử vào đầu mảng
 *   trong mongodb.
 * * Vẫn dùng $push, nhưng bọc data vào Array để trong $each và chỉ định $position: 0
 */
const unshiftNewComment = async (cardId, commentData) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $push: { comments: { $each: [commentData], $position: 0 } } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) { throw new Error(error) }
}

export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  deleteManyByColumnId,
  unshiftNewComment
}