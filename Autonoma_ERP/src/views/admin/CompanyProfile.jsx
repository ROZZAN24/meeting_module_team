import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Typography, TextField, Button, Divider, Snackbar, Alert,
  CircularProgress, Avatar, Tooltip, MenuItem, Select, FormControl,
  InputLabel, FormHelperText, Paper, Chip, Stack
} from '@mui/material';
import {
  IconBuilding, IconUpload, IconDeviceFloppy, IconRefresh,
  IconPhoto, IconLogin, IconCheck, IconAlertCircle
} from '@tabler/icons-react';

const API_BASE = (import.meta.env.VITE_APP_API_URL || 'http://localhost:8081').replace(/\/+$/, '');

// ─── Static Geo Data ────────────────────────────────────────────────────────
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Singapore', 'UAE'];

const STATES_BY_COUNTRY = {
  India: [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh'
  ],
  'United States': ['California', 'Texas', 'New York', 'Florida', 'Washington', 'Illinois', 'Pennsylvania', 'Ohio'],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  Canada: ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan'],
  Australia: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania'],
  Germany: ['Bavaria', 'Berlin', 'Hamburg', 'Hesse', 'North Rhine-Westphalia', 'Saxony'],
  France: ['Île-de-France', 'Provence', 'Normandy', 'Brittany', 'Alsace'],
  Singapore: ['Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region'],
  UAE: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'],
};

const STATE_CODES = {
  'Andhra Pradesh': 37, 'Arunachal Pradesh': 12, 'Assam': 18, 'Bihar': 10,
  'Chhattisgarh': 22, 'Goa': 30, 'Gujarat': 24, 'Haryana': 6, 'Himachal Pradesh': 2,
  'Jharkhand': 20, 'Karnataka': 29, 'Kerala': 32, 'Madhya Pradesh': 23,
  'Maharashtra': 27, 'Manipur': 14, 'Meghalaya': 17, 'Mizoram': 15, 'Nagaland': 13,
  'Odisha': 21, 'Punjab': 3, 'Rajasthan': 8, 'Sikkim': 11, 'Tamil Nadu': 33,
  'Telangana': 36, 'Tripura': 16, 'Uttar Pradesh': 9, 'Uttarakhand': 5,
  'West Bengal': 19, 'Delhi': 7, 'Jammu & Kashmir': 1, 'Ladakh': 38,
};

const CITIES_BY_STATE = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belagavi', 'Dharwad'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Allahabad'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
  'Punjab': ['Chandigarh', 'Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala'],
};

const DEFAULT_CITIES = ['City 1', 'City 2', 'City 3', 'City 4'];

const emptyForm = {
  companyName: '', shortName: '', address1: '', address2: '',
  city: '', state: '', stateCode: '', country: '', pincode: '',
  gstIn: '', dbSourceName: '', licRenewalDate: '', licExpiryDate: '',
  logoFileName: '', logInBgFileName: ''
};

