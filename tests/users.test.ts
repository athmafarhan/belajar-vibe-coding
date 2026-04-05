import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { app } from '../src/index';
import { db } from '../src/db';
import { users, sessions } from '../src/db/schema';
import { sql } from 'drizzle-orm';

describe('Users API', () => {
  // Clear database before and after tests
  const cleanup = async () => {
    await db.delete(sessions);
    await db.delete(users);
  };

  beforeAll(async () => {
    await cleanup();
  });

  afterAll(async () => {
    await cleanup();
  });

  describe('POST /api/users (Registration)', () => {
    it('should register a new user successfully', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );

      expect(response.status).toBe(201);
      const body: any = await response.json();
      expect(body.data).toBe('OK');
    });

    it('should fail to register with an existing email', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Another User',
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Email sudah terdaftar');
    });

    it('should fail to register with a name longer than 255 characters', async () => {
      const longName = 'a'.repeat(300);
      const response = await app.handle(
        new Request('http://localhost/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: longName,
            email: 'long@example.com',
            password: 'password123',
          }),
        })
      );
      expect(response.status).toBe(422);
    });
  });

  describe('POST /api/users/login', () => {
    it('should login successfully with correct credentials', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBeDefined();
      expect(typeof body.data).toBe('string');
    });

    it('should fail to login with wrong credentials', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'wrongpassword',
          }),
        })
      );

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Email atau password salah');
    });
  });

  describe('GET /api/users/current', () => {
    let token: string;

    beforeAll(async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
      const body = await response.json();
      token = body.data;
    });

    it('should get current user profile with valid token', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data.email).toBe('test@example.com');
      expect(body.data.name).toBe('Test User');
      expect(body.data.id).toBeDefined();
    });

    it('should fail to get profile with invalid token', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
          headers: { Authorization: 'Bearer invalid-token' },
        })
      );

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
    });

    it('should fail to get profile without Authorization header', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
        })
      );

      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
    });
  });

  describe('DELETE /api/users/logout', () => {
    let token: string;

    beforeAll(async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
          }),
        })
      );
      const body = await response.json();
      token = body.data;
    });

    it('should logout successfully with valid token', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/logout', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.data).toBe('OK');

      // Verify session is invalidated
      const currentResponse = await app.handle(
        new Request('http://localhost/api/users/current', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      expect(currentResponse.status).toBe(401);
    });

    it('should fail to logout with invalid token', async () => {
      const response = await app.handle(
        new Request('http://localhost/api/users/logout', {
          method: 'DELETE',
          headers: { Authorization: 'Bearer already-logged-out-or-invalid' },
        })
      );

      expect(response.status).toBe(401);
    });
  });
});
