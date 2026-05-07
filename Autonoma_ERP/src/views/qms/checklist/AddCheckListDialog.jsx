import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
  Divider,
  Checkbox,
  ListItemText,
  Slide,
  useTheme,
  CircularProgress,
  FormControl,
  InputLabel,
  Stack
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import {
  IconX,
  IconCheck,
  IconEraser,
  IconCloudUpload,
  IconCamera,
  IconFileDescription,
  IconMicrophone,
  IconMicrophoneOff,
  IconEdit,
  IconSettings,
  IconCalendarEvent,
  IconListDetails,
  IconFileText,
  IconTrash
} from '@tabler/icons-react';
import axios from 'utils/axios';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

// ── File type helpers ─────────────────────────────────────────────────────────
const getExt = (file) => file.name.split('.').pop().toLowerCase();
const isImageFile = (file) => /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name);
const isPDF = (file) => getExt(file) === 'pdf';
const isExcel = (file) => ['xlsx', 'xls', 'csv'].includes(getExt(file));
const isWord = (file) => ['doc', 'docx'].includes(getExt(file));

// ── Renders actual content of a file for the hover overlay ────────────────────
function FilePreviewContent({ file }) {
  const [state, setState] = useState({ status: 'loading', content: null, error: null });

  useEffect(() => {
    if (!file) return;
    setState({ status: 'loading', content: null, error: null });
    let revoked = false;

    const load = async () => {
      try {
        if (isImageFile(file)) {
          const url = URL.createObjectURL(file);
          setState({ status: 'done', content: { type: 'image', url } });
        } else if (isPDF(file)) {
          const url = URL.createObjectURL(file);
          setState({ status: 'done', content: { type: 'pdf', url } });
        } else if (isExcel(file)) {
          const buf = await file.arrayBuffer();
          const wb = XLSX.read(buf, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const html = XLSX.utils.sheet_to_html(ws, { id: 'excel-preview-table', editable: false });
          setState({ status: 'done', content: { type: 'excel', html } });
        } else if (isWord(file)) {
          const buf = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer: buf });
          setState({ status: 'done', content: { type: 'word', html: result.value } });
        } else {
          setState({ status: 'done', content: { type: 'unknown' } });
        }
      } catch (err) {
        if (!revoked) setState({ status: 'error', error: err.message });
      }
    };

    load();
    return () => {
      revoked = true;
    };
  }, [file]);

  if (state.status === 'loading') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
        <CircularProgress size={48} />
        <Typography variant="body2">Loading preview…</Typography>
      </Box>
    );
  }

  if (state.status === 'error') {
    return (
      <Box sx={{ textAlign: 'center', color: 'error.main' }}>
        <IconFileDescription size={64} stroke={1} />
        <Typography variant="body2" sx={{ mt: 1 }}>
          Could not load preview
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {state.error}
        </Typography>
      </Box>
    );
  }

  const { content } = state;

  if (content.type === 'image') {
    return (
      <Box
        component="img"
        src={content.url}
        alt={file.name}
        sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 1, boxShadow: 4 }}
      />
    );
  }

  if (content.type === 'pdf') {
    return (
      <Box component="iframe" src={content.url} title={file.name} sx={{ width: '100%', height: '100%', border: 'none', borderRadius: 1 }} />
    );
  }

  if (content.type === 'excel') {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
          bgcolor: 'white',
          borderRadius: 1,
          p: 1,
          '& table': { borderCollapse: 'collapse', width: '100%', fontSize: '0.78rem' },
          '& td, & th': { border: '1px solid #d0d0d0', px: 1, py: 0.5, whiteSpace: 'nowrap' },
          '& tr:first-of-type td': { bgcolor: '#1565c0', color: 'white', fontWeight: 700 },
          '& tr:nth-of-type(even)': { bgcolor: '#f5f5f5' }
        }}
        dangerouslySetInnerHTML={{ __html: content.html }}
      />
    );
  }

  if (content.type === 'word') {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
          bgcolor: 'white',
          borderRadius: 1,
          p: 3,
          '& h1,& h2,& h3': { mt: 2, mb: 1, fontWeight: 700 },
          '& p': { mb: 1, lineHeight: 1.7 },
          '& table': { borderCollapse: 'collapse', width: '100%', mb: 2 },
          '& td, & th': { border: '1px solid #ccc', px: 1.5, py: 0.8 },
          fontSize: '0.88rem',
          color: '#1a1a1a'
        }}
        dangerouslySetInnerHTML={{ __html: content.html }}
      />
    );
  }

  // Unknown file type
  return (
    <Box sx={{ textAlign: 'center', color: 'text.disabled' }}>
      <IconFileDescription size={80} stroke={1} />
      <Typography variant="body1" sx={{ mt: 2, fontWeight: 600, wordBreak: 'break-all' }}>
        {file.name}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
        {(file.size / 1024).toFixed(1)} KB — No preview available for this file type
      </Typography>
    </Box>
  );
}
FilePreviewContent.propTypes = { file: PropTypes.object };

