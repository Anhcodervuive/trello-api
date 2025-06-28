import { slugify } from '~/utils/formatter';
import { StatusCodes } from 'http-status-codes';

import { boardModel } from '~/models/boardModel';
import ApiError from '~/utils/ApiError';
import { cloneDeep } from 'lodash';
import { columnModel } from '~/models/columnModel';
import { cardModel } from '~/models/cardModel';
import { DEFAULT_ITEMS_PER_PAGE, DEFAULT_PAGE } from '~/utils/constants';

const createNew = async (payload) => {
  try {
    const newBoard = {
      ...payload,
      slug: slugify(payload.title),
    };

    const createdBoard = await boardModel.createNew(newBoard);

    const board = await boardModel.findOneById(createdBoard.insertedId.toString());

    return board;
  } catch (error) {
    throw error;
  }
}

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId);

    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found');
    }

    const resBoard = cloneDeep(board);
    resBoard.columns.forEach(column => {
      // Trong mongodb objectId có hỗ trợ hàm equal để so sánh
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id));
    });
    delete resBoard.cards;
    return resBoard;
  } catch (error) {
    throw error;
  }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) {
    throw error;
  }
}


const moveCardTodifferentColumn = async (reqBody) => {
  try {
    // Cập nhật lại mảng cardOrderIds của column ban đầu chứa nó
    const { currentCardId, prevColumnId, prevCardOrderIds, nextColumnId, nextCardOrderIds } = reqBody
    await columnModel.update(prevColumnId, {
      cardOrderIds: prevCardOrderIds,
      updatedAt: Date.now()
    })
    // Cập nhật lại mảng cardOrderIds của column tiếp theo
    await columnModel.update(nextColumnId, {
      cardOrderIds: nextCardOrderIds,
      updatedAt: Date.now()
    })
    // Cập nhật lại trường columnId mới của card vừa kéo
    await cardModel.update(currentCardId, {
      columnId: nextColumnId,
      updatedAt: Date.now()
    })

    return { updateResult: 'success' }
  } catch (error) {
    throw error;
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    // Nếu không tồn tại page hoặc itemsPerPage từ phía FE thì BE sẽ cần phải luôn gán giá trị mặc định
    if (!page) page = DEFAULT_PAGE;
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE;

    const results = await boardModel.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10)
    );

    return results;
  } catch (error) {
    throw error;
  }
};


export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardTodifferentColumn,
  getBoards
}