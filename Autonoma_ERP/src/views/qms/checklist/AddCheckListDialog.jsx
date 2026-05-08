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
  IconMicrophoneOff,
  IconEye,
  IconTrash
} from '@tabler/icons-react';
import axios from 'utils/axios';
import {
  BOSFormDialog,
  BOSFormSection,
  BOSTextField,
  btnClear,
  btnSave,
  BOSFileGallery
} from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import useLookups from 'hooks/useLookups';

// Departments are now fetched dynamically from API

const CATEGORIES = ['RENEWAL', 'CHECK LIST'];
const FREQUENCIES = ['DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'QUARTERLY', 'HALF YEARLY', 'YEARLY'];

export default function AddCheckListDialog({ open, handleClose, onSave, initialData, readOnly }) {
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
    carryForward: 'NO'
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [scannedFiles, setScannedFiles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const lookups = useLookups(['DEPARTMENTS']);
  const departmentList = (lookups.departments || []).map(d => (d.departmentName || '').toUpperCase());
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
          department: (initialData.departments || []).map((d) => (d.departmentName || d).toUpperCase()),
          stockLink: initialData.stockLink || 'NO',
          photoRequired: initialData.photoRequired || 'NO',
          itemCode: initialData.itemCode || '',
          qty: initialData.qty || '',
          dualCheck: initialData.dualCheck || 'NO',
          carryForward: initialData.carryForward || 'NO'
        });
        
        // Fix: Explicitly reset files before loading to avoid stale data from previous record
        setUploadedFiles([]);
        setScannedFiles([]);

        if (initialData.uploadedFiles) {
          setUploadedFiles(initialData.uploadedFiles.map(name => ({ name, isServer: true, type: name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg' })));
        }
        if (initialData.scannedFiles) {
          setScannedFiles(initialData.scannedFiles.map(name => ({ name, isServer: true, type: 'image/jpeg' })));
        }
      } else {
        resetForm();
        fetchNextSeq();
      }
    }
  }, [open, initialData]);

  const fetchNextSeq = async () => {
    try {
      const res = await axios.get(`${API_PATHS.QMS.CHECKLIST}/next-sequence`);
      setFormData(prev => ({ ...prev, seqNo: String(res.data.nextSeqNo).padStart(3, '0') }));
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
      carryForward: 'NO'
    });
    setUploadedFiles([]);
    setScannedFiles([]);
    if (!initialData) {
      fetchNextSeq();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Case 1: Change Expiry or Days -> Update Date
      if (name === 'expiryDate' || name === 'reminderDays') {
        const expiry = name === 'expiryDate' ? value : prev.expiryDate;
        const days = name === 'reminderDays' ? value : prev.reminderDays;
        
        if (expiry && days) {
          const date = new Date(expiry);
          const dayCount = parseInt(days);
          if (!isNaN(dayCount)) {
            date.setDate(date.getDate() - dayCount);
            newData.reminderDate = date.toISOString().split('T')[0];
          }
        }
      }
      
      // Case 2: Change Reminder Date -> Update Days
      if (name === 'reminderDate' && value && prev.expiryDate) {
        const expiry = new Date(prev.expiryDate);
        const reminder = new Date(value);
        const diffTime = expiry - reminder;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (!isNaN(diffDays)) {
          newData.reminderDays = diffDays >= 0 ? diffDays : 0;
        }
      }
      
      return newData;
    });
  };

  const handleSave = async () => {
    if (!formData.category || !formData.frequency || !formData.checkingPoint || !formData.description) {
      alert('Please fill required fields');
      return;
    }

    try {
      const uploadFile = async (fileObj) => {
        if (fileObj.isServer) return fileObj.name; // Already on server
        
        const formDataUpload = new FormData();
        formDataUpload.append('file', fileObj);
        const res = await axios.post(`${API_PATHS.FILES}/upload`, formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return res.data; // Server filename
      };

      const finalUploaded = await Promise.all(uploadedFiles.map(uploadFile));
      const finalScanned = await Promise.all(scannedFiles.map(uploadFile));

      await onSave({
        ...formData,
        id: initialData?.id,
        uploadedFiles: finalUploaded,
        scannedFiles: finalScanned
      });
      
      handleClose();
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save record or upload files.');
    }
  };

  // Speech Recognition Logic
  const removeFile = (list, setList, index) => {
    setList(prev => prev.filter((_, i) => i !== index));
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
                  options={departmentList}
                  value={formData.department}
                  disabled={!isEditing}
                  onChange={(e, val) => setFormData(p => ({ ...p, department: val }))}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return <Chip key={key} variant="outlined" label={option} size="small" {...tagProps} />;
                    })
                  }
                  renderInput={(params) => (
                    <BOSTextField {...params} label="Departments" placeholder={departmentList.length > 0 ? "Select Departments" : "Loading departments..."} />
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
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                <BOSTextField select label="Dual Check" name="dualCheck" value={formData.dualCheck} onChange={handleChange} disabled={!isEditing}>
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </BOSTextField>
                <BOSTextField select label="Carry Forward" name="carryForward" value={formData.carryForward} onChange={handleChange} disabled={!isEditing}>
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </BOSTextField>
                <BOSTextField type="number" label="Qty" name="qty" value={formData.qty} onChange={handleChange} disabled={!isEditing} />
              </Box>
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
                    <IconButton 
                      onClick={() => {
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
                      }} 
                      size="small" 
                      color={isListening ? 'error' : 'default'}
                    >
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
            <Box sx={{ p: 2, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: '8px', bgcolor: 'grey.50' }}>
              <Button component="label" variant="contained" startIcon={<IconCloudUpload size={20} />} disabled={!isEditing} sx={{ mb: 2 }}>
                Select Files
                <input type="file" multiple hidden onChange={(e) => setUploadedFiles(prev => [...prev, ...Array.from(e.target.files)])} />
              </Button>
              <BOSFileGallery files={uploadedFiles} onRemove={(idx) => removeFile(uploadedFiles, setUploadedFiles, idx)} isEditing={isEditing} />
            </Box>
          </BOSFormSection>

          <BOSFormSection title="Scan Documents" icon={<IconCamera size={20} color={theme.palette.secondary.main} />}>
            <Box sx={{ p: 2, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: '8px', bgcolor: 'grey.50' }}>
              <Button component="label" variant="contained" color="secondary" startIcon={<IconCamera size={20} />} disabled={!isEditing} sx={{ mb: 2 }}>
                Snap Camera
                <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => setScannedFiles(prev => [...prev, ...Array.from(e.target.files)])} />
              </Button>
              <BOSFileGallery files={scannedFiles} onRemove={(idx) => removeFile(scannedFiles, setScannedFiles, idx)} isEditing={isEditing} />
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
