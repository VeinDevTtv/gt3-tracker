import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfilePanel from '../components/ProfilePanel';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
      console.error('Failed to log out', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-card rounded-lg p-6 shadow-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">You are not logged in. Please sign in to view your profile.</p>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <Button variant="outline" onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <ProfilePanel />
        </div>
        
        <div className="bg-card rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{currentUser?.email}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Account created</p>
              <p className="font-medium">{currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/settings')}
            >
              Settings
            </Button>
            
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 