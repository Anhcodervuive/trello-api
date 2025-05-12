import { slugify } from '~/utils/formatter';
import { boardModel } from '~/models/boardModel';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';

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
    return board;
  } catch (error) {
    throw error;
  }
}

export const boardService = {
  createNew,
  getDetails
}