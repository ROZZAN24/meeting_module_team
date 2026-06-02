import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Grid, Typography, TextField, Button, Divider, Snackbar, Alert,
  CircularProgress, Avatar, Tooltip, MenuItem, Select, FormControl,
  InputLabel, FormHelperText, Paper, Chip, Stack, Autocomplete,
  InputAdornment, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItemIcon, ListItemText, ListItemButton
} from '@mui/material';
import {
  IconBuilding, IconUpload, IconDeviceFloppy, IconRefresh,
  IconPhoto, IconLogin, IconCheck, IconAlertCircle, IconFolderOpen,
  IconChevronRight, IconArrowLeft, IconFolder, IconDeviceFloppy as IconDrive,
  IconUser, IconCalendar
} from '@tabler/icons-react';
import useAuth from 'hooks/useAuth';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_API_URL || window.location.origin).replace(/\/+$/, '');

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
  companyName: '', shortName: '', address: '',
  city: '', state: '', stateCode: '', country: '', pincode: '',
  gstIn: '', dbSourceName: '', licRenewalDate: '', licExpiryDate: '',
  logoFileName: '', logInBgFileName: '', directoryPath: 'D:\\BOS_DOCUMENTS',
  licExpRemainderDays: 0,
  restoreEnableDays: 7,
  inputCaseStyle: 'UPPER_CASE',
  createdBy: '',
  createdDate: '',
  updatedBy: '',
  updatedDate: ''
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
          <Tooltip
            title={
              <img
                src={`${API_BASE}/api/company-profile/image/${preview}`}
                alt="Preview"
                style={{ maxWidth: 300, maxHeight: 300, objectFit: 'contain', display: 'block', borderRadius: 4 }}
              />
            }
            placement="top"
            arrow
          >
            <Avatar
              src={`${API_BASE}/api/company-profile/image/${preview}`}
              variant="rounded"
              sx={{ width: '100%', height: 110, mx: 'auto', mb: 1, objectFit: 'cover' }}
            />
          </Tooltip>
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
  const { user } = useAuth();
  const isSuperUser = user?.userLevel === 5;

  const perms = usePagePermissions(PAGE_CODES.AD_COMPANY_PROFILE);

  const [form, setForm] = useState(emptyForm);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ logo: false, bg: false });
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [errors, setErrors] = useState({});
  const [browserOpen, setBrowserOpen] = useState(false);
  const [browserData, setBrowserData] = useState({ currentPath: '', folders: [], roots: [], parentPath: null });
  const [browserLoading, setBrowserLoading] = useState(false);

  const citiesForState = CITIES_BY_STATE[form.state] || DEFAULT_CITIES;
  const statesForCountry = STATES_BY_COUNTRY[form.country] || [];

  // ── Load existing record on mount ──
  useEffect(() => {
    const token = sessionStorage.getItem('serviceToken') || '';
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
            address: rec.address || '',
            city: rec.city || '',
            state: rec.state || '',
            stateCode: rec.stateCode != null ? String(rec.stateCode) : '',
            country: rec.country || '',
            pincode: rec.pincode || '',
            gstIn: rec.gstIn || '',
            dbSourceName: rec.dbSourceName || 'AUTONOMA',
            licRenewalDate: rec.licRenewalDate ? rec.licRenewalDate.slice(0, 10) : '',
            licExpiryDate: rec.licExpiryDate ? rec.licExpiryDate.slice(0, 10) : '',
            logoFileName: rec.logoFileName || '',
            logInBgFileName: rec.logInBgFileName || '',
            directoryPath: rec.directoryPath || 'D:\\BOS_DOCUMENTS',
            licExpRemainderDays: rec.licExpRemainderDays || 0,
            restoreEnableDays: rec.restoreEnableDays || 0,
            inputCaseStyle: rec.inputCaseStyle || 'UPPER_CASE',
            createdBy: rec.createdBy || '',
            createdDate: rec.createdDate || '',
            updatedBy: rec.updatedBy || '',
            updatedDate: rec.updatedDate || ''
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
      // Auto-update license renewal date to current date when expiry date changes
      if (name === 'licExpiryDate') {
        updated.licRenewalDate = new Date().toISOString().split('T')[0];
      }
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
      const token = sessionStorage.getItem('serviceToken') || '';
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/api/company-profile/${endpoint}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const updatedFileName = data.fileName;

      setForm(prev => ({ ...prev, [field]: updatedFileName }));
      showSnack(data.message || 'File uploaded!', 'success');

      // ── Auto-save if already exists ──
      if (recordId) {
        const payload = {
          ...form,
          [field]: updatedFileName,
          stateCode: form.stateCode ? parseInt(form.stateCode) : null,
          licExpRemainderDays: form.licExpRemainderDays ? parseInt(form.licExpRemainderDays) : 0,
          restoreEnableDays: form.restoreEnableDays ? parseInt(form.restoreEnableDays) : 0,
          licRenewalDate: form.licRenewalDate ? new Date(form.licRenewalDate).toISOString() : null,
          licExpiryDate: form.licExpiryDate ? new Date(form.licExpiryDate).toISOString() : null,
          updatedBy: user?.id || 'SYSTEM'
        };

        await fetch(`${API_BASE}/api/company-profile/update/${recordId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (isLogo) {
          window.dispatchEvent(new CustomEvent('companyLogoUpdated', { detail: { fileName: updatedFileName } }));
        }
      }
    } catch (err) {
      showSnack('Upload failed: ' + err.message, 'error');
    } finally {
      setUploading(prev => ({ ...prev, [isLogo ? 'logo' : 'bg']: false }));
    }
  };

  // ── Directory Browser Logic ──
  const fetchDirectory = async (path) => {
    setBrowserLoading(true);
    try {
      const token = sessionStorage.getItem('serviceToken') || '';
      const url = path
        ? `${API_BASE}/api/directory/list?path=${encodeURIComponent(path)}`
        : `${API_BASE}/api/directory/roots`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        showSnack(data.error || 'Could not access this path', 'error');
        // If it was a specific path that failed, reset to roots
        if (path) fetchDirectory(null);
        return;
      }

      if (path) {
        setBrowserData(prev => ({
          ...prev,
          currentPath: data.currentPath,
          folders: data.folders || [],
          parentPath: data.parentPath
        }));
      } else {
        setBrowserData({ currentPath: '', folders: [], roots: Array.isArray(data) ? data : [], parentPath: null });
      }
    } catch (err) {
      showSnack('Failed to load directories', 'error');
    } finally {
      setBrowserLoading(false);
    }
  };

  const handleOpenBrowser = () => {
    setBrowserOpen(true);
    fetchDirectory(form.directoryPath || null);
  };

  // ── Save / Update ──
  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const token = sessionStorage.getItem('serviceToken') || '';
      const payload = {
        ...form,
        stateCode: form.stateCode ? parseInt(form.stateCode) : null,
        licExpRemainderDays: form.licExpRemainderDays ? parseInt(form.licExpRemainderDays) : 0,
        restoreEnableDays: form.restoreEnableDays ? parseInt(form.restoreEnableDays) : 0,
        licRenewalDate: form.licRenewalDate ? new Date(form.licRenewalDate).toISOString() : null,
        licExpiryDate: form.licExpiryDate ? new Date(form.licExpiryDate).toISOString() : null,
        updatedBy: user?.id || 'SYSTEM'
      };

      if (!recordId) {
        payload.createdBy = user?.id || 'SYSTEM';
      }

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
    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
      <Box sx={{
        p: 0.5, borderRadius: 1.5,
        background: 'linear-gradient(135deg,#5e72e4,#825ee4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={14} color="#fff" stroke={2} />
      </Box>
      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
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
    sx: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 1.5,
        bgcolor: extra.InputProps?.readOnly ? 'action.hover' : 'background.paper',
        '&:hover fieldset': { borderColor: 'primary.main' },
        '& input': { py: 0.75, px: 1.5, fontSize: '0.85rem' }
      },
      '& .MuiInputLabel-root': { fontSize: '0.85rem' }
    },
    ...extra
  });

  const dropdownProps = (name, label, options, extra = {}) => ({
    name, label, value: form[name], onChange: handleChange,
    error: !!errors[name], helperText: errors[name],
    options, size: 'small', fullWidth: true, ...extra
  });

  const DropdownField = ({ name, label, options, disabled }) => (
    <Autocomplete
      fullWidth
      size="small"
      sx={{ minWidth: 200,
        '& .MuiOutlinedInput-root': { padding: '2px !important' },
        '& .MuiAutocomplete-input': { padding: '4px 8px !important', fontSize: '0.85rem' },
        '& .MuiInputLabel-root': { fontSize: '0.85rem' }
      }}
      disabled={disabled}
      options={options}
      value={form[name] || null}
      onChange={(event, newValue) => {
        const syntheticEvent = {
          target: {
            name: name,
            value: newValue || ''
          }
        };
        handleChange(syntheticEvent);
      }}
      isOptionEqualToValue={(option, value) => option === value || value === ""}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={!!errors[name]}
          helperText={errors[name]}
          placeholder={`Search ${label}...`}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: disabled ? 'action.hover' : 'background.paper',
              '&:hover fieldset': { borderColor: 'primary.main' }
            }
          }}
        />
      )}
    />
  );

  const FolderBrowserDialog = () => (
    <Dialog open={browserOpen} onClose={() => setBrowserOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        bgcolor: 'primary.main', color: '#fff', py: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <IconFolderOpen size={24} stroke={2} />
        <Typography variant="h5" color="inherit" fontWeight={700}>Select Directory</Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 0, minHeight: 450, maxHeight: 600, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{
          p: 1.5, bgcolor: 'grey.50', display: 'flex', alignItems: 'center', gap: 1,
          borderBottom: '1px solid', borderColor: 'divider'
        }}>
          <IconButton
            size="small"
            disabled={!browserData.currentPath}
            onClick={() => fetchDirectory(browserData.parentPath || null)}
            sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', '&:hover': { bgcolor: 'primary.lighter' } }}
          >
            <IconArrowLeft size={18} />
          </IconButton>
          <Paper
            variant="outlined"
            sx={{
              flex: 1, py: 0.5, px: 1.5, bgcolor: '#fff', borderRadius: 1.5,
              display: 'flex', alignItems: 'center', overflow: 'hidden'
            }}
          >
            <Typography variant="caption" fontWeight={600} color="primary" sx={{ whiteSpace: 'nowrap' }}>
              {browserData.currentPath || 'This PC'}
            </Typography>
          </Paper>
        </Box>

        <List sx={{ py: 0, overflowY: 'auto', flex: 1, bgcolor: '#fff' }}>
          {browserLoading && (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CircularProgress size={40} thickness={4} />
              <Typography variant="body2" mt={2} color="text.secondary">Accessing file system...</Typography>
            </Box>
          )}

          {/* Drives View */}
          {!browserLoading && !browserData.currentPath && browserData.roots.map(root => (
            <ListItemButton
              key={root}
              onClick={() => fetchDirectory(root)}
              sx={{ borderBottom: '1px solid', borderColor: 'grey.50', py: 1.5 }}
            >
              <ListItemIcon sx={{ minWidth: 45 }}>
                <IconDrive color="#5e72e4" size={28} />
              </ListItemIcon>
              <ListItemText
                primary={`Local Disk (${root.replace('\\', '')})`}
                secondary={root}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              <IconChevronRight size={18} opacity={0.3} />
            </ListItemButton>
          ))}

          {/* Folders View */}
          {!browserLoading && browserData.folders.map(f => (
            <ListItemButton
              key={f.path}
              onClick={() => fetchDirectory(f.path)}
              sx={{ borderBottom: '1px solid', borderColor: 'grey.50', py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 45 }}>
                <IconFolder color="#febc2c" size={26} fill="#febc2c30" />
              </ListItemIcon>
              <ListItemText
                primary={f.name}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
              />
              <IconChevronRight size={16} opacity={0.2} />
            </ListItemButton>
          ))}

          {!browserLoading && browserData.currentPath && browserData.folders.length === 0 && (
            <Box sx={{ p: 8, textAlign: 'center', opacity: 0.4 }}>
              <IconFolder size={64} stroke={0.5} />
              <Typography variant="body1" mt={1}>This folder is empty</Typography>
            </Box>
          )}
        </List>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ p: 2, bgcolor: 'grey.50', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          Selected: <strong>{browserData.currentPath || 'None'}</strong>
        </Typography>
        <Box>
          <Button onClick={() => setBrowserOpen(false)} sx={{ fontWeight: 600, mr: 1 }}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!browserData.currentPath}
            onClick={() => {
              setForm(prev => ({ ...prev, directoryPath: browserData.currentPath }));
              setBrowserOpen(false);
            }}
            sx={{ borderRadius: 2, px: 4, fontWeight: 700, boxShadow: '0 4px 12px rgba(94,114,228,0.2)' }}
          >
            Select Folder
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, overflowX: 'hidden' }}>
      {/* ── Page Header ── */}
      <Box sx={{
        position: 'relative',
        background: 'linear-gradient(-45deg, #0f172a, #1e293b, #312e81, #1e1b4b)',
        backgroundSize: '400% 400%',
        animation: 'gradientBG 10s ease infinite',
        borderRadius: '16px',
        p: { xs: 1.5, md: 2 },
        mb: 2,
        color: '#fff',
        overflow: 'hidden',
        boxShadow: '0 8px 20px rgba(15, 23, 42, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Animated decorative shapes */}
        <Box sx={{
          position: 'absolute', top: -30, right: -30, width: 150, height: 150,
          borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.05))',
          backdropFilter: 'blur(10px)',
          animation: 'pulseSoft 4s ease-in-out infinite'
        }} />
        <Box sx={{
          position: 'absolute', bottom: -40, right: 100, width: 120, height: 120,
          borderRadius: '50%', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(168, 85, 247, 0))',
          backdropFilter: 'blur(15px)',
          animation: 'pulseSoft 6s ease-in-out infinite reverse'
        }} />
        <style>
          {`
            @keyframes gradientBG {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            @keyframes pulseSoft {
              0% { transform: scale(1) translateY(0) rotate(0deg); }
              50% { transform: scale(1.1) translateY(-10px) rotate(5deg); }
              100% { transform: scale(1) translateY(0) rotate(0deg); }
            }
            @keyframes bounceEmoji {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-5px); }
            }
            @keyframes spinIcon {
              0% { transform: rotate(0deg); }
              10% { transform: rotate(15deg); }
              20% { transform: rotate(-10deg); }
              30% { transform: rotate(5deg); }
              40% { transform: rotate(0deg); }
              100% { transform: rotate(0deg); }
            }
          `}
        </style>

        <Stack direction="row" alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
          {/* Logo / Icon Container */}
          <Box sx={{ 
            p: 1.5, 
            borderRadius: '12px', 
            background: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(12px)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            color: '#fff',
            animation: 'spinIcon 4s ease-in-out infinite'
          }}>
            <IconBuilding size={26} stroke={2} />
          </Box>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight={900} sx={{ 
              lineHeight: 1.2, 
              color: '#fff',
              textShadow: '0 2px 8px rgba(0,0,0,0.2)',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              Company Profile 
              <Box component="span" sx={{ display: 'inline-block', fontSize: '1.5rem', animation: 'bounceEmoji 2s infinite ease-in-out' }}>
                🚀
              </Box>
            </Typography>
            
            {form.companyName ? (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.2 }}>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.95)', 
                  fontWeight: 700, 
                  letterSpacing: '0.01em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  textShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <Box component="span" sx={{ fontSize: '0.9rem' }}>✨</Box>
                  {form.companyName}
                </Typography>
              </Stack>
            ) : (
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                Manage your company credentials and branding assets <Box component="span" sx={{ fontSize: '0.8rem' }}>🎨</Box>
              </Typography>
            )}
          </Box>

          {perms.write && (
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <IconDeviceFloppy size={18} />}
              onClick={handleSave}
              disabled={loading || !perms.write}
              sx={{
                borderRadius: '20px', textTransform: 'none', fontWeight: 700, px: 3,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.4)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                color: '#fff',
                '&:hover': { background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.2))' }
              }}
            >
              {loading ? 'Saving…' : recordId ? 'Update Profile' : 'Save Profile'}
            </Button>
          )}
          {recordId && (
            <Box sx={{
              px: 2, py: 0.75,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                ID 🎯
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 900, textShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                #{recordId}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {/* ── Main Profile Content ── */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ width: '100%', flexWrap: 'nowrap' }}>
        {/* Left Column - Branding & Identity */}
        <Box sx={{ width: { xs: '100%', md: '25%' }, flexShrink: 0 }}>
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2, height: '100%' }}>
            {sectionTitle('Branding & Identity', IconPhoto)}
            <Stack spacing={2}>
              <Box>
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
              </Box>

              <Box>
                <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                  Login Background
                </Typography>
                <ImageUploadCard
                  label="Login Background"
                  icon={IconLogin}
                  field="logInBgFileName"
                  preview={form.logInBgFileName}
                  onUpload={handleImageUpload}
                  uploading={uploading.bg}
                />
              </Box>

              <Box>
                <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>
                  Preferences
                </Typography>
                <DropdownField
                  name="inputCaseStyle"
                  label="Default Input Case Style"
                  options={['UPPER_CASE', 'PROPER_CASE', 'LOWER_CASE', 'CUSTOM']}
                  fullWidth
                />
              </Box>
            </Stack>
          </Paper>
        </Box>

        {/* Right Column - Details, Audit & Config */}
        <Box sx={{ width: { xs: '100%', md: '75%' }, flexGrow: 1, minWidth: 0 }}>
          <Stack spacing={2}>
            
            {/* Top Row of Right Column: Company Details & System Audit */}
            <Grid container spacing={2}>
              {/* Company Details */}
              <Grid item xs={12} md={8}>
                <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: { xs: 1.5, md: 2 }, height: '100%' }}>
                  {sectionTitle('Company Details', IconBuilding)}
                  
                  <Grid container spacing={1.5} mb={1.5}>
                    <Grid item xs={12} md={3}>
                      <TextField {...fieldProps('gstIn', 'GST IN')} inputProps={{ maxLength: 15 }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField {...fieldProps('companyName', 'Company Name *')} />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField {...fieldProps('shortName', 'Short Name')} />
                    </Grid>
                  </Grid>

                  <Grid container spacing={1.5} mb={1.5}>
                    <Grid item xs={12}>
                      <TextField {...fieldProps('address', 'Address')} multiline rows={2} fullWidth inputProps={{ maxLength: 500 }} />
                    </Grid>
                  </Grid>

                  <Grid container spacing={1.5}>
                    <Grid item xs={12} md={4}>
                      <DropdownField name="country" label="Country *" options={COUNTRIES} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <DropdownField name="state" label="State *" options={statesForCountry} disabled={!form.country} fullWidth />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <DropdownField name="city" label="City *" options={citiesForState} disabled={!form.state} fullWidth />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField {...fieldProps('stateCode', 'State Code')} InputProps={{ readOnly: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'action.hover' } }} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField {...fieldProps('pincode', 'Pincode')} inputProps={{ maxLength: 10 }} />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* System Audit */}
              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2, bgcolor: 'rgba(0,0,0,0.01)', height: '100%' }}>
                  {sectionTitle('System Audit', IconAlertCircle)}
                  <Stack spacing={1.5}>
                    <TextField label="Created By" value={form.createdBy} fullWidth size="small" InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><IconUser size={16} /></InputAdornment> }} />
                    <TextField label="Created Date" value={form.createdDate ? new Date(form.createdDate).toLocaleString() : ''} fullWidth size="small" InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><IconCalendar size={16} /></InputAdornment> }} />
                    <TextField label="Updated By" value={form.updatedBy} fullWidth size="small" InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><IconUser size={16} /></InputAdornment> }} />
                    <TextField label="Updated Date" value={form.updatedDate ? new Date(form.updatedDate).toLocaleString() : ''} fullWidth size="small" InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><IconCalendar size={16} /></InputAdornment> }} />
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            {/* Bottom Row of Right Column: License & Configuration */}
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: { xs: 1.5, md: 2 } }}>
              {sectionTitle('License & Configuration', IconAlertCircle)}
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={2}>
                  <TextField {...fieldProps('dbSourceName', 'DB Source Name')} inputProps={{ maxLength: 10 }} disabled={!isSuperUser} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    {...fieldProps('directoryPath', 'Document Path')}
                    disabled={!isSuperUser}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton color="primary" onClick={handleOpenBrowser} disabled={!isSuperUser} title="Browse Server Folders">
                            <IconFolderOpen size={20} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField {...fieldProps('licRenewalDate', 'Renewal Date')} type="date" InputLabelProps={{ shrink: true }} disabled={!isSuperUser} />
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField {...fieldProps('licExpiryDate', 'Expiry Date')} type="date" InputLabelProps={{ shrink: true }} disabled={!isSuperUser} />
                </Grid>
                <Grid item xs={12} md={1.5}>
                  <TextField {...fieldProps('licExpRemainderDays', 'Exp Remainder Days')} type="number" disabled={!isSuperUser} />
                </Grid>
                <Grid item xs={12} md={1.5}>
                  <TextField {...fieldProps('restoreEnableDays', 'Restore Enable Days')} type="number" disabled={!isSuperUser} helperText="Grace period" />
                </Grid>
              </Grid>
            </Paper>

          </Stack>
        </Box>
      </Stack>
      
      <FolderBrowserDialog />

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
