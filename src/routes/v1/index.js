import express from 'express';
import { StatusCodes } from 'http-status-codes'

import { BoardRoute } from './boardRoute'
import { ColumnRoute } from './columnRoute'
import { CardRoute } from './cardRoute'

const Router = express.Router()

Router.get('/status', (req, res) =>
  res.status(StatusCodes.OK).json({
    message: 'api-v1'
  })
)
Router.use('/boards', BoardRoute);

Router.use('/columns', ColumnRoute);

// Router.use('/cards', BoardRoute);

export const APIs_v1 = Router;