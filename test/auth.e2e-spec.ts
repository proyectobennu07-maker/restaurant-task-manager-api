import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth E2E (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await prismaService.assignment.deleteMany({});
    await prismaService.task.deleteMany({});
    await prismaService.user.deleteMany({});
    await prismaService.role.deleteMany({});
  });

  describe('POST /auth/login', () => {
    let testRole: any;
    let testUser: any;

    beforeEach(async () => {
      // Create test role
      testRole = await prismaService.role.create({
        data: { name: 'ADMIN' },
      });

      // Hash the password BEFORE creating the user
      const hashedPassword = await bcrypt.hash('password123', 10);

      // Create test user
      testUser = await prismaService.user.create({
        data: {
          name: 'Test Admin',
          email: 'admin@test.com',
          password: hashedPassword,
          roleId: testRole.id,
        },
      });
    });

    it('should return 200 with access_token when credentials are valid', async () => {
      // Arrange
      const loginDto = {
        email: 'admin@test.com',
        password: 'password123',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
    });

    it('should return 401 when email does not exist', async () => {
      // Arrange
      const loginDto = {
        email: 'notexist@test.com',
        password: 'password123',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto);

      // Assert
      expect(response.status).toBe(401);
    });

    it('should return 401 when password is incorrect', async () => {
      // Arrange
      const loginDto = {
        email: 'admin@test.com',
        password: 'wrongpassword',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto);

      // Assert
      expect(response.status).toBe(401);
    });

    it('should return 400 when email is missing', async () => {
      // Arrange
      const loginDto = {
        password: 'password123',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto);

      // Assert
      expect(response.status).toBe(400);
    });

    it('should return 400 when password is missing', async () => {
      // Arrange
      const loginDto = {
        email: 'admin@test.com',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto);

      // Assert
      expect(response.status).toBe(400);
    });

    it('should return 400 when email format is invalid', async () => {
      // Arrange
      const loginDto = {
        email: 'invalid-email',
        password: 'password123',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto);

      // Assert
      expect(response.status).toBe(400);
    });

    it('should return 400 when password is less than 6 characters', async () => {
      // Arrange
      const loginDto = {
        email: 'admin@test.com',
        password: 'short',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto);

      // Assert
      expect(response.status).toBe(400);
    });

    it('should return JWT token that can be used to authorize endpoints', async () => {
      // Arrange
      const loginDto = {
        email: 'admin@test.com',
        password: 'password123',
      };

      // Act - Get token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto);

      const token = loginResponse.body.access_token;

      // Act - Use token to access protected endpoint
      const protectedResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(protectedResponse.status).toBe(200);
    });

    it('should return 401 when accessing protected endpoint without token', async () => {
      // Act
      const response = await request(app.getHttpServer()).get('/users');

      // Assert
      expect(response.status).toBe(401);
    });
  });
});
