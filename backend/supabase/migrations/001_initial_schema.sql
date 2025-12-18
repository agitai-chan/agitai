-- =====================================================
-- AGIT Database Schema for Supabase
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- =====================================================

-- =====================================================
-- 1. ENUMS 생성
-- =====================================================

-- WorkspaceRole enum
DO $$ BEGIN
    CREATE TYPE "WorkspaceRole" AS ENUM ('Owner', 'Member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CourseRole enum
DO $$ BEGIN
    CREATE TYPE "CourseRole" AS ENUM ('Manager', 'Expert', 'Participant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- TeamRole enum
DO $$ BEGIN
    CREATE TYPE "TeamRole" AS ENUM ('CEO', 'CPO', 'CMO', 'COO', 'CTO', 'CFO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- TaskStatus enum
DO $$ BEGIN
    CREATE TYPE "TaskStatus" AS ENUM ('Todo', 'Doing', 'Review', 'Done');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- TabType enum
DO $$ BEGIN
    CREATE TYPE "TabType" AS ENUM ('guide', 'prompt', 'product');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ReviewAction enum
DO $$ BEGIN
    CREATE TYPE "ReviewAction" AS ENUM ('approve', 'reject', 'request_revision');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CourseType enum
DO $$ BEGIN
    CREATE TYPE "CourseType" AS ENUM (
        'startup_basic',
        'startup_advanced',
        'ai_literacy',
        'design_thinking',
        'business_model',
        'market_research',
        'pitch_deck'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. TABLES 생성
-- =====================================================

-- Users 테이블
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "real_name" TEXT NOT NULL,
    "nick_name" TEXT NOT NULL,
    "profile_image" TEXT,
    "phone_number" TEXT,
    "is_system_admin" BOOLEAN NOT NULL DEFAULT false,
    "login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Workspaces 테이블
CREATE TABLE IF NOT EXISTS "workspaces" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo_image" TEXT,
    "owner_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- Workspace Members 테이블
CREATE TABLE IF NOT EXISTS "workspace_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'Member',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- Workspace Invites 테이블
CREATE TABLE IF NOT EXISTS "workspace_invites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "max_uses" INTEGER NOT NULL DEFAULT 100,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_invites_pkey" PRIMARY KEY ("id")
);

-- Courses 테이블
CREATE TABLE IF NOT EXISTS "courses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "manager_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "course_type" "CourseType" NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- Course Members 테이블
CREATE TABLE IF NOT EXISTS "course_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "course_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "CourseRole" NOT NULL DEFAULT 'Participant',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_members_pkey" PRIMARY KEY ("id")
);

-- Course Invites 테이블
CREATE TABLE IF NOT EXISTS "course_invites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "course_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "role" "CourseRole" NOT NULL DEFAULT 'Participant',
    "max_uses" INTEGER NOT NULL DEFAULT 100,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_invites_pkey" PRIMARY KEY ("id")
);

-- Modules 테이블
CREATE TABLE IF NOT EXISTS "modules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "course_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- Teams 테이블
CREATE TABLE IF NOT EXISTS "teams" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "course_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- Team Members 테이블
CREATE TABLE IF NOT EXISTS "team_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "team_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'CEO',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- Tasks 테이블
CREATE TABLE IF NOT EXISTS "tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "module_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'Todo',
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- Team Tasks 테이블
CREATE TABLE IF NOT EXISTS "team_tasks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "module_id" UUID NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'Todo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_tasks_pkey" PRIMARY KEY ("id")
);

-- Guides 테이블
CREATE TABLE IF NOT EXISTS "guides" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID,
    "team_task_id" UUID,
    "content" TEXT,
    "last_editor_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guides_pkey" PRIMARY KEY ("id")
);

-- Guide Attachments 테이블
CREATE TABLE IF NOT EXISTS "guide_attachments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guide_id" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guide_attachments_pkey" PRIMARY KEY ("id")
);

-- Prompts 테이블
CREATE TABLE IF NOT EXISTS "prompts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "team_task_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "prompt_text" TEXT NOT NULL,
    "ai_response" TEXT,
    "ai_model" TEXT NOT NULL DEFAULT 'gpt-4',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "max_tokens" INTEGER NOT NULL DEFAULT 2048,
    "tokens_used" INTEGER,
    "execution_time_ms" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompts_pkey" PRIMARY KEY ("id")
);

