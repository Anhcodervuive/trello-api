import express from 'express';
import exitHook from 'async-exit-hook';
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb';
import { mapOrder } from '~/utils/sorts.js';
import { env } from './config/environment';

const START_SERVER = () => {
  const app = express();

  const hostname = env.APP_HOST;
  const port = env.APP_PORT;

  app.get('/', async (req, res) => {
    // Test Absolute import mapOrder
    console.log(mapOrder(
      [
        { id: 'id-1', name: 'One' },
        { id: 'id-2', name: 'Two' },
        { id: 'id-3', name: 'Three' },
        { id: 'id-4', name: 'Four' },
        { id: 'id-5', name: 'Five' }
      ],
      ['id-5', 'id-4', 'id-2', 'id-3', 'id-1'],
      'id'
    ))
    res.end('<h1>Hello World!</h1><hr>')
  })

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