import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('WorkspacesController (e2e)', () => {
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

  describe('POST /v1/workspaces - 워크스페이스 생성 API 테스트', () => {
    it('프론트엔드 형식(workspace_name)으로 요청 시 400 에러 발생 (필드명 불일치)', () => {
      // 프론트엔드에서 보내는 형식: workspace_name, workspace_color
      return request(app.getHttpServer())
        .post('/v1/workspaces')
        .set('Authorization', 'Bearer mock-token')
        .send({
          workspace_name: '테스트 워크스페이스',
          description: '테스트 설명',
          workspace_color: '#6366f1',
        })
        .expect(400) // forbidNonWhitelisted: true로 인해 400 에러
        .expect((res) => {
          console.log('프론트엔드 형식 응답:', JSON.stringify(res.body, null, 2));
          // workspace_name과 workspace_color가 허용되지 않는 필드라는 에러 메시지 기대
        });
    });

    it('백엔드 기대 형식(name)으로 요청 시 401 에러 (인증 필요)', () => {
      // 백엔드에서 기대하는 형식: name
      return request(app.getHttpServer())
        .post('/v1/workspaces')
        .set('Authorization', 'Bearer mock-token')
        .send({
          name: '테스트 워크스페이스',
          description: '테스트 설명',
        })
        .expect(401) // 인증 필요
        .expect((res) => {
          console.log('백엔드 형식 응답:', JSON.stringify(res.body, null, 2));
        });
    });

    it('인증 없이 요청 시 401 에러', () => {
      return request(app.getHttpServer())
        .post('/v1/workspaces')
        .send({
          name: '테스트 워크스페이스',
        })
        .expect(401);
    });
  });
});
