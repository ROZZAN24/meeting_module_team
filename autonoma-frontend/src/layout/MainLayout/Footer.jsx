import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', py: 0.1, mt: 0.2, mb: 0.2, flexShrink: 0 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.65rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <span>&copy; All rights reserved</span>
        <span style={{ color: '#2196f3', fontWeight: 700 }}>
          Nutech-Autonoma
        </span>
      </Typography>
    </Stack>
  );
}
