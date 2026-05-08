import PropTypes from 'prop-types';

import { useState, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// project imports
import autonomaLogo from 'assets/images/autonoma-logo.png';

const API_BASE = (import.meta.env.VITE_APP_API_URL || 'http://localhost:8081').replace(/\/+$/, '');

// ==============================|| LOGO IMAGE ||============================== //

export default function Logo({ height = 45 }) {
  const [logoSrc, setLogoSrc] = useState(autonomaLogo);

  useEffect(() => {
    const fetchLogo = () => {
      const token = localStorage.getItem('serviceToken') || '';
      fetch(`${API_BASE}/api/company-profile/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0 && data[0].logoFileName) {
            // Append timestamp to bust cache
            setLogoSrc(`${API_BASE}/api/company-profile/image/${data[0].logoFileName}?t=${new Date().getTime()}`);
          }
        })
        .catch(err => console.error('Logo sync error:', err));
    };

    fetchLogo();
    window.addEventListener('companyLogoUpdated', fetchLogo);
    return () => window.removeEventListener('companyLogoUpdated', fetchLogo);
  }, []);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <img
        src={logoSrc}
        alt="Autonoma ERP"
        style={{
          height: height,
          width: 'auto',
          objectFit: 'contain',
          maxWidth: '180px' // to prevent huge logos from breaking the header
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = autonomaLogo;
        }}
      />
    </Box>
  );
}

Logo.propTypes = {
  dark: PropTypes.bool,
  height: PropTypes.number
};
