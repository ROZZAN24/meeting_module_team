import { Link as RouterLink } from 'react-router-dom';

// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', pt: 3, mt: 'auto' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
        &copy; All rights reserved{' '}
        <Typography component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
          Nutech-Autonoma
        </Typography>
      </Typography>
    </Stack>
  );
}
