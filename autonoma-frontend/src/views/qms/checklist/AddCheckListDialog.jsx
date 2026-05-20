import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Box, Typography, TextField, Select, MenuItem,
  Button, IconButton, Divider, Checkbox, ListItemText, Slide, useTheme,
  CircularProgress, Autocomplete, Chip, FormControl, InputLabel
} from '@mui/material';
import {
  IconX, IconCheck, IconEraser, IconCloudUpload, IconCamera, IconFileDescription,
  IconMicrophone, IconMicrophoneOff
} from '@tabler/icons-react';
import axios from 'utils/axios';
import useLookups from 'hooks/useLookups';
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

  const [seqNo, setSeqNo] = useState('');
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
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [scannedFiles, setScannedFiles] = useState([]);
  const [stockLink, setStockLink] = useState('');
  const [photoRequired, setPhotoRequired] = useState('');
  const [dualCheck, setDualCheck] = useState('');
  const [carryForward, setCarryForward] = useState('');
  const [amendmentReason, setAmendmentReason] = useState('');
  const [levelIds, setLevelIds] = useState([]);
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
        setDualCheck(initialData.dualCheck || '');
        setCarryForward(initialData.carryForward || '');
        setAmendmentReason(initialData.amendmentReason || '');
        setLevelIds(initialData.levelIds ? initialData.levelIds.split(',').map(s => s.trim()).filter(Boolean) : []);
        setUploadedFiles([]);
        setScannedFiles([]);
      } else {
        setSeqNo(''); setAssignTo(''); setCategory(''); setEffectiveFrom(''); setExpiryDate(''); setReminderDays('');
        setReminderDate(''); setRenewalPoint(''); setFrequency(''); setDescription('');
        setDepartment([]); setUploadedFiles([]); setScannedFiles([]);
        setStockLink(''); setPhotoRequired(''); setDualCheck(''); setCarryForward('');
        setWeekDays(''); setRepeatEveryValue(''); setRepeatEveryUnit('');
        setAmendmentReason('');
        setLevelIds([]);
        axios.get('/api/qms/checklist/next-sequence')
          .then(res => setSeqNo(String(res.data.nextSeqNo).padStart(3, '0')))
          .catch(() => {});
      }
    }
  }, [open, initialData]);

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
    if (e.target.files?.length) setUploadedFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };
  const handleScanUpload = (e) => {
    if (e.target.files?.length) setScannedFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };
  const handleClear = () => {
    setSeqNo(''); setAssignTo(''); setCategory(''); setEffectiveFrom(''); setExpiryDate(''); setReminderDays('');
    setReminderDate(''); setRenewalPoint(''); setFrequency(''); setDescription('');
    setDepartment([]); setUploadedFiles([]); setScannedFiles([]);
    setStockLink(''); setPhotoRequired(''); setDualCheck(''); setCarryForward('');
    setWeekDays(''); setRepeatEveryValue(''); setRepeatEveryUnit('');
    setAmendmentReason('');
    setLevelIds([]);
  };
  const handleSave = (statusOverride) => {
    const missing = [];
    if (!category) missing.push('Category');
    if (!frequency) missing.push('Frequency');
    if (!effectiveFrom) missing.push('Effective From');
    if (!renewalPoint) missing.push('Renewal Point');
    if (!description) missing.push('Descriptions/SOP');
    if (department.length === 0) missing.push('Department');
    if (levelIds.length === 0) missing.push('Levels');
    if (missing.length > 0) {
      alert(`Please fill in all required fields: ${missing.join(', ')}`);
      return;
    }
    if (isAmendment && !amendmentReason) {
      alert('Please provide an Amendment Reason!'); return;
    }

    const statusVal = statusOverride === 'INACTIVE' ? 'Inactive' : 'Active';

    if (onSave) onSave({
      id: initialData?.id || null,
      seqNo,
      assignTo: assignTo || null,
      category,
      checkingPoint: renewalPoint,
      frequency,
      description,
      department,
      status: statusVal,
      verificationRequired: dualCheck === 'YES' ? 'YES' : 'NO',
      effectiveFrom: effectiveFrom || null,
      stockLink: stockLink || null,
      photoRequired: photoRequired || null,
      dualCheck: dualCheck || null,
      carryForward: carryForward || null,
      weekDays: weekDays || null,
      repeatEveryValue: repeatEveryValue ? Number(repeatEveryValue) : null,
      repeatEveryUnit: repeatEveryUnit || null,
      expiryDate: expiryDate || null,
      reminderDate: reminderDate || null,
      reminderDays: reminderDays ? Number(reminderDays) : null,
      amendmentReason: amendmentReason || null,
      levelIds: levelIds.join(','),
    });
    handleClose();
  };

  const isImage = (file) => /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name);

  return (
    <>
      <Dialog
        open={open} TransitionComponent={Transition} keepMounted onClose={handleClose}
        maxWidth="lg" fullWidth
        PaperProps={{ sx: { height: '90vh', borderRadius: '12px', overflow: 'hidden' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', py: 1.8, px: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#1e3a8a' }}>Master Details of Check List</Typography>
          <IconButton onClick={handleClose} size="small" sx={{ color: '#64748b' }}><IconX size={20} /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4, pt: '24px !important', display: 'flex', flexDirection: 'column', gap: 3.5, bgcolor: '#f8fafc', overflowY: 'auto' }}>
          {/* Form Fields CSS Grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, 
            gap: 2.5,
            mt: 1
          }}>
            {/* ROW 1 */}
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
              <TextField
                label="Sequence No"
                fullWidth
                size="small"
                value={seqNo}
                InputProps={{ readOnly: true }}
                InputLabelProps={{ shrink: true }}
                required
                sx={inputSx}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
              <FormControl fullWidth size="small" required sx={inputSx}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  label="Category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <MenuItem value=""><em>-Select-</em></MenuItem>
                  <MenuItem value="RENEWAL">RENEWAL</MenuItem>
                  <MenuItem value="CHECK LIST">CHECK LIST</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
              <FormControl fullWidth size="small" required sx={inputSx}>
                <InputLabel id="frequency-label">Frequency</InputLabel>
                <Select
                  labelId="frequency-label"
                  label="Frequency"
                  value={frequency}
                  onChange={e => setFrequency(e.target.value)}
                >
                  <MenuItem value=""><em>-Select-</em></MenuItem>
                  {['DAILY','WEEKLY','FORTNIGHTLY','MONTHLY','QUARTERLY','HALF YEARLY','YEARLY', 'CUSTOM'].map(f => (
                    <MenuItem key={f} value={f}>{f}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
              <TextField
                label="Effective From"
                fullWidth
                size="small"
                type="date"
                value={effectiveFrom}
                onChange={e => setEffectiveFrom(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={!initialData ? { min: new Date().toISOString().split('T')[0] } : {}}
                required
                sx={inputSx}
              />
            </Box>

            {/* Dynamic frequency helper inputs - if WEEKLY or CUSTOM are selected */}
            {(frequency === 'WEEKLY' || frequency === 'CUSTOM') && (
              <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 4' } }}>
                <Box sx={{ p: 2.5, border: '1px dashed', borderColor: 'primary.main', borderRadius: 2, bgcolor: '#ffffff', display: 'flex', gap: 2.5, alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  {frequency === 'WEEKLY' && (
                    <FormControl size="small" sx={{ minWidth: 200, ...inputSx }} required>
                      <InputLabel id="weekly-day-label">Week Day</InputLabel>
                      <Select
                        labelId="weekly-day-label"
                        label="Week Day"
                        value={weekDays}
                        onChange={e => setWeekDays(e.target.value)}
                      >
                        <MenuItem value=""><em>-Select-</em></MenuItem>
                        {WEEK_DAYS.map(day => (
                          <MenuItem key={day} value={day}>{day}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                  {frequency === 'CUSTOM' && (
                    <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                      <TextField 
                        label="Repeat Every"
                        size="small"
                        sx={{ width: 140, ...inputSx }}
                        placeholder="e.g. 2"
                        value={repeatEveryValue} 
                        onChange={e => setRepeatEveryValue(e.target.value)} 
                        required
                      />
                      <FormControl size="small" sx={{ width: 180, ...inputSx }} required>
                        <InputLabel id="repeat-unit-label">Unit</InputLabel>
                        <Select
                          labelId="repeat-unit-label"
                          label="Unit"
                          value={repeatEveryUnit} 
                          onChange={e => setRepeatEveryUnit(e.target.value)} 
                        >
                          <MenuItem value=""><em>-Select-</em></MenuItem>
                          <MenuItem value="DAYS">DAYS</MenuItem>
                          <MenuItem value="WEEKS">WEEKS</MenuItem>
                          <MenuItem value="MONTHS">MONTHS</MenuItem>
                          <MenuItem value="YEARS">YEARS</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* ROW 2 */}
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
              <TextField
                label="Expiry Date (dd/mm/yyyy)"
                fullWidth
                size="small"
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={!initialData ? { min: new Date().toISOString().split('T')[0] } : {}}
                sx={inputSx}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
              <TextField
                label="Reminder Days"
                fullWidth
                size="small"
                type="number"
                value={reminderDays}
                onChange={e => handleReminderDaysChange(e.target.value)}
                sx={inputSx}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
              <TextField
                label="Reminder Date (dd/mm/yyyy)"
                fullWidth
                size="small"
                type="date"
                value={reminderDate}
                onChange={e => setReminderDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={!initialData ? { min: new Date().toISOString().split('T')[0] } : {}}
                sx={inputSx}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
              <TextField
                label="Renewal Point"
                fullWidth
                size="small"
                value={renewalPoint}
                onChange={e => setRenewalPoint(e.target.value)}
                required
                sx={inputSx}
              />
            </Box>

            {/* ROW 3 - Descriptions/SOP */}
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 4' } }}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  label="Descriptions/SOP"
                  fullWidth
                  size="small"
                  multiline
                  minRows={4}
                  value={isListening && interimText ? description + ' ' + interimText : description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Standard Operating Procedure... (or use mic 🎤)"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ sx: { pr: '44px' } }}
                  required
                  sx={inputSx}
                />
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
              </Box>
              {isListening && (
                <Typography variant="caption" sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <IconMicrophone size={12} /> Listening… speak now
                </Typography>
              )}
            </Box>

            {/* ROW 4 */}
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
              <FormControl fullWidth size="small" required sx={inputSx}>
                <InputLabel id="department-label">Department</InputLabel>
                <Select
                  labelId="department-label"
                  label="Department"
                  multiple
                  value={department}
                  onChange={e => {
                    const val = e.target.value;
                    if (val.includes('Select All')) {
                      if (department.length === DEPARTMENTS.length) {
                        setDepartment([]);
                      } else {
                        setDepartment(DEPARTMENTS);
                      }
                    } else {
                      setDepartment(typeof val === 'string' ? val.split(',') : val);
                    }
                  }}
                  renderValue={sel => sel.length === 0 ? '-Select-' : sel.length === DEPARTMENTS.length ? 'All Departments' : sel.join(', ')}
                >
                  <MenuItem value="Select All">
                    <Checkbox 
                      checked={department.length === DEPARTMENTS.length} 
                      indeterminate={department.length > 0 && department.length < DEPARTMENTS.length} 
                      size="small" 
                    />
                    <ListItemText primary="Select All" primaryTypographyProps={{ fontWeight: 700 }} />
                  </MenuItem>
                  <Divider />
                  {DEPARTMENTS.map(dept => (
                    <MenuItem key={dept} value={dept}>
                      <Checkbox checked={department.includes(dept)} size="small" />
                      <ListItemText primary={dept} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
              <Autocomplete
                multiple
                size="small"
                options={['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7']}
                value={levelIds}
                onChange={(e, val) => setLevelIds(val)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return <Chip key={key} variant="outlined" label={option} size="small" {...tagProps} />;
                  })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Levels" placeholder="Select Levels" size="small" required sx={inputSx} />
                )}
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
              <FormControl fullWidth size="small" required sx={inputSx}>
                <InputLabel id="photo-required-label">Photo Required</InputLabel>
                <Select
                  labelId="photo-required-label"
                  label="Photo Required"
                  value={photoRequired}
                  onChange={e => setPhotoRequired(e.target.value)}
                >
                  <MenuItem value=""><em>-Select-</em></MenuItem>
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
              <FormControl fullWidth size="small" required sx={inputSx}>
                <InputLabel id="dual-check-label">Dual Check</InputLabel>
                <Select
                  labelId="dual-check-label"
                  label="Dual Check"
                  value={dualCheck}
                  onChange={e => setDualCheck(e.target.value)}
                >
                  <MenuItem value=""><em>-Select-</em></MenuItem>
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* ROW 5 */}
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
              <FormControl fullWidth size="small" required sx={inputSx}>
                <InputLabel id="carry-forward-label">Carry Forward</InputLabel>
                <Select
                  labelId="carry-forward-label"
                  label="Carry Forward"
                  value={carryForward}
                  onChange={e => setCarryForward(e.target.value)}
                >
                  <MenuItem value=""><em>-Select-</em></MenuItem>
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 1' } }}>
              <FormControl fullWidth size="small" required sx={inputSx}>
                <InputLabel id="stock-link-label">Stock Link</InputLabel>
                <Select
                  labelId="stock-link-label"
                  label="Stock Link"
                  value={stockLink}
                  onChange={e => setStockLink(e.target.value)}
                >
                  <MenuItem value=""><em>-Select-</em></MenuItem>
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}></Box>

            {isAmendment && (
              <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 4' } }}>
                <TextField 
                  label="Amendment Reason"
                  fullWidth 
                  size="small" 
                  multiline 
                  minRows={2} 
                  value={amendmentReason} 
                  onChange={e => setAmendmentReason(e.target.value)} 
                  placeholder="Enter reason for this amendment..."
                  required
                  sx={inputSx}
                />
              </Box>
            )}
          </Box>

          {/* BOTTOM SECTION: Files Grid */}
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Uploaded Files box */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#334155' }}>Uploaded Files</Typography>
                  <Button
                    component="label"
                    variant="contained"
                    size="small"
                    startIcon={<IconCloudUpload size={16} />}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '8px',
                      bgcolor: '#5c33a6', 
                      '&:hover': { bgcolor: '#4c298a' }
                    }}
                  >
                    Upload File
                    <input type="file" hidden multiple onChange={handleFileUpload} />
                  </Button>
                </Box>
                <Box sx={{ 
                  height: 200, 
                  bgcolor: '#ffffff', 
                  border: '1px dashed #cbd5e1', 
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
                      <IconCloudUpload size={48} stroke={1.5} color="#2563eb" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>No file uploaded yet</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Upload files using the button above</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }} onMouseLeave={hidePreview}>
                      {uploadedFiles.map((f, i) => (
                        <FileItem
                          key={i} file={f}
                          onEnter={(e) => showPreview(f, e)}
                          onMove={movePreview}
                          onLeave={hidePreview}
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
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#334155' }}>Scanned Files</Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<IconCamera size={16} />}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '8px',
                      bgcolor: '#0070f3',
                      '&:hover': { bgcolor: '#005ed3' }
                    }}
                  >
                    Scan & Upload
                  </Button>
                </Box>
                <Box sx={{ 
                  height: 200, 
                  bgcolor: '#ffffff', 
                  border: '1px dashed #cbd5e1', 
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
                      <IconFileDescription size={48} stroke={1.5} color="#2563eb" />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>No file scanned yet</Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>Upload files using the button above</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {scannedFiles.map((f, i) => (
                        <FileItem key={i} file={f} />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ justifyContent: 'center', gap: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', py: 2.5 }}>
          <Button
            variant="contained"
            onClick={() => handleSave('INACTIVE')}
            startIcon={<IconX size={16} />}
            sx={{
              bgcolor: '#dc2626',
              color: '#ffffff',
              borderRadius: '8px',
              textTransform: 'none',
              px: 4,
              py: 1,
              fontWeight: 600,
              '&:hover': { bgcolor: '#b91c1c' }
            }}
          >
            IN ACTIVE
          </Button>
          <Button
            variant="contained"
            onClick={handleClear}
            startIcon={<IconEraser size={16} />}
            sx={{
              bgcolor: '#5c33a6',
              color: '#ffffff',
              borderRadius: '8px',
              textTransform: 'none',
              px: 4,
              py: 1,
              fontWeight: 600,
              '&:hover': { bgcolor: '#4c298a' }
            }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={() => handleSave('ACTIVE')}
            startIcon={<IconCheck size={16} />}
            sx={{
              bgcolor: '#0070f3',
              color: '#ffffff',
              borderRadius: '8px',
              textTransform: 'none',
              px: 4,
              py: 1,
              fontWeight: 600,
              '&:hover': { bgcolor: '#005ed3' }
            }}
          >
            Save
          </Button>
        </DialogActions>
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
