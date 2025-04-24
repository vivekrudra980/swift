import { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import { getDb } from './db/mongo';
import { User, Post, Comment } from './models';
import * as http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const JSONPlaceholderBaseUrl = process.env.JSON_PLACEHOLDER_URL!;

async function getJsonPlaceholderData<T>(endpoint: string): Promise<T> {
  return new Promise((resolve, reject) => {
    http
      .get(`${JSONPlaceholderBaseUrl}${endpoint}`, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function loadData(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    const db = getDb();
    console.log('Loading data: inside try block...');
    // Fetching users
    const users: User[] = await getJsonPlaceholderData<User[]>('/users');

    for (const user of users) {
      // Fetching posts for each user
      const posts: Post[] = await getJsonPlaceholderData<Post[]>(
        `/posts?userId=${user.id}`
      );
      user.posts = posts;

      for (const post of posts) {
        // Fetching comments for each post
        const comments: Comment[] = await getJsonPlaceholderData<Comment[]>(
          `/comments?postId=${post.id}`
        );
        post.comments = comments;

        // Inserting comments into the database
        await db.collection<Comment>('comments').insertMany(comments);
      }

      // Inserting posts into the database
      await db.collection<Post>('posts').insertMany(posts);

      // Inserting user into the database
      await db.collection<User>('users').insertOne(user);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({})); // Empty response as required
  } catch (error: any) {
    console.error('Error loading data:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        message: 'Failed to load data',
        error: error.message,
      })
    );
  }
}

async function deleteUsers(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    const db = getDb();
    await db.collection('users').deleteMany({});
    await db.collection('posts').deleteMany({});
    await db.collection('comments').deleteMany({});

    res.writeHead(204); // No Content
    res.end();
  } catch (error: any) {
    console.error('Error deleting users:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        message: 'Failed to delete users',
        error: error.message,
      })
    );
  }
}

async function deleteUser(
  req: IncomingMessage,
  res: ServerResponse,
  userId: string
): Promise<void> {
  try {
    if (!userId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User ID is required' }));
      return;
    }

    const db = getDb();

    // deleting the user
    const deleteResult = await db
      .collection('users')
      .deleteOne({ id: parseInt(userId, 10) });

    if (deleteResult.deletedCount === 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
      return;
    }

    // Delete related posts and comments
    await db.collection('posts').deleteMany({ userId: parseInt(userId, 10) });
    await db.collection('comments').deleteMany({
      postId: {
        $in: (
          await db
            .collection('posts')
            .find({ userId: parseInt(userId, 10) })
            .toArray()
        ).map((post) => post.id),
      },
    });

    res.writeHead(204); // No Content
    res.end();
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({ message: 'Failed to delete user', error: error.message })
    );
  }
}

async function getUser(
  req: IncomingMessage,
  res: ServerResponse,
  userId: string
): Promise<void> {
  try {
    if (!userId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User ID is required' }));
      return;
    }

    const db = getDb();

    // Retrieve the user from the database
    const user = await db
      .collection<User>('users')
      .findOne({ id: parseInt(userId, 10) });

    if (!user) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User not found' }));
      return;
    }

    // Retrieve the user's posts from the database
    const posts = await db
      .collection<Post>('posts')
      .find({ userId: parseInt(userId, 10) })
      .toArray();
    user.posts = posts;

    // Retrieve comments for each post
    for (const post of posts) {
      post.comments = await db
        .collection<Comment>('comments')
        .find({ postId: post.id })
        .toArray();
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
  } catch (error: any) {
    console.error('Error getting user:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({ message: 'Failed to get user', error: error.message })
    );
  }
}

async function putUser(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  try {
    const db = getDb();
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const newUser: User = JSON.parse(body);

        // Checking if the user already exists
        const existingUser = await db
          .collection('users')
          .findOne({ id: newUser.id });
        if (existingUser) {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'User already exists' }));
          return;
        }

        // Inserting the new user
        await db.collection<User>('users').insertOne(newUser);

        res.writeHead(201, {
          'Content-Type': 'application/json',
          Link: `/users/${newUser.id}`,
        });
        res.end(JSON.stringify(newUser));
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid JSON format' }));
      }
    });
  } catch (error: any) {
    console.error('Error putting user:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({ message: 'Failed to put user', error: error.message })
    );
  }
}

export const handleRoutes = async (
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;

  console.log(`${method} ${path}`);

  switch (true) {
    case path === '/load' && method === 'GET':
      await loadData(req, res);
      break;
    case path === '/users' && method === 'DELETE':
      await deleteUsers(req, res);
      break;
    case path.startsWith('/users/') && method === 'DELETE':
      const userIdToDelete = path.split('/')[2];
      await deleteUser(req, res, userIdToDelete);
      break;
    case path.startsWith('/users/') && method === 'GET':
      const userIdToGet = path.split('/')[2];
      await getUser(req, res, userIdToGet);
      break;
    case path === '/users' && method === 'PUT':
      await putUser(req, res);
      break;
    default:
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Route not found' }));
  }
};
