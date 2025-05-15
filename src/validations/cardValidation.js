import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
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

export const cardValidation = {
  createNew
}