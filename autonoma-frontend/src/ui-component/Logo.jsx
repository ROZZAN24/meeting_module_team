import PropTypes from 'prop-types';

import { useState, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// project imports
import autonomaLogo from 'assets/images/autonoma-logo.png';
import { getCompanyImageUrl } from 'utils/upload-helper';

// ==============================|| LOGO IMAGE ||============================== //

export default function Logo({ height = 45 }) {
  const [logoSrc, setLogoSrc] = useState(autonomaLogo);

  useEffect(() => {
    const fetchLogo = () => {
      const token = localStorage.getItem('serviceToken') || '';
      const API_BASE = (import.meta.env.VITE_APP_API_URL || 'http://localhost:8081').replace(/\/+$/, '');
      console.log('[Logo] Fetching logo configuration...');
      fetch(`${API_BASE}/api/company-profile/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (data && data.length > 0 && data[0].logoFileName) {
            const logoUrl = getCompanyImageUrl(data[0].logoFileName);
            console.log('[Logo] Setting logo source:', logoUrl);
            setLogoSrc(logoUrl);
          } else {
            console.warn('[Logo] No custom logo found in backend, using default.');
          }
        })
        .catch(err => {
          console.error('[Logo] Sync error:', err.message);
          // Fallback is already set to autonomaLogo by useState
        });
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
