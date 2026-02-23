import { BrowserRouter, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { AppRoutes } from '@/routes';

// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          gutter={12}
          containerStyle={{ top: 20, right: 20 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#F8FAFC',
              fontSize: '0.875rem',
              borderRadius: '0.75rem',
              padding: '14px 18px',
              maxWidth: '420px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              border: '1px solid rgba(66, 133, 244, 0.2)',
              fontFamily: 'inherit',
            },
            success: {
              iconTheme: { primary: '#34A853', secondary: '#F8FAFC' },
            },
            error: {
              iconTheme: { primary: '#EA4335', secondary: '#F8FAFC' },
              duration: 5000,
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
