<<<<<<< HEAD
import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Box, Typography, TextField, Select, MenuItem,
  Button, IconButton, Divider, Checkbox, ListItemText, Slide, useTheme,
  CircularProgress
} from '@mui/material';
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

const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const LabelInput = ({ label, required, children }) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
    <Box sx={{ width: 135, flexShrink: 0, pt: 0.8 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
        {label}
        {required && <Typography component="span" sx={{ color: 'error.main', fontWeight: 900, ml: 0.2 }}>*</Typography>}
      </Typography>
    </Box>
    <Box sx={{ flex: 1 }}>{children}</Box>
  </Box>
);
LabelInput.propTypes = { label: PropTypes.string, required: PropTypes.bool, children: PropTypes.node };

export default function AddCheckListDialog({ open, handleClose, onSave, initialData, isAmendment }) {
  const theme = useTheme();

  const [seqNo, setSeqNo] = useState('');
  const [category, setCategory] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [reminderDays, setReminderDays] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [renewalPoint, setRenewalPoint] = useState('');
  const [frequency, setFrequency] = useState('');
  const [weekDays, setWeekDays] = useState([]);
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
=======
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  MenuItem,
  Stack,
  Autocomplete,
  Chip,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  Paper,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  IconSettings,
  IconCalendarEvent,
  IconListDetails,
  IconFileText,
  IconCloudUpload,
  IconEye,
  IconTrash,
  IconChecks,
  IconBan,
  IconMicrophone,
  IconMicrophoneOff,
  IconFiles,
  IconInfoCircle,
  IconAlertCircle
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import {
  BOSFormDialog,
  BOSFormSection,
  BOSTextField,
  getStatusChipSx,
  formatBOSFiles,
  BOSFileGallery,
  BOSFileUpload,
  errorStyle
} from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import useLookups from 'hooks/useLookups';
import { autoUploadFile } from 'utils/upload-helper';

const CATEGORIES = ['SAFETY', 'QUALITY', 'MAINTENANCE', 'PRODUCTION', 'HR/ADMIN', 'AUDIT', 'RENEWAL', 'CHECK LIST'];
const FREQUENCIES = ['DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'QUARTERLY', 'HALF YEARLY', 'YEARLY'];

export const AddCheckListDialog = ({ open, handleClose, onSave, initialData, readOnly, onVerify, onReject }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(!readOnly);

  const [formData, setFormData] = useState({
    seqNo: '',
    category: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    expiryDate: '',
    reminderDays: '',
    reminderDate: '',
    checkingPoint: '',
    frequency: '',
    description: '',
    department: [],
    stockLink: 'NO',
    photoRequired: 'NO',
    itemCode: '',
    qty: '',
    dualCheck: 'NO',
    carryForward: 'NO',
    assignTo: '',
    verificationRequired: 'YES',
    status: 'ACTIVE',
    amendmentReason: '',
    levelIds: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [scannedFiles, setScannedFiles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [errors, setErrors] = useState({});
  const speechRef = useRef(null);

  const lookups = useLookups(['ACTIVE_DEPARTMENTS', 'EMPLOYEES']);
  
  const departmentList = useMemo(() => 
    (lookups.activeDepartments || [])
      .map(d => (d.departmentName || d.deptName || d.name || d).toUpperCase())
      .filter(Boolean),
    [lookups.activeDepartments]
  );

  const filteredEmployees = useMemo(() => {
    if (!lookups.employees) return [];
    if (!formData.department || formData.department.length === 0) return lookups.employees;
    const selectedDeptIds = (lookups.activeDepartments || [])
      .filter(d => formData.department.includes((d.departmentName || d.deptName || '').toUpperCase()))
      .map(d => d.id);
    return lookups.employees.filter(e => selectedDeptIds.includes(e.departmentId));
  }, [lookups.activeDepartments, formData.department, lookups.employees]);

  const employeeList = useMemo(() => 
    filteredEmployees.map(e => e.employeeName || `${e.firstName} ${e.lastName}`),
    [filteredEmployees]
  );

  useEffect(() => {
    if (formData.assignTo && !employeeList.includes(formData.assignTo)) {
      setFormData(prev => ({ ...prev, assignTo: '' }));
    }
  }, [employeeList, formData.assignTo]);

  useEffect(() => {
    setIsEditing(!readOnly);
  }, [readOnly, open]);
>>>>>>> origin/chore/repo-cleanup

  useEffect(() => {
    if (open) {
      if (initialData) {
<<<<<<< HEAD
        setSeqNo(initialData.seqNo || '');
        setCategory(initialData.category || '');
        setEffectiveFrom(initialData.effectiveFrom || '');
        setExpiryDate(initialData.expiryDate || '');
        setReminderDays(initialData.reminderDays || '');
        setReminderDate(initialData.reminderDate || '');
        setRenewalPoint(initialData.checkingPoint || '');
        setFrequency(initialData.frequency || '');
        setWeekDays(initialData.weekDays ? (Array.isArray(initialData.weekDays) ? initialData.weekDays : initialData.weekDays.split(',')) : []);
        setRepeatEveryValue(initialData.repeatEveryValue || '');
        setRepeatEveryUnit(initialData.repeatEveryUnit || '');
        setDescription(initialData.description || '');
        setDepartment((initialData.departments || []).map(d => d.departmentName));
        setStockLink(initialData.stockLink || '');
        setPhotoRequired(initialData.photoRequired || '');
        setDualCheck(initialData.dualCheck || '');
        setCarryForward(initialData.carryForward || '');
        setAmendmentReason(initialData.amendmentReason || '');
        setUploadedFiles([]);
        setScannedFiles([]);
      } else {
        setSeqNo(''); setCategory(''); setEffectiveFrom(''); setExpiryDate(''); setReminderDays('');
        setReminderDate(''); setRenewalPoint(''); setFrequency(''); setDescription('');
        setDepartment([]); setUploadedFiles([]); setScannedFiles([]);
        setStockLink(''); setPhotoRequired(''); setDualCheck(''); setCarryForward('');
        setWeekDays([]); setRepeatEveryValue(''); setRepeatEveryUnit('');
        setAmendmentReason('');
        axios.get('/api/qms/checklist/next-sequence')
          .then(res => setSeqNo(String(res.data.nextSeqNo).padStart(3, '0')))
          .catch(() => {});
=======
        setFormData({
          seqNo: initialData.seqNo || '',
          category: initialData.category || '',
          effectiveFrom: initialData.effectiveFrom ? initialData.effectiveFrom.split('T')[0] : '',
          expiryDate: initialData.expiryDate ? initialData.expiryDate.split('T')[0] : '',
          reminderDays: initialData.reminderDays || '',
          reminderDate: initialData.reminderDate ? initialData.reminderDate.split('T')[0] : '',
          checkingPoint: initialData.checkingPoint || '',
          frequency: initialData.frequency || '',
          description: initialData.description || '',
          department: (initialData.departments || []).map((d) => (d.departmentName || d).toUpperCase()),
          stockLink: initialData.stockLink || 'NO',
          photoRequired: initialData.photoRequired || 'NO',
          itemCode: initialData.itemCode || '',
          qty: initialData.qty || '',
          dualCheck: initialData.dualCheck || 'NO',
          carryForward: initialData.carryForward || 'NO',
          assignTo: initialData.assignTo || '',
          verificationRequired: initialData.verificationRequired || 'YES',
          status: initialData.status === 'In Active' ? 'INACTIVE' : (initialData.status || 'ACTIVE'),
          amendmentReason: '',
          levelIds: initialData.levelIds || ''
        });
        setUploadedFiles(formatBOSFiles(initialData.uploadedFiles || initialData.uploaded_files));
        setScannedFiles(formatBOSFiles(initialData.scannedFiles || initialData.scanned_files));
      } else {
        resetForm();
>>>>>>> origin/chore/repo-cleanup
      }
    }
  }, [open, initialData]);

<<<<<<< HEAD
  const handleFileUpload = (e) => {
    if (e.target.files?.length) setUploadedFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };
  const handleScanUpload = (e) => {
    if (e.target.files?.length) setScannedFiles(prev => [...prev, ...Array.from(e.target.files)]);
  };
  const handleClear = () => {
    setSeqNo(''); setCategory(''); setEffectiveFrom(''); setExpiryDate(''); setReminderDays('');
    setReminderDate(''); setRenewalPoint(''); setFrequency(''); setDescription('');
    setDepartment([]); setUploadedFiles([]); setScannedFiles([]);
    setStockLink(''); setPhotoRequired(''); setDualCheck(''); setCarryForward('');
    setWeekDays([]); setRepeatEveryValue(''); setRepeatEveryUnit('');
    setAmendmentReason('');
  };
  const handleSave = () => {
    if (!category || !frequency || !effectiveFrom || !renewalPoint || !description || department.length === 0) {
      alert('Please fill in all required fields (Category, Frequency, Effective From, Renewal Point, Descriptions/SOP, Department)'); return;
    }
    if (isAmendment && !amendmentReason) {
      alert('Please provide an Amendment Reason!'); return;
    }
    if (onSave) onSave({
      id: initialData?.id || null,
      seqNo,
      category,
      checkingPoint: renewalPoint,
      frequency,
      description,
      department,
      effectiveFrom: effectiveFrom || null,
      stockLink: stockLink || null,
      photoRequired: photoRequired || null,
      dualCheck: dualCheck || null,
      carryForward: carryForward || null,
      weekDays: weekDays.length > 0 ? weekDays.join(',') : null,
      repeatEveryValue: repeatEveryValue ? Number(repeatEveryValue) : null,
      repeatEveryUnit: repeatEveryUnit || null,
      expiryDate: expiryDate || null,
      reminderDate: reminderDate || null,
      reminderDays: reminderDays ? Number(reminderDays) : null,
      amendmentReason: amendmentReason || null,
    });
    handleClose();
  };

  const isImage = (file) => /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(file.name);

  return (
    <>
      <Dialog
        open={open} TransitionComponent={Transition} keepMounted onClose={handleClose}
        maxWidth="lg" fullWidth
        PaperProps={{ sx: { height: '90vh' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.light', py: 1.2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.dark' }}>Master Details of Check List</Typography>
          <IconButton onClick={handleClose} size="small"><IconX size={20} /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <Grid container spacing={2} sx={{ height: '100%', flexWrap: 'nowrap' }}>

            {/* ── LEFT: Form ── */}
            <Grid item sx={{ width: 360, flexShrink: 0, height: '100%', overflowY: 'auto' }}>
              <LabelInput label="Sequence No" required>
                <TextField fullWidth size="small" value={seqNo} InputProps={{ readOnly: true }} />
              </LabelInput>
              <LabelInput label="Category" required>
                <Select fullWidth size="small" value={category} onChange={e => setCategory(e.target.value)} displayEmpty>
                  <MenuItem value=""><em>-Select-</em></MenuItem>
                  <MenuItem value="RENEWAL">RENEWAL</MenuItem>
                  <MenuItem value="CHECK LIST">CHECK LIST</MenuItem>
                </Select>
              </LabelInput>
              <LabelInput label="Frequency" required>
                <Select fullWidth size="small" value={frequency} onChange={e => setFrequency(e.target.value)} displayEmpty>
                  <MenuItem value=""><em>-Select-</em></MenuItem>
                  {['DAILY','WEEKLY','FORTNIGHTLY','MONTHLY','QUARTERLY','HALF YEARLY','YEARLY', 'CUSTOM'].map(f => (
                    <MenuItem key={f} value={f}>{f}</MenuItem>
                  ))}
                </Select>
              </LabelInput>
              
              {frequency === 'WEEKLY' && (
                <LabelInput label="Week Days" required>
                  <Select
                    multiple fullWidth size="small" value={weekDays}
                    onChange={e => setWeekDays(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                    renderValue={sel => sel.length === 0 ? <em>-Select-</em> : sel.join(', ')}
                  >
                    {WEEK_DAYS.map(day => (
                      <MenuItem key={day} value={day}>
                        <Checkbox checked={weekDays.includes(day)} size="small" />
                        <ListItemText primary={day} />
                      </MenuItem>
                    ))}
                  </Select>
                </LabelInput>
              )}

              {frequency === 'CUSTOM' && (
                <LabelInput label="Repeat Every" required>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField 
                      fullWidth size="small" 
                      placeholder="e.g. 2"
                      value={repeatEveryValue} 
                      onChange={e => setRepeatEveryValue(e.target.value)} 
                    />
                    <Select 
                      fullWidth size="small" 
                      value={repeatEveryUnit} 
                      onChange={e => setRepeatEveryUnit(e.target.value)} 
                      displayEmpty
                    >
                      <MenuItem value=""><em>-Select-</em></MenuItem>
                      <MenuItem value="DAYS">DAYS</MenuItem>
                      <MenuItem value="WEEKS">WEEKS</MenuItem>
                      <MenuItem value="MONTHS">MONTHS</MenuItem>
                      <MenuItem value="YEARS">YEARS</MenuItem>
                    </Select>
                  </Box>
                </LabelInput>
              )}
              <LabelInput label="Effective From" required>
                <TextField fullWidth size="small" type="date" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} />
              </LabelInput>
              <LabelInput label="Expiry Date">
                <TextField fullWidth size="small" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} />
              </LabelInput>
              <LabelInput label="Reminder Days">
                <TextField fullWidth size="small" type="number" value={reminderDays} onChange={e => setReminderDays(e.target.value)} />
              </LabelInput>
              <LabelInput label="Reminder Date">
                <TextField fullWidth size="small" type="date" value={reminderDate} onChange={e => setReminderDate(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} />
              </LabelInput>
              <LabelInput label="Renewal Point" required>
                <TextField fullWidth size="small" value={renewalPoint} onChange={e => setRenewalPoint(e.target.value)} />
              </LabelInput>
              <LabelInput label="Descriptions/SOP" required>
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth size="small" multiline minRows={4}
                    value={isListening && interimText ? description + ' ' + interimText : description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Standard Operating Procedure... (or use mic 🎤)"
                    InputProps={{ sx: { pr: '44px' } }}
                  />
                  <IconButton
                    onClick={toggleListening}
                    size="small"
                    title={isListening ? 'Stop recording' : isSpeechSupported ? 'Start voice input' : 'Not supported — use Chrome/Edge'}
                    sx={{
                      position: 'absolute', bottom: 8, right: 6,
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
              </LabelInput>
              <LabelInput label="Department" required>
                <Select
                  multiple fullWidth size="small" value={department}
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
                  renderValue={sel => sel.length === 0 ? <em>-Select-</em> : sel.length === DEPARTMENTS.length ? 'All Departments' : sel.join(', ')}
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
              </LabelInput>

              {/* ── Yes/No dropdowns ── */}
              {[{ label: 'Stock Link', value: stockLink, setter: setStockLink },
                { label: 'Photo Required', value: photoRequired, setter: setPhotoRequired },
                { label: 'Dual Check', value: dualCheck, setter: setDualCheck },
                { label: 'Carry Forward', value: carryForward, setter: setCarryForward }]
                .map(({ label, value, setter }) => (
                  <LabelInput key={label} label={label} required>
                    <Select fullWidth size="small" value={value} onChange={e => setter(e.target.value)} displayEmpty>
                      <MenuItem value=""><em>-Select-</em></MenuItem>
                      <MenuItem value="YES">YES</MenuItem>
                      <MenuItem value="NO">NO</MenuItem>
                    </Select>
                  </LabelInput>
                ))
              }

              {isAmendment && (
                <LabelInput label="Amendment Reason" required>
                  <TextField 
                    fullWidth 
                    size="small" 
                    multiline 
                    minRows={2} 
                    value={amendmentReason} 
                    onChange={e => setAmendmentReason(e.target.value)} 
                    placeholder="Enter reason for this amendment..."
                  />
                </LabelInput>
              )}
            </Grid>

            {/* ── RIGHT: Upload + Scan boxes (fill remaining space) ── */}
            <Grid item sx={{ flex: 1, height: '100%', display: 'flex', gap: 2, minWidth: 0, pl: 1 }}>

              {/* Uploaded Files box */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Uploaded Files</Typography>
                  <Button component="label" variant="contained" color="secondary" size="small"
                    startIcon={<IconCloudUpload size={16} />}
                    sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: '0.78rem' }}
                  >
                    Upload File
                    <input type="file" multiple hidden onChange={handleFileUpload} />
                  </Button>
                </Box>
                <Box sx={{
                  flex: 1, border: `1.5px dashed ${theme.palette.divider}`, borderRadius: 2,
                  p: 1.5, overflowY: 'auto',
                  display: 'flex', flexDirection: 'column',
                  alignItems: uploadedFiles.length === 0 ? 'center' : 'flex-start',
                  justifyContent: uploadedFiles.length === 0 ? 'center' : 'flex-start',
                }} onMouseLeave={hidePreview}>
                  {uploadedFiles.length === 0 ? (
                    <Box sx={{ textAlign: 'center', color: 'text.disabled' }}>
                      <IconFileDescription size={52} stroke={1} />
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>No file uploaded yet</Typography>
                      <Typography variant="caption">Upload files using the button above</Typography>
                    </Box>
                  ) : (
                    uploadedFiles.map((f, i) => (
                      <FileItem
                        key={i} file={f}
                        onEnter={(e) => showPreview(f, e)}
                        onMove={movePreview}
                        onLeave={hidePreview}
                      />
                    ))
                  )}
                </Box>
              </Box>

              {/* Scanned Files box */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Scanned Files</Typography>
                  <Button component="label" variant="contained" color="primary" size="small"
                    startIcon={<IconCamera size={16} />}
                    sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: '0.78rem' }}
                  >
                    Scan & Upload
                    <input type="file" accept="image/*" capture="environment" hidden onChange={handleScanUpload} />
                  </Button>
                </Box>
                <Box sx={{
                  flex: 1, border: `1.5px dashed ${theme.palette.divider}`, borderRadius: 2,
                  p: 1.5, overflowY: 'auto',
                  display: 'flex', flexDirection: 'column',
                  alignItems: scannedFiles.length === 0 ? 'center' : 'flex-start',
                  justifyContent: scannedFiles.length === 0 ? 'center' : 'flex-start',
                }} onMouseLeave={hidePreview}>
                  {scannedFiles.length === 0 ? (
                    <Box sx={{ textAlign: 'center', color: 'text.disabled' }}>
                      <IconFileDescription size={52} stroke={1} />
                      <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>No file scanned yet</Typography>
                      <Typography variant="caption">Upload files using the button above</Typography>
                    </Box>
                  ) : (
                    scannedFiles.map((f, i) => (
                      <FileItem
                        key={i} file={f}
                        onEnter={(e) => showPreview(f, e)}
                        onMove={movePreview}
                        onLeave={hidePreview}
                      />
                    ))
                  )}
                </Box>
              </Box>

            </Grid>
          </Grid>
        </DialogContent>

        <Divider />
        <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 2 }}>
          <Button variant="contained" color="error" startIcon={<IconX size={18} />} sx={{ px: 4, borderRadius: 1.5, textTransform: 'none' }}>IN ACTIVE</Button>
          <Button onClick={handleClear} variant="contained" color="secondary" startIcon={<IconEraser size={18} />} sx={{ px: 4, borderRadius: 1.5, textTransform: 'none' }}>Clear</Button>
          <Button onClick={handleSave} variant="contained" color="primary" startIcon={<IconCheck size={18} />} sx={{ px: 4, borderRadius: 1.5, textTransform: 'none' }}>Save</Button>
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
=======
  const fetchNextSeq = async () => {
    try {
      const res = await axios.get(`${API_PATHS.QMS.CHECKLIST}/next-sequence`);
      setFormData(prev => ({ ...prev, seqNo: res.data.nextSeqNo }));
    } catch (error) {
      setFormData(prev => ({ ...prev, seqNo: String(Date.now()).slice(-4) }));
    }
  };

  const resetForm = () => {
    setFormData({
      seqNo: '',
      category: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
      expiryDate: '',
      reminderDays: '',
      reminderDate: '',
      checkingPoint: '',
      frequency: '',
      description: '',
      department: [],
      stockLink: 'NO',
      photoRequired: 'NO',
      itemCode: '',
      qty: '',
      dualCheck: 'NO',
      carryForward: 'NO',
      assignTo: '',
      verificationRequired: 'YES',
      status: 'ACTIVE',
      amendmentReason: '',
      levelIds: ''
    });
    setUploadedFiles([]);
    setScannedFiles([]);
    setErrors({});
    if (!initialData) fetchNextSeq();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'expiryDate' || name === 'reminderDays') {
        const expiry = name === 'expiryDate' ? value : prev.expiryDate;
        const days = parseInt(name === 'reminderDays' ? value : prev.reminderDays);
        if (expiry && !isNaN(days)) {
          const date = new Date(expiry);
          date.setDate(date.getDate() - days);
          newData.reminderDate = date.toISOString().split('T')[0];
        }
      }
      return newData;
    });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleSave = async () => {
    const mandatoryFields = [
      { field: 'category', label: 'Category' },
      { field: 'frequency', label: 'Frequency' },
      { field: 'checkingPoint', label: 'Checking Point' },
      { field: 'description', label: 'SOP Description' },
      { field: 'effectiveFrom', label: 'Effective From' }
    ];

    const newErrors = {};
    mandatoryFields.forEach(f => { if (!formData[f.field]) newErrors[f.field] = true; });
    
    // SOP Check: Stock Link
    if (formData.stockLink === 'YES') {
      if (!formData.itemCode) newErrors.itemCode = true;
      if (!formData.qty) newErrors.qty = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      dispatch(openSnackbar({
        open: true,
        message: 'Please fill all highlighted mandatory fields.',
        variant: 'alert',
        severity: 'error',
        alert: { variant: 'filled' }
      }));
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(formData.effectiveFrom) < today) {
      setErrors(prev => ({ ...prev, effectiveFrom: true }));
      dispatch(openSnackbar({
        open: true,
        message: 'Effective From date cannot be in the past.',
        variant: 'alert',
        severity: 'error',
        alert: { variant: 'filled' }
      }));
      return;
    }

    try {
      const uploadFile = async (f) => f.isServer ? (f.docDetails ? `${f.name}|${f.docDetails}` : f.name) : 
        `${await autoUploadFile(f.file)}${f.docDetails ? '|' + f.docDetails : ''}`;

      const finalUploaded = await Promise.all(uploadedFiles.map(uploadFile));
      const finalScanned = await Promise.all(scannedFiles.map(uploadFile));

      await onSave({
        ...formData,
        id: initialData?.id,
        status: formData.status === 'INACTIVE' ? 'In Active' : 'Active',
        description: formData.amendmentReason ? formData.description + '\n[Amendment]: ' + formData.amendmentReason : formData.description,
        uploadedFiles: finalUploaded,
        scannedFiles: finalScanned
      });
      handleClose();
    } catch (error) {
      dispatch(openSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to save record.',
        variant: 'alert',
        severity: 'error',
        alert: { variant: 'filled' }
      }));
    }
  };


  return (
    <BOSFormDialog
      open={open}
      onClose={handleClose}
      onSave={handleSave}
      onClear={isEditing ? resetForm : null}
      isViewOnly={!isEditing}
      onEditClick={readOnly ? null : () => setIsEditing(true)}
      secondaryActions={
        (onVerify || onReject) && !isEditing && (
          <Stack direction="row" spacing={1.5}>
            {onReject && (
              <Button variant="contained" color="error" onClick={onReject} startIcon={<IconBan size={20} />} sx={{ borderRadius: '12px' }}>
                Reject
              </Button>
            )}
            {onVerify && (
              <Button variant="contained" color="success" onClick={onVerify} startIcon={<IconChecks size={20} />} sx={{ borderRadius: '12px' }}>
                Verify
              </Button>
            )}
          </Stack>
        )
      }
      title={initialData?.id ? `Checklist Management - ${initialData.seqNo}` : 'Create New Checklist'}
      maxWidth="lg"
      sidebar={
        <Stack spacing={3}>
          <BOSFormSection title="Standard Attachments" icon={<IconFiles size={22} color={theme.palette.primary.main} />}>
            <BOSFileUpload 
              files={uploadedFiles} 
              onChange={setUploadedFiles} 
              module="QMS_CHECKLIST"
              disabled={!isEditing}
              label="Upload SOP Documents"
              helperText="PDFs, Images, or Excel sheets"
            />
          </BOSFormSection>

          {initialData?.rejReason && (
            <Paper sx={{ p: 2, bgcolor: 'error.lighter', border: '1px solid', borderColor: 'error.light', borderRadius: '12px' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <IconAlertCircle size={20} color={theme.palette.error.main} />
                <Typography variant="subtitle2" color="error.main" fontWeight={700}>Rejection Note</Typography>
              </Stack>
              <Typography variant="body2" color="error.dark">{initialData.rejReason}</Typography>
            </Paper>
          )}

          <Paper sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: '12px', border: '1px solid', borderColor: 'primary.light' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <IconInfoCircle size={20} color={theme.palette.primary.main} />
              <Typography variant="subtitle2" color="primary.main" fontWeight={700}>Audit Info</Typography>
            </Stack>
            <Typography variant="caption" display="block">System ID: {initialData?.id || 'New'}</Typography>
            <Typography variant="caption" display="block">Verify Status: {initialData?.verifyStatus || 'Pending'}</Typography>
          </Paper>
        </Stack>
      }
    >
      <Stack spacing={3}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <BOSFormSection title="Configuration" icon={<IconSettings size={22} color={theme.palette.primary.main} />}>
            <Stack spacing={2.5}>
              <BOSTextField label="Sequence Number" value={formData.seqNo} InputProps={{ readOnly: true, sx: { fontWeight: 700, color: 'primary.main' } }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <BOSTextField select label="Category" name="category" value={formData.category} onChange={handleChange} disabled={!isEditing} required error={errors.category} sx={errorStyle(errors.category)}>
                  {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </BOSTextField>
                <BOSTextField select label="Frequency" name="frequency" value={formData.frequency} onChange={handleChange} disabled={!isEditing} required error={errors.frequency} sx={errorStyle(errors.frequency)}>
                  {FREQUENCIES.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </BOSTextField>
              </Box>
              <Autocomplete
                multiple
                options={departmentList}
                value={formData.department}
                disabled={!isEditing}
                onChange={(e, val) => {
                  setFormData(p => ({ ...p, department: val }));
                  if (errors.department) setErrors(prev => ({ ...prev, department: false }));
                }}
                renderTags={(value, getTagProps) => value.map((option, index) => <Chip key={index} variant="filled" color="primary" label={option} size="small" {...getTagProps({ index })} />)}
                renderInput={(params) => <BOSTextField {...params} label="Assigned Departments" placeholder="Select..." error={errors.department} sx={errorStyle(errors.department)} />}
              />
            </Stack>
          </BOSFormSection>

          <BOSFormSection title="Scheduling" icon={<IconCalendarEvent size={22} color={theme.palette.secondary.main} />}>
            <Stack spacing={2.5}>
              <BOSTextField type="date" label="Effective From" name="effectiveFrom" value={formData.effectiveFrom} onChange={handleChange} InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split('T')[0] }} disabled={!isEditing} required error={errors.effectiveFrom} sx={errorStyle(errors.effectiveFrom)} />
              {formData.category === 'RENEWAL' && (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <BOSTextField type="date" label="Expiry Date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} InputLabelProps={{ shrink: true }} disabled={!isEditing} />
                  <BOSTextField type="number" label="Days Reminder" name="reminderDays" value={formData.reminderDays} onChange={handleChange} disabled={!isEditing} />
                </Box>
              )}
              <BOSTextField select label="Executor (Assignee)" name="assignTo" value={formData.assignTo} onChange={handleChange} disabled={!isEditing}>
                <MenuItem value=""><em>Automatic / All</em></MenuItem>
                {employeeList.map(emp => <MenuItem key={emp} value={emp}>{emp}</MenuItem>)}
              </BOSTextField>
            </Stack>
          </BOSFormSection>
        </Box>

        <BOSFormSection title="Standard Operating Procedure (SOP)" icon={<IconFileText size={22} color={theme.palette.success.main} />}>
          <Stack spacing={2}>
            <BOSTextField label="Checking Point / Title" name="checkingPoint" value={formData.checkingPoint} onChange={handleChange} required disabled={!isEditing} error={errors.checkingPoint} sx={errorStyle(errors.checkingPoint)} />
            <BOSTextField
              fullWidth
              multiline
              rows={5}
              label="Step-by-Step Instructions"
              required
              name="description"
              value={isListening ? formData.description + ' ' + interimText : formData.description}
              onChange={handleChange}
              disabled={!isEditing}
              error={errors.description}
              sx={errorStyle(errors.description)}
              InputProps={{
                endAdornment: isEditing && (
                  <Tooltip title={isListening ? "Stop Listening" : "Voice Dictation"}>
                    <IconButton onClick={() => {
                      if (isListening) { speechRef.current?.stop(); setIsListening(false); }
                      else {
                        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                        if (!SR) return;
                        const rec = new SR(); rec.continuous = true; rec.interimResults = true;
                        rec.onresult = (e) => {
                          let fin = '', int = '';
                          for (let i = e.resultIndex; i < e.results.length; i++) {
                            if (e.results[i].isFinal) fin += e.results[i][0].transcript;
                            else int += e.results[i][0].transcript;
                          }
                          if (fin) setFormData(p => ({ ...p, description: (p.description ? p.description + ' ' : '') + fin.trim() }));
                          setInterimText(int);
                        };
                        rec.start(); speechRef.current = rec; setIsListening(true);
                      }
                    }} color={isListening ? 'error' : 'primary'}><IconMicrophone /></IconButton>
                  </Tooltip>
                )
              }}
            />
          </Stack>
        </BOSFormSection>

        <BOSFormSection title="Execution & Control" icon={<IconListDetails size={22} color={theme.palette.warning.main} />}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
            <BOSTextField select label="Photo Required" name="photoRequired" value={formData.photoRequired} onChange={handleChange} disabled={!isEditing}>
              <MenuItem value="YES">YES</MenuItem><MenuItem value="NO">NO</MenuItem>
            </BOSTextField>
            <BOSTextField select label="Dual Check" name="dualCheck" value={formData.dualCheck} onChange={handleChange} disabled={!isEditing}>
              <MenuItem value="YES">YES</MenuItem><MenuItem value="NO">NO</MenuItem>
            </BOSTextField>
            <BOSTextField select label="Carry Forward" name="carryForward" value={formData.carryForward} onChange={handleChange} disabled={!isEditing}>
              <MenuItem value="YES">YES</MenuItem><MenuItem value="NO">NO</MenuItem>
            </BOSTextField>
            
            <BOSTextField select label="Stock Linkage" name="stockLink" value={formData.stockLink} onChange={handleChange} disabled={!isEditing}>
              <MenuItem value="YES">YES</MenuItem><MenuItem value="NO">NO</MenuItem>
            </BOSTextField>
            <BOSTextField label="Item Code" name="itemCode" value={formData.itemCode} onChange={handleChange} disabled={!isEditing} required={formData.stockLink === 'YES'} error={errors.itemCode} sx={errorStyle(errors.itemCode)} />
            <BOSTextField type="number" label="Qty" name="qty" value={formData.qty} onChange={handleChange} disabled={!isEditing} required={formData.stockLink === 'YES'} error={errors.qty} sx={errorStyle(errors.qty)} />

            <BOSTextField select label="Verification Needed" name="verificationRequired" value={formData.verificationRequired} onChange={handleChange} disabled={!isEditing}>
              <MenuItem value="YES">YES</MenuItem><MenuItem value="NO">NO</MenuItem>
            </BOSTextField>
            <BOSTextField select label="Current Status" name="status" value={formData.status} onChange={handleChange} disabled={!isEditing}>
              <MenuItem value="ACTIVE">ACTIVE</MenuItem><MenuItem value="INACTIVE">IN ACTIVE</MenuItem>
            </BOSTextField>
          </Box>
        </BOSFormSection>
      </Stack>
    </BOSFormDialog>
  );
};
>>>>>>> origin/chore/repo-cleanup

AddCheckListDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  onSave: PropTypes.func,
<<<<<<< HEAD
  initialData: PropTypes.object
=======
  initialData: PropTypes.object,
  readOnly: PropTypes.bool,
  onVerify: PropTypes.func,
  onReject: PropTypes.func
>>>>>>> origin/chore/repo-cleanup
};
