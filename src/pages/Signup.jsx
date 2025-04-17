import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Stack, Typography, Box, Divider, Alert } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { Discord as DiscordIcon } from '@mui/icons-material/Language'; // Using Language as placeholder for Discord
import porscheLogo from '../assets/porsche-logo.png';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, googleSignIn, discordSignIn, error, setError } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!email || !password || !username) {
      return setError('Please fill in all fields');
    }
    
    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }
    
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }
    
    try {
      setError('');
      setLoading(true);
      await signup(email, password, username);
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      // Don't need to setError here as the signup function already does it
    } finally {
      setLoading(false);
    }
  }
  
  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      await googleSignIn();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign in error:', error);
      // Don't need to setError here as the googleSignIn function already does it
    } finally {
      setLoading(false);
    }
  }
  
  async function handleDiscordSignIn() {
    try {
      setError('');
      setLoading(true);
      await discordSignIn();
      navigate('/dashboard');
    } catch (error) {
      console.error('Discord sign in error:', error);
      // Don't need to setError here as the discordSignIn function already does it
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 3,
        backgroundColor: 'background.default'
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          width: '100%',
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: 'background.paper'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <img src={porscheLogo} alt="Porsche Logo" style={{ height: 60 }} />
        </Box>
        
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Create Account
        </Typography>
        
        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
          Start tracking your journey to your dream Porsche
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Input
              id="username"
              type="text"
              placeholder="Username"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disableUnderline
              sx={{ 
                p: 1.5, 
                bgcolor: 'action.hover', 
                borderRadius: 1 
              }}
            />
            
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disableUnderline
              sx={{ 
                p: 1.5, 
                bgcolor: 'action.hover', 
                borderRadius: 1 
              }}
            />
            
            <Input
              id="password"
              type="password"
              placeholder="Password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disableUnderline
              sx={{ 
                p: 1.5, 
                bgcolor: 'action.hover', 
                borderRadius: 1 
              }}
            />
            
            <Input
              id="passwordConfirm"
              type="password"
              placeholder="Confirm password"
              fullWidth
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              disableUnderline
              sx={{ 
                p: 1.5, 
                bgcolor: 'action.hover', 
                borderRadius: 1 
              }}
            />
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              Sign Up
            </Button>
          </Stack>
        </form>
        
        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="textSecondary">
            OR
          </Typography>
        </Divider>
        
        <Stack spacing={2}>
          <Button
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={loading}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Continue with Google
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<DiscordIcon />}
            onClick={handleDiscordSignIn}
            disabled={loading}
            fullWidth
            sx={{ py: 1.5 }}
          >
            Continue with Discord
          </Button>
        </Stack>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Typography component="span" variant="body2" color="primary">
                Sign in
              </Typography>
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
} 