import PropTypes from 'prop-types';
import { Box, Typography, Stack, useTheme } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { getDialogStyles } from './BOSStyles';

export default function BOSFormSection({ icon, title, children }) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const ds = getDialogStyles(theme, isDark);

  return (
    <Box sx={ds.sectionCard}>
      <Box sx={ds.sectionHeader}>
        {icon}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        <Stack spacing={2.5} sx={{ width: '100%' }}>
          {children}
        </Stack>
      </Box>
    </Box>
  );
}

BOSFormSection.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};
