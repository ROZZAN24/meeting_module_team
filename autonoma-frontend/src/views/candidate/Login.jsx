import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Stack
} from '@mui/material';
import Logo from 'ui-component/Logo';
import { motion } from 'framer-motion';

export default function CandidateLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenFromUrl = searchParams.get('token');

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    // If there is a token in the URL, save it to session storage
    if (tokenFromUrl) {
      sessionStorage.setItem('candidateToken', tokenFromUrl);
      setInfoMessage('Access token loaded from link. Please log in.');
    } else {
      const storedToken = sessionStorage.getItem('candidateToken');
      if (!storedToken) {
        setError('Verification token is missing! Please use the complete link sent to your email.');
      }
    }
  }, [tokenFromUrl]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const token = tokenFromUrl || sessionStorage.getItem('candidateToken');
    if (!token) {
      setError('Missing token! Please click the link sent to your email.');
      return;
    }

    if (!userId || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');
    setInfoMessage('');

    try {
      const response = await axios.post('/api/hra/applicants/portal/login', {
        token,
        userId,
        password
      });

      if (response.data && response.data.token) {
        // Save the valid candidate session token and details
        sessionStorage.setItem('candidateSessionToken', response.data.token);
        sessionStorage.setItem('candidateDetails', JSON.stringify(response.data.applicant));
        // Redirect to assessment page
        navigate('/candidate/assessment');
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Invalid login details or expired token window.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle, #0f172a 0%, #020617 100%)',
        p: 2
      }}
    >
      <Container maxWidth="xs">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            sx={{
              background: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 4,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Box sx={{ mb: 3 }}>
                <Logo height={80} />
              </Box>

              <Typography variant="h4" gutterBottom sx={{ color: '#f8fafc', fontWeight: 'bold' }}>
                Candidate Portal
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
                Please enter your credentials to access the Self-Assessment form.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2, background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5' }}>
                  {error}
                </Alert>
              )}

              {infoMessage && (
                <Alert severity="info" sx={{ mb: 2, background: 'rgba(59, 130, 246, 0.1)', color: '#93c5fd' }}>
                  {infoMessage}
                </Alert>
              )}

              <form onSubmit={handleLogin}>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="User ID (Enrollment Code)"
                    variant="outlined"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    InputLabelProps={{ style: { color: '#94a3b8' } }}
                    InputProps={{
                      style: { color: '#f8fafc', backgroundColor: 'rgba(15, 23, 42, 0.5)' }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                        '&:hover fieldset': { borderColor: '#3b82f6' }
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    helperText="Password is the last 4 digits of your registered mobile number"
                    FormHelperTextProps={{ style: { color: '#64748b' } }}
                    InputLabelProps={{ style: { color: '#94a3b8' } }}
                    InputProps={{
                      style: { color: '#f8fafc', backgroundColor: 'rgba(15, 23, 42, 0.5)' }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.1)' },
                        '&:hover fieldset': { borderColor: '#3b82f6' }
                      }
                    }}
                  />

                  <Button
                    fullWidth
                    type="submit"
                    disabled={loading || (!tokenFromUrl && !sessionStorage.getItem('candidateToken'))}
                    variant="contained"
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      textTransform: 'none',
                      backgroundColor: '#3b82f6',
                      '&:hover': { backgroundColor: '#2563eb' }
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Access Portal'}
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
