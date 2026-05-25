import { useState, useEffect, useRef } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import { useTheme, alpha } from '@mui/material/styles';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';
import axios from 'utils/axios';
import { getFaceDescriptor } from 'utils/faceApi';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { IconBuilding, IconBuildingFactory2, IconArrowLeft, IconLogin, IconShieldCheck, IconLock, IconCheck, IconInfoCircle, IconCamera, IconCameraOff, IconScan, IconUser, IconFaceId } from '@tabler/icons-react';

// ===============================|| JWT - TWO-STEP LOGIN ||=============================== //

export default function JWTLogin({ ...others }) {
  const theme = useTheme();
  const { login, faceLogin } = useAuth();
  const scriptedRef = useScriptRef();

  // Step management: 'credentials' | 'selection'
  const [step, setStep] = useState('credentials');
  const [loginMethod, setLoginMethod] = useState('face'); // 'password' | 'face'
  const [showPassword, setShowPassword] = useState(false);
  const [checkError, setCheckError] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Webcam states
  const [webcamStream, setWebcamStream] = useState(null);
  const webcamStreamRef = useRef(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [isFaceScanning, setIsFaceScanning] = useState(false);

  // Data from step 1
  const [pendingCredentials, setPendingCredentials] = useState({ username: '', password: '', faceImage: '', faceDescriptor: null });
  const [companies, setCompanies] = useState([]); // [{company, divisions}]

  // Step 2 selections
  const [selectedCompanyIndex, setSelectedCompanyIndex] = useState(0);
  const [selectedDivisionId, setSelectedDivisionId] = useState('');

  const handleClickShowPassword = () => setShowPassword((v) => !v);
  const handleMouseDownPassword = (e) => e.preventDefault();

  const startWebcam = async () => {
    setWebcamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' }
      });
      setWebcamStream(stream);
      webcamStreamRef.current = stream;
      setWebcamActive(true);
      
      setTimeout(() => {
        const videoElement = document.getElementById('webcam-video');
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      }, 150);
    } catch (err) {
      console.error("Webcam access error:", err);
      setWebcamError("Camera access denied or unavailable. Please check permissions.");
    }
  };

  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((track) => track.stop());
      webcamStreamRef.current = null;
    }
    setWebcamStream(null);
    setWebcamActive(false);
  };

  // Auto start camera on mount
  useEffect(() => {
    startWebcam();
    return () => {
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((track) => track.stop());
        webcamStreamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto face scan
  useEffect(() => {
    let timeoutId;
    if (loginMethod === 'face' && webcamActive && !isFaceScanning && step === 'credentials') {
      timeoutId = setTimeout(() => {
        setCheckError(null);
        // Use an empty string for username so the backend matches purely on face
        handleFaceScan('');
      }, 2500); // 2.5s delay to allow face detection and error viewing
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginMethod, webcamActive, isFaceScanning, step]);

  // ── STEP 1 (Password): Verify credentials & get company/division options ────────────────
  const handleCheckCredentials = async (values) => {
    setIsChecking(true);
    setCheckError(null);
    try {
      const res = await axios.post('/api/account/check-credentials', {
        username: values.email.trim(),
        password: values.password
      });

      const matches = res.data;
      if (!matches || matches.length === 0) {
        setCheckError('Invalid credentials or no company mapping found.');
        return;
      }

      // If super user (BOS admin) and only 0 or 1 company is available, auto-login directly.
      const isSuperUser = res.headers?.['x-is-bos-admin'] === '1';
      if (isSuperUser && matches.length <= 1) {
        const tenantId = matches[0]?.company?.dbSourceName || null;
        const divisionId = matches[0]?.divisions?.[0]?.id || null;

        setIsLoggingIn(true);
        try {
          await login(values.email.trim(), values.password, {
            tenantId,
            divisionId: divisionId ? Number(divisionId) : null
          });
          return;
        } catch (loginErr) {
          setCheckError(typeof loginErr === 'string' ? loginErr : loginErr?.message || 'Login failed.');
          setIsChecking(false);
          setIsLoggingIn(false);
          return;
        }
      }

      // If exactly one company and one division, auto-login
      if (matches.length === 1 && matches[0].divisions.length === 1) {
        const tenantId = matches[0].company.dbSourceName;
        const divisionId = matches[0].divisions[0].id;

        setIsLoggingIn(true);
        try {
          await login(values.email.trim(), values.password, {
            tenantId,
            divisionId: Number(divisionId)
          });
          return;
        } catch (loginErr) {
          setCheckError(typeof loginErr === 'string' ? loginErr : loginErr?.message || 'Login failed.');
          setIsChecking(false);
          setIsLoggingIn(false);
          return;
        }
      }

      setPendingCredentials({ username: values.email.trim(), password: values.password, faceImage: '', faceDescriptor: null });
      setCompanies(matches);
      setSelectedCompanyIndex(0);
      const firstDivs = matches[0]?.divisions || [];
      setSelectedDivisionId(firstDivs.length > 0 ? String(firstDivs[0].id) : '');
      setStep('selection');
    } catch (err) {
      const msg =
        typeof err === 'string'
          ? err
          : err?.message || 'Connection failed. Please try again.';
      setCheckError(msg);
    } finally {
      setIsChecking(false);
    }
  };

  // ── STEP 1 (Face ID): Verify face image & get company/division options ──────────────────
  const handleFaceScan = async (username) => {
    const videoElement = document.getElementById('webcam-video');
    if (!videoElement || !webcamActive) {
      setCheckError('Please start the camera first.');
      return;
    }

    setIsFaceScanning(true);
    setCheckError(null);

    try {
      // Get face descriptor using face-api.js
      const descriptorArray = await getFaceDescriptor(videoElement);
      const faceDescriptor = descriptorArray ? JSON.stringify(descriptorArray) : null;

      // Capture frame using canvas (fallback/UI)
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      const faceImageBase64 = canvas.toDataURL('image/jpeg', 0.85);

      if (!faceDescriptor) {
          setCheckError('No face detected. Please ensure your face is clearly visible.');
          setIsFaceScanning(false);
          return;
      }

      // Verify face image with backend
      const res = await axios.post('/api/account/check-face', {
        username: (username || '').trim(),
        faceImage: faceImageBase64,
        faceDescriptor
      });

      const resData = res.data;
      const matches = Array.isArray(resData) ? resData : (resData?.matches || []);
      const matchedUserId = resData?.userId || username || '';
      if (!matches || matches.length === 0) {
        setCheckError('Invalid face credentials or no company mapping found.');
        return;
      }

      stopWebcam();

      // If super user (BOS admin) and only 0 or 1 company is available, auto-login directly.
      const isSuperUser = res.headers?.['x-is-bos-admin'] === '1';
      if (isSuperUser && matches.length <= 1) {
        const tenantId = matches[0]?.company?.dbSourceName || null;
        const divisionId = matches[0]?.divisions?.[0]?.id || null;

        setIsLoggingIn(true);
        try {
          await faceLogin(matchedUserId.trim(), faceImageBase64, {
            tenantId,
            divisionId: divisionId ? Number(divisionId) : null
          }, faceDescriptor);
          return;
        } catch (loginErr) {
          setCheckError(typeof loginErr === 'string' ? loginErr : loginErr?.response?.data?.message || loginErr?.message || 'Face login failed.');
          setIsLoggingIn(false);
          return;
        }
      }

      // If exactly one company and one division, auto-login
      if (matches.length === 1 && matches[0].divisions.length === 1) {
        const tenantId = matches[0].company.dbSourceName;
        const divisionId = matches[0].divisions[0].id;

        setIsLoggingIn(true);
        try {
          await faceLogin(matchedUserId.trim(), faceImageBase64, {
            tenantId,
            divisionId: Number(divisionId)
          }, faceDescriptor);
          return;
        } catch (loginErr) {
          setCheckError(typeof loginErr === 'string' ? loginErr : loginErr?.response?.data?.message || loginErr?.message || 'Face login failed.');
          setIsLoggingIn(false);
          return;
        }
      }

      setPendingCredentials({ username: matchedUserId.trim(), password: '', faceImage: faceImageBase64, faceDescriptor });
      setCompanies(matches);
      setSelectedCompanyIndex(0);
      const firstDivs = matches[0]?.divisions || [];
      setSelectedDivisionId(firstDivs.length > 0 ? String(firstDivs[0].id) : '');
      setStep('selection');
    } catch (err) {
      console.error(err);
      const msg = typeof err === 'string' ? err : err?.response?.data?.message || err?.message || 'Facial recognition failed. Please try again.';
      setCheckError(msg);
    } finally {
      setIsFaceScanning(false);
    }
  };

  // ── STEP 2: Complete login with chosen company + division ────────────────────
  const handleFinalLogin = async () => {
    const chosen = companies[selectedCompanyIndex];
    if (!chosen) return;

    const currentDivisions = chosen.divisions || [];
    if (currentDivisions.length > 0 && !selectedDivisionId) {
      setLoginError('Please select a division to continue.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);
    try {
      if (loginMethod === 'face') {
        await faceLogin(pendingCredentials.username, pendingCredentials.faceImage, {
          tenantId: chosen.company.dbSourceName,
          divisionId: selectedDivisionId ? Number(selectedDivisionId) : null
        }, pendingCredentials.faceDescriptor);
      } else {
        await login(pendingCredentials.username, pendingCredentials.password, {
          tenantId: chosen.company.dbSourceName,
          divisionId: selectedDivisionId ? Number(selectedDivisionId) : null
        });
      }
    } catch (err) {
      if (scriptedRef.current) {
        const msg = typeof err === 'string' ? err : err?.message || 'Login failed. Please try again.';
        setLoginError(msg);
      }
    } finally {
      if (scriptedRef.current) setIsLoggingIn(false);
    }
  };

  const currentDivisions = companies[selectedCompanyIndex]?.divisions || [];

  return (
    <Box {...others}>
      <AnimatePresence mode="wait">
        {step === 'credentials' ? (
          <motion.div
            key="credentials"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Formik
              initialValues={{ email: '', password: '', submit: null }}
              validationSchema={Yup.object().shape({
                email: loginMethod === 'password'
                  ? Yup.string().max(255).required('User ID is required')
                  : Yup.string().max(255).nullable(),
                password: loginMethod === 'password'
                  ? Yup.string()
                      .required('Password is required')
                      .test('no-spaces', 'Password cannot start or end with spaces', (v) => v === v?.trim())
                      .max(50, 'Password must be under 50 characters')
                  : Yup.string().nullable()
              })}
              onSubmit={(values) => {
                if (loginMethod === 'face') {
                  handleFaceScan(values.email);
                } else {
                  handleCheckCredentials(values);
                }
              }}
            >
              {({ errors, handleBlur, handleChange, handleSubmit, touched, values }) => (
                <form noValidate onSubmit={handleSubmit}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: theme.palette.primary.main,
                        letterSpacing: '-0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <IconShieldCheck size={28} /> Welcome Back
                    </Typography>
                  </Box>

                  {/* Login Method Toggle */}
                  <Box
                    sx={{
                      display: 'flex',
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      p: 0.5,
                      borderRadius: '12px',
                      mb: 3
                    }}
                  >
                    <Button
                      fullWidth
                      type="button"
                      onClick={() => {
                        setLoginMethod('password');
                        stopWebcam();
                        setCheckError(null);
                      }}
                      variant={loginMethod === 'password' ? 'contained' : 'text'}
                      sx={{
                        borderRadius: '10px',
                        py: 1,
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        bgcolor: loginMethod === 'password' ? theme.palette.primary.main : 'transparent',
                        color: loginMethod === 'password' ? '#fff' : theme.palette.text.secondary,
                        '&:hover': {
                          bgcolor: loginMethod === 'password' ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.15)
                        }
                      }}
                    >
                      Password
                    </Button>
                    <Button
                      fullWidth
                      type="button"
                      onClick={() => {
                        setLoginMethod('face');
                        setCheckError(null);
                        startWebcam();
                      }}
                      variant={loginMethod === 'face' ? 'contained' : 'text'}
                      sx={{
                        borderRadius: '10px',
                        py: 1,
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        bgcolor: loginMethod === 'face' ? theme.palette.primary.main : 'transparent',
                        color: loginMethod === 'face' ? '#fff' : theme.palette.text.secondary,
                        '&:hover': {
                          bgcolor: loginMethod === 'face' ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.15)
                        }
                      }}
                    >
                      Face ID
                    </Button>
                  </Box>

                  {loginMethod === 'password' && (
                    <CustomFormControl fullWidth error={Boolean(touched.email && errors.email)} sx={{ mb: 2 }}>
                    <InputLabel htmlFor="login-userid">User ID / Email</InputLabel>
                    <OutlinedInput
                      id="login-userid"
                      type="text"
                      value={values.email}
                      name="email"
                      onBlur={handleBlur}
                      onChange={(e) => {
                        handleChange(e);
                        if (checkError) setCheckError(null);
                      }}
                      label="User ID / Email"
                      autoComplete="username"
                      sx={{
                        borderRadius: '12px',
                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                        backdropFilter: 'blur(4px)'
                      }}
                    />
                    {touched.email && errors.email && (
                      <FormHelperText error id="standard-weight-helper-text-email-login">
                        {errors.email}
                      </FormHelperText>
                    )}
                  </CustomFormControl>
                  )}

                  {loginMethod === 'password' ? (
                    <CustomFormControl fullWidth error={Boolean(touched.password && errors.password)}>
                      <InputLabel htmlFor="login-password">Password</InputLabel>
                      <OutlinedInput
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={values.password}
                        name="password"
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange(e);
                          if (checkError) setCheckError(null);
                        }}
                        label="Password"
                        autoComplete="current-password"
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              size="large"
                            >
                              {showPassword ? <Visibility /> : <VisibilityOff />}
                            </IconButton>
                          </InputAdornment>
                        }
                        sx={{
                          borderRadius: '12px',
                          bgcolor: alpha(theme.palette.background.paper, 0.5),
                          backdropFilter: 'blur(4px)'
                        }}
                      />
                      {touched.password && errors.password && (
                        <FormHelperText error id="standard-weight-helper-text-password-login">
                          {errors.password}
                        </FormHelperText>
                      )}
                    </CustomFormControl>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2,
                        position: 'relative'
                      }}
                    >
                      <Box
                        sx={{
                          width: 260,
                          height: 260,
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          my: 2
                        }}
                      >
                        {/* Orbiting Frosted Rings */}
                        <Box
                          sx={{
                            position: 'absolute',
                            inset: -20,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            borderRadius: '50%',
                            backdropFilter: 'blur(4px)',
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, transparent)`,
                            animation: 'slowSpin 15s linear infinite',
                            pointerEvents: 'none',
                            '@keyframes slowSpin': {
                              '0%': { transform: 'rotate(0deg)' },
                              '100%': { transform: 'rotate(360deg)' }
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: -4, left: '50%',
                              width: 8, height: 8,
                              bgcolor: theme.palette.primary.main,
                              borderRadius: '50%',
                              boxShadow: `0 0 15px 3px ${theme.palette.primary.main}`
                            }
                          }}
                        />

                        {/* Morphing Liquid Container */}
                        <Box
                          sx={{
                            width: 200,
                            height: 200,
                            position: 'relative',
                            overflow: 'hidden',
                            animation: 'morph 8s ease-in-out infinite',
                            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                            border: `2px solid ${alpha('#ffffff', 0.1)}`,
                            boxShadow: `0 20px 50px ${alpha(theme.palette.primary.dark, 0.4)}, inset 0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha('#000000', 0.4)} 100%)`,
                            backdropFilter: 'blur(16px)',
                            zIndex: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '@keyframes morph': {
                              '0%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
                              '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
                              '100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }
                            }
                          }}
                        >
                          {webcamActive ? (
                            <>
                              <video
                                id="webcam-video"
                                style={{
                                  width: '120%', // Slightly larger to cover the morphing shape
                                  height: '120%',
                                  objectFit: 'cover',
                                  transform: 'scaleX(-1)',
                                  position: 'relative',
                                  zIndex: 2
                                }}
                                autoPlay
                                playsInline
                                muted
                              />
                              <Box
                                sx={{
                                  position: 'absolute',
                                  inset: 0,
                                  background: `linear-gradient(180deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.3)} 50%, transparent 100%)`,
                                  backgroundSize: '100% 200%',
                                  animation: 'volumetricScan 3s ease-in-out infinite',
                                  zIndex: 3,
                                  pointerEvents: 'none',
                                  mixBlendMode: 'overlay',
                                  '@keyframes volumetricScan': {
                                    '0%': { backgroundPosition: '0% -100%' },
                                    '100%': { backgroundPosition: '0% 200%' }
                                  }
                                }}
                              />
                            </>
                          ) : (
                            <Box 
                              sx={{ 
                                color: theme.palette.primary.main, 
                                zIndex: 4,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                animation: 'breathe 3s ease-in-out infinite',
                                '@keyframes breathe': {
                                  '0%': { transform: 'scale(0.9)', opacity: 0.7, filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' },
                                  '50%': { transform: 'scale(1.05)', opacity: 1, filter: `drop-shadow(0 0 25px ${theme.palette.primary.main})` },
                                  '100%': { transform: 'scale(0.9)', opacity: 0.7, filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }
                                }
                              }}
                            >
                              <IconFaceId size={88} stroke={1} />
                            </Box>
                          )}
                        </Box>
                      </Box>



                      {webcamError && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, textAlign: 'center', display: 'block' }}>
                          {webcamError}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {checkError && (
                    <Box sx={{ mt: 2 }}>
                      <Alert
                        severity="error"
                        variant="outlined"
                        sx={{
                          borderRadius: '12px',
                          bgcolor: alpha(theme.palette.error.light, 0.1),
                          borderColor: alpha(theme.palette.error.main, 0.2),
                          color: theme.palette.error.dark,
                          fontWeight: 500
                        }}
                      >
                        {checkError}
                      </Alert>
                    </Box>
                  )}

                  {loginMethod === 'password' ? (
                    <Box sx={{ mt: 4 }}>
                      <AnimateButton>
                        <Button
                          color="primary"
                          disabled={isChecking}
                          fullWidth
                          size="large"
                          type="submit"
                          variant="contained"
                          startIcon={isChecking ? <CircularProgress size={18} color="inherit" /> : <IconLock size={18} />}
                          sx={{
                            borderRadius: '14px',
                            fontWeight: 700,
                            py: 1.6,
                            fontSize: '1rem',
                            boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                            '&:hover': {
                              boxShadow: `0 10px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          {isChecking ? 'Verifying Credentials…' : 'Continue'}
                        </Button>
                      </AnimateButton>
                    </Box>
                  ) : (
                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 56 }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {isFaceScanning ? <CircularProgress size={18} color="primary" /> : <IconScan size={20} color={theme.palette.primary.main} />}
                        {isFaceScanning ? 'Scanning your face automatically...' : 'Looking for a face...'}
                      </Typography>
                    </Box>
                  )}
                </form>
              )}
            </Formik>
          </motion.div>
        ) : (
          <motion.div
            key="selection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <Box>
              {/* Header Section */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, mb: 1.5 }}>
                <IconButton
                  size="small"
                  onClick={() => { setStep('credentials'); setLoginError(null); }}
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderRadius: '12px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.22),
                      transform: 'scale(1.06) translateY(-1px)',
                      boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.2)}`
                    }
                  }}
                >
                  <IconArrowLeft size={18} stroke={2.2} />
                </IconButton>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      letterSpacing: '-0.3px',
                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 0.2
                    }}
                  >
                    Context Selection
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
                      Signed in as
                    </Typography>
                    <Chip
                      label={pendingCredentials.username}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        color: theme.palette.primary.dark,
                        borderRadius: '6px'
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Company Selection */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.15em' }}>
                  Select Company ({companies.length})
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={String(selectedCompanyIndex)}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      setSelectedCompanyIndex(idx);
                      const divs = companies[idx]?.divisions || [];
                      setSelectedDivisionId(divs.length > 0 ? String(divs[0].id) : '');
                      setLoginError(null);
                    }}
                    sx={{
                      borderRadius: '16px',
                      background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.5)})`,
                      backdropFilter: 'blur(20px)',
                      border: '1px solid',
                      borderColor: alpha(theme.palette.common.white, 0.6),
                      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
                      py: 0.3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 10px 36px ${alpha(theme.palette.primary.main, 0.15)}`
                      },
                      '& .MuiSelect-select': {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        pl: 2
                      }
                    }}
                  >
                    {companies.map((item, idx) => (
                      <MenuItem key={idx} value={String(idx)} sx={{ py: 1.2, borderRadius: '10px', mx: 1, my: 0.2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: selectedCompanyIndex === idx ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.12),
                              color: selectedCompanyIndex === idx ? '#fff' : theme.palette.primary.main,
                              boxShadow: selectedCompanyIndex === idx ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}` : 'none',
                              transition: 'all 0.3s'
                            }}
                          >
                            <IconBuilding size={18} stroke={2.2} />
                          </Box>
                          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.88rem' }}>
                              {item.company.companyName || item.company.dbSourceName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', fontSize: '0.72rem' }}>
                              Instance: <span style={{ color: theme.palette.primary.main, fontWeight: 700 }}>{item.company.dbSourceName}</span>
                            </Typography>
                          </Box>
                          {selectedCompanyIndex === idx && (
                            <Chip
                              icon={<IconCheck size={14} />}
                              label="Selected"
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                                color: theme.palette.primary.dark,
                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                border: '1px solid',
                                px: 0.5
                              }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Division Selection */}
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.15em' }}>
                  Select Division {currentDivisions.length > 0 ? `(${currentDivisions.length})` : ''}
                </Typography>

                {currentDivisions.length === 0 ? (
                  <Alert
                    icon={<IconInfoCircle size={24} />}
                    severity="info"
                    variant="outlined"
                    sx={{
                      borderRadius: '16px',
                      background: `linear-gradient(145deg, ${alpha(theme.palette.info.light, 0.15)}, ${alpha(theme.palette.info.light, 0.05)})`,
                      borderColor: alpha(theme.palette.info.main, 0.4),
                      color: theme.palette.info.dark,
                      fontWeight: 700,
                      py: 1.5,
                      px: 2,
                      boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.12)}`,
                      backdropFilter: 'blur(12px)'
                    }}
                  >
                    No active divisions found. You will be signed in with Company-wide Administrative access to configure divisions.
                  </Alert>
                ) : (
                  <FormControl fullWidth>
                    <Select
                      value={selectedDivisionId}
                      onChange={(e) => {
                        setSelectedDivisionId(e.target.value);
                        setLoginError(null);
                      }}
                      sx={{
                        borderRadius: '16px',
                        background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.5)})`,
                        backdropFilter: 'blur(20px)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.common.white, 0.6),
                        boxShadow: `0 8px 32px ${alpha(theme.palette.secondary.main, 0.08)}`,
                        py: 0.3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: theme.palette.secondary.main,
                          boxShadow: `0 10px 36px ${alpha(theme.palette.secondary.main, 0.15)}`
                        },
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          pl: 2
                        }
                      }}
                    >
                      {currentDivisions.map((div) => (
                        <MenuItem key={div.id} value={String(div.id)} sx={{ py: 1.2, borderRadius: '10px', mx: 1, my: 0.2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: selectedDivisionId === String(div.id) ? theme.palette.secondary.main : alpha(theme.palette.secondary.main, 0.12),
                                color: selectedDivisionId === String(div.id) ? '#fff' : theme.palette.secondary.main,
                                boxShadow: selectedDivisionId === String(div.id) ? `0 4px 12px ${alpha(theme.palette.secondary.main, 0.4)}` : 'none',
                                transition: 'all 0.3s'
                              }}
                            >
                              <IconBuildingFactory2 size={18} stroke={2.2} />
                            </Box>
                            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.88rem' }}>
                                {div.divisionName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontWeight: 600, display: 'block', fontSize: '0.72rem' }}>
                                Division ID: <span style={{ color: theme.palette.secondary.main, fontWeight: 700 }}>{div.id}</span>
                              </Typography>
                            </Box>
                            {selectedDivisionId === String(div.id) && (
                              <Chip
                                icon={<IconCheck size={14} />}
                                label="Active"
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  bgcolor: alpha(theme.palette.secondary.main, 0.15),
                                  color: theme.palette.secondary.dark,
                                  borderColor: alpha(theme.palette.secondary.main, 0.3),
                                  border: '1px solid',
                                  px: 0.5
                                }}
                              />
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>

              {loginError && (
                <Box sx={{ mb: 2.5 }}>
                  <Alert severity="error" variant="filled" sx={{ borderRadius: '14px', fontWeight: 700, py: 1, boxShadow: `0 6px 20px ${alpha(theme.palette.error.main, 0.3)}` }}>
                    {loginError}
                  </Alert>
                </Box>
              )}

              <Box sx={{ mt: 'auto', pt: 3 }}>
                <AnimateButton>
                  <Button
                    disabled={isLoggingIn || (currentDivisions.length > 0 && !selectedDivisionId)}
                    fullWidth
                    size="large"
                    variant="contained"
                    onClick={handleFinalLogin}
                    startIcon={isLoggingIn ? <CircularProgress size={18} color="inherit" /> : <IconLogin size={20} />}
                    sx={{
                      borderRadius: '16px',
                      fontWeight: 800,
                      py: 1.5,
                      fontSize: '1rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                      boxShadow: `0 10px 25px ${alpha(theme.palette.secondary.main, 0.45)}`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
                        boxShadow: `0 14px 30px ${alpha(theme.palette.secondary.main, 0.55)}`,
                        transform: 'translateY(-2px) scale(1.01)'
                      }
                    }}
                  >
                    {isLoggingIn ? 'Launching Autonoma…' : 'Sign In'}
                  </Button>
                </AnimateButton>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
