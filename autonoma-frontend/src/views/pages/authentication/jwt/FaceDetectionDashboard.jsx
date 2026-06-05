import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  alpha,
  useTheme,
  CircularProgress,
  Fade,
  Slide,
  Button
} from '@mui/material';
import { keyframes, styled } from '@mui/material/styles';
import {
  IconShieldCheck,
  IconCheck,
  IconFaceId,
  IconActivity,
  IconUserCheck,
  IconX,
  IconCameraOff,
  IconLock
} from '@tabler/icons-react';
import { drawFaceDetection } from 'utils/faceApi';

// ─── Keyframes ────────────────────────────────────────────────────────────────
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  50%      { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
`;

const scanLine = keyframes`
  0%   { top: 0%; opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 1; }
  100% { top: 100%; opacity: 0; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const ScannerRing = styled(Box)(({ theme, statuscolor }) => ({
  position: 'absolute',
  top: -6,
  left: -6,
  right: -6,
  bottom: -6,
  borderRadius: '50%',
  border: `3px dashed ${statuscolor}`,
  animation: `${rotate} 8s linear infinite`,
  opacity: 0.8,
  zIndex: 1,
}));

const ScanLaser = styled(Box)(({ theme, statuscolor }) => ({
  position: 'absolute',
  left: '10%',
  right: '10%',
  height: 3,
  background: `linear-gradient(90deg, transparent, ${statuscolor}, transparent)`,
  boxShadow: `0 0 15px ${statuscolor}, 0 0 30px ${statuscolor}`,
  zIndex: 10,
  animation: `${scanLine} 2.5s ease-in-out infinite`,
}));

const StatusPill = styled(Box)(({ theme, active, error }) => {
  let bg = alpha(theme.palette.text.secondary, 0.05);
  let color = theme.palette.text.secondary;
  let borderColor = 'transparent';

  if (error) {
    bg = alpha(theme.palette.error.main, 0.1);
    color = theme.palette.error.main;
    borderColor = alpha(theme.palette.error.main, 0.3);
  } else if (active) {
    bg = alpha(theme.palette.primary.main, 0.1);
    color = theme.palette.primary.main;
    borderColor = alpha(theme.palette.primary.main, 0.3);
  }

  return {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 20px',
    borderRadius: '16px',
    background: bg,
    border: `1px solid ${borderColor}`,
    color: color,
    transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
    transform: active && !error ? 'scale(1.02)' : 'scale(1)',
  };
});

// ─── Main Component ─────────────────────────────────────────────────────────
const FaceDetectionDashboard = ({ open, onClose, webcamActive, webcamError, isFaceScanning, success, errorMessage, userId }) => {
  const theme = useTheme();
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    let timer1, timer2, timer3;
    if (open && isFaceScanning && !errorMessage && !success) {
      setScanStep(0);
      timer1 = setTimeout(() => setScanStep(1), 600);
      timer2 = setTimeout(() => setScanStep(2), 1200);
      timer3 = setTimeout(() => setScanStep(3), 1800);
    } else if (!isFaceScanning && !errorMessage && !success) {
      setScanStep(0);
    }
    if (errorMessage) {
      clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3);
    }
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  }, [open, isFaceScanning, errorMessage, success]);

  useEffect(() => {
    let animationFrameId;
    let isDrawing = true;

    const renderLoop = async () => {
      if (!isDrawing) return;
      const video = document.getElementById('webcam-video');
      const canvas = document.getElementById('webcam-canvas');

      if (video && canvas && video.readyState >= 2) {
        try { await drawFaceDetection(video, canvas); } catch (e) { /* ignore */ }
      }
      if (isDrawing) { animationFrameId = requestAnimationFrame(renderLoop); }
    };

    if (webcamActive) { renderLoop(); }
    return () => { isDrawing = false; if (animationFrameId) cancelAnimationFrame(animationFrameId); };
  }, [webcamActive]);

  let effectiveScanStep = scanStep;
  let errorStep = -1;

  if (errorMessage) {
    const errStr = errorMessage.toLowerCase();
    if (errStr.includes('no face') || errStr.includes('camera')) { effectiveScanStep = 0; }
    else if (errStr.includes('liveness') || errStr.includes('fake') || errStr.includes('spoof')) { effectiveScanStep = 1; }
    else if (errStr.includes('match') || errStr.includes('recognize') || errStr.includes('mismatch') || errStr.includes('invalid')) { effectiveScanStep = 2; }
    else { effectiveScanStep = 3; }
  } else if (success) { effectiveScanStep = 4; }
  else if (effectiveScanStep > 1) { effectiveScanStep = 1; }

  const statusColor = errorMessage ? theme.palette.error.main : success ? theme.palette.success.main : '#00B0FF';

  return (
    <Box sx={{
      width: '100%',
      p: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {/* Massive Glowing Camera Container */}
      <Box sx={{
        position: 'relative',
        width: { xs: 160, sm: 180, md: 180 },
        height: { xs: 160, sm: 180, md: 180 },
        mb: 2
      }}>
        {/* Outer Glowing Ring */}
        <Box sx={{
          position: 'absolute', inset: -15,
          borderRadius: '50%',
          border: '1px solid rgba(0, 176, 255, 0.2)',
          boxShadow: '0 0 40px rgba(0, 176, 255, 0.1)',
          animation: `${pulseGlow} 3s infinite alternate`
        }} />

        {/* Thick Inner Ring */}
        <Box sx={{
          position: 'absolute', inset: -4,
          borderRadius: '50%',
          border: '2px solid rgba(0, 176, 255, 0.6)',
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          animation: `${rotate} 10s linear infinite`
        }} />

        {/* Video Viewport */}
        <Box sx={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'rgba(10, 14, 23, 0.8)',
          position: 'relative',
          border: `2px solid rgba(0, 176, 255, 0.4)`,
          zIndex: 2
        }}>
          {/* Zoom Wrapper */}
          <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transform: isFaceScanning && !success && !errorMessage ? 'scale(1.25)' : 'scale(1)',
            transition: 'transform 3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          }}>
            {webcamActive ? (
              <>
                <video id="webcam-video" autoPlay playsInline muted style={{
                  width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', zIndex: 1
                }} />
                <canvas id="webcam-canvas" style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', zIndex: 2
                }} />
                {isFaceScanning && !success && !errorMessage && <ScanLaser statuscolor="#00B0FF" />}
              </>
            ) : (
              <IconCameraOff size={48} color="rgba(255,255,255,0.3)" stroke={1.5} />
            )}
          </Box>

          {/* Overlay on Success/Error */}
          <Fade in={success || !!errorMessage}>
            <Box sx={{
              position: 'absolute', inset: 0, zIndex: 10,
              background: success ? 'rgba(0, 230, 118, 0.8)' : 'rgba(255, 23, 68, 0.8)',
              backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {success ? <IconCheck size={64} color="#fff" /> : <IconX size={64} color="#fff" />}
            </Box>
          </Fade>
        </Box>
      </Box>
      {/* Status Indicators */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          {success ? <IconCheck size={20} color="#00e676" /> : 
           errorMessage ? <IconX size={20} color="#ff1744" /> : 
           <IconFaceId size={20} color="#00B0FF" />}
          <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>
            {success ? 'Identity Verified' : 
             errorMessage ? 'Verification Failed' : 
             'Position your face in the frame'}
          </Typography>
        </Box>
        <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
          {success ? 'You are successfully authenticated' : 
           errorMessage ? errorMessage : 
           'Make sure your face is clearly visible'}
        </Typography>
      </Box>
      
      {/* Authenticate Button Mock */}
      <Button
        disabled={!webcamActive || !!errorMessage || success}
        fullWidth
        size="large"
        variant="contained"
        startIcon={isFaceScanning ? <CircularProgress size={18} color="inherit" /> : <IconFaceId size={18} />}
        sx={{
          borderRadius: '12px',
          fontWeight: 700,
          py: 1,
          fontSize: '0.9rem',
          color: '#000',
          background: 'linear-gradient(90deg, #D4AF37 0%, #FFDF73 100%)',
          boxShadow: '0 8px 20px rgba(212, 175, 55, 0.3)',
          '&:hover': {
            background: 'linear-gradient(90deg, #C29B27 0%, #E6C858 100%)',
            boxShadow: '0 10px 25px rgba(212, 175, 55, 0.5)',
          },
          '&.Mui-disabled': {
            background: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.3)'
          }
        }}
      >
        {isFaceScanning ? 'Verifying...' : 'Authenticate'}
      </Button>

    </Box>
  );
};

export default FaceDetectionDashboard;
