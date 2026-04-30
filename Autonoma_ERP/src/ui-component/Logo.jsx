import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// project imports
import autonomaLogo from 'assets/images/autonoma-logo.png';

// ==============================|| LOGO IMAGE ||============================== //

export default function Logo({ height = 45 }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <img 
        src={autonomaLogo} 
        alt="Autonoma ERP" 
        style={{ 
          height: height, 
          width: 'auto', 
          objectFit: 'contain'
        }} 
      />
    </Box>
  );
}

Logo.propTypes = {
  dark: PropTypes.bool,
  height: PropTypes.number
};
