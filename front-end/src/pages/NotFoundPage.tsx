import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-6xl font-extrabold text-rose-600">404</h1>
      <p className="text-xl font-semibold text-rose-500">Page not found</p>

      <Link to="/" className="mt-6 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700">
        Go back to SR Store
      </Link>
    </div>
  );
}

export default NotFoundPage;
