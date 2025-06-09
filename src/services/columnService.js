import { columnModel } from '~/models/columnModel';
import { boardModel } from '~/models/boardModel';
import { cardModel } from '~/models/cardModel';
import ApiError from '~/utils/ApiError';
import { StatusCodes } from 'http-status-codes';

const createNew = async (payload) => {
  try {
    const newColumn = {
      ...payload,
    };

    const createdColumn = await columnModel.createNew(newColumn);
    // console.log(createdColumn.insertedId.toString());

    const getNewColumn = await columnModel.findOneById(createdColumn.insertedId.toString());

    if (getNewColumn) {
      getNewColumn.cards = []

      await boardModel.pushColumnOrderIds(getNewColumn)
    }

    return getNewColumn;
  } catch (error) {
    throw error;
  }
}

const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updateAt: Date.now()
    }

    const updatedColumn = await columnModel.update(columnId, updateData)

    return updatedColumn
  } catch (error) {
    throw error;
  }
}

const deleteColumn = async (columnId) => {
  try {
    const columnTarget = await columnModel.findOneById(columnId);

    if (!columnTarget) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found');
    }
    // Xóa column
    await columnModel.deleteOneById(columnId)
    // Xóa toàn bộ card thuộc column
    await cardModel.deleteManyByColumnId(columnId)

    // Xóa columnId khỏi columnOrderIds trong board
    await boardModel.pullColumnOrderIds(columnTarget)

    return { deleteResult : 'Column and its cards deleted successfully' }
  } catch (error) {
    throw error;
  }
}


export const columnService = {
  createNew,
  update,
  deleteColumn
}