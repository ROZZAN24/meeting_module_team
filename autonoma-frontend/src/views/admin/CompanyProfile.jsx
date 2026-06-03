import TextField from 'ui-component/CustomTextField';
import React, { useState, useEffect, useRef } from 'react';
import { Box, Grid, Typography, Button, Divider, Snackbar, Alert, CircularProgress, Avatar, Tooltip, MenuItem, Select, FormControl, InputLabel, FormHelperText, Paper, Chip, Stack, Autocomplete, InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItemIcon, ListItemText, ListItemButton, Tabs, Tab } from '@mui/material';
import {
  IconBuilding, IconUpload, IconDeviceFloppy, IconRefresh,
  IconPhoto, IconLogin, IconCheck, IconAlertCircle, IconFolderOpen,
  IconChevronRight, IconArrowLeft, IconFolder, IconDeviceFloppy as IconDrive,
  IconUser, IconCalendar,
  IconSettings2,
  IconLicense,
  IconBrandUnity,
  IconMapPin,
  IconExternalLink,
  IconCurrentLocation
} from '@tabler/icons-react';
import { useTheme, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { RMap, RMarker } from 'maplibre-react-components';
import osm_bright from '../forms/map/map-data/osm_bright.json';
import useAuth from 'hooks/useAuth';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_APP_API_URL || window.location.origin).replace(/\/+$/, '');

