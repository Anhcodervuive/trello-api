import { StatusCodes } from "http-status-codes"
import { userModel } from "~/models/userModel"
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import ApiError from "~/utils/ApiError"
import { pickUser } from "~/utils/formatter"
import { CLOUDINARY_FOLDER_SAVE_USERS_AVT, WEBSITE_DOMAIN } from "~/utils/constants"
import { sendRegisterEmail } from "~/providers/smtpMailerProvider"
import { JwtProvider } from "~/providers/JwtProvider"
import { env } from "~/config/environment"
import { CloudinaryProvider } from "~/providers/cloudinaryProvider"
import { extractPublicIdFromUrl } from "~/utils/mapper"

const createNew = async (reqBody) => {
  try {
    // Kiểm tra xem email đã tồn tại hay chưa ?
    const existedUser = await userModel.findOneByEmail(reqBody.email)
    if (existedUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exists!')
    }
    // Tạo data để lưu vào database
    // Nếu email là dudo@gmail.com thì sẽ lấy được 'dudo'
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), // Tham số thứ 2 là độ phức tạp, giá trị càng cao thì băm mật khẩu càng lâu
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }

    // Thực hiện lưu thông tin user vào database
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)
    // Gửi email cho người dùng xác thực tài khoản
    const verifyCationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`

    await sendRegisterEmail({
      to: getNewUser.email,
      subject: 'Chào mừng Bạn đến với Trello-API',
      context: {
        heading: 'Xin chào Bạn!',
        message: 'Cảm ơn bạn đã đăng ký. Hãy bắt đầu trải nghiệm quản lý công việc cùng Trello Clone.',
        actionText: 'Xác thực',
        actionUrl: verifyCationLink
      }
    })
      .then(res => {
        console.log('Gửi mail thành công', res);
      })
      .catch(err => {
        console.log('Gửi mai không thành công', err);
      });
    // return trả về dữ liệu cho phía controller
    return pickUser(getNewUser)
  } catch (error) {
    console.log(error);
    throw error
  }
}

const verifyAccount = async (reqBody) => {
  try {
    const existedUser = await userModel.findOneByEmail(reqBody.email)

    if (!existedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    if (existedUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account has already active!')
    }

    if (reqBody.token !== existedUser.verifyToken) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid')
    }

    const updateData = {
      isActive: true,
      verifyToken: null
    }

    const updatedUser = await userModel.update(existedUser._id, updateData)

    return pickUser(updatedUser)
  } catch (error) {
    console.log(error);
    throw error
  }
}

const login = async (reqBody) => {
  try {
    const existedUser = await userModel.findOneByEmail(reqBody.email)

    if (!existedUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    }

    if (!existedUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is not actived!')
    }

    if (!bcryptjs.compareSync(reqBody.password, existedUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your email or password is not incorrect!')
    }

    const userInfo = {
      _id: existedUser._id,
      email: existedUser.email
    }

    const accessToken = await JwtProvider.generateToken(userInfo, env.ACCESS_TOKEN_SECRET_SIGNATURE, env.ACCESS_TOKEN_LIFE)

    const refreshToken = await JwtProvider.generateToken(userInfo, env.REFRESH_TOKEN_SECRET_SIGNATURE, env.REFRESH_TOKEN_LIFE)

    return {
      accessToken,
      refreshToken,
      ...pickUser(existedUser)
    }
  } catch (error) {
    console.log(error);
    throw error
  }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    const refreshTokenDecoded = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)

    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    const accessToken = await JwtProvider.generateToken(userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
    )

    return accessToken
  } catch (error) {
    console.log(error);
    throw error
  }
}

const update = async (userId, reqBody, userAvtFile) => {
  try {
    const existedUser = await userModel.findOneById(userId)
    if (!existedUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found!')
    if (!existedUser) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your account is not active')

    let updatedUser = {}

    if (reqBody.current_password && reqBody.new_password) {
      if (!bcryptjs.compareSync(reqBody.current_password, existedUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your current password is not incorrect!')
      }
      updatedUser = await userModel.update(userId, {
        password: bcryptjs.hashSync(reqBody.new_password, 8),
      })
    } else if (userAvtFile) {
      if (existedUser.avatar) {
        const publicImageId = extractPublicIdFromUrl(existedUser.avatar)
        await CloudinaryProvider.deleteImage(publicImageId)
      }
      const uploadResult = await CloudinaryProvider.streamUpload(userAvtFile.buffer, CLOUDINARY_FOLDER_SAVE_USERS_AVT)
      console.log(uploadResult);
      updatedUser = await userModel.update(userId, {
        avatar: uploadResult.secure_url
      })
    }
    else {
      updatedUser = await userModel.update(userId, reqBody)
    }

    return pickUser(updatedUser)
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}