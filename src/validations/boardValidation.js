import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import { BOARD_TYPES } from '~/utils/constants';
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators';
import ApiError from '~/utils/ApiError';

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    description : Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(...Object.values(BOARD_TYPES)).required(),
  })

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
    });

    return next();
  } catch (err) {
    console.log(new Error(err));
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(err).message))
  }
}

const update = async (req, res, next) => {
  // Đối với trường hợp update:
  // - dữ liệu không cần full
  // - allowUnkown cho phép đây một số trường nằm ngoài correctCondition đã định nghĩa
  const correctCondition = Joi.object({
    title: Joi.string().min(3).max(50).trim().strict(),
    description : Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(...Object.values(BOARD_TYPES)),
    columnOrderIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
  })

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    });

    return next();
  } catch (err) {
    console.log(new Error(err));
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(err).message))
  }
}

const moveCardTodifferentColumn = async (req, res, next) => {
  const correctCondition = Joi.object({
    currentCardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    prevCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ),
    nextColumnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    nextCardOrderIds: Joi.array().required().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    ),
  })

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
    });

    return next();
  } catch (err) {
    console.log(new Error(err));
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(err).message))
  }
}

export const boardValidation = {
  createNew,
  update,
  moveCardTodifferentColumn
}