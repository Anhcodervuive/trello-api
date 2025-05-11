import { StatusCodes } from 'http-status-codes';

import { boardService } from '~/services/boardService';

const createNew = async (req, res, next) => {
  try {
    // return res.status(StatusCodes.CREATED).json({
    //   message: 'POST: API create new board'
    // });
    const createdBoard = await boardService.createNew(req.body);

    res.status(StatusCodes.CREATED).json({
      message: 'Board created successfully',
      data: createdBoard,
    });
  } catch (error) {
    next(error);
  }
}

export const boardController = {
  createNew
}
