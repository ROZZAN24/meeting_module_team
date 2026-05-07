import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  MenuItem,
  Stack,
  Autocomplete,
  Chip,
  Box,
  Typography,
  IconButton,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  IconSettings,
  IconCalendarEvent,
  IconListDetails,
  IconFileText,
  IconCloudUpload,
  IconCamera,
  IconFileDescription,
  IconMicrophone,
  IconMicrophoneOff
} from '@tabler/icons-react';
import axios from 'utils/axios';
import {
  BOSFormDialog,
  BOSFormSection,
  BOSTextField,
  btnClear,
  btnSave
} from 'ui-component/bos';

const DEPARTMENTS = [
  'ACCOUNTS', 'ADMIN', 'ASSEMBLY', 'BUSINESS DEVELOPMENT', 'DESIGN & DEVELOPMENT', 
  'HRA', 'LOGISTICS', 'MAINTENANCE', 'MANAGEMENT', 'MANAGEMENT REPRESENTATIVE', 
  'OPERATIONS', 'PLANNING', 'PRODUCT DEVELOPMENT', 'PRODUCTION', 'PURCHASE', 
  'QMS', 'QUALITY', 'SALES & MARKETING', 'STORES', 'STRATEGIC PROCUREMENT', 'TOP MANAGEMENT'
];

