import express from 'express';
import { StatusCodes } from 'http-status-codes'

import { BoardRoute } from './boardRoute'
import { ColumnRoute } from './columnRoute'
import { CardRoute } from './cardRoute'
import { userRoute } from './userRoute'
import { invitationRoute } from './invitationRoute';

const Router = express.Router()

Router.get('/status', (req, res) =>
  res.status(StatusCodes.OK).json({
    message: 'api-v1'
  })
)
Router.use('/boards', BoardRoute);

Router.use('/columns', ColumnRoute);

Router.use('/cards', CardRoute);

Router.use('/users', userRoute);

Router.use('/invitations', invitationRoute)

export const APIs_v1 = Router;