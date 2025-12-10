import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-primary-600">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-slate-900">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="mt-2 text-slate-600">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => window.history.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            이전 페이지
          </Button>
          <Link to="/dashboard">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              홈으로 이동
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