// ── Top-level so it never remounts on parent re-render ────────────────────────
const FileItem = ({ file, onEnter, onMove, onLeave }) => (
  <Box
    onMouseEnter={onEnter}
    onMouseMove={onMove}
    onMouseLeave={onLeave}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      py: 0.5,
      px: 1,
      borderRadius: 1,
      cursor: 'default',
      '&:hover': { bgcolor: 'action.hover' }
    }}
  >
    <IconFileDescription size={16} />
    <Typography variant="caption" noWrap sx={{ flex: 1, fontSize: '0.72rem' }}>
      {file.name}
    </Typography>
    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.disabled', flexShrink: 0 }}>
      {(file.size / 1024).toFixed(0)}KB
    </Typography>
  </Box>
);
FileItem.propTypes = { file: PropTypes.object, onEnter: PropTypes.func, onMove: PropTypes.func, onLeave: PropTypes.func };

const DEPARTMENTS = [
  'HRA',
  'PRODUCTION',
  'MAINTENANCE',
  'FINANCE',
  'STORES',
  'QUALITY',
  'PURCHASE',
  'LOGISTICS',
  'MARKETING',
  'IT',
  'MANAGEMENT'
];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const LabelInput = ({ label, required, children }) => {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
      <Box sx={{ width: 140, flexShrink: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: isDark ? '#f0f6fc' : theme.palette.text.primary,
            fontSize: '0.85rem'
          }}
        >
          {label}
          {required && (
            <Typography component="span" sx={{ color: isDark ? '#ff7b72' : theme.palette.error.main, ml: 0.5 }}>
              *
            </Typography>
          )}
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
};
LabelInput.propTypes = { label: PropTypes.string, required: PropTypes.bool, children: PropTypes.node };

