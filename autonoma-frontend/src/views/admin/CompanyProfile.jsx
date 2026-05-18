import React, { useState, useEffect, useRef } from 'react';
<<<<<<< HEAD
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

const API_BASE = (import.meta.env.VITE_APP_API_URL || 'http://localhost:8081').replace(/\/+$/, '');
=======
import { useDispatch } from 'react-redux';
import {
  Box, Grid, Typography, Button, Divider,
  CircularProgress, Avatar, Tooltip, Paper, Chip, Stack,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItemIcon, ListItemText, ListItemButton, InputAdornment
} from '@mui/material';
import {
  IconBuilding, IconPhoto, IconLogin, IconCheck, IconAlertCircle, IconFolderOpen,
  IconChevronRight, IconArrowLeft, IconFolder, IconDeviceFloppy as IconDrive,
  IconUser, IconCalendar, IconDeviceFloppy
} from '@tabler/icons-react';
import useAuth from 'hooks/useAuth';
import { autoUploadFile, getCompanyImageUrl } from 'utils/upload-helper';
import axios from 'utils/axios';
import { openSnackbar } from 'store/slices/snackbar';
import useKeyboardShortcuts from 'hooks/useKeyboardShortcuts';
import { BOSFormSection, BOSTextField } from 'ui-component/bos';
>>>>>>> origin/chore/repo-cleanup

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
<<<<<<< HEAD
  restoreEnableDays: 7,
=======
>>>>>>> origin/chore/repo-cleanup
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
<<<<<<< HEAD
                src={`${API_BASE}/api/company-profile/image/${preview}`}
=======
                src={getCompanyImageUrl(preview)}
>>>>>>> origin/chore/repo-cleanup
                alt="Preview"
                style={{ maxWidth: 300, maxHeight: 300, objectFit: 'contain', display: 'block', borderRadius: 4 }}
              />
            }
            placement="top"
            arrow
          >
            <Avatar
<<<<<<< HEAD
              src={`${API_BASE}/api/company-profile/image/${preview}`}
=======
              src={getCompanyImageUrl(preview)}
>>>>>>> origin/chore/repo-cleanup
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
<<<<<<< HEAD
=======
  const dispatch = useDispatch();
>>>>>>> origin/chore/repo-cleanup
  const isSuperUser = user?.isBosAdmin === 1;

  const [form, setForm] = useState(emptyForm);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ logo: false, bg: false });
