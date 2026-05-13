import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

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

// Helper component to automatically pre-select target values if precisely one valid item exists
function FormikAutoSelector({ companies, divisions, setDivisions, setFieldValue }) {
  // 1. Auto-select Company if exactly one maps
  useEffect(() => {
    if (companies && companies.length === 1) {
      const singleCompId = String(companies[0].id);
      localStorage.setItem('companyId', singleCompId);
      setFieldValue('companyId', singleCompId);

      axios.get(`/api/admin/divisions/by-company/${singleCompId}/active`)
        .then(divRes => {
          if (Array.isArray(divRes.data)) {
            setDivisions(divRes.data);
          }
        })
        .catch(() => {});
    }
  }, [companies, setDivisions, setFieldValue]);

  // 2. Auto-select Division if exactly one maps
  useEffect(() => {
    if (divisions && divisions.length === 1) {
      const singleDivId = String(divisions[0].id);
      localStorage.setItem('divisionId', singleDivId);
      setFieldValue('divisionId', singleDivId);
    }
  }, [divisions, setFieldValue]);

  return null;
}

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

  const [searchParams] = useSearchParams();
  const authParam = searchParams.get('auth');

  // ── Company / Division Unit Selection State ──────────────────────────────
  const [companies, setCompanies] = useState([]);
  const [divisions, setDivisions] = useState([]);

  // Fetch all companies on mount
  useEffect(() => {
    axios.get('/api/company-profile/all')
      .then(res => {
        if (Array.isArray(res.data)) {
          setCompanies(res.data);
        }
      })
      .catch(() => {});

    // If a company was already persisted in session, pre-load its active divisions
    const initCompId = localStorage.getItem('companyId');
    if (initCompId) {
      axios.get(`/api/admin/divisions/by-company/${initCompId}/active`)
        .then(res => {
          if (Array.isArray(res.data)) {
            setDivisions(res.data);
          }
        })
        .catch(() => {});
    }
  }, []);

  return (
    <Formik
      initialValues={{
        companyId: localStorage.getItem('companyId') || '',
        divisionId: localStorage.getItem('divisionId') || '',
        email: '',
        password: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        companyId: Yup.string().required('Please select a Company unit'),
        divisionId: Yup.string().required('Please select an active Division unit'),
        email: Yup.string().max(255).required('User ID is required'),
        password: Yup.string()
          .required('Password is required')
          .test('no-leading-trailing-whitespace', 'Password can not start or end with spaces', (value) => value === value.trim())
          .max(10, 'Password must be less than 10 characters')
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          // Explicitly save selected routing headers in session prior to handshake
          localStorage.setItem('companyId', values.companyId);
          localStorage.setItem('divisionId', values.divisionId);

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
          <FormikAutoSelector
            companies={companies}
            divisions={divisions}
            setDivisions={setDivisions}
            setFieldValue={setFieldValue}
          />

          {/* ── 1. Company Unit Dropdown ─────────────────────────────────────── */}
          <CustomFormControl fullWidth error={Boolean(touched.companyId && errors.companyId)}>
            <InputLabel id="select-company-label">Company Profile</InputLabel>
            <Select
              labelId="select-company-label"
              id="company-select-login"
              value={values.companyId}
              name="companyId"
              onBlur={handleBlur}
              onChange={(e) => {
                handleChange(e);
                const selectedCompId = e.target.value;
                localStorage.setItem('companyId', selectedCompId);
                
                // Reset dependent division state cleanly
                setDivisions([]);
                setFieldValue('divisionId', '');
                localStorage.removeItem('divisionId');

                if (selectedCompId) {
                  axios.get(`/api/admin/divisions/by-company/${selectedCompId}/active`)
                    .then(res => {
                      if (Array.isArray(res.data)) {
                        setDivisions(res.data);
                      }
                    })
                    .catch(() => {});
                }
              }}
              input={<OutlinedInput label="Company Profile" />}
              sx={{
                '& .MuiSelect-select': {
                  padding: '30.5px 14px 11.5px !important',
                  textAlign: 'left'
                }
              }}
            >
              {companies.map(c => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.companyName}
                </MenuItem>
              ))}
            </Select>
            {touched.companyId && errors.companyId && (
              <FormHelperText error id="helper-text-companyId">
                {errors.companyId}
              </FormHelperText>
            )}
          </CustomFormControl>

          {/* ── 2. Division Unit Dropdown ────────────────────────────────────── */}
          <CustomFormControl fullWidth error={Boolean(touched.divisionId && errors.divisionId)}>
            <InputLabel id="select-division-label">Division Target</InputLabel>
            <Select
              labelId="select-division-label"
              id="division-select-login"
              value={values.divisionId}
              name="divisionId"
              onBlur={handleBlur}
              onChange={(e) => {
                handleChange(e);
                localStorage.setItem('divisionId', e.target.value);
              }}
              input={<OutlinedInput label="Division Target" />}
              disabled={!values.companyId}
              sx={{
                '& .MuiSelect-select': {
                  padding: '30.5px 14px 11.5px !important',
                  textAlign: 'left'
                }
              }}
            >
              {divisions.length === 0 ? (
                <MenuItem disabled value="">
                  <em>No active divisions mapped</em>
                </MenuItem>
              ) : (
                divisions.map(d => (
                  <MenuItem key={d.id} value={String(d.id)}>
                    {d.divisionName}
                  </MenuItem>
                ))
              )}
            </Select>
            {touched.divisionId && errors.divisionId && (
              <FormHelperText error id="helper-text-divisionId">
                {errors.divisionId}
              </FormHelperText>
            )}
          </CustomFormControl>

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
