import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

// third party
import { motion } from 'framer-motion';

// project imports
import ViewOnlyAlert from './ViewOnlyAlert';
import AuthLoginBackground from './AuthLoginBackground';
import Logo from 'ui-component/Logo';
import AuthFooter from 'ui-component/cards/AuthFooter';
import useAuth from 'hooks/useAuth';
import { APP_AUTH } from 'config';

// A mapping of auth types to dynamic imports
const authLoginImports = {
  jwt: () => import('./jwt/AuthLogin'),
  auth0: () => import('./auth0/AuthLogin')
};

// ================================|| AUTH - ERP LOGIN ||================================ //

export default function Login() {
  const { isLoggedIn } = useAuth();
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const [AuthLoginComponent, setAuthLoginComponent] = useState(null);
  const [isFaceMode, setIsFaceMode] = useState(false);

  const [searchParams] = useSearchParams();
  const authParam = searchParams.get('auth') || '';

  useEffect(() => {
    const selectedAuth = authParam || APP_AUTH;
    const importAuthLoginComponent = authLoginImports[selectedAuth];

    if (importAuthLoginComponent) {
      importAuthLoginComponent()
        .then((module) => setAuthLoginComponent(() => module.default))
        .catch((error) => {
          console.error(`Error loading ${selectedAuth} AuthLogin`, error);
        });
    }
  }, [authParam]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        p: { xs: 2, sm: 3 }
      }}
    >
      <AuthLoginBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 480 }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3.5 },
            width: '100%',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {!isLoggedIn && <ViewOnlyAlert />}

          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Link to="#" aria-label="logo">
              <Logo height={100} />
            </Link>
          </Box>

          <Box sx={{ width: '100%' }}>
            {AuthLoginComponent && (
              <AuthLoginComponent onFaceModeChange={(isFace) => setIsFaceMode(isFace)} />
            )}
          </Box>

          <Divider sx={{ my: 3, width: '100%' }} />

          <Box sx={{ mt: 3, width: '100%' }}>
            <AuthFooter />
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}
