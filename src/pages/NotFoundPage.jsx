import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background-dark text-text-dark-primary flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-2xl text-text-dark-secondary mt-4">Page Not Found</p>
      <p className="mt-2">Sorry, the page you are looking for does not exist.</p>
      <Link to="/dashboard" className="mt-8 px-6 py-3 rounded-md text-lg font-medium text-white bg-primary hover:bg-primary/90">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
