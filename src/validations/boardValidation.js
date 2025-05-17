import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';
import { BOARD_TYPES } from '~/utils/constants';

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
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(err).message
    })
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
  })

  try {
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true
    });

    return next();
  } catch (err) {
    console.log(new Error(err));
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(err).message
    })
  }
}

export const boardValidation = {
  createNew,
  update
}