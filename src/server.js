import express from 'express';
import cors from 'cors';
import exitHook from 'async-exit-hook';
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb';
import { env } from './config/environment';
import { APIs_v1 } from './routes/v1';
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware';
import { corsOptions } from './config/cors';
import cookieParser from 'cookie-parser';

// Xử lý socket real-time với gói socket.io
// https://socket.io/get-started/chat/#integrating-socketio
import http from 'http'
import Socket from 'socket.io'
import { inviteUserToBoardSocket } from './sockets/inviteUserToBoardSocket';


const START_SERVER = () => {
  const app = express();

  const hostname = env.APP_HOST;
  const port = env.APP_PORT;

  // Fix cache from disk của Express js
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store'),
    next()
  })

  app.use(cookieParser())
  app.use(cors(corsOptions));
  app.use(express.json())

  app.use('/v1', APIs_v1);

  // Middleware for handling errors
  app.use(errorHandlingMiddleware);

  // Tạo 1 server mới bọc thằng app của express để làm real-time socket.io
  const server = http.createServer(app)
  // Khởi tạo biến io với server và cors
  const io = Socket(server, {
    cors: corsOptions
  })

  io.on('connection', (socket) => {
    console.log('a user connected');
    inviteUserToBoardSocket(socket)
  })

  server.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello, I am running at http://${ hostname }:${ port }/`);
  })

  exitHook(() => {
    CLOSE_DB();
  })
}

CONNECT_DB()
  .then(() => console.log('Connected to Mongodb Cloud Atlas!'))
  .then(() => START_SERVER())
  .catch(err => {
    console.log(err);
    process.exit(0);
  })