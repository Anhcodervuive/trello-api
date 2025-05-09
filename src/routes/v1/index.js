import express from 'express';
import { StatusCodes } from 'http-status-codes'

import { BoardRoutes } from './boardRoutes'

const Router = express.Router()

Router.get('/status', (req, res) =>
  res.status(StatusCodes.OK).json({
    message: 'api-v1'
  })
)
Router.use('/boards', BoardRoutes);

export const APIs_v1 = Router;