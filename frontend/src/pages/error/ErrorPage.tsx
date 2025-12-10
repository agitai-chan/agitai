import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui';

export function ErrorPage() {
  const error = useRouteError();

  let errorMessage = '알 수 없는 오류가 발생했습니다.';
  let errorStatus = '';

  if (isRouteErrorResponse(error)) {
    errorStatus = `${error.status}`;
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
        </div>
        {errorStatus && (
          <p className="text-6xl font-bold text-red-600">{errorStatus}</p>
        )}
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          오류가 발생했습니다
        </h1>
        <p className="mt-2 max-w-md text-slate-600">{errorMessage}</p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
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