-- AI Feedbacks 테이블
CREATE TABLE IF NOT EXISTS "ai_feedbacks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "prompt_id" UUID NOT NULL,
    "clarity_score" INTEGER,
    "specificity_score" INTEGER,
    "context_score" INTEGER,
    "format_score" INTEGER,
    "piq_score" INTEGER,
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "improvements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ai_comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_feedbacks_pkey" PRIMARY KEY ("id")
);

-- Products 테이블
CREATE TABLE IF NOT EXISTS "products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "team_task_id" UUID NOT NULL,
    "content" TEXT,
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "last_editor_id" UUID,
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "review_action" "ReviewAction",
    "review_score" INTEGER,
    "review_rank" INTEGER,
    "review_feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- Product Versions 테이블
CREATE TABLE IF NOT EXISTS "product_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "version_memo" TEXT,
    "editor_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_versions_pkey" PRIMARY KEY ("id")
);

-- Comments 테이블
CREATE TABLE IF NOT EXISTS "comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "task_id" UUID,
    "team_task_id" UUID,
    "tab_type" "TabType" NOT NULL,
    "prompt_user_id" UUID,
    "author_id" UUID NOT NULL,
    "comment_text" TEXT NOT NULL,
    "parent_comment_id" UUID,
    "mentioned_users" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- =====================================================
-- 3. UNIQUE CONSTRAINTS
-- =====================================================

-- Users
ALTER TABLE "users" ADD CONSTRAINT "users_email_key" UNIQUE ("email");
ALTER TABLE "users" ADD CONSTRAINT "users_nick_name_key" UNIQUE ("nick_name");

-- Workspace Members
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_user_id_key" UNIQUE ("workspace_id", "user_id");

-- Workspace Invites
ALTER TABLE "workspace_invites" ADD CONSTRAINT "workspace_invites_token_key" UNIQUE ("token");

-- Course Members
ALTER TABLE "course_members" ADD CONSTRAINT "course_members_course_id_user_id_key" UNIQUE ("course_id", "user_id");

-- Course Invites
ALTER TABLE "course_invites" ADD CONSTRAINT "course_invites_token_key" UNIQUE ("token");

-- Teams
ALTER TABLE "teams" ADD CONSTRAINT "teams_course_id_name_key" UNIQUE ("course_id", "name");

-- Team Members
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_user_id_key" UNIQUE ("team_id", "user_id");

-- Team Tasks
ALTER TABLE "team_tasks" ADD CONSTRAINT "team_tasks_task_id_team_id_key" UNIQUE ("task_id", "team_id");

-- Guides
ALTER TABLE "guides" ADD CONSTRAINT "guides_task_id_key" UNIQUE ("task_id");
ALTER TABLE "guides" ADD CONSTRAINT "guides_team_task_id_key" UNIQUE ("team_task_id");

-- AI Feedbacks
ALTER TABLE "ai_feedbacks" ADD CONSTRAINT "ai_feedbacks_prompt_id_key" UNIQUE ("prompt_id");

-- Products
ALTER TABLE "products" ADD CONSTRAINT "products_team_task_id_key" UNIQUE ("team_task_id");

-- Product Versions
ALTER TABLE "product_versions" ADD CONSTRAINT "product_versions_product_id_version_number_key" UNIQUE ("product_id", "version_number");

-- =====================================================
-- 4. FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Workspaces
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_id_fkey" 
    FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Workspace Members
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_fkey" 
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Workspace Invites
ALTER TABLE "workspace_invites" ADD CONSTRAINT "workspace_invites_workspace_id_fkey" 
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Courses
ALTER TABLE "courses" ADD CONSTRAINT "courses_workspace_id_fkey" 
    FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "courses" ADD CONSTRAINT "courses_manager_id_fkey" 
    FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Course Members
ALTER TABLE "course_members" ADD CONSTRAINT "course_members_course_id_fkey" 
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "course_members" ADD CONSTRAINT "course_members_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Course Invites
ALTER TABLE "course_invites" ADD CONSTRAINT "course_invites_course_id_fkey" 
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Modules
ALTER TABLE "modules" ADD CONSTRAINT "modules_course_id_fkey" 
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Teams
ALTER TABLE "teams" ADD CONSTRAINT "teams_course_id_fkey" 
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Team Members
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_fkey" 
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tasks
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_module_id_fkey" 
    FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Team Tasks
