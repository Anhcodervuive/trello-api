import { cardModel } from '~/models/cardModel';
import { columnModel } from '~/models/columnModel';

const createNew = async (payload) => {
  try {
    const newCard = {
      ...payload,
    };

    const createdCard = await cardModel.createNew(newCard);

    const getNewCard = await cardModel.findOneById(createdCard.insertedId.toString());

    if (getNewCard) {
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard;
  } catch (error) {
    throw error;
  }
}

export const cardService = {
  createNew,
}