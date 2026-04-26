import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';

// project imports
import logo from 'assets/images/logo.png';

// ==============================|| LOGO SVG ||============================== //

export default function Logo() {
  const theme = useTheme();

  return <img src={logo} alt="AUTONOMA" height="60" />;
}

Logo.propTypes = { dark: PropTypes.bool };
