import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';

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
    { label: 'Chat', icon: <IconMessage stroke={1.5} size="20px" />, path: '/apps/chat' },
    { label: 'Mail', icon: <IconMail stroke={1.5} size="20px" />, path: '/apps/mail' },
    { label: 'Calendar', icon: <IconCalendar stroke={1.5} size="20px" />, path: '/apps/calendar' },
    { label: 'Contacts', icon: <IconAddressBook stroke={1.5} size="20px" />, path: '/apps/contact/c-card' },
    { label: 'Live Users', icon: <IconUsers stroke={1.5} size="20px" />, path: '#' },
    { label: 'Calculator', icon: <IconCalculator stroke={1.5} size="20px" />, path: 'calculator' },
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
      <SpeedDial
        ariaLabel="Quick Access Menu"
        sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1200 }}
        icon={<SpeedDialIcon icon={<IconApps stroke={1.5} />} openIcon={<IconX stroke={1.5} />} />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        direction="up"
      >
        {quickLinks.map((action) => (
          <SpeedDialAction
            key={action.label}
            icon={action.icon}
            tooltipTitle={action.label}
            tooltipOpen
            onClick={() => handleNavigate(action.path)}
          />
        ))}
      </SpeedDial>

      <WeightCalculator open={calcOpen} handleClose={() => setCalcOpen(false)} />
    </>
  );
}
