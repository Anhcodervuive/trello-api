import { StatusCodes } from 'http-status-codes';
import ApiError from '~/utils/ApiError';

const createNew = async (req, res, next) => {
  try {
    // return res.status(StatusCodes.CREATED).json({
    //   message: 'POST: API create new board'
    // });
    throw new ApiError(StatusCodes.NOT_FOUND, 'Error from boardController');
  } catch (error) {
    next(error);
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    //   errors: error.message,
    // })
  }
}

export const boardController = {
  createNew
}
