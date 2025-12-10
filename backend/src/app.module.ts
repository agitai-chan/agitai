import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';

// Config
import appConfig from './config/app.config';
import supabaseConfig from './config/supabase.config';
import aiConfig from './config/ai.config';

// Common
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

// Core Services
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { CoursesModule } from './modules/courses/courses.module';
import { ModulesModule } from './modules/modules/modules.module';
import { TeamsModule } from './modules/teams/teams.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { GuidesModule } from './modules/guides/guides.module';
import { PromptsModule } from './modules/prompts/prompts.module';
import { ProductsModule } from './modules/products/products.module';
import { CommentsModule } from './modules/comments/comments.module';
import { AiModule } from './modules/ai/ai.module';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, supabaseConfig, aiConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Core Services
    PrismaModule,
    SupabaseModule,

    // Feature Modules
    AuthModule,
    UsersModule,
    WorkspacesModule,
    CoursesModule,
    ModulesModule,
    TeamsModule,
    TasksModule,
    GuidesModule,
    PromptsModule,
    ProductsModule,
    CommentsModule,
    AiModule,
    FilesModule,
  ],
  providers: [
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global Transform Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    // Global Logging Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
