import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Box, Typography, TextField, Select, MenuItem,
  Button, IconButton, Divider, Checkbox, ListItemText, Slide, useTheme,
  CircularProgress
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import {
  IconX, IconCheck, IconEraser, IconCloudUpload, IconCamera, IconFileDescription,
  IconMicrophone, IconMicrophoneOff
} from '@tabler/icons-react';
import axios from 'utils/axios';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

// ── File type helpers ─────────────────────────────────────────────────────────
const getExt = (file) => file.name.split('.').pop().toLowerCase();
const isImageFile  = (file) => /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name);
const isPDF        = (file) => getExt(file) === 'pdf';
const isExcel      = (file) => ['xlsx', 'xls', 'csv'].includes(getExt(file));
const isWord       = (file) => ['doc', 'docx'].includes(getExt(file));

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
          const wb  = XLSX.read(buf, { type: 'array' });
          const ws  = wb.Sheets[wb.SheetNames[0]];
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
    return () => { revoked = true; };
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
        <Typography variant="body2" sx={{ mt: 1 }}>Could not load preview</Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>{state.error}</Typography>
      </Box>
    );
  }

  const { content } = state;

  if (content.type === 'image') {
    return (
      <Box component="img" src={content.url} alt={file.name}
        sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 1, boxShadow: 4 }} />
    );
  }

  if (content.type === 'pdf') {
    return (
      <Box component="iframe" src={content.url} title={file.name}
        sx={{ width: '100%', height: '100%', border: 'none', borderRadius: 1 }} />
    );
  }

  if (content.type === 'excel') {
    return (
      <Box sx={{
        width: '100%', height: '100%', overflow: 'auto',
        bgcolor: 'white', borderRadius: 1, p: 1,
        '& table': { borderCollapse: 'collapse', width: '100%', fontSize: '0.78rem' },
        '& td, & th': { border: '1px solid #d0d0d0', px: 1, py: 0.5, whiteSpace: 'nowrap' },
        '& tr:first-of-type td': { bgcolor: '#1565c0', color: 'white', fontWeight: 700 },
        '& tr:nth-of-type(even)': { bgcolor: '#f5f5f5' },
      }}
        dangerouslySetInnerHTML={{ __html: content.html }}
      />
    );
  }

  if (content.type === 'word') {
    return (
      <Box sx={{
        width: '100%', height: '100%', overflow: 'auto',
        bgcolor: 'white', borderRadius: 1, p: 3,
        '& h1,& h2,& h3': { mt: 2, mb: 1, fontWeight: 700 },
        '& p': { mb: 1, lineHeight: 1.7 },
        '& table': { borderCollapse: 'collapse', width: '100%', mb: 2 },
        '& td, & th': { border: '1px solid #ccc', px: 1.5, py: 0.8 },
        fontSize: '0.88rem', color: '#1a1a1a',
      }}
        dangerouslySetInnerHTML={{ __html: content.html }}
      />
    );
  }

  // Unknown file type
  return (
    <Box sx={{ textAlign: 'center', color: 'text.disabled' }}>
      <IconFileDescription size={80} stroke={1} />
      <Typography variant="body1" sx={{ mt: 2, fontWeight: 600, wordBreak: 'break-all' }}>{file.name}</Typography>
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
      display: 'flex', alignItems: 'center', gap: 1, py: 0.5, px: 1,
      borderRadius: 1, cursor: 'default',
      '&:hover': { bgcolor: 'action.hover' }
    }}
  >
    <IconFileDescription size={16} />
    <Typography variant="caption" noWrap sx={{ flex: 1, fontSize: '0.72rem' }}>{file.name}</Typography>
    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.disabled', flexShrink: 0 }}>
      {(file.size / 1024).toFixed(0)}KB
    </Typography>
  </Box>
);
FileItem.propTypes = { file: PropTypes.object, onEnter: PropTypes.func, onMove: PropTypes.func, onLeave: PropTypes.func };

const DEPARTMENTS = [
  'HRA', 'PRODUCTION', 'MAINTENANCE', 'FINANCE', 'STORES',
  'QUALITY', 'PURCHASE', 'LOGISTICS', 'MARKETING', 'IT', 'MANAGEMENT'
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
        <Typography variant="body2" sx={{ 
          fontWeight: 600, 
          color: isDark ? '#f0f6fc' : theme.palette.text.primary, 
          fontSize: '0.85rem' 
        }}>
          {label}
          {required && <Typography component="span" sx={{ color: isDark ? '#ff7b72' : theme.palette.error.main, ml: 0.5 }}>*</Typography>}
        </Typography>
      </Box>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
};
LabelInput.propTypes = { label: PropTypes.string, required: PropTypes.bool, children: PropTypes.node };