<<<<<<< HEAD
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
=======
>>>>>>> origin/chore/repo-cleanup
  const [errors, setErrors] = useState({});
  const [browserOpen, setBrowserOpen] = useState(false);
  const [browserData, setBrowserData] = useState({ currentPath: '', folders: [], roots: [], parentPath: null });
  const [browserLoading, setBrowserLoading] = useState(false);

  const citiesForState = CITIES_BY_STATE[form.state] || DEFAULT_CITIES;
  const statesForCountry = STATES_BY_COUNTRY[form.country] || [];

  // ── Load existing record on mount ──
  useEffect(() => {
<<<<<<< HEAD
    const token = localStorage.getItem('serviceToken') || '';
    fetch(`${API_BASE}/api/company-profile/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
=======
    axios.get('/api/company-profile/all')
      .then(r => {
        const data = r.data;
>>>>>>> origin/chore/repo-cleanup
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
            dbSourceName: rec.dbSourceName || 'BOSDBSRC',
            licRenewalDate: rec.licRenewalDate ? rec.licRenewalDate.slice(0, 10) : '',
            licExpiryDate: rec.licExpiryDate ? rec.licExpiryDate.slice(0, 10) : '',
            logoFileName: rec.logoFileName || '',
            logInBgFileName: rec.logInBgFileName || '',
            directoryPath: rec.directoryPath || 'D:\\BOS_DOCUMENTS',
            licExpRemainderDays: rec.licExpRemainderDays || 0,
<<<<<<< HEAD
            restoreEnableDays: rec.restoreEnableDays || 0,
=======
>>>>>>> origin/chore/repo-cleanup
            createdBy: rec.createdBy || '',
            createdDate: rec.createdDate || '',
            updatedBy: rec.updatedBy || '',
            updatedDate: rec.updatedDate || ''
          });
        }
      })
      .catch(() => {/* silently ignore on first load */ });
  }, []);

<<<<<<< HEAD
=======
  // Keyboard shortcut: Ctrl+S to save
  useKeyboardShortcuts({
    'ctrl+s': (e) => {
      e.preventDefault();
      handleSave();
    }
  });

>>>>>>> origin/chore/repo-cleanup
  // ── Field change ──
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
<<<<<<< HEAD
      // Auto-set state code when state changes
      if (name === 'state' && STATE_CODES[value] !== undefined) {
        updated.stateCode = String(STATE_CODES[value]);
      }
      // Reset state/city if country changes
      if (name === 'country') { updated.state = ''; updated.city = ''; updated.stateCode = ''; }
      // Reset city if state changes
=======
      if (name === 'state' && STATE_CODES[value] !== undefined) {
        updated.stateCode = String(STATE_CODES[value]);
      }
      if (name === 'country') { updated.state = ''; updated.city = ''; updated.stateCode = ''; }
>>>>>>> origin/chore/repo-cleanup
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

<<<<<<< HEAD
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
=======
  const showSnack = (msg, severity = 'success') => {
    dispatch(openSnackbar({ open: true, message: msg, variant: 'alert', severity }));
  };

  // ── Image Upload ──
  const handleImageUpload = async (field, file) => {
    const isLogo = field === 'logoFileName';
    setUploading(prev => ({ ...prev, [isLogo ? 'logo' : 'bg']: true }));
    try {
      const uploadedPath = await autoUploadFile(file, 'COMPANY_PROFILE');
      
      setForm(prev => ({ ...prev, [field]: uploadedPath }));
      showSnack('File uploaded successfully!', 'success');

      if (recordId) {
        const payload = {
          ...form,
          [field]: uploadedPath,
          stateCode: form.stateCode ? parseInt(form.stateCode) : null,
          licExpRemainderDays: form.licExpRemainderDays ? parseInt(form.licExpRemainderDays) : 0,
>>>>>>> origin/chore/repo-cleanup
          licRenewalDate: form.licRenewalDate ? new Date(form.licRenewalDate).toISOString() : null,
          licExpiryDate: form.licExpiryDate ? new Date(form.licExpiryDate).toISOString() : null,
          updatedBy: user?.id || 'SYSTEM'
        };

<<<<<<< HEAD
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
=======
        await axios.put(`/api/company-profile/update/${recordId}`, payload);

        if (isLogo) {
          window.dispatchEvent(new CustomEvent('companyLogoUpdated', { detail: { fileName: uploadedPath } }));
>>>>>>> origin/chore/repo-cleanup
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
<<<<<<< HEAD
      const token = localStorage.getItem('serviceToken') || '';
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
=======
      const url = path
        ? `/api/directory/list?path=${encodeURIComponent(path)}`
        : `/api/directory/roots`;

      const res = await axios.get(url);
      const data = res.data;
>>>>>>> origin/chore/repo-cleanup

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
<<<<<<< HEAD
      showSnack('Failed to load directories', 'error');
=======
      const msg = err.response?.data?.error || 'Failed to load directories';
      showSnack(msg, 'error');
      if (path) fetchDirectory(null);
>>>>>>> origin/chore/repo-cleanup
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
<<<<<<< HEAD
    if (!validate()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('serviceToken') || '';
=======
    if (!validate()) {
      showSnack('Please fix validation errors', 'error');
      return;
    }
    setLoading(true);
    try {
>>>>>>> origin/chore/repo-cleanup
      const payload = {
        ...form,
        stateCode: form.stateCode ? parseInt(form.stateCode) : null,
        licExpRemainderDays: form.licExpRemainderDays ? parseInt(form.licExpRemainderDays) : 0,
<<<<<<< HEAD
        restoreEnableDays: form.restoreEnableDays ? parseInt(form.restoreEnableDays) : 0,
=======
>>>>>>> origin/chore/repo-cleanup
        licRenewalDate: form.licRenewalDate ? new Date(form.licRenewalDate).toISOString() : null,
        licExpiryDate: form.licExpiryDate ? new Date(form.licExpiryDate).toISOString() : null,
        updatedBy: user?.id || 'SYSTEM'
      };
<<<<<<< HEAD

=======
      
>>>>>>> origin/chore/repo-cleanup
      if (!recordId) {
        payload.createdBy = user?.id || 'SYSTEM';
      }

<<<<<<< HEAD
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
=======
      let res;
      if (recordId) {
        res = await axios.put(`/api/company-profile/update/${recordId}`, payload);
      } else {
        res = await axios.post(`/api/company-profile/create`, payload);
      }
      
      const saved = res.data;
>>>>>>> origin/chore/repo-cleanup
      setRecordId(saved.id);
      showSnack(recordId ? 'Company profile updated successfully!' : 'Company profile saved successfully!', 'success');
    } catch (err) {
      showSnack('Error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
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
    sx: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        bgcolor: extra.InputProps?.readOnly ? 'action.hover' : 'background.paper',
        '&:hover fieldset': { borderColor: 'primary.main' }
      }
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
      sx={{ minWidth: 200 }}
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

=======
>>>>>>> origin/chore/repo-cleanup
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
    <Box sx={{ p: { xs: 1, md: 2 }, maxWidth: '100%', mx: 0 }}>
      {/* ── Page Header ── */}
      <Box sx={{
        background: 'linear-gradient(135deg,#5e72e4 0%,#825ee4 100%)',
        borderRadius: 3, p: { xs: 2.5, md: 3.5 }, mb: 3,
        color: '#fff', position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(94,114,228,0.35)'
      }}>
<<<<<<< HEAD
        {/* decorative circles */}
        <Box sx={{
          position: 'absolute', top: -40, right: -40, width: 180, height: 180,
          borderRadius: '50%', background: 'rgba(255,255,255,0.07)'
        }} />
        <Box sx={{
          position: 'absolute', bottom: -30, right: 80, width: 100, height: 100,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)'
        }} />
=======
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
        <Box sx={{ position: 'absolute', bottom: -30, right: 80, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
>>>>>>> origin/chore/repo-cleanup

        <Stack direction="row" alignItems="center" spacing={2}>
          <Box sx={{ p: 1.5, borderRadius: 2, background: 'rgba(255,255,255,0.18)', display: 'flex' }}>
            <IconBuilding size={28} stroke={1.5} />
          </Box>
          <Box>
<<<<<<< HEAD
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
=======
            <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.2 }}>Company Profile</Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.4 }}>Manage your company credentials and branding assets</Typography>
          </Box>
          {recordId && (
            <Chip label={`ID: ${recordId}`} size="small" sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 700 }} />
>>>>>>> origin/chore/repo-cleanup
          )}
        </Stack>
      </Box>

      {/* ── Form Card ── */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
<<<<<<< HEAD

        {/* ── Section 1 – Company Info ── */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {sectionTitle('Company Information', IconBuilding)}
          {/* Row 1: Names */}
          <Grid container spacing={2.5} mb={2.5}>
            <Grid item xs={12} md={6}>
              <TextField {...fieldProps('companyName', 'Company Name *')} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField {...fieldProps('shortName', 'Short Name')} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField {...fieldProps('gstIn', 'GST IN')} inputProps={{ maxLength: 15 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                {...fieldProps('address', 'Address')}
                multiline
                rows={2}
                fullWidth
                sx={{ ...fieldProps('address', 'Address').sx, width: '440px' }}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>
          </Grid>

          {/* Row 3: Geo Selection */}
          <Grid container spacing={2.5} mb={2.5}>
            <Grid item xs={12} md={6}>
              <DropdownField name="country" label="Country *" options={COUNTRIES} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <DropdownField
                name="state" label="State *"
                options={statesForCountry}
                disabled={!form.country} fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DropdownField
                name="city" label="City *"
                options={citiesForState}
                disabled={!form.state} fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField {...fieldProps('stateCode', 'State Code')}
                InputProps={{ readOnly: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'action.hover' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField {...fieldProps('pincode', 'Pincode')} inputProps={{ maxLength: 10 }} />
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
        {/* ── Section 2 – License Info ── */}
        <Box sx={{ p: { xs: 3, md: 3 } }}>
          {sectionTitle('License Details', IconAlertCircle)}

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={4}>
              <TextField {...fieldProps('dbSourceName', 'DB Source')} inputProps={{ maxLength: 10 }} disabled={!isSuperUser} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                {...fieldProps('licRenewalDate', 'License Renewal Date')}
                type="date"
                InputLabelProps={{ shrink: true }}
                disabled={!isSuperUser}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                {...fieldProps('licExpiryDate', 'License Expiry Date')}
                type="date"
                InputLabelProps={{ shrink: true }}
                disabled={!isSuperUser}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                {...fieldProps('licExpRemainderDays', 'Lic Exp Remainder Days')}
                type="number"
                disabled={!isSuperUser}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                {...fieldProps('restoreEnableDays', 'Restore Enable Days')}
                type="number"
                disabled={!isSuperUser}
                helperText="Grace period (days) to restore deleted records"
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                {...fieldProps('directoryPath', 'Directory Path')}
                disabled={!isSuperUser}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        color="primary"
                        onClick={handleOpenBrowser}
                        disabled={!isSuperUser}
                        title="Browse Server Folders"
                      >
=======
        
        <BOSFormSection title="Company Information" icon={<IconBuilding size={20} />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <BOSTextField name="companyName" label="Company Name *" value={form.companyName} onChange={handleChange} error={errors.companyName} />
            </Grid>
            <Grid item xs={12} md={3}>
              <BOSTextField name="shortName" label="Short Name" value={form.shortName} onChange={handleChange} error={errors.shortName} />
            </Grid>
            <Grid item xs={12} md={3}>
              <BOSTextField name="gstIn" label="GST IN" value={form.gstIn} onChange={handleChange} error={errors.gstIn} inputProps={{ maxLength: 15 }} />
            </Grid>
            <Grid item xs={12}>
              <BOSTextField name="address" label="Address" value={form.address} onChange={handleChange} error={errors.address} multiline rows={2} inputProps={{ maxLength: 500 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <BOSTextField select name="country" label="Country *" value={form.country} onChange={handleChange} error={errors.country} options={COUNTRIES.map(c => ({ value: c, label: c }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <BOSTextField select name="state" label="State *" value={form.state} onChange={handleChange} error={errors.state} disabled={!form.country} options={statesForCountry.map(c => ({ value: c, label: c }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <BOSTextField select name="city" label="City *" value={form.city} onChange={handleChange} error={errors.city} disabled={!form.state} options={citiesForState.map(c => ({ value: c, label: c }))} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2}>
                <BOSTextField name="stateCode" label="State Code" value={form.stateCode} disabled sx={{ width: '40%' }} />
                <BOSTextField name="pincode" label="Pincode" value={form.pincode} onChange={handleChange} error={errors.pincode} inputProps={{ maxLength: 10 }} sx={{ width: '60%' }} />
              </Stack>
            </Grid>
          </Grid>
        </BOSFormSection>

        <Divider />

        <BOSFormSection title="Branding Assets" icon={<IconPhoto size={20} />}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>Company Logo</Typography>
              <ImageUploadCard label="Company Logo" icon={IconPhoto} field="logoFileName" preview={form.logoFileName} onUpload={handleImageUpload} uploading={uploading.logo} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" fontWeight={600} color="text.secondary" mb={1}>Login Background Image</Typography>
              <ImageUploadCard label="Login Background" icon={IconLogin} field="logInBgFileName" preview={form.logInBgFileName} onUpload={handleImageUpload} uploading={uploading.bg} />
            </Grid>
          </Grid>
        </BOSFormSection>

        <Divider />

        <BOSFormSection title="License Details" icon={<IconAlertCircle size={20} />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <BOSTextField name="dbSourceName" label="DB Source" value={form.dbSourceName} onChange={handleChange} error={errors.dbSourceName} disabled={!isSuperUser} inputProps={{ maxLength: 10 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <BOSTextField name="licRenewalDate" label="License Renewal Date" type="date" value={form.licRenewalDate} onChange={handleChange} error={errors.licRenewalDate} disabled={!isSuperUser} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <BOSTextField name="licExpiryDate" label="License Expiry Date" type="date" value={form.licExpiryDate} onChange={handleChange} error={errors.licExpiryDate} disabled={!isSuperUser} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <BOSTextField name="licExpRemainderDays" label="Lic Exp Remainder Days" type="number" value={form.licExpRemainderDays} onChange={handleChange} error={errors.licExpRemainderDays} disabled={!isSuperUser} />
            </Grid>
            <Grid item xs={12} sm={8}>
              <BOSTextField 
                name="directoryPath" label="Directory Path" value={form.directoryPath} onChange={handleChange} error={errors.directoryPath} disabled={!isSuperUser}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton color="primary" onClick={handleOpenBrowser} disabled={!isSuperUser} title="Browse Server Folders">
>>>>>>> origin/chore/repo-cleanup
                        <IconFolderOpen size={20} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
<<<<<<< HEAD
        </Box>
=======
        </BOSFormSection>
>>>>>>> origin/chore/repo-cleanup

        <FolderBrowserDialog />

        <Divider />

<<<<<<< HEAD
        {/* ── Section 4 – System Info ── */}
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'rgba(0,0,0,0.01)' }}>
          {sectionTitle('System Information', IconAlertCircle)}
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Created By"
                value={form.createdBy}
                fullWidth
                size="small"
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconUser size={18} opacity={0.5} />
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'action.hover' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Created Date"
                value={form.createdDate ? new Date(form.createdDate).toLocaleString() : ''}
                fullWidth
                size="small"
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconCalendar size={18} opacity={0.5} />
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'action.hover' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Updated By"
                value={form.updatedBy}
                fullWidth
                size="small"
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconUser size={18} opacity={0.5} />
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'action.hover' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Updated Date"
                value={form.updatedDate ? new Date(form.updatedDate).toLocaleString() : ''}
                fullWidth
                size="small"
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconCalendar size={18} opacity={0.5} />
                    </InputAdornment>
                  )
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'action.hover' } }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider />


=======
        <BOSFormSection title="System Information" icon={<IconAlertCircle size={20} />}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <BOSTextField label="Created By" value={form.createdBy} disabled InputProps={{ startAdornment: <InputAdornment position="start"><IconUser size={18} opacity={0.5} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <BOSTextField label="Created Date" value={form.createdDate ? new Date(form.createdDate).toLocaleString() : ''} disabled InputProps={{ startAdornment: <InputAdornment position="start"><IconCalendar size={18} opacity={0.5} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <BOSTextField label="Updated By" value={form.updatedBy} disabled InputProps={{ startAdornment: <InputAdornment position="start"><IconUser size={18} opacity={0.5} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <BOSTextField label="Updated Date" value={form.updatedDate ? new Date(form.updatedDate).toLocaleString() : ''} disabled InputProps={{ startAdornment: <InputAdornment position="start"><IconCalendar size={18} opacity={0.5} /></InputAdornment> }} />
            </Grid>
          </Grid>
        </BOSFormSection>
>>>>>>> origin/chore/repo-cleanup

        <Divider />

        {/* ── Action Buttons ── */}
        <Box sx={{
          p: { xs: 2, md: 3 },
          bgcolor: 'action.hover',
          display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap'
        }}>
<<<<<<< HEAD
          {/* <Tooltip title="Reset form">
            <Button
              variant="outlined"
              startIcon={<IconRefresh size={18} />}
              onClick={handleReset}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Reset
            </Button>
          </Tooltip> */}
=======
>>>>>>> origin/chore/repo-cleanup
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
<<<<<<< HEAD

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
=======
>>>>>>> origin/chore/repo-cleanup
    </Box>
  );
};

export default CompanyProfile;
