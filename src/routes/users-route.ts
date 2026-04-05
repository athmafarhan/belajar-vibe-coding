import { Elysia, t } from 'elysia';
import { UsersService } from '../services/users-service';

export const usersRoute = new Elysia({ prefix: '/api/users' })
  .post('/', async ({ body, set }) => {
    const result = await UsersService.register(body);
    
    if (result.error) {
      set.status = 400;
      return result;
    }
    
    set.status = 201;
    return result;
  }, {
    body: t.Object({
      name: t.String({ maxLength: 255 }),
      email: t.String({ maxLength: 255 }),
      password: t.String({ maxLength: 255 })
    }),
    detail: {
      tags: ['Auth'],
      summary: 'Register a new user account'
    },
    response: {
      201: t.Object({ data: t.String() }),
      400: t.Object({ error: t.String() })
    }
  })
  .post('/login', async ({ body, set }) => {
    const result = await UsersService.login(body);

    if (result.error) {
      set.status = 401;
      return result;
    }

    set.status = 200;
    return result;
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
    }),
    detail: {
      tags: ['Auth'],
      summary: 'Login to existing user account'
    },
    response: {
      200: t.Object({ data: t.String() }),
      401: t.Object({ error: t.String() })
    }
  })
  .get('/current', async ({ headers, set }) => {
    const auth = headers['authorization'];
    if (!auth) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    const token = auth.replace('Bearer ', '');
    const result = await UsersService.getCurrent(token);

    if (result.error) {
      set.status = 401;
      return result;
    }

    set.status = 200;
    return result;
  }, {
    detail: {
      tags: ['Auth'],
      summary: 'Get current authorized user profil'
    },
    response: {
      200: t.Object({
        data: t.Object({
          id: t.Number(),
          name: t.String(),
          email: t.String(),
          createdAt: t.Date()
        })
      }),
      401: t.Object({ error: t.String() })
    }
  })
  .delete('/logout', async ({ headers, set }) => {
    const auth = headers['authorization'];
    if (!auth) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }

    const token = auth.replace('Bearer ', '');
    const result = await UsersService.logout(token);

    if (result.error) {
      set.status = 401;
      return result;
    }

    set.status = 200;
    return result;
  }, {
    detail: {
      tags: ['Auth'],
      summary: 'Logout current user session'
    },
    response: {
      200: t.Object({ data: t.String() }),
      401: t.Object({ error: t.String() })
    }
  });
