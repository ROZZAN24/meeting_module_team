import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import Tooltip from '@mui/material/Tooltip';

// project imports
import WeightCalculator from 'ui-component/WeightCalculator';

// assets
import { IconApps, IconMessage, IconMail, IconCalendar, IconAddressBook, IconUsers, IconX, IconCalculator } from '@tabler/icons-react';

// ==============================|| QUICK ACCESS SECTION ||============================== //

export default function QuickAccessSection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);

  const quickLinks = [
    { label: 'Chat', icon: <IconMessage stroke={1.5} size="20px" />, path: '/apps/chat', color: '#0288d1', bg: '#e1f5fe' },
    { label: 'Mail', icon: <IconMail stroke={1.5} size="20px" />, path: '/apps/mail', color: '#d32f2f', bg: '#ffebee' },
    { label: 'Calendar', icon: <IconCalendar stroke={1.5} size="20px" />, path: '/apps/calendar', color: '#ed6c02', bg: '#fff3e0' },
    { label: 'Contacts', icon: <IconAddressBook stroke={1.5} size="20px" />, path: '/apps/contact/c-card', color: '#2e7d32', bg: '#e8f5e9' },
    { label: 'Live Users', icon: <IconUsers stroke={1.5} size="20px" />, path: '#', color: '#9c27b0', bg: '#f3e5f5' },
    { label: 'Calculator', icon: <IconCalculator stroke={1.5} size="20px" />, path: 'calculator', color: '#00897b', bg: '#e0f2f1' },
  ];

  const handleNavigate = (path) => {
    if (path === 'calculator') {
      setCalcOpen(true);
      setOpen(false);
    } else if (path !== '#') {
      navigate(path);
      setOpen(false);
    }
  };

  return (
    <>
      <Box sx={{ ml: 1, position: 'relative', width: 34, height: 34, zIndex: 1200 }}>
        <SpeedDial
          ariaLabel="Quick Access Menu"
          direction="down"
          icon={<SpeedDialIcon icon={<IconApps stroke={1.5} size="20px" />} openIcon={<IconX stroke={1.5} size="20px" />} />}
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          open={open}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            '& .MuiSpeedDial-fab': {
              margin: 0
            },
            '& .MuiSpeedDial-actions': {
              paddingTop: '16px'
            }
          }}
          FabProps={{
            variant: 'rounded',
            sx: {
              ...theme.typography.commonAvatar,
              ...theme.typography.mediumAvatar,
              boxShadow: 'none',
              minHeight: '34px',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              transition: 'all .2s ease-in-out',
              color: theme.vars.palette.primary.main,
              background: theme.vars.palette.primary.light,
              '&:hover': {
                color: theme.vars.palette.primary.light,
                background: theme.vars.palette.primary.main,
                boxShadow: 'none'
              },
              ...theme.applyStyles('dark', {
                color: theme.vars.palette.primary.main,
                background: theme.vars.palette.dark.main,
                '&:hover': {
                  color: theme.vars.palette.primary.light,
                  background: theme.vars.palette.primary.main
                }
              })
            }
          }}
        >
          {quickLinks.map((action) => (
            <SpeedDialAction
              key={action.label}
              icon={action.icon}
              tooltipTitle={action.label}
              onClick={() => handleNavigate(action.path)}
              sx={{ margin: '4px 0' }}
              FabProps={{
                sx: {
                  backgroundColor: `${action.bg} !important`,
                  color: `${action.color} !important`,
                  boxShadow: `${theme.shadows[2]} !important`,
                  '&:hover': {
                    backgroundColor: `${action.color} !important`,
                    color: '#ffffff !important'
                  }
                }
              }}
            />
          ))}
        </SpeedDial>
      </Box>

      <WeightCalculator open={calcOpen} handleClose={() => setCalcOpen(false)} />
    </>
  );
}
