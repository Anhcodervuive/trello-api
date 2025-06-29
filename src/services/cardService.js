import { cardModel } from '~/models/cardModel';
import { columnModel } from '~/models/columnModel';
import { CloudinaryProvider } from '~/providers/cloudinaryProvider';
import { CLOUDINARY_FOLDER_SAVE_CARDS_COVER } from '~/utils/constants';
import { extractPublicIdFromUrl } from '~/utils/mapper';

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

const update = async (cardId, reqBody, cardCoverFile) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      const cardNeedToUpdate = await cardModel.findOneById(cardId)
      if (cardNeedToUpdate.cover) {
        const publicImageId = extractPublicIdFromUrl(cardNeedToUpdate.cover)
        await CloudinaryProvider.deleteImage(publicImageId)
      }
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, CLOUDINARY_FOLDER_SAVE_CARDS_COVER)
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      })
    } else {
      updatedCard = await cardModel.update(cardId, updateData)
    }


    return updatedCard
  } catch (error) {
    throw error
  }
}


export const cardService = {
  createNew,
  update
}