const CATEGORIES = ['RENEWAL', 'CHECK LIST'];
const FREQUENCIES = ['DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'QUARTERLY', 'HALF YEARLY', 'YEARLY'];

export default function AddCheckListDialog({ open, handleClose, onSave, initialData, readOnly }) {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(!readOnly);

  const [formData, setFormData] = useState({
    seqNo: '',
    category: '',
    effectiveFrom: '',
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
    qty: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [scannedFiles, setScannedFiles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const speechRef = useRef(null);

  useEffect(() => {
    setIsEditing(!readOnly);
  }, [readOnly, open]);

  useEffect(() => {
    if (open) {
      if (initialData) {
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
          department: (initialData.departments || []).map((d) => d.departmentName || d),
          stockLink: initialData.stockLink || 'NO',
          photoRequired: initialData.photoRequired || 'NO',
          itemCode: initialData.itemCode || '',
          qty: initialData.qty || ''
        });
      } else {
        resetForm();
        fetchNextSeq();
      }
    }
  }, [open, initialData]);

  const fetchNextSeq = async () => {
    try {
      const res = await axios.get('/api/qms/checklist/next-sequence');
      setFormData(prev => ({ ...prev, seqNo: String(res.data.nextSeqNo).padStart(3, '0') }));
    } catch (error) {
      setFormData(prev => ({ ...prev, seqNo: String(Date.now()).slice(-4) }));
    }
  };

  const resetForm = () => {
    setFormData({
      seqNo: '',
      category: '',
      effectiveFrom: '',
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
      qty: ''
    });
    setUploadedFiles([]);
    setScannedFiles([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.category || !formData.frequency || !formData.checkingPoint || !formData.description) {
      alert('Please fill required fields');
      return;
    }
    onSave({
      ...formData,
      id: initialData?.id,
      uploadedFiles: uploadedFiles.map(f => f.name),
      scannedFiles: scannedFiles.map(f => f.name)
    });
    handleClose();
  };

  // Speech Recognition Logic
  const toggleListening = () => {
    if (isListening) {
      speechRef.current?.stop();
      setIsListening(false);
    } else {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) return;
      const rec = new SR();
      rec.lang = 'en-US';
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (e) => {
        let interim = '';
        let final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        if (final) setFormData(p => ({ ...p, description: (p.description ? p.description + ' ' : '') + final.trim() }));
        setInterimText(interim);
      };
      rec.start();
      speechRef.current = rec;
      setIsListening(true);
    }
  };

  return (
    <BOSFormDialog
      open={open}
      onClose={handleClose}
      onSave={handleSave}
      onClear={resetForm}
      title="Check List Master Details"
      maxWidth="lg"
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Left Column */}
        <Stack spacing={3}>
          <BOSFormSection title="Core Settings" icon={<IconSettings size={20} color={theme.palette.primary.main} />}>
            <Stack spacing={2.5}>
              <BOSTextField label="Sequence No" value={formData.seqNo} InputProps={{ readOnly: true }} />
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <BOSTextField select label="Category" name="category" value={formData.category} onChange={handleChange} disabled={!isEditing} required>
                  {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </BOSTextField>
                <BOSTextField select label="Frequency" name="frequency" value={formData.frequency} onChange={handleChange} disabled={!isEditing} required>
                  {FREQUENCIES.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </BOSTextField>
              </Box>

              {/* Solves "long select" issue using Autocomplete with Chips */}
              <Autocomplete
                multiple
                options={DEPARTMENTS}
                value={formData.department}
                disabled={!isEditing}
                onChange={(e, val) => setFormData(p => ({ ...p, department: val }))}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <BOSTextField {...params} label="Departments" placeholder="Select Departments" />
                )}
              />
            </Stack>
          </BOSFormSection>

          <BOSFormSection title="Timeline & Reminders" icon={<IconCalendarEvent size={20} color={theme.palette.secondary.main} />}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
              <BOSTextField type="date" label="Effective From" name="effectiveFrom" value={formData.effectiveFrom} onChange={handleChange} InputLabelProps={{ shrink: true }} disabled={!isEditing} />
              <BOSTextField type="date" label="Expiry Date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} InputLabelProps={{ shrink: true }} disabled={!isEditing} />
              <BOSTextField type="number" label="Reminder Days" name="reminderDays" value={formData.reminderDays} onChange={handleChange} disabled={!isEditing} />
              <BOSTextField type="date" label="Reminder Date" name="reminderDate" value={formData.reminderDate} onChange={handleChange} InputLabelProps={{ shrink: true }} disabled={!isEditing} />
            </Box>
          </BOSFormSection>

          <BOSFormSection title="Execution Details" icon={<IconListDetails size={20} color={theme.palette.warning.main} />}>
            <Stack spacing={2.5}>
              <BOSTextField label="Checking Point" name="checkingPoint" value={formData.checkingPoint} onChange={handleChange} required disabled={!isEditing} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                <BOSTextField select label="Photo Required" name="photoRequired" value={formData.photoRequired} onChange={handleChange} disabled={!isEditing}>
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </BOSTextField>
                <BOSTextField select label="Stock Link" name="stockLink" value={formData.stockLink} onChange={handleChange} disabled={!isEditing}>
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </BOSTextField>
                <BOSTextField label="Item Code" name="itemCode" value={formData.itemCode} onChange={handleChange} disabled={!isEditing} />
              </Box>
              <BOSTextField type="number" label="Qty" name="qty" value={formData.qty} onChange={handleChange} disabled={!isEditing} />
            </Stack>
          </BOSFormSection>

          <BOSFormSection title="Description / SOP" icon={<IconFileText size={20} color={theme.palette.success.main} />}>
            <Box sx={{ position: 'relative' }}>
              <BOSTextField
                fullWidth
                multiline
                rows={4}
                label="Standard Operating Procedure"
                required
                name="description"
                value={isListening ? formData.description + ' ' + interimText : formData.description}
                onChange={handleChange}
                disabled={!isEditing}
                InputProps={{
                  endAdornment: isEditing && (
                    <IconButton onClick={toggleListening} size="small" color={isListening ? 'error' : 'default'}>
                      {isListening ? <IconMicrophone size={20} /> : <IconMicrophoneOff size={20} />}
                    </IconButton>
                  )
                }}
              />
            </Box>
          </BOSFormSection>
        </Stack>

        {/* Right Column: Attachments */}
        <Stack spacing={3}>
          <BOSFormSection title="Attachments" icon={<IconCloudUpload size={20} color={theme.palette.primary.main} />}>
            <Box sx={{ p: 2, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: '8px' }}>
              <Button component="label" variant="outlined" startIcon={<IconCloudUpload size={20} />} disabled={!isEditing}>
                Upload Files
                <input type="file" multiple hidden onChange={(e) => setUploadedFiles(prev => [...prev, ...Array.from(e.target.files)])} />
              </Button>
              <Box sx={{ mt: 2 }}>
                {uploadedFiles.length === 0 ? (
                  <Typography variant="caption" color="text.disabled">No files uploaded</Typography>
                ) : (
                  uploadedFiles.map((f, i) => (
                    <Typography key={i} variant="caption" display="block">{f.name}</Typography>
                  ))
                )}
              </Box>
            </Box>
          </BOSFormSection>

          <BOSFormSection title="Scan Documents" icon={<IconCamera size={20} color={theme.palette.secondary.main} />}>
            <Box sx={{ p: 2, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: '8px' }}>
              <Button component="label" variant="outlined" startIcon={<IconCamera size={20} />} disabled={!isEditing}>
                Scan & Upload
                <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => setScannedFiles(prev => [...prev, ...Array.from(e.target.files)])} />
              </Button>
              <Box sx={{ mt: 2 }}>
                {scannedFiles.length === 0 ? (
                  <Typography variant="caption" color="text.disabled">No scans yet</Typography>
                ) : (
                  scannedFiles.map((f, i) => (
                    <Typography key={i} variant="caption" display="block">{f.name}</Typography>
                  ))
                )}
              </Box>
            </Box>
          </BOSFormSection>
        </Stack>
      </Box>
    </BOSFormDialog>
  );
}

AddCheckListDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  onSave: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};
