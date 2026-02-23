import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface mesh-bg p-6">
      <Helmet>
        <title>Page Not Found - AutoRevive</title>
        <meta name="description" content="The page you're looking for doesn't exist or has been moved." />
      </Helmet>
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl flex items-center justify-center shadow-glow">
          <i className="fas fa-car text-4xl text-accent"></i>
        </div>
        <h1 className="text-7xl font-extrabold font-display text-accent mb-3">404</h1>
        <p className="text-xl text-slate-600 mb-2 font-bold font-display">Page not found</p>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard">
          <Button icon="fa-house">Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
