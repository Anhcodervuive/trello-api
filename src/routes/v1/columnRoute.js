import express from 'express';
import { columnValidation } from '~/validations/columnValidation';
import { columnController } from '~/controllers/columnController';
import { authMiddleware } from '~/middlewares/authMiddleware';

const Router = express.Router()

Router.use(authMiddleware.isAuthorized)

Router.route('/')
  .post(columnValidation.createNew, columnController.createNew);

Router.route('/:id')
  .put(columnValidation.update, columnController.update)
  .delete(columnValidation.deleteColumn, columnController.deleteColumn)

export const ColumnRoute = Router;