import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';

// project imports
import LogoSection from '../LogoSection';
import SearchSection from './SearchSection';
import MobileSection from './MobileSection';
import ProfileSection from './ProfileSection';
import LocalizationSection from './LocalizationSection';
import MegaMenuSection from './MegaMenuSection';
import FullScreenSection from './FullScreenSection';
import NotificationSection from './NotificationSection';
import VoiceAssistant from './VoiceAssistant';

import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';
import { MenuOrientation } from 'config';
import useConfig from 'hooks/useConfig';

// assets
import { IconMenu2, IconCalculator } from '@tabler/icons-react';
import WeightCalculator from 'ui-component/WeightCalculator';
import SessionInfoBadge from 'ui-component/SessionInfoBadge';

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

export default function Header() {
  const theme = useTheme();
  const downMD = useMediaQuery(theme.breakpoints.down('md'));

  const {
    state: { menuOrientation }
  } = useConfig();
  const { menuMaster } = useGetMenuMaster();
  const [calcOpen, setCalcOpen] = useState(false);
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downMD;

  return (
    <>
      {/* logo & toggler button */}
      <Box sx={{ width: downMD ? 'auto' : 228, display: 'flex' }}>
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <LogoSection />
        </Box>
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
      </Box>

      {/* Global Header Search + Session Context */}
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, gap: 1.5 }}>
        <SearchSection />
        <VoiceAssistant />
        <SessionInfoBadge />
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

      {/* Weight Calculator */}
      <Box sx={{ ml: 2, display: { xs: 'none', md: 'block' } }}>
        <Avatar
          variant="rounded"
          sx={{
            ...theme.typography.commonAvatar,
            ...theme.typography.mediumAvatar,
            transition: 'all .2s ease-in-out',
            color: theme.palette.primary.dark,
            background: theme.palette.primary.light,
            '&:hover': {
              color: theme.palette.primary.light,
              background: theme.palette.primary.dark
            }
          }}
          onClick={() => setCalcOpen(true)}
        >
          <IconCalculator stroke={1.5} size="20px" />
        </Avatar>
      </Box>
      <WeightCalculator open={calcOpen} handleClose={() => setCalcOpen(false)} />

      {/* mobile header */}
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <MobileSection />
      </Box>
    </>
  );
}
