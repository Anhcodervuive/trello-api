import { columnModel } from '~/models/columnModel';

const createNew = async (payload) => {
  try {
    const newColumn = {
      ...payload,
    };

    const createdColumn = await columnModel.createNew(newColumn);

    const column = await columnModel.findOneById(createdColumn.insertedId.toString());

    return column;
  } catch (error) {
    throw error;
  }
}

export const columnService = {
  createNew,
}