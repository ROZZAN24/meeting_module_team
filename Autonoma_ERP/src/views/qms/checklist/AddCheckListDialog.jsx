import { useState, forwardRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import Slide from '@mui/material/Slide';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import axios from 'utils/axios';

import { IconCloudUpload, IconCheck, IconX, IconEraser, IconFileDescription, IconCamera } from '@tabler/icons-react';

const DEPARTMENTS = [
  'ACCOUNTS', 'ADMIN', 'ASSEMBLY', 'BUSINESS DEVELOPMENT', 'DESIGN & DEVELOPMENT',
  'HRA', 'LOGISTICS', 'MAINTENANCE', 'MANAGEMENT', 'MANAGEMENT REPRESENTATIVE',
  'OPERATIONS', 'PLANNING', 'PRODUCT DEVELOPMENT', 'PRODUCTION', 'PURCHASE',
  'QMS', 'QUALITY', 'SALES & MARKETING', 'STORES', 'STRATEGIC PROCUREMENT', 'TOP MANAGEMENT'
];

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

// Fixed-width label + full-width input row
const LabelInput = ({ label, required, children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
    <Box sx={{ width: 180, flexShrink: 0 }}>
      <Typography variant="body1" sx={{ fontWeight: 600 }}>
        {label}
        {required && <Typography component="span" sx={{ ml: 0.3, color: 'error.main', fontWeight: 700 }}>*</Typography>}
      </Typography>
    </Box>
    <Box sx={{ flexGrow: 1 }}>{children}</Box>
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
  const [stockLink, setStockLink] = useState('');
  const [photoRequired, setPhotoRequired] = useState('');
  const [verificationRequired, setVerificationRequired] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [qty, setQty] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [scannedFiles, setScannedFiles] = useState([]);

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
        setVerificationRequired(initialData.verificationRequired || '');
        setAssignTo(initialData.assignTo || '');
        setItemCode(initialData.itemCode || '');
        setQty(initialData.qty || '');
        setUploadedFiles(initialData.uploadedFiles || []);
        setScannedFiles(initialData.scannedFiles || []);
      } else {
        setSeqNo('');
        setCategory('');
        setExpiryDate('');
        setReminderDays('');
        setReminderDate('');
        setRenewalPoint('');
        setFrequency('');
        setDescription('');
        setDepartment([]);
        setStockLink('');
        setPhotoRequired('');
        setVerificationRequired('');
        setAssignTo('');
        setItemCode('');
        setQty('');
        setUploadedFiles([]);
        setScannedFiles([]);

        axios.get('/api/qms/checklist/next-sequence')
          .then(res => setSeqNo(String(res.data.nextSeqNo).padStart(3, '0')))
          .catch(err => console.error('Failed to get next sequence', err));
      }
    }
  }, [open, initialData]);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f) => f.name);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleScanUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f) => f.name);
      setScannedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleClear = () => {
    setSeqNo(''); setCategory(''); setExpiryDate(''); setReminderDays('');
    setReminderDate(''); setRenewalPoint(''); setFrequency(''); setDescription('');
    setDepartment([]); setStockLink(''); setPhotoRequired('');
    setVerificationRequired(''); setUploadedFiles([]); setScannedFiles([]);
  };

  const handleSave = () => {
    // Validation
    if (!category || !frequency || !renewalPoint || !description || department.length === 0) {
      alert('Please fill in all required fields (Category, Frequency, Renewal Point, Description, Department)');
      return;
    }

    const dataToSave = {
      id: initialData?.id,
      seqNo,
      category,
      expiryDate,
      reminderDays,
      reminderDate,
      checkingPoint: renewalPoint,
      frequency,
      description,
      department: department,
      stockLink,
      photoRequired,
      verificationRequired,
      assignTo,
      itemCode,
      qty,
      uploadedFiles,
      scannedFiles
    };
    if (onSave) onSave(dataToSave);
    handleClose();
  };

  // Shared sx for all input controls — same height, same width, no radius variation
  const inputSx = { borderRadius: 1 };

  return (
    <Dialog open={open} TransitionComponent={Transition} keepMounted onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.light' }}>
        <Typography variant="h4" component="span" color="primary.dark">Master Details of Check List</Typography>
        <IconButton onClick={handleClose} size="small"><IconX size={20} /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* ── Left Column ── */}
          <Grid item xs={12} md={6}>
            <LabelInput label="Sequence No" required>
              <TextField fullWidth size="small" value={seqNo} InputProps={{ readOnly: true }} sx={{ ...inputSx, bgcolor: 'action.hover' }} />
            </LabelInput>

            <LabelInput label="Category" required>
              <FormControl fullWidth size="small" sx={inputSx}>
                <Select value={category} onChange={(e) => setCategory(e.target.value)} displayEmpty>
                  <MenuItem value=""><em>-Select-</em></MenuItem>
                  <MenuItem value="RENEWAL">RENEWAL</MenuItem>
                  <MenuItem value="CHECK LIST">CHECK LIST</MenuItem>
                </Select>
              </FormControl>
            </LabelInput>

            <LabelInput label="Frequency" required>
              <FormControl fullWidth size="small" sx={inputSx}>
                <Select value={frequency} onChange={(e) => setFrequency(e.target.value)} displayEmpty>
                  <MenuItem value=""><em>-Select-</em></MenuItem>
                  <MenuItem value="DAILY">DAILY</MenuItem>
                  <MenuItem value="WEEKLY">WEEKLY</MenuItem>
                  <MenuItem value="FORTNIGHTLY">FORTNIGHTLY</MenuItem>
                  <MenuItem value="MONTHLY">MONTHLY</MenuItem>
                  <MenuItem value="QUARTERLY">QUARTERLY</MenuItem>
                  <MenuItem value="HALF YEARLY">HALF YEARLY</MenuItem>
                  <MenuItem value="YEARLY">YEARLY</MenuItem>
                </Select>
              </FormControl>
            </LabelInput>

            <LabelInput label="Expiry Date">
              <TextField fullWidth size="small" type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={inputSx} />
            </LabelInput>

            <LabelInput label="Reminder Days">
              <TextField fullWidth size="small" type="number" value={reminderDays} onChange={(e) => setReminderDays(e.target.value)} sx={inputSx} />
            </LabelInput>

            <LabelInput label="Reminder Date">
              <TextField fullWidth size="small" type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={inputSx} />
            </LabelInput>

            <LabelInput label="Renewal Point" required>
              <TextField fullWidth size="small" value={renewalPoint} onChange={(e) => setRenewalPoint(e.target.value)} sx={inputSx} />
            </LabelInput>

            <LabelInput label="Descriptions/SOP" required>
              <TextField fullWidth size="small" multiline minRows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Standard Operating Procedure (SOP)..." sx={inputSx} />
            </LabelInput>

            <LabelInput label="Department" required>
              <FormControl fullWidth size="small" sx={inputSx}>
                <Select
                  multiple displayEmpty value={department}
                  onChange={(e) => setDepartment(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                  renderValue={(sel) => sel.length === 0 ? <em>-Select-</em> : sel.join(', ')}
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      <Checkbox checked={department.indexOf(dept) > -1} size="small" />
                      <ListItemText primary={dept} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </LabelInput>

            <LabelInput label="Stock Link ?" required>
              <FormControl fullWidth size="small" sx={inputSx}>
                <Select value={stockLink} onChange={(e) => setStockLink(e.target.value)} displayEmpty>
                  <MenuItem value=""><em>-Select-</em></MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                  <MenuItem value="YES">YES</MenuItem>
                </Select>
              </FormControl>
            </LabelInput>

            <LabelInput label="Photo Required ?" required>
              <FormControl fullWidth size="small" sx={inputSx}>
                <Select value={photoRequired} onChange={(e) => setPhotoRequired(e.target.value)} displayEmpty>
                  <MenuItem value=""><em>-Select-</em></MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                  <MenuItem value="YES">YES</MenuItem>
                </Select>
              </FormControl>
            </LabelInput>

            <LabelInput label="Verification Required ?" required>
              <FormControl fullWidth size="small" sx={inputSx}>
                <Select value={verificationRequired} onChange={(e) => setVerificationRequired(e.target.value)} displayEmpty>
                  <MenuItem value=""><em>-Select-</em></MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                  <MenuItem value="YES">YES</MenuItem>
                </Select>
              </FormControl>
            </LabelInput>

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>Assignment & Item Details (Optional)</Typography>

            <LabelInput label="Default Assign To">
              <TextField fullWidth size="small" value={assignTo} onChange={(e) => setAssignTo(e.target.value)} placeholder="Username or Role" sx={inputSx} />
            </LabelInput>

            <LabelInput label="Item Code">
              <TextField fullWidth size="small" value={itemCode} onChange={(e) => setItemCode(e.target.value)} sx={inputSx} />
            </LabelInput>

            <LabelInput label="Quantity">
              <TextField fullWidth size="small" type="number" value={qty} onChange={(e) => setQty(e.target.value)} sx={inputSx} />
            </LabelInput>
          </Grid>

          {/* ── Right Column ── */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Button component="label" variant="contained" color="secondary" startIcon={<IconCloudUpload size={20} />} fullWidth sx={{ py: 1.5 }}>
                    Upload File
                    <input type="file" multiple hidden onChange={handleFileUpload} />
                  </Button>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Uploaded Files</Typography>
                <Box
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    minHeight: 380,
                    p: 2,
                    bgcolor: 'background.paper',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: uploadedFiles.length === 0 ? 'center' : 'flex-start',
                    justifyContent: uploadedFiles.length === 0 ? 'center' : 'flex-start'
                  }}
                >
                  {uploadedFiles.length === 0 ? (
                    <Box sx={{ textAlign: 'center', color: 'text.disabled' }}>
                      <IconFileDescription size={56} stroke={1} />
                      <Typography variant="body2" sx={{ mt: 1 }}>No files uploaded yet.</Typography>
                    </Box>
                  ) : (
                    uploadedFiles.map((file, idx) => (
                      <Typography key={idx} variant="body2" sx={{ py: 0.4 }}>✓ {file}</Typography>
                    ))
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Button component="label" variant="contained" color="primary" startIcon={<IconCamera size={20} />} fullWidth sx={{ py: 1.5 }}>
                    Scan & Upload
                    <input type="file" accept="image/*" capture="environment" hidden onChange={handleScanUpload} />
                  </Button>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Scanned Files</Typography>
                <Box
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1,
                    minHeight: 380,
                    p: 2,
                    bgcolor: 'background.paper',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: scannedFiles.length === 0 ? 'center' : 'flex-start',
                    justifyContent: scannedFiles.length === 0 ? 'center' : 'flex-start'
                  }}
                >
                  {scannedFiles.length === 0 ? (
                    <Box sx={{ textAlign: 'center', color: 'text.disabled' }}>
                      <IconFileDescription size={56} stroke={1} />
                      <Typography variant="body2" sx={{ mt: 1 }}>No files scanned yet.</Typography>
                    </Box>
                  ) : (
                    scannedFiles.map((file, idx) => (
                      <Typography key={idx} variant="body2" sx={{ py: 0.4 }}>✓ {file}</Typography>
                    ))
                  )}
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 2 }}>
        <Button variant="contained" color="error" startIcon={<IconX size={18} />}>IN ACTIVE</Button>
        <Button onClick={handleClear} variant="contained" color="secondary" startIcon={<IconEraser size={18} />}>Clear</Button>
        <Button onClick={handleSave} variant="contained" color="primary" startIcon={<IconCheck size={18} />}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

AddCheckListDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  onSave: PropTypes.func,
  initialData: PropTypes.object
};