ALTER TABLE "team_tasks" ADD CONSTRAINT "team_tasks_task_id_fkey" 
    FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_tasks" ADD CONSTRAINT "team_tasks_team_id_fkey" 
    FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_tasks" ADD CONSTRAINT "team_tasks_module_id_fkey" 
    FOREIGN KEY ("module_id") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Guides
ALTER TABLE "guides" ADD CONSTRAINT "guides_task_id_fkey" 
    FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "guides" ADD CONSTRAINT "guides_team_task_id_fkey" 
    FOREIGN KEY ("team_task_id") REFERENCES "team_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "guides" ADD CONSTRAINT "guides_last_editor_id_fkey" 
    FOREIGN KEY ("last_editor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Guide Attachments
ALTER TABLE "guide_attachments" ADD CONSTRAINT "guide_attachments_guide_id_fkey" 
    FOREIGN KEY ("guide_id") REFERENCES "guides"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Prompts
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_team_task_id_fkey" 
    FOREIGN KEY ("team_task_id") REFERENCES "team_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prompts" ADD CONSTRAINT "prompts_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AI Feedbacks
ALTER TABLE "ai_feedbacks" ADD CONSTRAINT "ai_feedbacks_prompt_id_fkey" 
    FOREIGN KEY ("prompt_id") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Products
ALTER TABLE "products" ADD CONSTRAINT "products_team_task_id_fkey" 
    FOREIGN KEY ("team_task_id") REFERENCES "team_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "products" ADD CONSTRAINT "products_last_editor_id_fkey" 
    FOREIGN KEY ("last_editor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Product Versions
ALTER TABLE "product_versions" ADD CONSTRAINT "product_versions_product_id_fkey" 
    FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_versions" ADD CONSTRAINT "product_versions_editor_id_fkey" 
    FOREIGN KEY ("editor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Comments
ALTER TABLE "comments" ADD CONSTRAINT "comments_task_id_fkey" 
    FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_team_task_id_fkey" 
    FOREIGN KEY ("team_task_id") REFERENCES "team_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" 
    FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_fkey" 
    FOREIGN KEY ("parent_comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =====================================================
-- 5. INDEXES
-- =====================================================

-- Modules
CREATE INDEX IF NOT EXISTS "modules_course_id_order_index_idx" ON "modules"("course_id", "order_index");

-- Tasks
CREATE INDEX IF NOT EXISTS "tasks_module_id_order_index_idx" ON "tasks"("module_id", "order_index");

-- Prompts
CREATE INDEX IF NOT EXISTS "prompts_team_task_id_user_id_idx" ON "prompts"("team_task_id", "user_id");
CREATE INDEX IF NOT EXISTS "prompts_created_at_idx" ON "prompts"("created_at" DESC);

-- Comments
CREATE INDEX IF NOT EXISTS "comments_task_id_tab_type_idx" ON "comments"("task_id", "tab_type");
CREATE INDEX IF NOT EXISTS "comments_team_task_id_tab_type_idx" ON "comments"("team_task_id", "tab_type");

-- =====================================================
-- 6. UPDATED_AT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at column
CREATE OR REPLACE TRIGGER update_users_updated_at
    BEFORE UPDATE ON "users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_workspaces_updated_at
    BEFORE UPDATE ON "workspaces"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON "courses"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_modules_updated_at
    BEFORE UPDATE ON "modules"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON "teams"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON "tasks"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_team_tasks_updated_at
    BEFORE UPDATE ON "team_tasks"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_guides_updated_at
    BEFORE UPDATE ON "guides"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_products_updated_at
    BEFORE UPDATE ON "products"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON "comments"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) - Optional
-- =====================================================

-- Enable RLS on all tables (uncomment if needed)
-- ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "workspaces" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "workspace_members" ENABLE ROW LEVEL SECURITY;
-- ... etc

-- =====================================================
-- DONE! 테이블 생성 완료
-- =====================================================

-- 확인 쿼리
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
