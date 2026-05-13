import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';

// assets
import erpBg from 'assets/images/auth/auth-pattern.svg';

const API_BASE = (import.meta.env.VITE_APP_API_URL || 'http://localhost:8081').replace(/\/+$/, '');

const AuthLoginBackground = () => {
  const [bgImage, setBgImage] = useState(erpBg);

  useEffect(() => {
    const token = localStorage.getItem('serviceToken') || '';
    fetch(`${API_BASE}/api/company-profile/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Fetch failed');
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0 && data[0].logInBgFileName) {
          const imgUrl = `${API_BASE}/api/company-profile/image/${data[0].logInBgFileName}`;
          const img = new Image();
          img.onload = () => setBgImage(imgUrl);
          img.onerror = () => console.error('Failed to load dynamic login background image');
          img.src = imgUrl;
        }
      })
      .catch(err => {
        console.error('Failed to load login background:', err);
      });
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        background: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("${bgImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    />
  );
};

export default AuthLoginBackground;
