import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/user/signup (POST)', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/v1/user/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          password_confirm: 'Password123!',
          real_name: '테스트',
          nick_name: '테스터',
          terms_all_agree: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user_id).toBeDefined();
          expect(res.body.email).toBe('test@example.com');
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/v1/user/signup')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          password_confirm: 'Password123!',
          real_name: '테스트',
          nick_name: '테스터',
          terms_all_agree: true,
        })
        .expect(400);
    });

    it('should fail with password mismatch', () => {
      return request(app.getHttpServer())
        .post('/v1/user/signup')
        .send({
          email: 'test2@example.com',
          password: 'Password123!',
          password_confirm: 'DifferentPassword123!',
          real_name: '테스트',
          nick_name: '테스터2',
          terms_all_agree: true,
        })
        .expect(400);
    });
  });

  describe('/user/login (POST)', () => {
    it('should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/v1/user/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });
  });
});
