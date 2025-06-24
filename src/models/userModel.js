import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'

const USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin'
}

// Define Collection (name & schema)
const USER_COLLECTION_NAME = 'users'
const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
  password: Joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE),

  // Username cắt ra từ email sẽ có khả năng không unique
  username: Joi.string().required().trim().strict(),
  displayName: Joi.string().required().trim().strict(),
  avatar: Joi.string().default(null),
  role: Joi.string().valid(USER_ROLES.ADMIN, USER_ROLES.CLIENT).default(USER_ROLES.CLIENT),

  isActive: Joi.boolean().default(false),
  verifyToken: Joi.string(),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'email', 'username']

const validateBeforeCreate = async (data) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, {
    abortEarly: false,
  });
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data);

    const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData);
    return createdUser;
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (id) => {
  try {
    const user = await GET_DB().collection(USER_COLLECTION_NAME).findOne({
      _id: new ObjectId(id),
    });
    return user;
  }
  catch (error) {
    throw new Error(error)
  }
}

const findOneByEmail = async (email) => {
  try {
    const user = await GET_DB().collection(USER_COLLECTION_NAME).findOne({
      email
    });
    return user;
  }
  catch (error) {
    throw new Error(error)
  }
}

const update = async (userId, updatedData) => {
  try {
    Object.keys(updatedData).forEach(field => {
      if (INVALID_UPDATE_FIELDS.includes(field)) {
        delete updatedData[field]
      }
    })

    // Biến đổi những dữ liệu liên quan đến objectId
    if (updatedData.columnId) {
      updatedData.columnId = new ObjectId(updatedData.columnId)
    }

    const result = await GET_DB().collection(USER_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(userId)
      },
      {
        $set: updatedData
      },
      {
        returnDocument : 'after' // Sẽ trả về kết quả mới sau khi cập nhật
      }
    )

    return result;
  } catch (error) {
    throw new Error(error)
  }
}

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findOneByEmail,
  update,
}