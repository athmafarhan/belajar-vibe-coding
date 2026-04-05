import { Elysia } from 'elysia';
import { db } from './db';
import { users } from './db/schema';
import { usersRoute } from './routes/users-route';

const app = new Elysia()
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