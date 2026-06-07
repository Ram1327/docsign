import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <p className="text-8xl font-bold text-gray-200">404</p>
      <h1 className="text-xl font-semibold text-gray-800">Page not found</h1>
      <p className="text-sm text-gray-500">
        The page you're looking for doesn't exist.
      </p>
      <Link to="/dashboard" className="btn-primary mt-2">
        Go to Dashboard
      </Link>
    </div>
  );
}