// ─── Image Upload Card ───────────────────────────────────────────────────────
function ImageUploadCard({ label, icon: Icon, field, preview, onUpload, uploading }) {
  const inputRef = useRef();
  return (
    <Paper
      elevation={0}
      sx={{
        border: '2px dashed',
        borderColor: preview ? 'primary.main' : 'divider',
        borderRadius: 3,
        p: 2,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s',
        background: preview
          ? 'linear-gradient(135deg,rgba(94,114,228,0.06),rgba(130,94,228,0.06))'
          : 'transparent',
        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => { if (e.target.files[0]) onUpload(field, e.target.files[0]); }}
      />
      {preview ? (
        <Box>
          <Avatar
            src={`${API_BASE}/uploads/company/${preview}`}
            variant="rounded"
            sx={{ width: '100%', height: 110, mx: 'auto', mb: 1, objectFit: 'cover' }}
          />
          <Chip
            label={preview.length > 22 ? preview.slice(0, 22) + '…' : preview}
            size="small" color="primary" variant="outlined"
            icon={<IconCheck size={13} />}
          />
        </Box>
      ) : (
        <Box sx={{ py: 2 }}>
          {uploading
            ? <CircularProgress size={36} />
            : <Icon size={36} stroke={1.5} style={{ opacity: 0.4 }} />}
          <Typography variant="body2" color="text.secondary" mt={1}>
            {uploading ? 'Uploading…' : `Click to upload ${label}`}
          </Typography>
          <Typography variant="caption" color="text.disabled">PNG, JPG up to 10 MB</Typography>
        </Box>
      )}
    </Paper>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const CompanyProfile = () => {
  const [form, setForm] = useState(emptyForm);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ logo: false, bg: false });
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [errors, setErrors] = useState({});

  const citiesForState = CITIES_BY_STATE[form.state] || DEFAULT_CITIES;
  const statesForCountry = STATES_BY_COUNTRY[form.country] || [];

  // ── Load existing record on mount ──
  useEffect(() => {
    const token = localStorage.getItem('serviceToken') || '';
    fetch(`${API_BASE}/api/company-profile/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const rec = data[0];
          setRecordId(rec.id);
          setForm({
            companyName: rec.companyName || '',
            shortName: rec.shortName || '',
            address1: rec.address1 || '',
            address2: rec.address2 || '',
            city: rec.city || '',
            state: rec.state || '',
            stateCode: rec.stateCode != null ? String(rec.stateCode) : '',
            country: rec.country || '',
            pincode: rec.pincode || '',
            gstIn: rec.gstIn || '',
            dbSourceName: rec.dbSourceName || '',
            licRenewalDate: rec.licRenewalDate ? rec.licRenewalDate.slice(0, 10) : '',
            licExpiryDate: rec.licExpiryDate ? rec.licExpiryDate.slice(0, 10) : '',
            logoFileName: rec.logoFileName || '',
            logInBgFileName: rec.logInBgFileName || '',
          });
        }
      })
      .catch(() => {/* silently ignore on first load */ });
  }, []);

  // ── Field change ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-set state code when state changes
      if (name === 'state' && STATE_CODES[value] !== undefined) {
        updated.stateCode = String(STATE_CODES[value]);
      }
      // Reset state/city if country changes
      if (name === 'country') { updated.state = ''; updated.city = ''; updated.stateCode = ''; }
      // Reset city if state changes
      if (name === 'state') { updated.city = ''; }
      return updated;
    });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ── Validation ──
  const validate = () => {
    const e = {};
    if (!form.companyName.trim()) e.companyName = 'Company Name is required';
    if (!form.country) e.country = 'Country is required';
    if (!form.state) e.state = 'State is required';
    if (!form.city) e.city = 'City is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Image Upload ──
  const handleImageUpload = async (field, file) => {
    const isLogo = field === 'logoFileName';
    const endpoint = isLogo ? 'upload-logo' : 'upload-bg';
    setUploading(prev => ({ ...prev, [isLogo ? 'logo' : 'bg']: true }));
    try {
      const token = localStorage.getItem('serviceToken') || '';
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/api/company-profile/${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setForm(prev => ({ ...prev, [field]: data.fileName }));
      showSnack(data.message || 'File uploaded!', 'success');
    } catch (err) {
      showSnack('Upload failed: ' + err.message, 'error');
    } finally {
      setUploading(prev => ({ ...prev, [isLogo ? 'logo' : 'bg']: false }));
    }
  };

  // ── Save / Update ──
  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('serviceToken') || '';
      const payload = {
        ...form,
        stateCode: form.stateCode ? parseInt(form.stateCode) : null,
        licRenewalDate: form.licRenewalDate ? new Date(form.licRenewalDate).toISOString() : null,
        licExpiryDate: form.licExpiryDate ? new Date(form.licExpiryDate).toISOString() : null,
      };

      let url, method;
      if (recordId) {
        url = `${API_BASE}/api/company-profile/update/${recordId}`;
        method = 'PUT';
      } else {
        url = `${API_BASE}/api/company-profile/create`;
        method = 'POST';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      setRecordId(saved.id);
      showSnack(recordId ? 'Company profile updated successfully!' : 'Company profile saved successfully!', 'success');
    } catch (err) {
      showSnack('Error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(emptyForm);
    setRecordId(null);
    setErrors({});
  };

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  // ─── Styles ───
  const sectionTitle = (title, Icon) => (
    <Box display="flex" alignItems="center" gap={1} mb={2} mt={1}>
      <Box sx={{
        p: 0.75, borderRadius: 1.5,
        background: 'linear-gradient(135deg,#5e72e4,#825ee4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={16} color="#fff" stroke={2} />
      </Box>
      <Typography variant="subtitle1" fontWeight={700} color="text.primary">
        {title}
      </Typography>
    </Box>
  );

  const fieldProps = (name, label, extra = {}) => ({
    name, label, value: form[name],
    onChange: handleChange,
    error: !!errors[name],
    helperText: errors[name] || '',
    size: 'small', fullWidth: true,
    sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
    ...extra
  });

  const dropdownProps = (name, label, options, extra = {}) => ({
    name, label, value: form[name], onChange: handleChange,
    error: !!errors[name], helperText: errors[name],
    options, size: 'small', fullWidth: true, ...extra
  });

  const DropdownField = ({ name, label, options, disabled }) => (
    <FormControl fullWidth size="small" error={!!errors[name]} disabled={disabled}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        id={name}
        name={name}
        value={form[name]}
        label={label}
        onChange={handleChange}
        sx={{ borderRadius: 2 }}
      >
        <MenuItem value=""><em>Select {label}</em></MenuItem>
        {options.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
      </Select>
      {errors[name] && <FormHelperText>{errors[name]}</FormHelperText>}
    </FormControl>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
      {/* ── Page Header ── */}
      <Box sx={{
        background: 'linear-gradient(135deg,#5e72e4 0%,#825ee4 100%)',
        borderRadius: 3, p: { xs: 2.5, md: 3.5 }, mb: 3,
        color: '#fff', position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(94,114,228,0.35)'
      }}>
        {/* decorative circles */}
        <Box sx={{
          position: 'absolute', top: -40, right: -40, width: 180, height: 180,
          borderRadius: '50%', background: 'rgba(255,255,255,0.07)'
        }} />
        <Box sx={{
          position: 'absolute', bottom: -30, right: 80, width: 100, height: 100,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)'
        }} />

        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,255,255,0.18)', display: 'flex' }}>
            <IconBuilding size={28} stroke={1.5} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              Company Profile
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.4 }}>
              Manage your company credentials and branding assets
            </Typography>
          </Box>
          {recordId && (
            <Chip
              label={`ID: ${recordId}`}
              size="small"
              sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 700 }}
            />
          )}
        </Stack>
      </Box>

      {/* ── Form Card ── */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>

        {/* ── Section 1 – Company Info ── */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {sectionTitle('Company Information', IconBuilding)}
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField {...fieldProps('companyName', 'Company Name *')} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField {...fieldProps('shortName', 'Short Name')} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField {...fieldProps('dbSourceName', 'DB Source')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField {...fieldProps('address1', 'Address Line 1')} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField {...fieldProps('address2', 'Address Line 2')} />
            </Grid>

            {/* Country → State → City cascade */}
            <Grid item xs={12} md={4}>
              <DropdownField name="country" label="Country *" options={COUNTRIES} />
            </Grid>
            <Grid item xs={12} md={4}>
              <DropdownField
                name="state" label="State *"
                options={statesForCountry}
                disabled={!form.country}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DropdownField
                name="city" label="City *"
                options={citiesForState}
                disabled={!form.state}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField {...fieldProps('stateCode', 'State Code')}
                InputProps={{ readOnly: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'action.hover' } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField {...fieldProps('pincode', 'Pincode')} inputProps={{ maxLength: 10 }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField {...fieldProps('gstIn', 'GST IN')} inputProps={{ maxLength: 15 }} />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* ── Section 2 – License Info ── */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {sectionTitle('License Details', IconAlertCircle)}
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                {...fieldProps('licRenewalDate', 'License Renewal Date')}
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                {...fieldProps('licExpiryDate', 'License Expiry Date')}
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* ── Section 3 – Branding Assets ── */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {sectionTitle('Branding Assets', IconPhoto)}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                Company Logo
              </Typography>
              <ImageUploadCard
                label="Company Logo"
                icon={IconPhoto}
                field="logoFileName"
                preview={form.logoFileName}
                onUpload={handleImageUpload}
                uploading={uploading.logo}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                Login Background Image
              </Typography>
              <ImageUploadCard
                label="Login Background"
                icon={IconLogin}
                field="logInBgFileName"
                preview={form.logInBgFileName}
                onUpload={handleImageUpload}
                uploading={uploading.bg}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* ── Action Buttons ── */}
        <Box sx={{
          p: { xs: 2, md: 3 },
          bgcolor: 'action.hover',
          display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap'
        }}>
          <Tooltip title="Reset form">
            <Button
              variant="outlined"
              startIcon={<IconRefresh size={18} />}
              onClick={handleReset}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Reset
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <IconDeviceFloppy size={18} />}
            onClick={handleSave}
            disabled={loading}
            sx={{
              borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 4,
              background: 'linear-gradient(135deg,#5e72e4,#825ee4)',
              boxShadow: '0 4px 15px rgba(94,114,228,0.4)',
              '&:hover': { background: 'linear-gradient(135deg,#4a5fd4,#6e48d4)', boxShadow: '0 6px 20px rgba(94,114,228,0.5)' }
            }}
          >
            {loading ? 'Saving…' : recordId ? 'Update Profile' : 'Save Profile'}
          </Button>
        </Box>
      </Paper>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyProfile;
