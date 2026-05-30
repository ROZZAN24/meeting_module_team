import { useState, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';

// project imports
import LogoSection from '../LogoSection';
import SearchSection from './SearchSection';
import MobileSection from './MobileSection';
import ProfileSection from './ProfileSection';
import LocalizationSection from './LocalizationSection';
import MegaMenuSection from './MegaMenuSection';
import FullScreenSection from './FullScreenSection';
import NotificationSection from './NotificationSection';
import QuickAccessSection from './QuickAccessSection';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';
import useLookups from 'hooks/useLookups';
import axios from 'utils/axios';

// assets
import { IconMenu2, IconLogout, IconUser } from '@tabler/icons-react';
import SessionInfoBadge from 'ui-component/SessionInfoBadge';
import useAuth from 'hooks/useAuth';
import Tooltip from '@mui/material/Tooltip';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

export default function Header() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const {
    state: { menuOrientation }
  } = useConfig();
  const { menuMaster } = useGetMenuMaster();
  const { logout, user } = useAuth();
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
  };
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downMD;

  const [empDesig, setEmpDesig] = useState('');
  const [empDept, setEmpDept] = useState('');
  const { departments = [], designations = [] } = useLookups(['DEPARTMENTS', 'DESIGNATIONS']);

  useEffect(() => {
    if (user) {
      axios.get('/api/master/hr/employees')
        .then(res => {
          const allEmps = res.data || [];
          const empRecord = allEmps.find(e =>
            (e.id && user.empId && String(e.id) === String(user.empId)) ||
            (e.empCode && user.empCode && String(e.empCode) === String(user.empCode))
          );
          if (empRecord) {
            const getDesigName = (id, fallback) => String(designations.find(d => String(d.id) === String(id))?.designationName || fallback || '');
            const getDeptName = (id, fallback) => String(departments.find(d => String(d.id) === String(id))?.departmentName || fallback || '');

            const desig = empRecord.designationId ? getDesigName(empRecord.designationId, empRecord.designationName || empRecord.designation) : (user.designation?.name || user.designation || empRecord.designationName || empRecord.designation || '');
            const dept = empRecord.departmentId ? getDeptName(empRecord.departmentId, empRecord.departmentName || empRecord.department) : (user.department?.name || user.department || empRecord.departmentName || empRecord.department || '');

            setEmpDesig(desig);
            setEmpDept(dept);
          } else {
            setEmpDesig(user.designation?.name || user.designation || '');
            setEmpDept(user.department?.name || user.department || '');
          }
        })
        .catch(err => {
          console.error(err);
          setEmpDesig(user.designation?.name || user.designation || '');
          setEmpDept(user.department?.name || user.department || '');
        });
    }
  }, [user, departments, designations]);

  return (
    <>
      {/* logo & toggler button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2 }}>
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' } }}>
          <LogoSection />
        </Box>
        {!isHorizontal && (
          <Avatar
              variant="rounded"
              sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.mediumAvatar,
                overflow: 'hidden',
                transition: 'all .2s ease-in-out',
                color: theme.vars.palette.secondary.dark,
                background: theme.vars.palette.secondary.light,
                '&:hover': {
                  color: theme.vars.palette.secondary.light,
                  background: theme.vars.palette.secondary.dark
                },
                ...theme.applyStyles('dark', {
                  color: theme.vars.palette.secondary.main,
                  background: theme.vars.palette.dark.main,
                  '&:hover': {
                    color: theme.vars.palette.secondary.light,
                    background: theme.vars.palette.secondary.main
                  }
                })
              }}
              onClick={() => handlerDrawerOpen(!drawerOpen)}
            >
              <IconMenu2 stroke={1.5} size="20px" />
            </Avatar>
        )}
        <SessionInfoBadge />
        
        {/* User Info near Company Info */}
        {user && (
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              flexDirection: 'column',
              justifyContent: 'center',
              px: 1.5,
              py: 0.5,
              ml: 1,
              borderRadius: '12px',
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.secondary.main, 0.08),
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.1) : alpha(theme.palette.secondary.main, 0.15),
              minWidth: 0,
              maxWidth: { xs: 160, sm: 300, md: 450 }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}>
              <IconUser size={15} stroke={2} style={{ color: theme.palette.secondary.main, flexShrink: 0 }} />
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.main', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.75rem' }}>
                {user?.name || 'User'}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.65rem' }}>
              {[empDesig, empDept].filter(Boolean).join(' / ')}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Global Header Search + Session Context */}
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, gap: 1.5 }}>
        <Box sx={{ flexGrow: 1 }} />
        <SearchSection />
      </Box>

      {/* mega-menu */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <MegaMenuSection />
      </Box>

      {/* live customization & localization */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <LocalizationSection />
      </Box>

      {/* notification */}
      <NotificationSection />

      {/* full sceen toggler */}
      <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
        <FullScreenSection />
      </Box>

      {/* profile */}
      <ProfileSection />

      {/* Quick Access */}
      <QuickAccessSection />

      {/* Logout Button */}
      <Box sx={{ ml: 1, display: { xs: 'none', md: 'block' } }}>
        <Tooltip title="Logout" placement="bottom" arrow>
          <Avatar
            variant="rounded"
            sx={{
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              transition: 'all .2s ease-in-out',
              color: '#d32f2f',
              background: '#ffebee',
              '&:hover': {
                color: '#fff',
                background: '#d32f2f',
                boxShadow: '0 4px 12px rgba(211,47,47,0.4)'
              },
              ...theme.applyStyles('dark', {
                color: '#ef9a9a',
                background: 'rgba(211,47,47,0.15)',
                '&:hover': {
                  color: '#fff',
                  background: '#c62828',
                  boxShadow: '0 4px 12px rgba(211,47,47,0.5)'
                }
              })
            }}
            onClick={handleLogout}
            aria-label="logout"
          >
            <IconLogout stroke={1.5} size="20px" />
          </Avatar>
        </Tooltip>
      </Box>

      {/* mobile header */}
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <MobileSection />
      </Box>
    </>
  );
}
