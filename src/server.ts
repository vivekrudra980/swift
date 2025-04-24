import * as http from 'http';
import { connectToMongo } from './db/mongo';
import { handleRoutes } from './routes';
import { IncomingMessage, ServerResponse } from 'http';

const PORT = 8080;

const requestListener = async (req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Content-Type', 'application/json');
  await handleRoutes(req, res);
};

const server = http.createServer(requestListener);

connectToMongo()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(
      'Failed to start server due to MongoDB connection error:',
      err
    );
  });
