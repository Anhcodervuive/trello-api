import { MongoClient, ServerApiVersion } from 'mongodb';

import { env } from '~/config/environment';

const MONGODB_URL = env.MONGODB_URI
const DATABASE_NAME = env.DATABASE_NAME;
// Khởi tạo một đối tượng trelloDatabaseInstance là null (vì chúng ta chưa connect)
let trelloDatabaseInstance = null;

// Khởi tạo một đối tượng Client instance để connect tới mongodb
const mongoClientInstance = new MongoClient(MONGODB_URL, {
//  Lưu ý : cái serverApi có từ mongo > 5.0.0, có thể không cần dùng đến nó, còn nếu dùng nó là chúng ta sẽ
//  chỉ định một cái stable api version của mongodb
//  đọc thêm https://www.mongodb.com/docs/drivers/node/current/fundamentals/stable-api/
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Kết nối tới csdl
export const CONNECT_DB = async () => {
  await mongoClientInstance.connect();

  trelloDatabaseInstance = mongoClientInstance.db(DATABASE_NAME);
}

export const GET_DB = () => {
  if (!trelloDatabaseInstance) {
    throw new Error('Must connect to database first!');
  } else {
    return trelloDatabaseInstance;
  }
}

export const CLOSE_DB = async () => {
  console.log('Disconnecting from Mongodb Cloud Atlas...');
  await mongoClientInstance.close();
}