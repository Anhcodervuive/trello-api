import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().required().min(3).max(50).trim().strict(),
  })

  try {
    // console.log(req.body);
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
    // Nếu cần duy chuyển card qua board khác thì mới cần
    // boardId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    title: Joi.string().min(3).max(50).trim().strict(),
    cardOrderIds : Joi.array().items(
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
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(err).message
    })
  }
}

const deleteColumn = async (req, res, next) => {
  const correctCondition = Joi.object({
    id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  })

  try {
    await correctCondition.validateAsync(req.params);

    return next();
  } catch (err) {
    console.log(new Error(err));
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(err).message
    })
  }
}

export const columnValidation = {
  createNew,
  update,
  deleteColumn
}