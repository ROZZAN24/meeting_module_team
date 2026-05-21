import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Grid, Box, Typography, MenuItem, Paper, Stack,
  Button, IconButton, Divider, Checkbox, ListItemText, useTheme,
  Autocomplete, Chip, Tooltip, CircularProgress
} from '@mui/material';
import {
  IconCloudUpload, IconCamera, IconFileDescription,
  IconMicrophone, IconMicrophoneOff, IconEye, IconTrash,
  IconInfoCircle, IconAlertCircle, IconSettings, IconClipboardList
} from '@tabler/icons-react';
import axios from 'utils/axios';
import useLookups from 'hooks/useLookups';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSFormDialog, BOSFormSection, BOSTextField, BOSFilePreview } from 'ui-component/bos';

// ── Top-level so it never remounts on parent re-render ────────────────────────
const FileItem = ({ file, onPreview, onRemove }) => (
  <Box
    sx={{
      display: 'flex', alignItems: 'center', gap: 1, py: 0.5, px: 1,
      borderRadius: 1,
      '&:hover': { bgcolor: 'action.hover' }
    }}
  >
    <IconFileDescription size={16} style={{ flexShrink: 0 }} />
    <Typography variant="caption" noWrap sx={{ flex: 1, fontSize: '0.72rem' }}>{file.name}</Typography>
    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.disabled', flexShrink: 0, mr: 0.5 }}>
      {(file.size / 1024).toFixed(0)}KB
    </Typography>
    {onPreview && (
      <Tooltip title="Preview">
        <IconButton size="small" onClick={() => onPreview(file)} sx={{ p: 0.3, color: 'primary.main' }}>
          <IconEye size={14} />
        </IconButton>
      </Tooltip>
    )}
    {onRemove && (
      <Tooltip title="Remove">
        <IconButton size="small" onClick={() => onRemove(file)} sx={{ p: 0.3, color: 'error.main' }}>
          <IconTrash size={14} />
        </IconButton>
      </Tooltip>
    )}
  </Box>
);
FileItem.propTypes = { file: PropTypes.object, onPreview: PropTypes.func, onRemove: PropTypes.func };

const DEPARTMENTS = [
  'ACCOUNTS','ADMIN','ASSEMBLY','BUSINESS DEVELOPMENT','DESIGN & DEVELOPMENT',
  'FINANCE','HRA','IT','LOGISTICS','MAINTENANCE','MARKETING','PRODUCTION','PURCHASE','QUALITY','STORES'
];

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const LabelInput = ({ label, required, children }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, width: '100%' }}>
    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary' }}>
      {label}
      {required && <Typography component="span" sx={{ color: 'error.main', fontWeight: 900, ml: 0.2 }}>*</Typography>}
    </Typography>
    <Box sx={{ width: '100%' }}>{children}</Box>
  </Box>
);
const formatDateForInput = (dateVal) => {
  if (!dateVal) return '';
  try {
    if (typeof dateVal === 'number') {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    }
    
    let str = String(dateVal).trim();
    if (!str) return '';
    
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      return str.substring(0, 10);
    }
    
    if (/^\d{2}-\d{2}-\d{4}/.test(str)) {
      const parts = str.split('-');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    
    const d = new Date(str);
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  } catch (e) {
    return '';
  }
};

const parseFileString = (fileStr) => {
  if (!fileStr || typeof fileStr !== 'string') return [];
  return fileStr
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(name => {
      const parts = name.split('_');
      const displayName = parts.length > 1 && parts[0].length >= 32 ? parts.slice(1).join('_') : name;
      return {
        name: displayName,
        fileName: displayName,
        serverFileName: name,
        isServer: true,
        size: 0
      };
    });
};

const inputSx = {
  backgroundColor: '#fff',
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#cbd5e1',
    },
    '&:hover fieldset': {
      borderColor: '#94a3b8',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563eb',
      borderWidth: '1px',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#64748b',
    '&.Mui-focused': {
      color: '#2563eb',
    },
  },
  '& .MuiFormLabel-asterisk': {
    color: '#ef4444',
  }
};

