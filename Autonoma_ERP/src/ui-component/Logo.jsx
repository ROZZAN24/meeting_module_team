import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';

// project imports
import logo from 'assets/images/logo1.jpeg';

// ==============================|| LOGO SVG ||============================== //

export default function Logo({ height = 60 }) {
  const theme = useTheme();

  return <img src={logo} alt="AUTONOMA" height={height} />;
}

Logo.propTypes = {
  dark: PropTypes.bool,
  height: PropTypes.number
};
