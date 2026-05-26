import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  alpha,
  useTheme
} from '@mui/material';
import {
  IconShieldCheck,
  IconCheck,
  IconFaceId,
  IconActivity,
  IconUserCheck,
  IconLock,
  IconCameraOff,
  IconCalendar
} from '@tabler/icons-react';

const FaceDetectionDashboard = ({ open, onClose, webcamActive, webcamError, isFaceScanning, success }) => {
  const theme = useTheme();

  const getFormattedDate = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getFormattedTime = () => {
    const d = new Date();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');
    return `${strHours}:${minutes} ${ampm}`;
  };

  // Animation state for status items
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    if (open && isFaceScanning) {
      setScanStep(0);
      const timer1 = setTimeout(() => setScanStep(1), 600);
      const timer2 = setTimeout(() => setScanStep(2), 1200);
      const timer3 = setTimeout(() => setScanStep(3), 1800);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else if (!isFaceScanning) {
      setScanStep(0);
    }
  }, [open, isFaceScanning]);

  useEffect(() => {
    if (success) {
      setScanStep(4);
    }
  }, [success]);

  const statusItems = [
    { title: 'Face Detected', subtitle: 'High Quality', icon: <IconFaceId size={16} color="#00e676" /> },
    { title: 'Liveness Check', subtitle: 'Real Person', icon: <IconActivity size={16} color="#00e676" /> },
    { title: 'Face Matched', subtitle: '100% Match', icon: <IconUserCheck size={16} color="#00e676" /> },
    { title: 'Verification', subtitle: 'Completed', icon: <IconShieldCheck size={16} color="#00e676" /> }
  ];

  return (
    <Box
      sx={{
        background: 'linear-gradient(145deg, #0a1128 0%, #030815 100%)',
        borderRadius: '18px',
        border: '1.5px solid #a88444',
        boxShadow: '0 0 30px rgba(0,0,0,0.8), inset 0 0 15px rgba(168, 132, 68, 0.15)',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        color: '#fff'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mb: 1.5 }}>
        {/* Left Column */}
        <Box sx={{ flex: '0 0 48%', display: 'flex', flexDirection: 'column' }}>
          {/* Header - Icon */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5, position: 'relative' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, #152238 0%, #080d1a 100%)',
                borderRadius: '14px',
                border: '1.5px solid #a88444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(168, 132, 68, 0.3)',
                transform: 'rotate(45deg)',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ transform: 'rotate(-45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconFaceId size={32} color="#00f0ff" stroke={1.5} />
              </Box>
            </Box>
          </Box>

          {/* Title */}
          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Typography sx={{ color: '#fff', fontWeight: 700, letterSpacing: '0.8px', fontSize: '0.75rem', mb: 0.2 }}>
              FACE DETECTION &
            </Typography>
            <Typography
              sx={{
                fontWeight: 800,
                letterSpacing: '1.5px',
                fontSize: '1.1rem',
                background: 'linear-gradient(90deg, #00d4ff 0%, #00e676 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 0.5,
                lineHeight: 1.1
              }}
            >
              VERIFICATION
            </Typography>
            <Typography sx={{ color: scanStep === 4 ? '#00e676' : '#a88444', fontSize: '0.65rem', fontWeight: 700 }}>
              {scanStep === 4 ? 'Identity Verified Successfully' : 'Scanning Protocol Initiated...'}
            </Typography>
          </Box>

          {/* Status Items - Vertical List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {statusItems.map((item, index) => {
              const isActive = scanStep > index;
              return (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 0.8,
                    px: 1,
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'all 0.4s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        background: isActive ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255,255,255,0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: isActive ? '1px solid rgba(0, 230, 118, 0.3)' : '1px solid transparent'
                      }}
                    >
                      {React.cloneElement(item.icon, { size: 14, color: isActive ? '#00e676' : '#555' })}
                    </Box>
                    <Box>
                      <Typography sx={{ color: isActive ? '#fff' : '#777', fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.2 }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ color: isActive ? '#999' : '#444', fontSize: '0.55rem', lineHeight: 1, display: 'block', mt: 0.3 }}>
                        {item.subtitle}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Checkmark Circle */}
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: isActive ? '1.5px solid #00e676' : '1.5px solid #333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      boxShadow: isActive ? '0 0 6px rgba(0, 230, 118, 0.3)' : 'none',
                      flexShrink: 0
                    }}
                  >
                    {isActive && <IconCheck size={10} color="#00e676" stroke={3} />}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Right Column - Camera Area */}
        <Box sx={{ flex: '1', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <Box
            sx={{
              width: '100%',
              height: '100%',
              minHeight: '260px',
              borderRadius: '14px',
              border: '1.5px solid rgba(168, 132, 68, 0.3)',
              background: '#040b17',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 20px rgba(0,0,0,0.5)'
            }}
          >
            {/* Cyan Tech Corner Brackets */}
            <Box sx={{ position: 'absolute', top: 10, left: 10, width: 24, height: 24, borderTop: '3px solid #00f0ff', borderLeft: '3px solid #00f0ff', borderRadius: '3px 0 0 0', zIndex: 10, filter: 'drop-shadow(0 0 4px #00f0ff)' }} />
            <Box sx={{ position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderTop: '3px solid #00f0ff', borderRight: '3px solid #00f0ff', borderRadius: '0 3px 0 0', zIndex: 10, filter: 'drop-shadow(0 0 4px #00f0ff)' }} />
            <Box sx={{ position: 'absolute', bottom: 10, left: 10, width: 24, height: 24, borderBottom: '3px solid #00f0ff', borderLeft: '3px solid #00f0ff', borderRadius: '0 0 0 3px', zIndex: 10, filter: 'drop-shadow(0 0 4px #00f0ff)' }} />
            <Box sx={{ position: 'absolute', bottom: 10, right: 10, width: 24, height: 24, borderBottom: '3px solid #00f0ff', borderRight: '3px solid #00f0ff', borderRadius: '0 0 3px 0', zIndex: 10, filter: 'drop-shadow(0 0 4px #00f0ff)' }} />

            {/* Scanning Laser */}
            {isFaceScanning && scanStep < 4 && (
              <>
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '1.5px',
                    background: '#00f0ff',
                    boxShadow: '0 0 10px 2px #00f0ff',
                    zIndex: 10,
                    animation: 'scanVertical 2s ease-in-out infinite',
                    '@keyframes scanVertical': {
                      '0%, 100%': { top: '10%' },
                      '50%': { top: '90%' }
                    }
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `radial-gradient(circle at center, transparent 30%, rgba(0, 240, 255, 0.05) 70%)`,
                    zIndex: 9
                  }}
                />
              </>
            )}

            {/* Video Feed */}
            {webcamActive ? (
              <video
                id="webcam-video"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)',
                  position: 'relative',
                  zIndex: 2
                }}
                autoPlay
                playsInline
                muted
              />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', zIndex: 4, position: 'relative' }}>
                <IconCameraOff size={56} color="#333" stroke={1.2} />
              </Box>
            )}
          </Box>

          {/* Giant Overlapping Checkmark */}
          {scanStep === 4 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -20,
                right: '15%',
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#040b17',
                border: '3px solid #a88444',
                boxShadow: '0 0 20px rgba(0,0,0,0.8), inset 0 0 10px rgba(168, 132, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                '@keyframes popIn': {
                  '0%': { transform: 'scale(0)', opacity: 0 },
                  '100%': { transform: 'scale(1)', opacity: 1 }
                }
              }}
            >
              <IconCheck size={32} color="#00e676" stroke={4} style={{ filter: 'drop-shadow(0 0 8px rgba(0, 230, 118, 0.6))' }} />
            </Box>
          )}
        </Box>
      </Box>

      {/* Bottom Bar */}
      <Box
        sx={{
          width: '100%',
          background: scanStep === 4
            ? 'linear-gradient(90deg, rgba(4,32,48,1) 0%, rgba(9,45,68,1) 50%, rgba(4,32,48,1) 100%)'
            : 'linear-gradient(90deg, rgba(10,17,40,1) 0%, rgba(15,25,55,1) 50%, rgba(10,17,40,1) 100%)',
          borderRadius: '12px',
          border: scanStep === 4 ? '1.5px solid #00e676' : '1.5px solid rgba(168, 132, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.2,
          overflow: 'hidden',
          boxShadow: scanStep === 4
            ? '0 0 20px rgba(0, 230, 118, 0.2), inset 0 0 20px rgba(0, 230, 118, 0.1)'
            : 'inset 0 0 20px rgba(168, 132, 68, 0.05)',
          transition: 'all 0.5s ease'
        }}
      >
        {/* Left Side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              background: scanStep === 4
                ? 'linear-gradient(135deg, #00b0ff 0%, #00e676 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: scanStep === 4 ? '1.5px solid #00e676' : '1.5px solid rgba(255,255,255,0.1)',
              boxShadow: scanStep === 4 ? '0 0 15px rgba(0, 230, 118, 0.5)' : 'none',
              transition: 'all 0.5s ease'
            }}
          >
            {scanStep === 4 ? (
              <IconShieldCheck size={20} color="#fff" />
            ) : (
              <IconLock size={20} color="#555" />
            )}
          </Box>
          <Box>
            <Typography
              sx={{
                color: scanStep === 4 ? '#00e676' : '#888',
                fontWeight: 800,
                letterSpacing: '0.5px',
                lineHeight: 1.2,
                fontSize: '0.8rem',
                transition: 'all 0.5s ease'
              }}
            >
              {scanStep === 4 ? 'VERIFIED' : 'PENDING'}
            </Typography>
            <Typography
              sx={{
                color: '#fff',
                letterSpacing: '0.5px',
                fontSize: '0.6rem',
                opacity: scanStep === 4 ? 0.9 : 0.4,
                transition: 'all 0.5s ease'
              }}
            >
              {scanStep === 4 ? 'ACCESS GRANTED' : 'AUTHORIZATION...'}
            </Typography>
          </Box>
        </Box>

        {/* Right Side */}
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', mb: 0.3, fontSize: '0.6rem' }}>
            <IconCalendar size={12} color="#aaa" stroke={1.5} />
            {getFormattedDate()} &bull; {getFormattedTime()}
          </Typography>
          <Typography sx={{ color: '#aaa', fontWeight: 600, fontSize: '0.6rem' }}>
            USER ID: 4587 &nbsp;&bull;&nbsp; <span style={{ color: scanStep === 4 ? '#00e676' : '#888' }}>KYC LEVEL 1</span>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default FaceDetectionDashboard;
