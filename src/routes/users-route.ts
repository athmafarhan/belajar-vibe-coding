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
      name: t.String(),
      email: t.String(),
      password: t.String()
    })
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
    })
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
  });
