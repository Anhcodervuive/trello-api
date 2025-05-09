import express from 'express';
import { StatusCodes } from 'http-status-codes'

const Router = express.Router()

Router.route('/')
  .get((req, res) => res.status(StatusCodes.OK).json({ message: 'GET: API get list boards' }))
  .post((req, res) => res.status(StatusCodes.OK).json({ message: 'POST: API get create new board' }));

export const BoardRoutes = Router;