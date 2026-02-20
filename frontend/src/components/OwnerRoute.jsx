import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OwnerRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (!user || !user.profile?.is_owner) {
        // Redirect to dashboard if not owner
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default OwnerRoute;
