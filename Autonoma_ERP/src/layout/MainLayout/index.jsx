import { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grow from '@mui/material/Grow';

// project imports
import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';
import HorizontalBar from './HorizontalBar';
import MainContentStyled from './MainContentStyled';
import Customization from '../Customization';
import Loader from 'ui-component/Loader';
import Transitions from 'ui-component/extended/Transitions';
import useAuth from 'hooks/useAuth';
import useNavigationTracker from 'hooks/useNavigationTracker';
import Alert from '@mui/material/Alert';

import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { RibbonProvider, useRibbon } from 'contexts/RibbonContext';
import { IconAlertCircle } from '@tabler/icons-react';

// ==============================|| MAIN LAYOUT ||============================== //

// Inner layout — can safely use useRibbon (inside provider)
function MainLayoutInner() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const {
    state: { borderRadius, container, miniDrawer, menuOrientation }
  } = useConfig();
  const { menuMaster, menuMasterLoading } = useGetMenuMaster();
  const drawerOpen = menuMaster?.isDashboardDrawerOpened;
  const { ribbonOpen } = useRibbon();
  const { licenseStatus, logoutCountdown } = useAuth();
  const [showLicenseAlert, setShowLicenseAlert] = useState(false);

  // Initialize navigation tracking
  useNavigationTracker();

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('license_alert_acknowledged') === 'true';
    if (licenseStatus?.isWarningPeriod && !isDismissed) {
      setShowLicenseAlert(true);
    }
  }, [licenseStatus]);

  const handleDismissLicenseAlert = () => {
    setShowLicenseAlert(false);
    sessionStorage.setItem('license_alert_acknowledged', 'true');
  };

  useEffect(() => {
    handlerDrawerOpen(!miniDrawer);
  }, [miniDrawer]);

  useEffect(() => {
    downMD && handlerDrawerOpen(false);
  }, [downMD]);

  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downMD;

  // horizontal menu-list bar : drawer
  const menu = useMemo(() => (isHorizontal ? <HorizontalBar /> : <Sidebar />), [isHorizontal]);

  if (menuMasterLoading) return <Loader />;

  return (
    <Box sx={{ display: 'flex' }}>
      {/* header */}
      <AppBar enableColorOnDark position="fixed" color="inherit" elevation={0} sx={{ bgcolor: 'background.default' }}>
        <Toolbar sx={{ p: isHorizontal ? 1.25 : 2 }}>
          <Header />
        </Toolbar>
      </AppBar>

      {logoutCountdown !== null && (
        <Box
          sx={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 6000,
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
            px: 4,
            py: 1.5,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1e1e2f 0%, #11111d 100%)',
            color: '#fff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            animation: 'slideInDown 0.5s ease-out',
            '@keyframes slideInDown': {
              '0%': { transform: 'translateX(-50%) translateY(-100%)', opacity: 0 },
              '100%': { transform: 'translateX(-50%) translateY(0)', opacity: 1 }
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '12px', bgcolor: 'rgba(244, 67, 54, 0.2)', color: '#f44336' }}>
             <IconAlertCircle size={28} stroke={2.5} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'inherit', mb: 0.2 }}>
               Terminate Session : <span style={{ color: '#f44336' }}>{logoutCountdown}s</span>
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7, color: 'inherit', fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
               The system license is no longer valid. Kindly save your work immediately!
            </Typography>
          </Box>
        </Box>
      )}

      <Grow in={showLicenseAlert} unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 5000,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 1.25,
            borderRadius: '16px',
            bgcolor: 'rgba(255, 171, 0, 0.9)',
            backdropFilter: 'blur(8px)',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(255, 171, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transformOrigin: 'bottom right'
          }}
        >
          <IconAlertCircle size={22} stroke={2} />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1, color: 'inherit' }}>
              License Expiry Alert
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
              Your plan expires in <strong>{licenseStatus.daysLeft} days</strong>. Renew soon to continue uninterrupted access.
            </Typography>
          </Box>
          <Button
            size="small"
            variant="contained"
            sx={{
              bgcolor: '#fff',
              color: 'warning.main',
              fontWeight: 800,
              borderRadius: '10px',
              px: 2,
              '&:hover': { bgcolor: 'grey.100' }
            }}
            onClick={handleDismissLicenseAlert}
          >
            Got it
          </Button>
        </Box>
      </Grow>

      {/* menu / drawer */}
      {menu}

      {/* main content */}
      <MainContentStyled {...{ borderRadius, menuOrientation, open: drawerOpen, ribbonOpen }}>
        <Container
          maxWidth={false}
          sx={{ px: 0, minHeight: 'calc(100vh - 128px)', display: 'flex', flexDirection: 'column', maxWidth: 'none' }}
        >
          {/* breadcrumb */}
          {/* <Breadcrumbs /> */}
          <Outlet />
          <Footer />
        </Container>
      </MainContentStyled>
      <Customization />
    </Box>
  );
}

// Outer wrapper provides the ribbon context
export default function MainLayout() {
  return (
    <RibbonProvider>
      <MainLayoutInner />
    </RibbonProvider>
  );
}
