import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      await resetPassword(email);
      setMessage('Please check your email for password reset instructions');
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Reset Password</h1>
          <p className="text-muted-foreground">We'll send you instructions to reset your password</p>
        </div>
        
        {error && (
          <div className="bg-destructive/10 p-3 rounded-md flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {message && (
          <div className="bg-green-100 p-3 rounded-md flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{message}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Reset Password'}
          </Button>
        </form>
        
        <div className="mt-4 text-center space-y-2 text-sm">
          <p>
            <Link to="/login" className="font-medium text-primary-color hover:underline">
              Back to Sign in
            </Link>
          </p>
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary-color hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 