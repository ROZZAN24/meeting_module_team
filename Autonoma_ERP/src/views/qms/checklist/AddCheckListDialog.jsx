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
                  {['DAILY','WEEKLY','FORTNIGHTLY','MONTHLY','QUARTERLY','HALF YEARLY','YEARLY'].map(f => (
                    <MenuItem key={f} value={f}>{f}</MenuItem>
                  ))}
                </Select>
              </LabelInput>
              <LabelInput label="Expiry Date">
                <TextField fullWidth size="small" type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} InputLabelProps={{ shrink: true }} />
              </LabelInput>
              <LabelInput label="Reminder Days">
                <TextField fullWidth size="small" type="number" value={reminderDays} onChange={e => setReminderDays(e.target.value)} />
              </LabelInput>
              <LabelInput label="Reminder Date">
                <TextField fullWidth size="small" type="date" value={reminderDate} onChange={e => setReminderDate(e.target.value)} InputLabelProps={{ shrink: true }} />
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
                  onChange={e => setDepartment(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  renderValue={sel => sel.length === 0 ? <em>-Select-</em> : sel.join(', ')}
                >
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

AddCheckListDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  onSave: PropTypes.func,
  initialData: PropTypes.object
};
