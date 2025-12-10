import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  const apiPrefix = process.env.API_PREFIX || 'v1';
  app.setGlobalPrefix(apiPrefix);

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('AGIT Solution API')
    .setDescription(`
      AGIT(AI-Guided Interactive Training) 솔루션의 REST API 명세서입니다.
      
      ## 개요
      AGIT은 AI 프롬프트 기반 창업 및 AI 리터러시 학습 시스템입니다.
      
      ## 주요 기능
      - User: 회원가입, 로그인, 프로필 관리
      - Workspace: 워크스페이스 생성/관리 (System 허가 Owner만 생성 가능)
      - Course: 코스 생성/관리, Expert/Participant 초대
      - Module: 모듈 생성/관리, 팀으로 내보내기
      - Team: 팀 생성, Participant 역할 배정 (CEO/CPO/CMO/COO/CTO/CFO)
      - Task: 태스크 관리, Guide/Prompt/Product 3탭 구조
      - Comments: 태스크별 코멘트 (채팅형 우측 패널)
      
      ## 상태 전이 (Task Status)
      Todo -> Doing -> Review -> Done
      
      ## 역할 계층
      - Workspace: Owner, Member
      - Course: Manager, Expert, Participant
      - Team: CEO, CPO, CMO, COO, CTO, CFO
    `)
    .setVersion('1.1.0')
    .setContact('AGIT Support', '', 'support@agit.io')
    .addBearerAuth()
    .addServer('https://api.agit.io/v1', 'Production server')
    .addServer('https://staging-api.agit.io/v1', 'Staging server')
    .addServer(`http://localhost:${process.env.PORT || 5000}/${apiPrefix}`, 'Local server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`🚀 AGIT Server is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
}

bootstrap();
