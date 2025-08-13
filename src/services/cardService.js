/* eslint-disable no-useless-catch */
import { cardModel } from "~/models/cardModel";
import { columnModel } from "~/models/columnModel";
// import { cloneDeep } from "lodash";

const createNew = async (reqBody) => {
  try {
    const newCard = {
      ...reqBody,
    };

    const createdCard = await cardModel.createNew(newCard);

    const getNewCard = await cardModel.findOneById(createdCard.insertedId);

    if (getNewCard) {
      // Cập nhật lại mảng pushCardOrderIds trong collection columns
      await columnModel.pushCardOrderIds(getNewCard);
    }
    return getNewCard;
  } catch (error) {
    throw error;
  }
};

export const cardService = {
  createNew,
};
