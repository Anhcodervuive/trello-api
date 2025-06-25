import express from 'express';
import { cardValidation } from '~/validations/cardValidation';
import { cardController } from '~/controllers/cardController';
import { authMiddleware } from '~/middlewares/authMiddleware';

const Router = express.Router()

Router.use(authMiddleware.isAuthorized)

Router.route('/')
  .post(cardValidation.createNew, cardController.createNew);

export const CardRoute = Router;