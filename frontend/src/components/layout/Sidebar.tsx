import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Users,
  FolderKanban,
  ChevronRight,
  Star,
} from 'lucide-react';
import { useUIStore } from '@/stores';
import { cn } from '@/utils/cn';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  badge?: number;
}

function NavItem({ to, icon, label, collapsed, badge }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-50 text-primary-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
          collapsed && 'justify-center px-2'
        )
      }
    >
      {icon}
      {!collapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-100 px-1.5 text-xs font-medium text-primary-700">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { sidebarCollapsed } = useUIStore();
  const { workspaceId, courseId } = useParams();

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-40 h-[calc(100vh-64px)] border-r border-slate-200 bg-white transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <nav className="flex h-full flex-col p-3">
        {/* Main Navigation */}
        <div className="space-y-1">
          <NavItem
            to="/dashboard"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="대시보드"
            collapsed={sidebarCollapsed}
          />
          <NavItem
            to="/workspaces"
            icon={<Building2 className="h-5 w-5" />}
            label="워크스페이스"
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* Context-aware Navigation */}
        {workspaceId && (
          <>
            <div className="my-4 border-t border-slate-200" />
            
            {!sidebarCollapsed && (
              <div className="mb-2 px-3">
                <p className="text-xs font-medium uppercase text-slate-400">
                  현재 워크스페이스
                </p>
              </div>
            )}
            
            <div className="space-y-1">
              <NavItem
                to={`/workspace/${workspaceId}`}
                icon={<BookOpen className="h-5 w-5" />}
                label="코스"
                collapsed={sidebarCollapsed}
              />
              
              {courseId && (
                <>
                  <NavItem
                    to={`/workspace/${workspaceId}/course/${courseId}`}
                    icon={<FolderKanban className="h-5 w-5" />}
                    label="모듈 & 태스크"
                    collapsed={sidebarCollapsed}
                  />
                  <NavItem
                    to={`/workspace/${workspaceId}/course/${courseId}/teams`}
                    icon={<Users className="h-5 w-5" />}
                    label="팀"
                    collapsed={sidebarCollapsed}
                  />
                </>
              )}
            </div>
          </>
        )}

        {/* Favorites Section */}
        {!sidebarCollapsed && (
          <>
            <div className="my-4 border-t border-slate-200" />
            
            <div className="mb-2 flex items-center justify-between px-3">
              <p className="text-xs font-medium uppercase text-slate-400">
                즐겨찾기
              </p>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
            
            <div className="space-y-1">
              {/* 즐겨찾기 항목들 - 실제로는 API에서 가져옴 */}
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="truncate">스타트업 창업 101</span>
              </button>
            </div>
          </>
        )}

        {/* Bottom Section */}
        <div className="mt-auto">
          {!sidebarCollapsed && (
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">도움이 필요하신가요?</p>
              <p className="mt-1 text-xs text-slate-500">
                가이드와 문서를 확인해보세요.
              </p>
              <button className="mt-3 text-sm font-medium text-primary-600 hover:text-primary-700">
                도움말 센터 방문
              </button>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