export default function AddCheckListDialog({ open, handleClose, onSave, initialData, isAmendment }) {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [seqNo, setSeqNo] = useState('');
  const [status, setStatus] = useState('Active');
  const [assignTo, setAssignTo] = useState('');
  const lookups = useLookups(['EMPLOYEES']);
  const employeeList = (lookups.employees || []).map(e => e.employeeName || `${e.firstName} ${e.lastName}`);
  const [category, setCategory] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [reminderDays, setReminderDays] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [renewalPoint, setRenewalPoint] = useState('');
  const [frequency, setFrequency] = useState('');
  const [weekDays, setWeekDays] = useState('');
  const [repeatEveryValue, setRepeatEveryValue] = useState('');
  const [repeatEveryUnit, setRepeatEveryUnit] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState([]);
  const [departmentsList, setDepartmentsList] = useState(DEPARTMENTS);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [scannedFiles, setScannedFiles] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [stockLink, setStockLink] = useState('');
  const [photoRequired, setPhotoRequired] = useState('');
  const [dualCheck, setDualCheck] = useState('');
  const [carryForward, setCarryForward] = useState('');
  const [amendmentReason, setAmendmentReason] = useState('');
  const [levelIds, setLevelIds] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const isViewOnly = initialData?.verifyStatus === 'Verified' && !isAmendment;
  const speechRef = useRef(null);
  const isSpeechSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const stopListening = useCallback(() => {
    if (speechRef.current) {
      speechRef.current.stop();
      speechRef.current = null;
    }
    setIsListening(false);
    setInterimText('');
  }, []);

  const startListening = useCallback(() => {
    if (!isSpeechSupported) { dispatch(openSnackbar({ open: true, message: 'Speech recognition is not supported in this browser. Please use Chrome or Edge.', variant: 'alert', alert: { color: 'error' }, severity: 'error' })); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      if (final) setDescription(prev => (prev ? prev + ' ' : '') + final.trim());
      setInterimText(interim);
    };
    recognition.onerror = () => stopListening();
    recognition.onend = () => { setIsListening(false); setInterimText(''); };

    recognition.start();
    speechRef.current = recognition;
    setIsListening(true);
  }, [isSpeechSupported, stopListening]);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  // Stop mic when dialog closes
  useEffect(() => { if (!open) stopListening(); }, [open, stopListening]);

  const [previewFile, setPreviewFile] = useState(null);

  // Open and close file preview dialog using BOSFilePreview
  const handlePreviewOpen = useCallback((file) => {
    setPreviewFile(file);
  }, []);

  const handlePreviewClose = useCallback(() => {
    setPreviewFile(null);
  }, []);

  const handleRemoveFile = useCallback((fileToRemove) => {
    setUploadedFiles(prev => prev.filter(f => f !== fileToRemove));
  }, []);

  const handleRemoveScannedFile = useCallback((fileToRemove) => {
    setScannedFiles(prev => prev.filter(f => f !== fileToRemove));
  }, []);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setSeqNo(initialData.seqNo || '');
        setAssignTo(initialData.assignTo || '');
        setCategory(initialData.category || '');
        setEffectiveFrom(formatDateForInput(initialData.effectiveFrom));
        setExpiryDate(formatDateForInput(initialData.expiryDate));
        setReminderDays(initialData.reminderDays || '');
        setReminderDate(formatDateForInput(initialData.reminderDate));
        setRenewalPoint(initialData.checkingPoint || '');
        setFrequency(initialData.frequency || '');
        setWeekDays(initialData.weekDays ? (Array.isArray(initialData.weekDays) ? initialData.weekDays[0] : String(initialData.weekDays).split(',')[0]) : '');
        setRepeatEveryValue(initialData.repeatEveryValue || '');
        setRepeatEveryUnit(initialData.repeatEveryUnit || '');
        setDescription(initialData.description || '');
        setDepartment((initialData.departments || []).map(d => d.departmentName));
        setStockLink(initialData.stockLink || '');
        setPhotoRequired(initialData.photoRequired || '');
        setDualCheck(initialData.category === 'RENEWAL' ? (initialData.verificationRequired || '') : (initialData.dualCheck || ''));
        setCarryForward(initialData.carryForward || '');
        setAmendmentReason(initialData.amendmentReason || '');
        setLevelIds(initialData.levelIds ? initialData.levelIds.split(',').map(s => s.trim()).filter(Boolean) : []);
        setStatus(initialData.status || 'Active');
        setUploadedFiles(parseFileString(initialData.uploadedFiles));
        setScannedFiles(parseFileString(initialData.scannedFiles));
      } else {
        setSeqNo(''); setAssignTo(''); setCategory(''); setEffectiveFrom(''); setExpiryDate(''); setReminderDays('');
        setReminderDate(''); setRenewalPoint(''); setFrequency(''); setDescription('');
        setDepartment([]); setUploadedFiles([]); setScannedFiles([]);
        setStockLink(''); setPhotoRequired(''); setDualCheck(''); setCarryForward('');
        setWeekDays(''); setRepeatEveryValue(''); setRepeatEveryUnit('');
        setAmendmentReason('');
        setLevelIds([]);
        setStatus('Active');
        axios.get('/api/qms/checklist/next-sequence')
          .then(res => setSeqNo(String(res.data.nextSeqNo).padStart(3, '0')))
          .catch(() => {});
      }
    }
  }, [open, initialData]);

  useEffect(() => {
    if (open) {
      axios.get('/api/hrm/departments')
        .then(res => {
          const list = (res.data || [])
            .filter(d => d.status?.toLowerCase() === 'active' || d.status === null)
            .map(d => d.departmentName);
          if (list.length > 0) {
            setDepartmentsList(list);
          }
        })
        .catch(err => {
          console.error("Failed to load departments from master", err);
        });
    }
  }, [open]);

  // Automatically calculate Reminder Days when Expiry Date or Reminder Date changes
  useEffect(() => {
    if (expiryDate && reminderDate) {
      const exp = new Date(expiryDate);
      const rem = new Date(reminderDate);
      
      // Clear time components to get exact day difference
      exp.setHours(0, 0, 0, 0);
      rem.setHours(0, 0, 0, 0);
      
      const diffTime = exp.getTime() - rem.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      if (!isNaN(diffDays)) {
        setReminderDays(diffDays >= 0 ? String(diffDays) : '0');
      }
    }
  }, [expiryDate, reminderDate]);

  // Automatically calculate Reminder Date when user manually updates Reminder Days
  const handleReminderDaysChange = (val) => {
    setReminderDays(val);
    if (expiryDate && val && !isNaN(Number(val))) {
      const exp = new Date(expiryDate);
      exp.setHours(0, 0, 0, 0);
      exp.setDate(exp.getDate() - Number(val));
      
      const yyyy = exp.getFullYear();
      const mm = String(exp.getMonth() + 1).padStart(2, '0');
      const dd = String(exp.getDate()).padStart(2, '0');
      setReminderDate(`${yyyy}-${mm}-${dd}`);
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files?.length) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
    e.target.value = '';
  };
  const handleScanUpload = (e) => {
    if (e.target.files?.length) {
      setScannedFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
    e.target.value = '';
  };
  const handleClear = () => {
    setSeqNo(''); setAssignTo(''); setCategory(''); setEffectiveFrom(''); setExpiryDate(''); setReminderDays('');
    setReminderDate(''); setRenewalPoint(''); setFrequency(''); setDescription('');
    setDepartment([]); setUploadedFiles([]); setScannedFiles([]);
    setStockLink(''); setPhotoRequired(''); setDualCheck(''); setCarryForward('');
    setWeekDays(''); setRepeatEveryValue(''); setRepeatEveryUnit('');
    setAmendmentReason('');
    setLevelIds([]);
    setStatus('Active');
  };
  const handleSave = async (statusOverride) => {
    if (isSaving) return;

    const missing = [];
    if (!category) {
      missing.push('Category');
    } else if (category === 'RENEWAL') {
      if (!expiryDate) missing.push('Expiry Date');
      if (!reminderDays) missing.push('Reminder Days');
      if (!reminderDate) missing.push('Reminder Date');
      if (!renewalPoint) missing.push('Renewal Point');
      if (!description) missing.push('Descriptions/SOP');
      if (department.length === 0) missing.push('Department');
      if (!stockLink) missing.push('Stock Link');
      if (!photoRequired) missing.push('Photo Required');
      if (!dualCheck) missing.push('Verification Required');
    } else if (category === 'CHECK LIST') {
      if (!renewalPoint) missing.push('Checking Point');
      if (!description) missing.push('Descriptions/SOP');
      if (department.length === 0) missing.push('Department');
      if (!effectiveFrom) missing.push('Effective From');
      if (!frequency) missing.push('Frequency');
      if (!stockLink) missing.push('Stock Link');
      if (!photoRequired) missing.push('Photo Required');
      if (!dualCheck) missing.push('Dual Check');
      if (!carryForward) missing.push('Carry Forward');
    }

    if (missing.length > 0) {
      dispatch(openSnackbar({ open: true, message: `Please fill in all required fields: ${missing.join(', ')}`, variant: 'alert', alert: { color: 'warning' }, severity: 'warning' }));
      return;
    }
    if (isAmendment && !amendmentReason) {
      dispatch(openSnackbar({ open: true, message: 'Please provide an Amendment Reason!', variant: 'alert', alert: { color: 'warning' }, severity: 'warning' }));
      return;
    }

    setIsSaving(true);
    try {
      const uploadedFileNames = [];
      for (const f of uploadedFiles) {
        if (f.isServer) {
          uploadedFileNames.push(f.serverFileName);
        } else {
          const upFormData = new FormData();
          upFormData.append('file', f);
          const res = await axios.post('/api/files/upload?module=QMS', upFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          uploadedFileNames.push(res.data);
        }
      }

      const scannedFileNames = [];
      for (const f of scannedFiles) {
        if (f.isServer) {
          scannedFileNames.push(f.serverFileName);
        } else {
          const upFormData = new FormData();
          upFormData.append('file', f);
          const res = await axios.post('/api/files/upload?module=QMS', upFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          scannedFileNames.push(res.data);
        }
      }

      const statusVal = statusOverride === 'INACTIVE' ? 'Inactive' : (statusOverride === 'ACTIVE' ? 'Active' : status);

      if (onSave) {
        await onSave({
          id: initialData?.id || null,
          seqNo,
          assignTo: assignTo || null,
          category,
          checkingPoint: renewalPoint,
          frequency,
          description,
          department,
          status: statusVal,
          verificationRequired: category === 'RENEWAL' ? (dualCheck === 'YES' ? 'YES' : 'NO') : null,
          effectiveFrom: effectiveFrom || null,
          stockLink: stockLink || null,
          photoRequired: photoRequired || null,
          dualCheck: category === 'CHECK LIST' ? (dualCheck || null) : null,
          carryForward: carryForward || null,
          weekDays: weekDays || null,
          repeatEveryValue: repeatEveryValue ? Number(repeatEveryValue) : null,
          repeatEveryUnit: repeatEveryUnit || null,
          expiryDate: expiryDate || null,
          reminderDate: reminderDate || null,
          reminderDays: reminderDays ? Number(reminderDays) : null,
          amendmentReason: amendmentReason || null,
          levelIds: levelIds.join(','),
          uploadedFiles: uploadedFileNames.join(',') || null,
          scannedFiles: scannedFileNames.join(',') || null,
        });
      }
      handleClose();
    } catch (err) {
      console.error('Failed to upload files or save checklist:', err);
      dispatch(openSnackbar({
        open: true,
        message: err?.response?.data?.message || err?.message || 'Failed to save checklist.',
        variant: 'alert',
        alert: { color: 'error' },
        severity: 'error'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const isImage = (file) => /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name);

  const sidebarContent = (
    <Stack spacing={3}>
      <Paper sx={{ p: 2.5, bgcolor: 'primary.lighter', borderRadius: '12px', border: '1px solid', borderColor: 'primary.light' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <IconInfoCircle size={20} color={theme.palette.primary.main} />
          <Typography variant="subtitle2" color="primary.main" fontWeight={700}>Audit Log</Typography>
        </Stack>
        <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>System ID: {initialData?.id || 'Draft'}</Typography>
        <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>Sequence: {seqNo || '-'}</Typography>
        <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>Created By: {initialData?.createdBy || '-'}</Typography>
        <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>Created Date: {formatDateForInput(initialData?.createdAt) || '-'}</Typography>
        {initialData?.updatedAt && (
          <Typography variant="caption" display="block">Last Updated: {formatDateForInput(initialData.updatedAt)}</Typography>
        )}
      </Paper>

      <Paper sx={{ p: 2.5, bgcolor: 'secondary.lighter', borderRadius: '12px', border: '1px solid', borderColor: 'secondary.light' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          <IconAlertCircle size={20} color={theme.palette.secondary.main} />
          <Typography variant="subtitle2" color="secondary.main" fontWeight={700}>SOP Guidelines</Typography>
        </Stack>
        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
          Ensure all standard checking points and descriptions are entered clearly.
        </Typography>
        <Typography variant="caption" display="block">
          For renewal categories, expiry dates and reminder thresholds are mandatory.
        </Typography>
      </Paper>
    </Stack>
  );

  return (
    <>
      <BOSFormDialog
        open={open}
        onClose={handleClose}
        onSave={isSaving || isViewOnly ? undefined : () => handleSave()}
        onClear={isViewOnly ? undefined : handleClear}
        title={isViewOnly ? 'Checklist Details' : (initialData ? 'Edit Checklist' : 'New Checklist')}
        hasId={!!initialData?.id && !isViewOnly}
        isViewOnly={isViewOnly}
        maxWidth="lg"
        sidebar={sidebarContent}
      >
        {isSaving && (
          <Box sx={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.7)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 2, borderRadius: '12px'
          }}>
            <CircularProgress size={48} thickness={4.5} />
            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
              Saving & uploading files...
            </Typography>
          </Box>
        )}
        <BOSFormSection
          icon={<IconClipboardList size={22} color={theme.palette.primary.main} />}
          title="Checklist Category Details"
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <BOSTextField
              label="Sequence No"
              value={seqNo}
              InputProps={{ readOnly: true }}
              required
            />

            <BOSTextField
              select
              label="Category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              required
              disabled={isViewOnly}
            >
              <MenuItem value=""><em>-Select-</em></MenuItem>
              <MenuItem value="RENEWAL">RENEWAL</MenuItem>
              <MenuItem value="CHECK LIST">CHECK LIST</MenuItem>
            </BOSTextField>
          </Box>

          {category === 'RENEWAL' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 3 }}>
              <BOSTextField
                label="Expiry Date"
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={!initialData ? { min: new Date().toISOString().split('T')[0] } : {}}
                required
                disabled={isViewOnly}
              />

              <BOSTextField
                label="Reminder Days"
                type="number"
                value={reminderDays}
                onChange={e => handleReminderDaysChange(e.target.value)}
                required
                disabled={isViewOnly}
              />

              <BOSTextField
                label="Reminder Date"
                type="date"
                value={reminderDate}
                onChange={e => setReminderDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={!initialData ? { min: new Date().toISOString().split('T')[0] } : {}}
                required
                disabled={isViewOnly}
              />
            </Box>
          )}

          <BOSTextField
            label={category === 'RENEWAL' ? "Renewal Point" : "Checking Point"}
            value={renewalPoint}
            onChange={e => setRenewalPoint(e.target.value)}
            required
            disabled={isViewOnly}
          />

          <Box sx={{ position: 'relative' }}>
            <BOSTextField
              label="Descriptions/SOP"
              multiline
              minRows={4}
              value={isListening && interimText ? description + ' ' + interimText : description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Standard Operating Procedure... (or use mic 🎤)"
              InputLabelProps={{ shrink: true }}
              InputProps={{ sx: { pr: '44px' } }}
              required
              disabled={isViewOnly}
            />
            {!isViewOnly && (
              <IconButton
                onClick={toggleListening}
                size="small"
                title={isListening ? 'Stop recording' : isSpeechSupported ? 'Start voice input' : 'Not supported — use Chrome/Edge'}
                sx={{
                  position: 'absolute', bottom: 12, right: 12,
                  color: isListening ? 'error.main' : 'text.secondary',
                  animation: isListening ? 'micPulse 1.2s ease-in-out infinite' : 'none',
                  '@keyframes micPulse': {
                    '0%':   { transform: 'scale(1)',    opacity: 1 },
                    '50%':  { transform: 'scale(1.3)',  opacity: 0.55 },
                    '100%': { transform: 'scale(1)',    opacity: 1 },
                  }
                }}
              >
                {isListening ? <IconMicrophone size={18} /> : <IconMicrophoneOff size={18} />}
              </IconButton>
            )}
          </Box>
          {isListening && (
            <Typography variant="caption" sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <IconMicrophone size={12} /> Listening… speak now
            </Typography>
          )}
        </BOSFormSection>

        <BOSFormSection
          icon={<IconSettings size={22} color={theme.palette.primary.main} />}
          title="Execution & Frequency Controls"
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <BOSTextField
              select
              label="Department"
              value={department}
              disabled={isViewOnly}
              SelectProps={{
                multiple: true,
                renderValue: sel => sel.length === 0 ? '-Select-' : sel.length === departmentsList.length ? 'All Departments' : sel.join(', '),
                onChange: e => {
                  const val = e.target.value;
                  if (val.includes('Select All')) {
                    if (department.length === departmentsList.length) {
                      setDepartment([]);
                    } else {
                      setDepartment(departmentsList);
                    }
                  } else {
                    setDepartment(typeof val === 'string' ? val.split(',') : val);
                  }
                }
              }}
              required
            >
              <MenuItem value="Select All">
                <Checkbox 
                  checked={department.length === departmentsList.length} 
                  indeterminate={department.length > 0 && department.length < departmentsList.length} 
                  size="small" 
                  disabled={isViewOnly}
                />
                <ListItemText primary="Select All" primaryTypographyProps={{ fontWeight: 700 }} />
              </MenuItem>
              <Divider />
              {departmentsList.map(dept => (
                <MenuItem key={dept} value={dept}>
                  <Checkbox checked={department.includes(dept)} size="small" disabled={isViewOnly} />
                  <ListItemText primary={dept} />
                </MenuItem>
              ))}
            </BOSTextField>

            {category !== 'RENEWAL' && (
              <BOSTextField
                label="Effective From"
                type="date"
                value={effectiveFrom}
                onChange={e => setEffectiveFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={!initialData ? { min: new Date().toISOString().split('T')[0] } : {}}
                required
                disabled={isViewOnly}
              />
            )}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            {category !== 'RENEWAL' && (
              <BOSTextField
                select
                label="Frequency"
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                required
                disabled={isViewOnly}
              >
                <MenuItem value=""><em>-Select-</em></MenuItem>
                {['DAILY','WEEKLY','FORTNIGHTLY','MONTHLY','QUARTERLY','HALF YEARLY','YEARLY', 'CUSTOM'].map(f => (
                  <MenuItem key={f} value={f}>{f}</MenuItem>
                ))}
              </BOSTextField>
            )}

            {category !== 'RENEWAL' && (frequency === 'WEEKLY' || frequency === 'CUSTOM') && (
              <Box sx={{ p: 2.5, border: '1px dashed', borderColor: 'primary.light', borderRadius: 2, bgcolor: 'background.paper', display: 'flex', gap: 2.5, alignItems: 'center' }}>
                {frequency === 'WEEKLY' && (
                  <BOSTextField
                    select
                    label="Week Day"
                    value={weekDays}
                    onChange={e => setWeekDays(e.target.value)}
                    required
                    disabled={isViewOnly}
                    sx={{ minWidth: 200 }}
                  >
                    <MenuItem value=""><em>-Select-</em></MenuItem>
                    {WEEK_DAYS.map(day => (
                      <MenuItem key={day} value={day}>{day}</MenuItem>
                    ))}
                  </BOSTextField>
                )}
                {frequency === 'CUSTOM' && (
                  <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center', width: '100%' }}>
                    <BOSTextField 
                      label="Repeat Every"
                      type="number"
                      placeholder="e.g. 2"
                      value={repeatEveryValue} 
                      onChange={e => setRepeatEveryValue(e.target.value)} 
                      required
                      disabled={isViewOnly}
                    />
                    <BOSTextField
                      select
                      label="Unit"
                      value={repeatEveryUnit} 
                      onChange={e => setRepeatEveryUnit(e.target.value)} 
                      required
                      disabled={isViewOnly}
                    >
                      <MenuItem value=""><em>-Select-</em></MenuItem>
                      <MenuItem value="DAYS">DAYS</MenuItem>
                      <MenuItem value="WEEKS">WEEKS</MenuItem>
                      <MenuItem value="MONTHS">MONTHS</MenuItem>
                      <MenuItem value="YEARS">YEARS</MenuItem>
                    </BOSTextField>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 3 }}>
            <BOSTextField
              select
              label="Stock Link ?"
              value={stockLink}
              onChange={e => setStockLink(e.target.value)}
              required
              disabled={isViewOnly}
            >
              <MenuItem value=""><em>-Select-</em></MenuItem>
              <MenuItem value="YES">YES</MenuItem>
              <MenuItem value="NO">NO</MenuItem>
            </BOSTextField>

            <BOSTextField
              select
              label="Photo Required ?"
              value={photoRequired}
              onChange={e => setPhotoRequired(e.target.value)}
              required
              disabled={isViewOnly}
            >
              <MenuItem value=""><em>-Select-</em></MenuItem>
              <MenuItem value="YES">YES</MenuItem>
              <MenuItem value="NO">NO</MenuItem>
            </BOSTextField>

            <BOSTextField
              select
              label={category === 'RENEWAL' ? 'Verification Required ?' : 'Dual Check ?'}
              value={dualCheck}
              onChange={e => setDualCheck(e.target.value)}
              required
              disabled={isViewOnly}
            >
              <MenuItem value=""><em>-Select-</em></MenuItem>
              <MenuItem value="YES">YES</MenuItem>
              <MenuItem value="NO">NO</MenuItem>
            </BOSTextField>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            {category !== 'RENEWAL' && (
              <BOSTextField
                select
                label="Carry Forward ?"
                value={carryForward}
                onChange={e => setCarryForward(e.target.value)}
                required
                disabled={isViewOnly}
              >
                <MenuItem value=""><em>-Select-</em></MenuItem>
                <MenuItem value="YES">YES</MenuItem>
                <MenuItem value="NO">NO</MenuItem>
              </BOSTextField>
            )}

            <BOSTextField
              select
              label="Status"
              value={status}
              onChange={e => setStatus(e.target.value)}
              required
              disabled={isViewOnly}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">In Active</MenuItem>
            </BOSTextField>
          </Box>

          {isAmendment && (
            <BOSTextField 
              label="Amendment Reason"
              multiline 
              minRows={2} 
              value={amendmentReason} 
              onChange={e => setAmendmentReason(e.target.value)} 
              placeholder="Enter reason for this amendment..."
              required
              disabled={isViewOnly}
            />
          )}
        </BOSFormSection>

        <BOSFormSection
          icon={<IconCloudUpload size={22} color={theme.palette.primary.main} />}
          title="Reference Files & Attachments"
        >
          <Grid container spacing={3}>
            {/* Uploaded Files box */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>Uploaded Files</Typography>
                  {!isViewOnly && (
                    <Button
                      component="label"
                      variant="contained"
                      size="small"
                      startIcon={<IconCloudUpload size={16} />}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '8px',
                        bgcolor: 'primary.main', 
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                    >
                      Upload File
                      <input type="file" hidden multiple onChange={handleFileUpload} />
                    </Button>
                  )}
                </Box>
                <Box sx={{ 
                  height: 200, 
                  bgcolor: 'background.paper', 
                  border: '1px dashed', 
                  borderColor: 'divider',
                  borderRadius: '10px', 
                  p: 3,
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 1.5,
                  overflowY: 'auto'
                }}>
                  {uploadedFiles.length === 0 ? (
                    <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <IconCloudUpload size={48} stroke={1.5} color={theme.palette.primary.main} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>No file uploaded yet</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Upload files using the button above</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {uploadedFiles.map((f, i) => (
                        <FileItem
                          key={i} file={f}
                          onPreview={handlePreviewOpen}
                          onRemove={isViewOnly ? undefined : handleRemoveFile}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>

            {/* Scanned Files box */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>Scanned Files</Typography>
                  {!isViewOnly && (
                    <Button
                      component="label"
                      variant="contained"
                      size="small"
                      startIcon={<IconCamera size={16} />}
                      sx={{
                        textTransform: 'none',
                        borderRadius: '8px',
                        bgcolor: 'secondary.main',
                        '&:hover': { bgcolor: 'secondary.dark' }
                      }}
                    >
                      Scan & Upload
                      <input type="file" hidden multiple accept="image/*" onChange={handleScanUpload} />
                    </Button>
                  )}
                </Box>
                <Box sx={{ 
                  height: 200, 
                  bgcolor: 'background.paper', 
                  border: '1px dashed', 
                  borderColor: 'divider',
                  borderRadius: '10px', 
                  p: 3,
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 1.5,
                  overflowY: 'auto'
                }}>
                  {scannedFiles.length === 0 ? (
                    <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <IconFileDescription size={48} stroke={1.5} color={theme.palette.secondary.main} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>No file scanned yet</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Upload files using the button above</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {scannedFiles.map((f, i) => (
                        <FileItem key={i} file={f} onPreview={handlePreviewOpen} onRemove={isViewOnly ? undefined : handleRemoveScannedFile} />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </BOSFormSection>
      </BOSFormDialog>

      {/* ── BOS File Preview Dialog ── */}
      {previewFile && (
        <BOSFilePreview
          open={!!previewFile}
          onClose={handlePreviewClose}
          file={previewFile}
        />
      )}
    </>
  );
}

AddCheckListDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  onSave: PropTypes.func,
  initialData: PropTypes.object
};