// ─── Static Geo Data ────────────────────────────────────────────────────────
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED'];
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
  logoFileName: '', logInBgFileName: '', directoryPath: 'BOS_DOCUMENTS',
  licExpRemainderDays: 0,
  restoreEnableDays: 7,
  inputCaseStyle: 'CUSTOM',
  registrationNo: '', panNo: '', mobileNo: '', phoneNo: '', emailId: '', website: '', gmaplink: '',
  decimalPlaces: 2, currencyCode: 'INR',
  smtpHost: '', smtpPort: 587, smtpUsername: '', smtpPassword: '', smtpSslEnabled: false,
  supportEmail: '', supportPhone: '', auditLogEnabled: false,
  createdBy: '', createdDate: '', updatedBy: '', updatedDate: ''
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
  const theme = useTheme();

  console.log("CompanyProfile layout version: 6-3-3 active");

  const { user } = useAuth();
  const isSuperUser = user?.userLevel === 5;

  const perms = usePagePermissions(PAGE_CODES.AD_COMPANY_PROFILE);

  const [form, setForm] = useState(emptyForm);
  const [activeTab, setActiveTab] = useState(0);
  const [originalCaseStyle, setOriginalCaseStyle] = useState('UPPER_CASE');
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [casePromptOpen, setCasePromptOpen] = useState(false);
  const [databaseUpdating, setDatabaseUpdating] = useState(false);
  const [uploading, setUploading] = useState({ logo: false, bg: false });
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const [errors, setErrors] = useState({});
  const [browserOpen, setBrowserOpen] = useState(false);
  const [browserData, setBrowserData] = useState({ currentPath: '', folders: [], roots: [], parentPath: null });
  const [browserLoading, setBrowserLoading] = useState(false);

  // Map Picker State
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [mapMarker, setMapMarker] = useState({ latitude: 13.0827, longitude: 80.2707 });

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
            directoryPath: rec.directoryPath || 'BOS_DOCUMENTS',
            licExpRemainderDays: rec.licExpRemainderDays || 0,
            restoreEnableDays: rec.restoreEnableDays || 0,
            inputCaseStyle: rec.inputCaseStyle || 'UPPER_CASE',
            decimalPlaces: rec.decimalPlaces != null ? rec.decimalPlaces : 2,
            currencyCode: rec.currencyCode || 'INR',
            createdBy: rec.createdBy || '',
            createdDate: rec.createdDate || '',
            updatedBy: rec.updatedBy || '',
            updatedDate: rec.updatedDate || ''
          });
          setOriginalCaseStyle(rec.inputCaseStyle || 'UPPER_CASE');
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

  const handleMarkerDrag = (e) => {
    const lngLat = e.target.getLngLat();
    setMapMarker({ latitude: lngLat.lat, longitude: lngLat.lng });
  };

  const openMapDialog = () => {
    let lat = 13.0827, lng = 80.2707;
    if (form.gmaplink) {
      const match = form.gmaplink.match(/q=([-+]?\d*\.?\d+),([-+]?\d*\.?\d+)/);
      if (match) {
        lat = parseFloat(match[1]);
        lng = parseFloat(match[2]);
      }
    }
    setMapMarker({ latitude: lat, longitude: lng });
    setMapDialogOpen(true);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapMarker({ latitude: position.coords.latitude, longitude: position.coords.longitude });
          showSnack('Location updated to current position!', 'success');
        },
        (error) => {
          showSnack('Unable to retrieve your location.', 'error');
        }
      );
    } else {
      showSnack('Geolocation is not supported by this browser.', 'error');
    }
  };

  const handleMapSave = () => {
    handleChange({
      target: { name: 'gmaplink', value: `https://maps.google.com/?q=${mapMarker.latitude},${mapMarker.longitude}` }
    });
    setMapDialogOpen(false);
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
  const handleSaveClick = () => {
    if (!validate()) return;

    // Intercept if case style changed (skip dialog if changing to CUSTOM)
    if (form.inputCaseStyle !== originalCaseStyle && form.inputCaseStyle !== 'CUSTOM') {
      setCasePromptOpen(true);
    } else {
      executeSave(false);
    }
  };

  const executeSave = async (updateExistingDb) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('serviceToken') || '';
      const payload = {
        ...form,
        stateCode: form.stateCode ? parseInt(form.stateCode) : null,
        licExpRemainderDays: form.licExpRemainderDays ? parseInt(form.licExpRemainderDays) : 0,
        restoreEnableDays: form.restoreEnableDays ? parseInt(form.restoreEnableDays) : 0,
        decimalPlaces: form.decimalPlaces ? parseInt(form.decimalPlaces) : 2,
        smtpPort: form.smtpPort ? parseInt(form.smtpPort) : 587,
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
      setOriginalCaseStyle(form.inputCaseStyle);
      window.localStorage.setItem('inputCaseStyle', form.inputCaseStyle);

      if (updateExistingDb) {
        setDatabaseUpdating(true);
        try {
          const dbRes = await fetch(`${API_BASE}/api/company-profile/update-database-case-style?style=${form.inputCaseStyle}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!dbRes.ok) throw new Error('Failed to update existing database records');
          showSnack('Saved successfully and all existing database records have been transformed!', 'success');
        } catch (e) {
          showSnack('Profile saved, but failed to update existing database records.', 'warning');
        } finally {
          setDatabaseUpdating(false);
        }
      } else {
        showSnack('Saved successfully!', 'success');
      }
    } catch (err) {
      showSnack(err.message || 'Failed to save', 'error');
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
    <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
      <Box sx={{
        p: 0.75, borderRadius: 2,
        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
        border: '1px solid #bfdbfe',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(59,130,246,0.1)'
      }}>
        <Icon size={18} color="#2563eb" stroke={2.5} />
      </Box>
      <Typography variant="subtitle1" fontWeight={800} color="#1e293b" sx={{ letterSpacing: '0.01em' }}>
        {title}
      </Typography>
    </Box>
  );

  const fieldProps = (name, label, extra = {}) => ({
    name, label, value: form[name] || '',
    onChange: handleChange,
    error: !!errors[name],
    helperText: errors[name] || '',
    size: 'small', fullWidth: true,
    ...extra,
    InputProps: {
      style: { color: '#0f172a', fontWeight: 500 },
      ...extra.InputProps
    },
    InputLabelProps: {
      style: { color: '#64748b' },
      ...extra.InputLabelProps
    },
    sx: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 2,
        bgcolor: extra.InputProps?.readOnly ? '#f1f5f9' : '#ffffff',
        '& fieldset': { borderColor: '#cbd5e1' },
        '&:hover fieldset': { borderColor: '#94a3b8' },
        '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: '2px' },
        '& input': { py: 0.75, px: 1.5, fontSize: '0.85rem' },
        '& textarea': { fontSize: '0.85rem' }
      },
      '& .MuiInputLabel-root': { fontSize: '0.85rem' },
      ...(extra.sx || {})
    }
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
      sx={{
        minWidth: 200,
        '& .MuiOutlinedInput-root': { padding: '2px !important' },
        '& .MuiAutocomplete-input': { padding: '4px 8px !important', fontSize: '0.85rem', color: '#0f172a', fontWeight: 500 },
        '& .MuiInputLabel-root': { fontSize: '0.85rem', color: '#64748b' },
        '& .MuiIconButton-root': { color: '#64748b' }
      }}
      disabled={disabled}
      options={options}
      value={form[name] || null}
      onChange={(event, newValue) => {
        handleChange({ target: { name, value: newValue || '' } });
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
              bgcolor: disabled ? '#f1f5f9' : '#ffffff',
              '& fieldset': { borderColor: '#cbd5e1' },
              '&:hover fieldset': { borderColor: '#94a3b8' },
              '&.Mui-focused fieldset': { borderColor: '#3b82f6', borderWidth: '2px' }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, overflowX: 'hidden', minHeight: '100vh', background: '#f8fafc' }}>
      {/* ── Page Header ── */}
      <Box sx={{
        position: 'relative',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        p: { xs: 1.5, md: 2 },
        mb: 2,
        color: '#0f172a',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Decorative shapes (static) */}
        <Box sx={{
          position: 'absolute', top: -30, right: -30, width: 150, height: 150,
          borderRadius: '50%', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.0))',
          backdropFilter: 'blur(10px)'
        }} />
        <Box sx={{
          position: 'absolute', bottom: -40, right: 100, width: 120, height: 120,
          borderRadius: '50%', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0))',
          backdropFilter: 'blur(15px)'
        }} />

        <Stack direction="row" alignItems="center" spacing={2} sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
          {/* Logo / Icon Container */}
          <Box sx={{
            p: 1.5,
            borderRadius: '12px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            color: '#2563eb'
          }}>
            <IconBuilding size={26} stroke={2} />
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" fontWeight={900} sx={{
              lineHeight: 1.2,
              color: '#0f172a',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              Company Profile
            </Typography>

            {form.companyName ? (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.2 }}>
                <Typography variant="body2" sx={{
                  color: '#475569',
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}>
                  {form.companyName}
                </Typography>
              </Stack>
            ) : (
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                Manage your company credentials and branding assets
              </Typography>
            )}
          </Box>

          {perms.write && (
            <Button
              variant="contained"
              startIcon={loading || databaseUpdating ? <CircularProgress size={16} color="inherit" /> : <IconDeviceFloppy size={18} />}
              onClick={handleSaveClick}
              disabled={loading || databaseUpdating || !perms.write}
              sx={{
                borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 3,
                background: '#2563eb',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                color: '#fff',
                '&:hover': { background: '#1d4ed8' }
              }}
            >
              {loading ? 'Saving…' : recordId ? 'Update Profile' : 'Save Profile'}
            </Button>
          )}
          {recordId && (
            <Box sx={{
              px: 2, py: 0.75,
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                ID
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#0f172a', fontWeight: 900 }}>
                #{recordId}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {/* ── Main Profile Content ── */}
      <Box sx={{ width: '100%', flexGrow: 1 }} component={motion.div} variants={containerVariants} initial="hidden" animate="show">
        <Stack spacing={3}>

          {/* Company Details Row (Always Visible at Top) */}
          <Paper elevation={0} component={motion.div} variants={itemVariants} sx={{ border: '1px solid #e2e8f0', borderRadius: 4, p: 3, background: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025)' }}>
            <Grid container spacing={2} columns={24}>
              <Grid item xs={24} md={8}><TextField {...fieldProps('companyName', 'Company Name*')} /></Grid>
              <Grid item xs={24} md={4}><TextField {...fieldProps('shortName', 'Short Name')} /></Grid>
              <Grid item xs={24} md={4}><TextField {...fieldProps('registrationNo', 'Registration No')} /></Grid>
              <Grid item xs={24} md={4}><TextField {...fieldProps('panNo', 'PAN No')} /></Grid>
              <Grid item xs={24} md={4}><TextField {...fieldProps('gstIn', 'GST IN')} inputProps={{ maxLength: 15 }} /></Grid>

            </Grid>
          </Paper>

          {/* Main Layout (Tabs + Tab Content) */}
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>

            {/* Left Side: Vertical Tabs */}
            <Paper elevation={0} sx={{
              minWidth: { xs: '100%', md: 260 },
              border: '1px solid #e2e8f0',
              borderRadius: 4,
              bgcolor: '#ffffff',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              height: 'fit-content'
            }}>
              <Tabs
                orientation="vertical"
                variant="scrollable"
                value={activeTab}
                onChange={(e, val) => setActiveTab(val)}
                sx={{
                  borderRight: 1, borderColor: 'divider',
                  '& .MuiTab-root': {
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    py: 2.5, px: 3,
                    fontWeight: 600,
                    color: '#64748b',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    borderBottom: '1px solid #f8fafc',
                    minHeight: 64
                  },
                  '& .Mui-selected': {
                    color: '#2563eb !important',
                    bgcolor: '#eff6ff',
                    fontWeight: 700
                  }
                }}
              >
                <Tab icon={<IconBuilding size={20} />} iconPosition="start" label="Contact & Web" />
                <Tab icon={<IconPhoto size={20} />} iconPosition="start" label="Branding & Identity" />
                <Tab icon={<IconSettings2 size={20} />} iconPosition="start" label="App Config" />
                <Tab icon={<IconSettings2 size={20} />} iconPosition="start" label="SMTP Settings" />
                <Tab icon={<IconLicense size={20} />} iconPosition="start" label="License Info" />
                <Tab icon={<IconBrandUnity size={20} />} iconPosition="start" label="System Audit" />
              </Tabs>
            </Paper>


            {/* Right Side: Tab Content */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show">

                {/* Tab 0: Branding & Identity */}
                {activeTab === 1 && (
                  <Paper elevation={0} component={motion.div} variants={itemVariants} sx={{ border: '1px solid #e2e8f0', borderRadius: 4, p: 3, background: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025)' }}>
                    {sectionTitle('Branding & Identity', IconPhoto)}
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <ImageUploadCard label="Company Logo" icon={IconPhoto} field="logoFileName" preview={form.logoFileName} onUpload={handleImageUpload} uploading={uploading.logo} />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <ImageUploadCard label="Login Background" icon={IconLogin} field="logInBgFileName" preview={form.logInBgFileName} onUpload={handleImageUpload} uploading={uploading.bg} />
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {/* Tab 1: Contact & Web */}
                {activeTab === 0 && (
                  <Paper elevation={0} component={motion.div} variants={itemVariants} sx={{ border: '1px solid #e2e8f0', borderRadius: 4, p: 3, background: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025)' }}>
                    {sectionTitle('Contact & Web', IconBuilding)}
                    <Grid container spacing={4}>

                      {/* Left Column: Address Details */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#475569', fontWeight: 700 }}>Address Details</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12}><TextField {...fieldProps('address', 'Address')} multiline rows={3} fullWidth inputProps={{ maxLength: 500 }} /></Grid>
                          <Grid item xs={12}><DropdownField name="country" label="Country *" options={COUNTRIES} fullWidth /></Grid>
                          <Grid item xs={12} sm={6}><DropdownField name="state" label="State *" options={statesForCountry} disabled={!form.country} fullWidth /></Grid>
                          <Grid item xs={12} sm={6}><DropdownField name="city" label="City *" options={citiesForState} disabled={!form.state} fullWidth /></Grid>
                          <Grid item xs={12} sm={6}><TextField {...fieldProps('pincode', 'Pincode')} inputProps={{ maxLength: 6 }} /></Grid>
                        </Grid>
                      </Grid>

                      {/* Right Column: Other Details */}
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#475569', fontWeight: 700 }}>Contact Details</Typography>
                        <Grid container spacing={3} sx={{ height: '100%' }}>
                          <Grid item xs={12} sm={5}>
                            <Stack spacing={2.5}>
                              <TextField {...fieldProps('mobileNo', 'Mobile No')} />
                              <TextField {...fieldProps('phoneNo', 'Phone No')} />
                              <TextField {...fieldProps('emailId', 'Email ID')} />
                              <TextField {...fieldProps('website', 'Website')} />
                              <TextField {...fieldProps('supportPhone', 'Support Phone')} />
                              <TextField {...fieldProps('supportEmail', 'Support Email')} />
                            </Stack>
                          </Grid>
                          <Grid item xs={12} sm={7}>
                            <TextField
                              name="gmaplink"
                              value={form.gmaplink}
                              onChange={handleChange}
                              placeholder="Google Maps Link"
                              multiline
                              rows={14}
                              fullWidth
                              sx={{

                                '& textarea': {
                                  textAlign: 'center',
                                  fontSize: '1.25rem',
                                  fontWeight: 500,
                                  color: '#64748b',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  marginTop: 'auto',
                                  marginBottom: 'auto'
                                }
                              }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end" sx={{ height: '100%', maxHeight: 'none', alignItems: 'center', ml: 1 }}>
                                    {form.gmaplink && (
                                      <Tooltip title="View Map">
                                        <IconButton sx={{ color: '#0ea5e9', mr: 1 }} onClick={() => window.open(form.gmaplink, '_blank')}>
                                          <IconExternalLink size={28} />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    <Tooltip title="Pick Location">
                                      <IconButton sx={{ color: '#2563eb', bgcolor: '#eff6ff', borderRadius: 2, p: 1.5 }} onClick={openMapDialog}>
                                        <IconMapPin size={36} />
                                      </IconButton>
                                    </Tooltip>
                                  </InputAdornment>
                                )
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>

                    </Grid>
                  </Paper>
                )}

                {/* Tab 2: SMTP Settings */}
                {activeTab === 3 && (
                  <Paper elevation={0} component={motion.div} variants={itemVariants} sx={{ border: '1px solid #e2e8f0', borderRadius: 4, p: 3, background: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025)' }}>
                    {sectionTitle('SMTP Settings', IconSettings2)}
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}><TextField {...fieldProps('smtpHost', 'SMTP Host')} /></Grid>
                      <Grid item xs={12} md={2}><TextField {...fieldProps('smtpPort', 'SMTP Port')} type="number" /></Grid>
                      <Grid item xs={12} md={3}><TextField {...fieldProps('smtpUsername', 'SMTP Username')} /></Grid>
                      <Grid item xs={12} md={3}><TextField {...fieldProps('smtpPassword', 'SMTP Password')} type="password" /></Grid>
                      <Grid item xs={12} md={1} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <input type="checkbox" id="smtpSslEnabled" checked={form.smtpSslEnabled} onChange={(e) => handleChange({ target: { name: 'smtpSslEnabled', value: e.target.checked } })} />
                          <label htmlFor="smtpSslEnabled" style={{ fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, color: '#0f172a' }}>SSL</label>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {/* Tab 3: License Info */}
                {activeTab === 4 && (
                  <Paper elevation={0} component={motion.div} variants={itemVariants} sx={{ border: '1px solid #e2e8f0', borderRadius: 4, p: 3, background: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025)' }}>
                    {sectionTitle('License Info', IconLicense)}
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}><TextField {...fieldProps('dbSourceName', 'DB Source Name')} inputProps={{ maxLength: 10 }} disabled={!isSuperUser} /></Grid>
                      <Grid item xs={12} md={3}><TextField {...fieldProps('licRenewalDate', 'Renewal Date')} type="date" InputLabelProps={{ shrink: true }} disabled={!isSuperUser} /></Grid>
                      <Grid item xs={12} md={3}><TextField {...fieldProps('licExpiryDate', 'Expiry Date')} type="date" InputLabelProps={{ shrink: true }} disabled={!isSuperUser} /></Grid>
                      <Grid item xs={12} md={3}><TextField {...fieldProps('licExpRemainderDays', 'Exp Remainder Days')} type="number" disabled={!isSuperUser} /></Grid>
                      <Grid item xs={12} md={3}><TextField {...fieldProps('restoreEnableDays', 'Restore Enable Days')} type="number" disabled={!isSuperUser} helperText="Grace period" /></Grid>
                      <Grid item xs={12} md={6}>
                        <TextField {...fieldProps('directoryPath', 'Document Path')} disabled={!isSuperUser} InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton sx={{ color: '#2563eb' }} onClick={handleOpenBrowser} disabled={!isSuperUser}><IconFolderOpen size={20} /></IconButton></InputAdornment>) }} />
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {/* Tab 4: App Config */}
                {activeTab === 2 && (
                  <Paper elevation={0} component={motion.div} variants={itemVariants} sx={{ border: '1px solid #e2e8f0', borderRadius: 4, p: 3, background: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025)' }}>
                    {sectionTitle('App Config', IconSettings2)}
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}><DropdownField name="inputCaseStyle" label="Default Input Case Style" options={['UPPER_CASE', 'PROPER_CASE', 'LOWER_CASE', 'CUSTOM']} fullWidth /></Grid>
                      <Grid item xs={12} md={4}><TextField {...fieldProps('decimalPlaces', 'Decimal Places')} type="number" inputProps={{ min: 0, max: 10 }} /></Grid>
                      <Grid item xs={12} md={4}><DropdownField name="currencyCode" label="Currency Code" options={CURRENCIES} fullWidth /></Grid>
                    </Grid>
                  </Paper>
                )}

                {/* Tab 5: System Audit */}
                {activeTab === 5 && (
                  <Paper elevation={0} component={motion.div} variants={itemVariants} sx={{ border: '1px solid #cbd5e1', borderRadius: 4, p: 3, background: '#f8fafc', boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.02)' }}>
                    {sectionTitle('System Audit', IconBrandUnity)}
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <input type="checkbox" id="auditLogEnabled" checked={form.auditLogEnabled} onChange={(e) => handleChange({ target: { name: 'auditLogEnabled', value: e.target.checked } })} />
                          <label htmlFor="auditLogEnabled" style={{ fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, color: '#0f172a' }}>Enable Audit Logs</label>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={2.5}><TextField label="Created By" value={form.createdBy} fullWidth size="small" InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><IconUser color="#64748b" size={16} /></InputAdornment> }} /></Grid>
                      <Grid item xs={12} md={2.5}><TextField label="Created Date" value={form.createdDate ? new Date(form.createdDate).toLocaleString() : ''} fullWidth size="small" InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><IconCalendar color="#64748b" size={16} /></InputAdornment> }} /></Grid>
                      <Grid item xs={12} md={2.5}><TextField label="Updated By" value={form.updatedBy} fullWidth size="small" InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><IconUser color="#64748b" size={16} /></InputAdornment> }} /></Grid>
                      <Grid item xs={12} md={2.5}><TextField label="Updated Date" value={form.updatedDate ? new Date(form.updatedDate).toLocaleString() : ''} fullWidth size="small" InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start"><IconCalendar color="#64748b" size={16} /></InputAdornment> }} /></Grid>
                    </Grid>
                  </Paper>
                )}

              </Box>
            </Box>
          </Box>
        </Stack>
      </Box>

      {/* Database Case Style Update Confirmation Dialog */}
      <Dialog open={casePromptOpen} onClose={() => !databaseUpdating && setCasePromptOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Update Global Case Style</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" mb={2}>
            You have changed the <strong>Default Input Case Style</strong> from {originalCaseStyle} to {form.inputCaseStyle}.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            How would you like this change to be applied?
          </Typography>
          <Box mt={2} pl={2} borderLeft="3px solid" borderColor="warning.main">
            <Typography variant="body2" mb={1}>
              <strong>Apply to future data only:</strong> The new case style will only affect new inputs. Existing data in the database will remain unchanged.
            </Typography>
            <Typography variant="body2" color="error.main">
              <strong>Update existing database:</strong> This will retroactively update ALL text across the entire database to match the new case style. This operation may take several minutes.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCasePromptOpen(false)} disabled={databaseUpdating || loading}>Cancel</Button>
          <Button
            variant="outlined"
            onClick={() => { setCasePromptOpen(false); executeSave(false); }}
            disabled={databaseUpdating || loading}
          >
            Future Data Only
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => { setCasePromptOpen(false); executeSave(true); }}
            disabled={databaseUpdating || loading}
            startIcon={databaseUpdating || loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {databaseUpdating ? 'Updating Database...' : 'Update Existing Database'}
          </Button>
        </DialogActions>
      </Dialog>

      <FolderBrowserDialog />

      {/* Map Picker Dialog */}
      <Dialog open={mapDialogOpen} onClose={() => setMapDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Pick Location from Map</DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: 400 }}>
          <RMap initialCenter={[mapMarker.longitude, mapMarker.latitude]} initialZoom={12} mapStyle={osm_bright}>
            <RMarker
              longitude={mapMarker.longitude}
              latitude={mapMarker.latitude}
              draggable={true}
              initialAnchor="bottom"
              onDrag={handleMarkerDrag}
            />
          </RMap>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleGetCurrentLocation}
            color="secondary"
            startIcon={<IconCurrentLocation size={18} />}
            sx={{ mr: 'auto' }}
          >
            Live Location
          </Button>
          <Button onClick={() => setMapDialogOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleMapSave} startIcon={<IconMapPin size={18} />}>
            Use this Location
          </Button>
        </DialogActions>
      </Dialog>

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