export default function AddCheckListDialog({ open, handleClose, onSave, initialData }) {
  const theme = useTheme();

  const [seqNo, setSeqNo] = useState('');
  const [category, setCategory] = useState('');
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
  const [dualCheck, setDualCheck] = useState('');
  const [carryForward, setCarryForward] = useState('');
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
    if (!isSpeechSupported) { alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.'); return; }
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
        setExpiryDate(initialData.expiryDate || '');
        setReminderDays(initialData.reminderDays || '');
        setReminderDate(initialData.reminderDate || '');
        setRenewalPoint(initialData.checkingPoint || '');
        setFrequency(initialData.frequency || '');
        setDescription(initialData.description || '');
        setDepartment((initialData.departments || []).map(d => d.departmentName));
        setStockLink(initialData.stockLink || '');
        setPhotoRequired(initialData.photoRequired || '');
        setDualCheck(initialData.dualCheck || '');
        setCarryForward(initialData.carryForward || '');
        setUploadedFiles([]);
        setScannedFiles([]);
      } else {
        setSeqNo(''); setCategory(''); setExpiryDate(''); setReminderDays('');
        setReminderDate(''); setRenewalPoint(''); setFrequency(''); setDescription('');
        setDepartment([]); setUploadedFiles([]); setScannedFiles([]);
        setStockLink(''); setPhotoRequired(''); setDualCheck(''); setCarryForward('');
        axios.get('/api/qms/checklist/next-sequence')
          .then(res => setSeqNo(String(res.data.nextSeqNo).padStart(3, '0')))
          .catch(() => {});
      }
    }
  }, [open, initialData]);

  const handleFileUpload = (e) => {
    if (e.target.files?.length) setUploadedFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };
  const handleScanUpload = (e) => {
    if (e.target.files?.length) setScannedFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };
  const handleClear = () => {
    setSeqNo(''); setCategory(''); setExpiryDate(''); setReminderDays('');
    setReminderDate(''); setRenewalPoint(''); setFrequency(''); setDescription('');
    setDepartment([]); setUploadedFiles([]); setScannedFiles([]);
    setStockLink(''); setPhotoRequired(''); setDualCheck(''); setCarryForward('');
  };
  const handleSave = () => {
    if (!category || !frequency || !renewalPoint || !description || department.length === 0) {
      alert('Please fill in all required fields'); return;
    }
    if (onSave) onSave({
      seqNo, category, expiryDate, reminderDays, reminderDate,
      checkingPoint: renewalPoint, frequency, description, department,
      stockLink, photoRequired, dualCheck, carryForward,
      uploadedFiles: uploadedFiles.map(f => f.name),
      scannedFiles: scannedFiles.map(f => f.name)
    });
    handleClose();
  };

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const darkStyles = {
    dialog: {
      bgcolor: isDark ? '#161b22' : theme.palette.background.paper,
      color: isDark ? '#c9d1d9' : theme.palette.text.primary,
    },
    input: {
      '& .MuiOutlinedInput-root': {
        bgcolor: isDark ? '#0d1117' : '#f8f9fa',
        color: isDark ? '#f0f6fc' : theme.palette.text.primary,
        '& fieldset': { borderColor: isDark ? '#30363d' : theme.palette.divider },
        '&:hover fieldset': { borderColor: isDark ? '#8b949e' : theme.palette.primary.main },
        '&.Mui-focused fieldset': { borderColor: isDark ? '#58a6ff' : theme.palette.primary.main },
        '& input': { py: 1.2, fontSize: '0.9rem' },
        '& .MuiSelect-select': { py: 1.2, fontSize: '0.9rem' },
      },
      '& .MuiInputLabel-root': { color: isDark ? '#8b949e' : theme.palette.text.secondary },
      '& .MuiSvgIcon-root': { color: isDark ? '#8b949e' : theme.palette.text.secondary },
    },
    box: {
      border: isDark ? '1px dashed #30363d' : `1px dashed ${theme.palette.divider}`,
      borderRadius: '8px',
      bgcolor: isDark ? '#0d1117' : theme.palette.background.paper,
      minHeight: 220,
      width: '100% !important',
      display: 'block !important',
      p: 3,
      textAlign: 'center',
      boxSizing: 'border-box'
    },
    btnSave: {
      bgcolor: isDark ? '#238af2' : theme.palette.primary.main,
      color: '#fff',
      '&:hover': { bgcolor: isDark ? '#1a76d2' : theme.palette.primary.dark },
      borderRadius: '8px',
      textTransform: 'none',
      px: 3,
      fontWeight: 600,
    },
    btnClear: {
      bgcolor: isDark ? '#7c4dff' : theme.palette.secondary.main,
      color: '#fff',
      '&:hover': { bgcolor: isDark ? '#651fff' : theme.palette.secondary.dark },
      borderRadius: '8px',
      textTransform: 'none',
      px: 3,
      fontWeight: 600,
    },
    btnInactive: {
      bgcolor: isDark ? '#f44336' : theme.palette.error.main,
      color: '#fff',
      '&:hover': { bgcolor: isDark ? '#d32f2f' : theme.palette.error.dark },
      borderRadius: '8px',
      textTransform: 'none',
      px: 3,
      fontWeight: 600,
    },
    btnUpload: {
      bgcolor: isDark ? '#7c4dff' : theme.palette.primary.main,
      color: '#fff',
      '&:hover': { bgcolor: isDark ? '#651fff' : theme.palette.primary.dark },
      borderRadius: '8px',
      textTransform: 'none',
      fontSize: '0.85rem',
    },
    btnScan: {
      bgcolor: isDark ? '#238af2' : theme.palette.primary.main,
      color: '#fff',
      '&:hover': { bgcolor: isDark ? '#1a76d2' : theme.palette.primary.dark },
      borderRadius: '8px',
      textTransform: 'none',
      fontSize: '0.85rem',
    }
  };

  return (
    <>
      <Dialog
        open={open} TransitionComponent={Transition} keepMounted onClose={handleClose}
        maxWidth="lg" fullWidth
        PaperProps={{ 
          sx: { 
            height: 'auto', 
            maxHeight: '95vh', 
            bgcolor: darkStyles.dialog.bgcolor, 
            backgroundImage: 'none', 
            borderRadius: '12px', 
            border: isDark ? '1px solid #30363d' : 'none' 
          } 
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          bgcolor: darkStyles.dialog.bgcolor, 
          borderBottom: isDark ? '1px solid #30363d' : `1px solid ${theme.palette.divider}`,
          py: 2,
          px: 3
        }}>
          <Typography variant="h5" sx={{ 
            fontWeight: 600, 
            color: isDark ? '#58a6ff' : theme.palette.primary.main, 
            fontSize: '1.25rem' 
          }}>
            Master Details of Check List
          </Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: isDark ? '#8b949e' : theme.palette.text.secondary }}>
            <IconX size={24} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, bgcolor: darkStyles.dialog.bgcolor }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, width: '100%' }}>

            {/* ── LEFT COLUMN: Form ── */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ pr: 1 }}>
                <LabelInput label="Sequence No" required>
                  <TextField fullWidth size="small" value={seqNo} InputProps={{ readOnly: true }} sx={darkStyles.input} />
                </LabelInput>
                <LabelInput label="Category" required>
                  <Select fullWidth size="small" value={category} onChange={e => setCategory(e.target.value)} displayEmpty sx={darkStyles.input}>
                    <MenuItem value=""><em>-Select-</em></MenuItem>
                    <MenuItem value="RENEWAL">RENEWAL</MenuItem>
                    <MenuItem value="CHECK LIST">CHECK LIST</MenuItem>
                  </Select>
                </LabelInput>
                <LabelInput label="Frequency" required>
                  <Select fullWidth size="small" value={frequency} onChange={e => setFrequency(e.target.value)} displayEmpty sx={darkStyles.input}>
                    <MenuItem value=""><em>-Select-</em></MenuItem>
                    {['DAILY','WEEKLY','FORTNIGHTLY','MONTHLY','QUARTERLY','HALF YEARLY','YEARLY'].map(f => (
                      <MenuItem key={f} value={f}>{f}</MenuItem>
                    ))}
                  </Select>
                </LabelInput>
                <LabelInput label="Expiry Date">
                  <TextField fullWidth size="small" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={darkStyles.input} />
                </LabelInput>
                <LabelInput label="Reminder Days">
                  <TextField fullWidth size="small" type="number" value={reminderDays} onChange={e => setReminderDays(e.target.value)} sx={darkStyles.input} />
                </LabelInput>
                <LabelInput label="Reminder Date">
                  <TextField fullWidth size="small" type="date" value={reminderDate} onChange={e => setReminderDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={darkStyles.input} />
                </LabelInput>
                <LabelInput label="Renewal Point" required>
                  <TextField fullWidth size="small" value={renewalPoint} onChange={e => setRenewalPoint(e.target.value)} sx={darkStyles.input} />
                </LabelInput>
                <LabelInput label="Descriptions/SOP" required>
                  <Box sx={{ position: 'relative' }}>
                    <TextField
                      fullWidth size="small" multiline minRows={6}
                      value={isListening && interimText ? description + ' ' + interimText : description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Standard Operating Procedure... (or use mic 🎤)"
                      sx={darkStyles.input}
                      InputProps={{ sx: { pr: '44px' } }}
                    />
                    <IconButton
                      onClick={toggleListening}
                      size="small"
                      sx={{
                        position: 'absolute', bottom: 12, right: 12,
                        color: isListening ? (isDark ? '#ff7b72' : theme.palette.error.main) : (isDark ? '#8b949e' : theme.palette.text.secondary),
                      }}
                    >
                      {isListening ? <IconMicrophone size={20} /> : <IconMicrophoneOff size={20} />}
                    </IconButton>
                  </Box>
                </LabelInput>

                <Box sx={{ display: 'none' }}>
                  <LabelInput label="Department" required>
                    <Select
                      multiple fullWidth size="small" value={department}
                      onChange={e => setDepartment(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                      renderValue={sel => sel.length === 0 ? <em>-Select-</em> : sel.join(', ')}
                      sx={darkStyles.input}
                    >
                      {DEPARTMENTS.map(dept => (
                        <MenuItem key={dept} value={dept}><Checkbox checked={department.includes(dept)} size="small" /><ListItemText primary={dept} /></MenuItem>
                      ))}
                    </Select>
                  </LabelInput>
                </Box>
              </Box>
            </Box>

            {/* ── RIGHT COLUMN: Stacked Files ── */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
              
              {/* Uploaded Files (Top) */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: isDark ? '#f0f6fc' : theme.palette.text.primary }}>Uploaded Files</Typography>
                <Box sx={{
                  border: isDark ? '1px dashed #30363d' : `1px dashed ${theme.palette.divider}`,
                  borderRadius: '8px',
                  bgcolor: isDark ? '#0d1117' : '#f8f9fa',
                  minHeight: 220,
                  width: '100%',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  boxSizing: 'border-box'
                }}>
                  <Box sx={{ mb: 2 }}>
                    <Button component="label" variant="contained" sx={darkStyles.btnUpload} startIcon={<IconCloudUpload size={20} />}>
                      Upload File
                      <input type="file" multiple hidden onChange={handleFileUpload} />
                    </Button>
                  </Box>
                  {uploadedFiles.length === 0 ? (
                    <Box sx={{ textAlign: 'center', color: isDark ? '#8b949e' : theme.palette.text.disabled }}>
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

              {/* Scanned Files (Bottom) */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: isDark ? '#f0f6fc' : theme.palette.text.primary }}>Scanned Files</Typography>
                <Box sx={{
                  border: isDark ? '1px dashed #30363d' : `1px dashed ${theme.palette.divider}`,
                  borderRadius: '8px',
                  bgcolor: isDark ? '#0d1117' : '#f8f9fa',
                  minHeight: 220,
                  width: '100%',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  boxSizing: 'border-box'
                }}>
                  <Box sx={{ mb: 2 }}>
                    <Button component="label" variant="contained" sx={darkStyles.btnScan} startIcon={<IconCamera size={20} />}>
                      Scan & Upload
                      <input type="file" accept="image/*" capture="environment" hidden onChange={handleScanUpload} />
                    </Button>
                  </Box>
                  {scannedFiles.length === 0 ? (
                    <Box sx={{ textAlign: 'center', color: isDark ? '#8b949e' : theme.palette.text.disabled }}>
                      <IconFileDescription size={52} stroke={1} />
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>No file scanned yet</Typography>
                      <Typography variant="caption">Upload files using the button above</Typography>
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

        <Box sx={{ 
          p: 3, 
          borderTop: isDark ? '1px solid #30363d' : `1px solid ${theme.palette.divider}`, 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 3, 
          bgcolor: darkStyles.dialog.bgcolor 
        }}>
          <Button variant="contained" sx={darkStyles.btnInactive} startIcon={<IconX size={20} />}>IN ACTIVE</Button>
          <Button onClick={handleClear} variant="contained" sx={darkStyles.btnClear} startIcon={<IconEraser size={20} />}>Clear</Button>
          <Button onClick={handleSave} variant="contained" sx={darkStyles.btnSave} startIcon={<IconCheck size={20} />}>Save</Button>
        </Box>
      </Dialog>

      {/* ── Hover preview — same size as the Add dialog (maxWidth lg, 90vh) ── */}
      {hoverFile && (
        <Box sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          bgcolor: 'rgba(0,0,0,0.45)',
        }}>
          <Box sx={{
            width: '100%',
            maxWidth: '1200px',
            height: '90vh',
            mx: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Header */}
            <Box sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              px: 2.5, py: 1.5,
              bgcolor: 'primary.light',
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.dark', fontSize: '1rem' }}>
                {hoverFile.name}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {(hoverFile.size / 1024).toFixed(1)} KB
              </Typography>
            </Box>

            {/* Content */}
            <Box sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              p: 2,
              bgcolor: 'grey.50',
            }}>
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
  initialData: PropTypes.object
};
