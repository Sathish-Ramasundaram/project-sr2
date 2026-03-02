import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="mt-3 text-lg">Page not found</p>

      <Link to="/" className="mt-4 text-blue-600 underline">
        Go back home
      </Link>
    </div>
  );
}

export default NotFoundPage;