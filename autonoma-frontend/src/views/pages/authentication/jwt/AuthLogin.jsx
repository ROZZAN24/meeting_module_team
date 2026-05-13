import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';

import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';

// third party

import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';
import axios from 'utils/axios';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


// ===============================|| JWT - LOGIN WITH UNIT MULTI-TENANCY ||=============================== //

export default function JWTLogin({ ...others }) {
  const { login, isLoggedIn } = useAuth();
  const scriptedRef = useScriptRef();
  const [loginError, setLoginError] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };


  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string().max(255).required('User ID is required'),
        password: Yup.string()
          .required('Password is required')
          .test('no-leading-trailing-whitespace', 'Password can not start or end with spaces', (value) => value === value.trim())
          .max(10, 'Password must be less than 10 characters')
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          const trimmedEmail = values.email.trim();
          await login?.(trimmedEmail, values.password);

          if (scriptedRef.current) {
            setStatus({ success: true });
            setSubmitting(false);
          }
        } catch (err) {
          console.error('Login error:', err);
          if (scriptedRef.current) {
            setStatus({ success: false });
            let errorMessage = 'Login failed. Please check your credentials.';
            if (typeof err === 'string') {
              errorMessage = err;
            } else if (err && typeof err === 'object') {
              errorMessage = err.message || err.error || errorMessage;
            }
            setLoginError(errorMessage);
            setSubmitting(false);
          }
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, setFieldValue, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit} {...others}>
          {/* ── 3. User ID / Username Input ─────────────────────────────────── */}

          <CustomFormControl fullWidth error={Boolean(touched.email && errors.email)}>
            <InputLabel htmlFor="outlined-adornment-email-login">User ID / Email Address</InputLabel>
            <OutlinedInput
              id="outlined-adornment-email-login"
              type="text"
              value={values.email}
              name="email"
              onBlur={handleBlur}
              onChange={(e) => {
                handleChange(e);
                if (loginError) setLoginError(null);
              }}
            />
            {touched.email && errors.email && (
              <FormHelperText error id="standard-weight-helper-text-email-login">
                {errors.email}
              </FormHelperText>
            )}
          </CustomFormControl>

          {/* ── 4. Password Input ───────────────────────────────────────────── */}
          <CustomFormControl fullWidth error={Boolean(touched.password && errors.password)}>
            <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password-login"
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              name="password"
              onBlur={handleBlur}
              onChange={(e) => {
                handleChange(e);
                if (loginError) setLoginError(null);
              }}
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
              label="Password"
            />
            {touched.password && errors.password && (
              <FormHelperText error id="standard-weight-helper-text-password-login">
                {errors.password}
              </FormHelperText>
            )}
          </CustomFormControl>

          {loginError && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="error" variant="filled" sx={{ borderRadius: '8px' }}>
                {loginError}
              </Alert>
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <AnimateButton>
              <Button color="primary" disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained">
                Sign In to ERP
              </Button>
            </AnimateButton>
          </Box>
        </form>
      )}
    </Formik>
  );
}
