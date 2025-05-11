import { slugify } from '~/utils/formatter';
import { boardModel } from '~/models/boardModel';

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

export const boardService = {
  createNew
}