import express from 'express';
import cors from 'cors';
import exitHook from 'async-exit-hook';
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb';
import { env } from './config/environment';
import { APIs_v1 } from './routes/v1';
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware';
import { corsOptions } from './config/cors';
import cookieParser from 'cookie-parser';

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

  app.listen(port, hostname, () => {
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