import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { AppRoutes } from '@/routes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          gutter={12}
          containerStyle={{ top: 20, right: 20 }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#020617',
              color: '#F8FAFC',
              fontSize: '0.875rem',
              borderRadius: '1rem',
              padding: '14px 18px',
              maxWidth: '420px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
              border: '1px solid rgba(79,70,229,0.2)',
              fontFamily: '"Plus Jakarta Sans", Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#16A34A', secondary: '#F8FAFC' },
            },
            error: {
              iconTheme: { primary: '#DC2626', secondary: '#F8FAFC' },
              duration: 5000,
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
