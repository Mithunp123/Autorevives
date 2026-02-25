import { Navigate } from 'react-router-dom';

// The OTP-based flow now handles everything through /forgot-password.
// This route simply redirects back to that page.
export default function ResetPassword() {
    return <Navigate to="/forgot-password" replace />;
}
