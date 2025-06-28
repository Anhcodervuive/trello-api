import express from 'express';
import { boardValidation } from '~/validations/boardValidation';
import { boardController } from '~/controllers/boardController';
import { authMiddleware } from '~/middlewares/authMiddleware';

const Router = express.Router()

Router.use(authMiddleware.isAuthorized)

Router.route('/')
  .get(boardController.getBoards)
  .post(boardValidation.createNew, boardController.createNew);

Router.route('/:id')
  .get(boardController.getDetails)
  .put(boardValidation.update, boardController.update)

// APi hỗ trợ việc duy chuyển card giữa các column khác nhau trong board
Router.route('/supports/moving_card')
  .put(boardValidation.moveCardTodifferentColumn, boardController.moveCardTodifferentColumn)

export const BoardRoute = Router;