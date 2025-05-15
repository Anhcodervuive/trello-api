import { cardModel } from '~/models/cardModel';

const createNew = async (payload) => {
  try {
    const newCard = {
      ...payload,
    };

    const createdCard = await cardModel.createNew(newCard);

    const card = await cardModel.findOneById(createdCard.insertedId.toString());

    return card;
  } catch (error) {
    throw error;
  }
}

export const cardService = {
  createNew,
}