import express from 'express';
import exitHook from 'async-exit-hook';
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb';
import { env } from './config/environment';
import { APIs_v1 } from './routes/v1';

const START_SERVER = () => {
  const app = express();

  const hostname = env.APP_HOST;
  const port = env.APP_PORT;

  app.use(express.json())

  app.use('/v1', APIs_v1);

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