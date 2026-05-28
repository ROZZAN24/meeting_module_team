import PropTypes from 'prop-types';
import { useState } from 'react';
import { Box, Typography, Stack, useTheme, Collapse, IconButton } from '@mui/material';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useColorScheme } from '@mui/material/styles';
import { getDialogStyles } from './BOSStyles';

export default function BOSFormSection({ icon, title, children, defaultOpen = true, sx = {}, contentSx = {} }) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const ds = getDialogStyles(theme, isDark);
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Box sx={{ ...ds.sectionCard, ...sx }}>
      <Box 
        sx={{ 
          ...ds.sectionHeader, 
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pr: 1
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          {icon}
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {title}
          </Typography>
        </Stack>
        <IconButton size="small" sx={{ color: 'text.secondary' }}>
          {isOpen ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
        </IconButton>
      </Box>
      <Collapse in={isOpen} sx={{ '& .MuiCollapse-wrapper': { overflow: 'visible' }, '& .MuiCollapse-wrapperInner': { overflow: 'visible' } }}>
        <Box sx={{ p: 2.5, ...contentSx }}>
          <Stack spacing={2.5} sx={{ width: '100%' }}>
            {children}
          </Stack>
        </Box>
      </Collapse>
    </Box>
  );
}

BOSFormSection.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
  sx: PropTypes.object,
  contentSx: PropTypes.object
};
