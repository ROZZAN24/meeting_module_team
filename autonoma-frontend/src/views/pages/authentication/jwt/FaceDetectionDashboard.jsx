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
  IconCalendar,
  IconX
} from '@tabler/icons-react';

const FaceDetectionDashboard = ({ open, onClose, webcamActive, webcamError, isFaceScanning, success, errorMessage, userId }) => {
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
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [open, isFaceScanning, errorMessage, success]);

  // Derive effective scan step and error states
  let effectiveScanStep = scanStep;
  let errorStep = -1;
  
  if (errorMessage) {
    const errStr = errorMessage.toLowerCase();
    if (errStr.includes('no face detected') || errStr.includes('camera')) {
      effectiveScanStep = 0;
      errorStep = 0;
    } else if (errStr.includes('liveness')) {
      effectiveScanStep = 1;
      errorStep = 1;
    } else {
      effectiveScanStep = 2; // Face Matched failed
      errorStep = 2;
    }
  } else if (success) {
    effectiveScanStep = 4;
  } else {
    if (effectiveScanStep > 1) {
      effectiveScanStep = 1;
    }
  }

  const statusItems = [
    { 
      title: 'Face Detected', 
      subtitle: effectiveScanStep > 0 || success ? 'High Quality' : (errorStep === 0 ? 'No Face Found' : 'Scanning...'), 
      icon: <IconFaceId size={16} color="#00e676" /> 
    },
    { 
      title: 'Liveness Check', 
      subtitle: effectiveScanStep > 1 || success ? 'Real Person' : (errorStep === 1 ? 'Check Failed' : 'Analyzing...'), 
      icon: <IconActivity size={16} color="#00e676" /> 
    },
    { 
      title: 'Face Matched', 
      subtitle: effectiveScanStep > 2 || success ? '100% Match' : (errorStep === 2 ? 'Mismatch' : 'Comparing...'), 
      icon: <IconUserCheck size={16} color="#00e676" /> 
    },
    { 
      title: 'Verification', 
      subtitle: effectiveScanStep === 4 ? 'Completed' : (errorMessage ? 'Denied' : 'Pending...'), 
      icon: <IconShieldCheck size={16} color="#00e676" /> 
    }
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
            <Typography sx={{ color: effectiveScanStep === 4 ? '#00e676' : (errorMessage ? '#ff5252' : '#a88444'), fontSize: '0.65rem', fontWeight: 700 }}>
              {effectiveScanStep === 4 ? 'Identity Verified Successfully' : (errorMessage ? 'Verification Failed' : 'Scanning Protocol Initiated...')}
            </Typography>
          </Box>

          {/* Status Items - Vertical List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {statusItems.map((item, index) => {
              const isActive = effectiveScanStep > index || success;
              const isError = errorStep === index;
              
              let outerBorder = '1px solid rgba(255,255,255,0.06)';
              let iconBg = 'rgba(255,255,255,0.03)';
              let iconBorder = '1px solid transparent';
              let iconColor = '#555';
              let circleBorder = '1.5px solid #333';
              let circleShadow = 'none';

              if (isActive && !isError) {
                outerBorder = '1px solid rgba(0, 230, 118, 0.3)';
                iconBg = 'rgba(0, 230, 118, 0.1)';
                iconBorder = '1px solid rgba(0, 230, 118, 0.3)';
                iconColor = '#00e676';
                circleBorder = '1.5px solid #00e676';
                circleShadow = '0 0 6px rgba(0, 230, 118, 0.3)';
              } else if (isError) {
                outerBorder = '1px solid rgba(255, 82, 82, 0.3)';
                iconBg = 'rgba(255, 82, 82, 0.1)';
                iconBorder = '1px solid rgba(255, 82, 82, 0.3)';
                iconColor = '#ff5252';
                circleBorder = '1.5px solid #ff5252';
                circleShadow = '0 0 6px rgba(255, 82, 82, 0.3)';
              }

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
                    border: outerBorder,
                    transition: 'all 0.4s ease'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '6px',
                        background: iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: iconBorder
                      }}
                    >
                      {React.cloneElement(item.icon, { size: 14, color: iconColor })}
                    </Box>
                    <Box>
                      <Typography sx={{ color: isActive || isError ? '#fff' : '#777', fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.2 }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ color: isActive ? '#999' : (isError ? '#ff5252' : '#444'), fontSize: '0.55rem', lineHeight: 1, display: 'block', mt: 0.3 }}>
                        {isError ? 'Failed' : item.subtitle}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Checkmark / Error Circle */}
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      border: circleBorder,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      boxShadow: circleShadow,
                      flexShrink: 0
                    }}
                  >
                    {isActive && !isError && <IconCheck size={10} color="#00e676" stroke={3} />}
                    {isError && <IconX size={10} color="#ff5252" stroke={3} />}
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
            {isFaceScanning && effectiveScanStep < 4 && !errorMessage && (
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

          {/* Giant Overlapping Checkmark or Cross */}
          {effectiveScanStep === 4 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: '50%',
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#040b17',
                border: '4px solid #a88444',
                boxShadow: '0 0 20px rgba(0,230,118,0.5), inset 0 0 10px rgba(0,230,118,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                '@keyframes popIn': {
                  '0%': { transform: 'translateX(-50%) scale(0)', opacity: 0 },
                  '100%': { transform: 'translateX(-50%) scale(1)', opacity: 1 }
                }
              }}
            >
              <IconCheck size={40} color="#00e676" stroke={4} style={{ filter: 'drop-shadow(0 0 10px rgba(0, 230, 118, 0.8))' }} />
            </Box>
          )}
          {errorMessage && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -26,
                left: '50%',
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#040b17',
                border: '3px solid #ff5252',
                boxShadow: '0 0 20px rgba(255,82,82,0.5), inset 0 0 10px rgba(255,82,82,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 20,
                animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                '@keyframes popIn': {
                  '0%': { transform: 'translateX(-50%) scale(0)', opacity: 0 },
                  '100%': { transform: 'translateX(-50%) scale(1)', opacity: 1 }
                }
              }}
            >
              <IconX size={32} color="#ff5252" stroke={4} style={{ filter: 'drop-shadow(0 0 8px rgba(255, 82, 82, 0.6))' }} />
            </Box>
          )}
        </Box>
      </Box>

      {/* Bottom Bar */}
      <Box
        sx={{
          width: '100%',
          background: effectiveScanStep === 4
            ? 'linear-gradient(90deg, rgba(4,32,48,1) 0%, rgba(9,45,68,1) 50%, rgba(4,32,48,1) 100%)'
            : (errorMessage ? 'linear-gradient(90deg, rgba(48,4,4,1) 0%, rgba(68,9,9,1) 50%, rgba(48,4,4,1) 100%)' : 'linear-gradient(90deg, rgba(10,17,40,1) 0%, rgba(15,25,55,1) 50%, rgba(10,17,40,1) 100%)'),
          borderRadius: '12px',
          border: effectiveScanStep === 4 ? '1.5px solid #00e676' : (errorMessage ? '1.5px solid #ff5252' : '1.5px solid rgba(168, 132, 68, 0.4)'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.2,
          overflow: 'hidden',
          boxShadow: effectiveScanStep === 4
            ? '0 0 20px rgba(0, 230, 118, 0.2), inset 0 0 20px rgba(0, 230, 118, 0.1)'
            : (errorMessage ? '0 0 20px rgba(255, 82, 82, 0.2), inset 0 0 20px rgba(255, 82, 82, 0.1)' : 'inset 0 0 20px rgba(168, 132, 68, 0.05)'),
          transition: 'all 0.5s ease'
        }}
      >
        {/* Left Side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              background: effectiveScanStep === 4
                ? 'linear-gradient(135deg, #00b0ff 0%, #00e676 100%)'
                : (errorMessage ? 'linear-gradient(135deg, #ff5252 0%, #d50000 100%)' : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'),
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: effectiveScanStep === 4 ? '1.5px solid #00e676' : (errorMessage ? '1.5px solid #ff5252' : '1.5px solid rgba(255,255,255,0.1)'),
              boxShadow: effectiveScanStep === 4 ? '0 0 15px rgba(0, 230, 118, 0.5)' : (errorMessage ? '0 0 15px rgba(255, 82, 82, 0.5)' : 'none'),
              transition: 'all 0.5s ease'
            }}
          >
            {effectiveScanStep === 4 ? (
              <IconShieldCheck size={20} color="#fff" />
            ) : (errorMessage ? (
              <IconX size={20} color="#fff" />
            ) : (
              <IconLock size={20} color="#555" />
            ))}
          </Box>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography
              sx={{
                color: effectiveScanStep === 4 ? '#00e676' : (errorMessage ? '#ff5252' : '#888'),
                fontWeight: 800,
                letterSpacing: '0.5px',
                lineHeight: 1.2,
                fontSize: '0.8rem',
                transition: 'all 0.5s ease'
              }}
            >
              {effectiveScanStep === 4 ? 'VERIFIED' : (errorMessage ? 'FAILED' : 'PENDING')}
            </Typography>
            <Typography
              sx={{
                color: errorMessage ? '#ff5252' : '#fff',
                letterSpacing: '0.5px',
                fontSize: '0.6rem',
                opacity: effectiveScanStep === 4 || errorMessage ? 0.9 : 0.4,
                transition: 'all 0.5s ease',
                maxWidth: '180px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={errorMessage || ''}
            >
              {effectiveScanStep === 4 ? 'ACCESS GRANTED' : (errorMessage ? errorMessage : 'AUTHORIZATION...')}
            </Typography>
          </Box>
        </Box>

        {/* Right Side */}
        <Box sx={{ textAlign: 'right' }}>
          <Typography sx={{ color: '#aaa', display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end', mb: 0.3, fontSize: '0.6rem' }}>
            <IconCalendar size={12} color="#aaa" stroke={1.5} />
            {getFormattedDate()} &bull; {getFormattedTime()}
          </Typography>
          <Typography sx={{ color: '#aaa', fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase' }}>
            {userId ? `USER ID: ${userId}` : 'IDENTIFYING...'} &nbsp;&bull;&nbsp; <span style={{ color: effectiveScanStep === 4 ? '#00e676' : (errorMessage ? '#ff5252' : '#888') }}>KYC LEVEL 1</span>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default FaceDetectionDashboard;
