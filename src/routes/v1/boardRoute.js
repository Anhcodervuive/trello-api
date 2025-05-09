import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { boardValidation } from '~/validations/boardValidation';

const Router = express.Router()

Router.route('/')
  .get((req, res) => res.status(StatusCodes.OK).json({ message: 'GET: API get list boards' }))
  .post(boardValidation.createNew, (req, res) => res.status(StatusCodes.OK).json({ message: 'POST: API get create new board' }));

export const BoardRoute = Router;