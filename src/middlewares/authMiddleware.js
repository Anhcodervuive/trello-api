import { StatusCodes } from "http-status-codes"
import { env } from "~/config/environment"
import { JwtProvider } from "~/providers/JwtProvider"
import ApiError from "~/utils/ApiError"

const isAuthorized = async (req, res, next) => {
  const clientAccessToken = req.cookies?.accessToken
  if (!clientAccessToken) {
    return next(new ApiError(StatusCodes.GONE, 'Unauthorized! (token not found)'))
  }

  try {
    const accessTokenDecoded = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)

    req.jwtDecoded = accessTokenDecoded

    next()
  } catch (error) {
    console.log(error);
    // Sử dụng 1 mã lỗi 410 để trả về nếu accessToken hết hạn, trình duyệt se gọi refreshToken
    if (error?.message?.includes('jwt expired')) {
      return next(new ApiError(StatusCodes.GONE, 'Need to refresh token'))
    }

    // Nếu accessToken không hợp lệ vì bất kỳ điều gì khác hết hạn thì trả về 401 để client đăng xuất
    return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}