export default function AddCheckListDialog({ open, handleClose, onSave, initialData, readOnly }) {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(!readOnly);

  useEffect(() => {
    setIsEditing(!readOnly);
  }, [readOnly, open]);

  const [seqNo, setSeqNo] = useState('');
  const [category, setCategory] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [reminderDays, setReminderDays] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [renewalPoint, setRenewalPoint] = useState('');
  const [frequency, setFrequency] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [scannedFiles, setScannedFiles] = useState([]);
  const [stockLink, setStockLink] = useState('');
  const [photoRequired, setPhotoRequired] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [qty, setQty] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
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
    if (!isSpeechSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
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
      if (final) setDescription((prev) => (prev ? prev + ' ' : '') + final.trim());
      setInterimText(interim);
    };
    recognition.onerror = () => stopListening();
    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    recognition.start();
    speechRef.current = recognition;
    setIsListening(true);
  }, [isSpeechSupported, stopListening]);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  // Stop mic when dialog closes
  useEffect(() => {
    if (!open) stopListening();
  }, [open, stopListening]);

  const [hoverFile, setHoverFile] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  // Stable callbacks so FileItem never remounts from new function refs
  const hidePreview = useCallback(() => setHoverFile(null), []);
  const showPreview = useCallback((file, e) => {
    setHoverFile(file);
    setHoverPos({ x: e.clientX + 16, y: e.clientY - 90 });
  }, []);
  const movePreview = useCallback((e) => {
    setHoverPos({ x: e.clientX + 16, y: e.clientY - 90 });
  }, []);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setSeqNo(initialData.seqNo || '');
        setCategory(initialData.category || '');
        setEffectiveFrom(initialData.effectiveFrom ? initialData.effectiveFrom.split('T')[0] : '');
        setExpiryDate(initialData.expiryDate ? initialData.expiryDate.split('T')[0] : '');
        setReminderDays(initialData.reminderDays || '');
        setReminderDate(initialData.reminderDate ? initialData.reminderDate.split('T')[0] : '');
        setRenewalPoint(initialData.checkingPoint || '');
        setFrequency(initialData.frequency || '');
        setDescription(initialData.description || '');
        setDepartment((initialData.departments || []).map((d) => d.departmentName));
        setStockLink(initialData.stockLink || '');
        setPhotoRequired(initialData.photoRequired || '');
        setItemCode(initialData.itemCode || '');
        setQty(initialData.qty || '');
        setUploadedFiles([]);
        setScannedFiles([]);
      } else {
        setSeqNo('');
        setCategory('');
        setEffectiveFrom('');
        setExpiryDate('');
        setReminderDays('');
        setReminderDate('');
        setRenewalPoint('');
        setFrequency('');
        setDescription('');
        setDepartment([]);
        setUploadedFiles([]);
        setScannedFiles([]);
        setStockLink('');
        setPhotoRequired('');
        setItemCode('');
        setQty('');
        // Fetch next sequence from backend, fallback to timestamp-based
        axios
          .get('/api/qms/checklist/next-sequence')
          .then((res) => setSeqNo(String(res.data.nextSeqNo).padStart(3, '0')))
          .catch(() => setSeqNo(String(Date.now()).slice(-4)));
      }
    }
  }, [open, initialData]);

  const handleFileUpload = (e) => {
    if (e.target.files?.length) setUploadedFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };
  const handleScanUpload = (e) => {
    if (e.target.files?.length) setScannedFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };
  const handleClear = () => {
    setSeqNo('');
    setCategory('');
    setEffectiveFrom('');
    setExpiryDate('');
    setReminderDays('');
    setReminderDate('');
    setRenewalPoint('');
    setFrequency('');
    setDescription('');
    setDepartment([]);
    setUploadedFiles([]);
    setScannedFiles([]);
    setStockLink('');
    setPhotoRequired('');
    setItemCode('');
    setQty('');
  };
  const handleSave = () => {
    if (!category || !frequency || !renewalPoint || !description) {
      alert('Please fill in all required fields: Category, Frequency, Checking Point, Description');
      return;
    }
    if (onSave)
      onSave({
        id: initialData?.id,
        seqNo,
        category,
        effectiveFrom,
        expiryDate,
        reminderDays,
        reminderDate,
        checkingPoint: renewalPoint,
        frequency,
        description,
        department,
        stockLink,
        photoRequired,
        itemCode,
        qty,
        uploadedFiles: uploadedFiles.map((f) => f.name),
        scannedFiles: scannedFiles.map((f) => f.name)
      });
    handleClose();
  };

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const darkStyles = {
    dialog: {
      bgcolor: isDark ? '#161b22' : theme.palette.background.paper,
      color: isDark ? '#c9d1d9' : theme.palette.text.primary
    },
    input: {
      width: '100%',
      '& .MuiOutlinedInput-root': {
        width: '100%',
        bgcolor: isDark ? 'background.default' : 'grey.50',
        color: 'text.primary',
        '& fieldset': { borderColor: 'divider' },
        '&:hover fieldset': { borderColor: isDark ? '#8b949e' : theme.palette.primary.main },
        '&.Mui-focused fieldset': { borderColor: isDark ? '#58a6ff' : theme.palette.primary.main },
        '& input': { py: 1.2, fontSize: '0.9rem' },
        '& .MuiSelect-select': { py: 1.2, fontSize: '0.9rem', width: '100%', minWidth: '150px' }
      },
      '& .MuiInputLabel-root': { color: isDark ? '#8b949e' : theme.palette.text.secondary },
      '& .MuiSvgIcon-root': { color: isDark ? '#8b949e' : theme.palette.text.secondary }
    },
    box: {
      border: 'none',
      borderRadius: '16px',
      bgcolor: isDark ? 'background.default' : 'background.paper',
      boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : 3,
      minHeight: 220,
      width: '100% !important',
      display: 'block !important',
      p: 3,
      textAlign: 'center',
      boxSizing: 'border-box'
    },
    btnSave: {
      bgcolor: 'success.main',
      color: '#fff',
      '&:hover': { bgcolor: 'success.dark', transform: 'translateY(-2px)', boxShadow: 6 },
      borderRadius: '24px',
      textTransform: 'none',
      px: 4,
      py: 1,
      fontWeight: 700,
      transition: 'all 0.2s',
      boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'
    },
    btnClear: {
      bgcolor: 'secondary.main',
      color: '#fff',
      '&:hover': { bgcolor: 'secondary.dark', transform: 'translateY(-2px)', boxShadow: 6 },
      borderRadius: '24px',
      textTransform: 'none',
      px: 4,
      py: 1,
      fontWeight: 700,
      transition: 'all 0.2s'
    },
    btnInactive: {
      bgcolor: 'error.main',
      color: '#fff',
      '&:hover': { bgcolor: 'error.dark', transform: 'translateY(-2px)', boxShadow: 6 },
      borderRadius: '24px',
      textTransform: 'none',
      px: 4,
      py: 1,
      fontWeight: 700,
      transition: 'all 0.2s',
      boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'
    },
    btnUpload: {
      bgcolor: isDark ? '#7c4dff' : theme.palette.primary.main,
      color: '#fff',
      '&:hover': { bgcolor: isDark ? '#651fff' : theme.palette.primary.dark },
      borderRadius: '8px',
      textTransform: 'none',
      fontSize: '0.85rem'
    },
    btnScan: {
      bgcolor: isDark ? '#238af2' : theme.palette.primary.main,
      color: '#fff',
      '&:hover': { bgcolor: isDark ? '#1a76d2' : theme.palette.primary.dark },
      borderRadius: '8px',
      textTransform: 'none',
      fontSize: '0.85rem'
    }
  };

  return (
    <>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(8px)'
            }
          }
        }}
        PaperProps={{
          sx: {
            height: 'auto',
            maxHeight: '95vh',
            bgcolor: darkStyles.dialog.bgcolor,
            backgroundImage: 'none',
            borderRadius: '24px',
            border: isDark ? '1px solid #30363d' : 'none',
            boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.5)' : '0 24px 48px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: isDark ? 'background.default' : 'primary.light',
            borderBottom: '1px solid',
            borderColor: 'divider',
            py: 2.5,
            px: 4
          }}
        >
          <Typography
            variant="h5"
            component="span"
            sx={{
              fontWeight: 600,
              color: isDark ? '#58a6ff' : theme.palette.primary.main,
              fontSize: '1.25rem'
            }}
          >
            Master Details of Check List
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: isDark ? '#8b949e' : theme.palette.text.secondary }}>
            <IconX size={24} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, pt: 5, bgcolor: darkStyles.dialog.bgcolor, width: '100%', overflowX: 'hidden' }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, 
            gap: 4, 
            width: '100%',
            alignItems: 'start'
          }}>
            {/* ── LEFT COLUMN: Form Sections ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                
                {/* 1. Core Settings */}
                <Box sx={{ bgcolor: isDark ? 'background.default' : '#ffffff', borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                  <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#1c2128' : 'grey.50', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconSettings size={20} color={theme.palette.primary.main} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>Core Settings</Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={2.5} sx={{ width: '100%' }}>
                      <TextField fullWidth size="small" label="Sequence No" value={seqNo || 'Loading...'} InputProps={{ readOnly: true }} required sx={{ ...darkStyles.input, width: '100% !important' }} />
                      
                      <TextField select fullWidth size="small" required sx={{ ...darkStyles.input, width: '100% !important' }} disabled={!isEditing} label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <MenuItem value="RENEWAL">RENEWAL</MenuItem>
                        <MenuItem value="CHECK LIST">CHECK LIST</MenuItem>
                      </TextField>

                      <TextField select fullWidth size="small" required sx={{ ...darkStyles.input, width: '100% !important' }} disabled={!isEditing} label="Frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                        {['DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'QUARTERLY', 'HALF YEARLY', 'YEARLY'].map((f) => (
                          <MenuItem key={f} value={f}>{f}</MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        select
                        fullWidth
                        size="small"
                        sx={{ ...darkStyles.input, width: '100% !important' }}
                        disabled={!isEditing}
                        label="Department"
                        value={department}
                        onChange={(e) => setDepartment(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                        SelectProps={{
                          multiple: true,
                          renderValue: (sel) => sel.join(', ')
                        }}
                      >
                        {DEPARTMENTS.map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            <Checkbox checked={department.includes(dept)} size="small" />
                            <ListItemText primary={dept} />
                          </MenuItem>
                        ))}
                      </TextField>
                    </Stack>
                  </Box>
                </Box>

                {/* 2. Timeline & Reminders */}
                <Box sx={{ bgcolor: isDark ? 'background.default' : '#ffffff', borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                  <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#1c2128' : 'grey.50', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconCalendarEvent size={20} color={theme.palette.secondary.main} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>Timeline & Reminders</Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={2.5} sx={{ width: '100%' }}>
                      <TextField fullWidth size="small" type="date" label="Effective From" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ ...darkStyles.input, width: '100% !important' }} InputProps={{ readOnly: !isEditing }} />
                      <TextField fullWidth size="small" type="date" label="Expiry Date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ ...darkStyles.input, width: '100% !important' }} InputProps={{ readOnly: !isEditing }} />
                      <TextField fullWidth size="small" type="number" label="Reminder Days" value={reminderDays} onChange={(e) => setReminderDays(e.target.value)} sx={{ ...darkStyles.input, width: '100% !important' }} InputProps={{ readOnly: !isEditing }} />
                      <TextField fullWidth size="small" type="date" label="Reminder Date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ ...darkStyles.input, width: '100% !important' }} InputProps={{ readOnly: !isEditing }} />
                    </Stack>
                  </Box>
                </Box>

                {/* 3. Execution Details */}
                <Box sx={{ bgcolor: isDark ? 'background.default' : '#ffffff', borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                  <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#1c2128' : 'grey.50', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconListDetails size={20} color={theme.palette.warning.main} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>Execution Details</Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Stack spacing={2.5} sx={{ width: '100%' }}>

                        <TextField fullWidth size="small" label="Checking Point" required value={renewalPoint} onChange={(e) => setRenewalPoint(e.target.value)} sx={{ ...darkStyles.input, width: '100% !important' }} InputProps={{ readOnly: !isEditing }} />


                        <TextField select fullWidth size="small" sx={{ ...darkStyles.input, width: '100% !important' }} disabled={!isEditing} label="Photo Required" value={photoRequired} onChange={(e) => setPhotoRequired(e.target.value)}>
                          <MenuItem value="YES">YES</MenuItem>
                          <MenuItem value="NO">NO</MenuItem>
                        </TextField>


                        <TextField select fullWidth size="small" sx={{ ...darkStyles.input, width: '100% !important' }} disabled={!isEditing} label="Stock Link" value={stockLink} onChange={(e) => setStockLink(e.target.value)}>
                          <MenuItem value="YES">YES</MenuItem>
                          <MenuItem value="NO">NO</MenuItem>
                        </TextField>


                        <TextField fullWidth size="small" label="Item Code" value={itemCode} onChange={(e) => setItemCode(e.target.value)} sx={{ ...darkStyles.input, width: '100% !important' }} InputProps={{ readOnly: !isEditing }} />


                        <TextField fullWidth size="small" type="number" label="Qty" value={qty} onChange={(e) => setQty(e.target.value)} sx={{ ...darkStyles.input, width: '100% !important' }} InputProps={{ readOnly: !isEditing }} />

                    </Stack>
                  </Box>
                </Box>

                {/* 4. SOP / Instructions */}
                <Box sx={{ bgcolor: isDark ? 'background.default' : '#ffffff', borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                  <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#1c2128' : 'grey.50', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconFileText size={20} color={theme.palette.success.main} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>Descriptions / SOP</Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ position: 'relative' }}>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={4}
                        label="Standard Operating Procedure"
                        required
                        value={isListening && interimText ? description + ' ' + interimText : description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Detail the procedure... (or use mic 🎤)"
                        sx={{ ...darkStyles.input, width: '100% !important' }}
                        InputProps={{ sx: { pr: '44px' }, readOnly: !isEditing }}
                      />
                      {isEditing && (
                        <IconButton
                          onClick={toggleListening}
                          size="small"
                          sx={{
                            position: 'absolute',
                            bottom: 12,
                            right: 12,
                            color: isListening ? 'error.main' : 'text.secondary'
                          }}
                        >
                          {isListening ? <IconMicrophone size={20} /> : <IconMicrophoneOff size={20} />}
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </Box>

              </Box>

            {/* ── RIGHT COLUMN: Attachments & Scanning ── */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
                
                {/* Uploaded Files */}
                <Box sx={{ bgcolor: isDark ? 'background.default' : '#ffffff', borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#1c2128' : 'grey.50', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconCloudUpload size={20} color={theme.palette.primary.main} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>Attachments</Typography>
                  </Box>
                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, bgcolor: isDark ? 'transparent' : 'grey.50' }}>
                    <Box sx={{ mb: 2 }}>
                      <Button component="label" variant="contained" sx={darkStyles.btnUpload} startIcon={<IconCloudUpload size={20} />}>
                        Browse Files
                        <input type="file" multiple hidden onChange={handleFileUpload} />
                      </Button>
                    </Box>
                    {uploadedFiles.length === 0 ? (
                      <Box sx={{ textAlign: 'center', color: 'text.disabled' }}>
                        <IconFileDescription size={52} stroke={1} />
                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>No file uploaded yet</Typography>
                        <Typography variant="caption">Upload files using the button above</Typography>
                      </Box>
                    ) : (
                      <Box sx={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                        {uploadedFiles.map((f, i) => (
                          <FileItem key={i} file={f} onEnter={(e) => showPreview(f, e)} onMove={movePreview} onLeave={hidePreview} />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Scanned Files */}
                <Box sx={{ bgcolor: isDark ? 'background.default' : '#ffffff', borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: isDark ? '#1c2128' : 'grey.50', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconCamera size={20} color={theme.palette.secondary.main} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>Scan Documents</Typography>
                  </Box>
                  <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, bgcolor: isDark ? 'transparent' : 'grey.50' }}>
                    <Box sx={{ mb: 2 }}>
                      <Button component="label" variant="contained" sx={darkStyles.btnScan} startIcon={<IconCamera size={20} />}>
                        Scan & Upload
                        <input type="file" accept="image/*" capture="environment" hidden onChange={handleScanUpload} />
                      </Button>
                    </Box>
                    {scannedFiles.length === 0 ? (
                      <Box sx={{ textAlign: 'center', color: 'text.disabled' }}>
                        <IconFileDescription size={52} stroke={1} />
                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>No file scanned yet</Typography>
                        <Typography variant="caption">Scan documents using the camera</Typography>
                      </Box>
                    ) : (
                      <Box sx={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                        {scannedFiles.map((f, i) => (
                          <FileItem key={i} file={f} onEnter={(e) => showPreview(f, e)} onMove={movePreview} onLeave={hidePreview} />
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>

            </Box>
          </Box>
        </DialogContent>

        <Box
          sx={{
            p: 3,
            borderTop: isDark ? '1px solid #30363d' : `1px solid ${theme.palette.divider}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: darkStyles.dialog.bgcolor
          }}
        >
          {!isEditing ? (
            <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
              <Button onClick={() => setIsEditing(true)} variant="contained" sx={{...darkStyles.btnSave, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' }}} startIcon={<IconEdit size={20} />}>
                Edit
              </Button>
              <Button
                onClick={handleClose}
                variant="outlined"
                sx={{ ...darkStyles.btnInactive, color: isDark ? '#fff' : 'inherit' }}
                startIcon={<IconX size={20} />}
              >
                Close
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" sx={darkStyles.btnInactive} startIcon={<IconTrash size={20} />}>
                  Delete
                </Button>
                <Button onClick={handleClear} variant="contained" sx={darkStyles.btnClear} startIcon={<IconEraser size={20} />}>
                  Clear
                </Button>
              </Box>
              <Box>
                <Button onClick={handleSave} variant="contained" sx={darkStyles.btnSave} startIcon={<IconCheck size={20} />}>
                  Save
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Dialog>

      {/* ── Hover preview — same size as the Add dialog (maxWidth lg, 90vh) ── */}
      {hoverFile && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            bgcolor: 'rgba(0,0,0,0.45)'
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: '1200px',
              height: '90vh',
              mx: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2.5,
                py: 1.5,
                bgcolor: 'primary.light',
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark', fontSize: '1rem' }}>
                {hoverFile.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {(hoverFile.size / 1024).toFixed(1)} KB
              </Typography>
            </Box>

            {/* Content */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                p: 2,
                bgcolor: 'grey.50'
              }}
            >
              <FilePreviewContent file={hoverFile} />
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}

AddCheckListDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  onSave: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};
