import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { db } from './db';
import { users } from './db/schema';
import { usersRoute } from './routes/users-route';

export const app = new Elysia()
  .use(swagger({
    documentation: {
      info: {
        title: 'Belajar Vibe Coding API',
        version: '1.0.0',
        description: 'User Authentication API Documentation'
      },
      tags: [
        { name: 'Auth', description: 'Authentication related endpoints' }
      ]
    }
  }))
  .get('/', () => 'Hello from Elysia, Drizzle, and MySQL!')
  .use(usersRoute)
  .get('/users', async () => {
    const allUsers = await db.select().from(users);
    return allUsers;
  })
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);