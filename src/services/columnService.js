import { columnModel } from '~/models/columnModel';
import { boardModel } from '~/models/boardModel';

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

export const columnService = {
  createNew,
}