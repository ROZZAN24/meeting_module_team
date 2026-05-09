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
  IconTrash,
  IconRefresh,
  IconChecks,
  IconBan
} from '@tabler/icons-react';
import axios from 'utils/axios';
import {
  BOSFormDialog,
  BOSFormSection,
  BOSTextField,
  BOSDataTable,
  btnClear,
  btnSave,
  btnCancel,
  getStatusChipSx,
  formatBOSFiles,
  BOSFileGallery
} from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import useLookups from 'hooks/useLookups';

// Departments are now fetched dynamically from API

const CATEGORIES = ['RENEWAL', 'CHECK LIST'];
const FREQUENCIES = ['DAILY', 'WEEKLY', 'FORTNIGHTLY', 'MONTHLY', 'QUARTERLY', 'HALF YEARLY', 'YEARLY'];

export const AddCheckListDialog = ({ open, handleClose, onSave, initialData, readOnly, onVerify, onReject }) => {
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

  const [docDetails, setDocDetails] = useState('');
  const [currentFile, setCurrentFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [scannedFiles, setScannedFiles] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const lookups = useLookups(['DEPARTMENTS', 'EMPLOYEES']);
  const departmentList = (lookups.departments || []).map(d => (d.departmentName || '').toUpperCase());
  
  const filteredEmployees = useMemo(() => {
    if (!lookups.employees) return [];
    if (!formData.department || formData.department.length === 0) return lookups.employees;

    // 1. Get IDs of selected departments
    const selectedDeptIds = (lookups.departments || [])
      .filter(d => formData.department.includes((d.departmentName || '').toUpperCase()))
      .map(d => d.id);

    // 2. Filter employees by those IDs
    return lookups.employees.filter(e => selectedDeptIds.includes(e.departmentId));
  }, [lookups.employees, lookups.departments, formData.department]);

  const employeeList = filteredEmployees.map(e => e.employeeName || `${e.firstName} ${e.lastName}`);
  const speechRef = useRef(null);

  useEffect(() => {
    if (formData.assignTo && !employeeList.includes(formData.assignTo)) {
      setFormData(prev => ({ ...prev, assignTo: '' }));
    }
  }, [employeeList, formData.assignTo]);

  useEffect(() => {
    setIsEditing(!readOnly);
  }, [readOnly, open]);



  useEffect(() => {
    if (open) {
      console.log('BOS Checklist initialData:', initialData);
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
          carryForward: initialData.carryForward || 'NO',
          assignTo: initialData.assignTo || '',
          verificationRequired: initialData.verificationRequired || 'YES',
          status: initialData.status === 'In Active' ? 'INACTIVE' : (initialData.status || 'ACTIVE'),
          amendmentReason: '',
          levelIds: initialData.levelIds || ''
        });

        // Use standardized BOS utility for robust file loading
        setUploadedFiles(formatBOSFiles(initialData.uploadedFiles || initialData.uploaded_files));
        setScannedFiles(formatBOSFiles(initialData.scannedFiles || initialData.scanned_files));
      } else {
        resetForm();
        fetchNextSeq();
      }
    }
  }, [open, initialData]);

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
    setDocDetails('');
    setCurrentFile(null);
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
    if (!formData.category || !formData.frequency || !formData.checkingPoint || !formData.description || !formData.reminderDays ||
      !formData.photoRequired || !formData.stockLink || !formData.dualCheck || !formData.carryForward) {
      alert('Please fill all mandatory fields including Photo Required, Stock Link, Dual Check and Carry Forward');
      return;
    }

    try {
      const uploadFile = async (fileObj) => {
        let serverName = '';
        if (fileObj.isServer) {
          serverName = fileObj.name;
        } else {
          const formDataUpload = new FormData();
          formDataUpload.append('file', fileObj.file);
          const res = await axios.post(`${API_PATHS.FILES}/upload`, formDataUpload, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          serverName = res.data; // Server filename
        }
        
        // Append docDetails metadata using pipe separator
        return fileObj.docDetails ? `${serverName}|${fileObj.docDetails}` : serverName;
      };

      const finalUploaded = await Promise.all(uploadedFiles.map(uploadFile));
      const finalScanned = await Promise.all(scannedFiles.map(uploadFile));

      await onSave({
        ...formData,
        id: initialData?.id,
        status: formData.status === 'INACTIVE' ? 'In Active' : 'Active',
        amendmentReason: formData.amendmentReason,
        levelIds: formData.levelIds, // Need to add levelIds to formData state
        description: formData.amendmentReason ? formData.description + '\n[Amendment]: ' + formData.amendmentReason : formData.description,
        uploadedFiles: finalUploaded,
        scannedFiles: finalScanned
      });

      handleClose();
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save record or upload files.');
    }
  };

  const handleAddFile = () => {
    if (!currentFile) {
      alert('Please choose a file'); // Using native alert as a fallback, but should use snackbar normally.
      return;
    }
    const newFile = {
      id: Date.now(),
      docDetails: docDetails || 'N/A',
      file: currentFile,
      name: currentFile.name
    };
    setUploadedFiles(prev => [...prev, newFile]);
    setDocDetails('');
    setCurrentFile(null);
  };

  const handleFileDelete = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
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
      onClear={isEditing ? resetForm : null}
      isViewOnly={!isEditing}
      onEditClick={readOnly ? null : () => setIsEditing(true)}
      secondaryActions={
        (onVerify || onReject) && !isEditing && (
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {onReject && (
              <Button 
                variant="contained" 
                color="error" 
                onClick={onReject}
                startIcon={<IconBan size={20} />}
                sx={{ borderRadius: '8px', fontWeight: 600 }}
              >
                Reject
              </Button>
            )}
            {onVerify && (
              <Button 
                variant="contained" 
                color="success" 
                onClick={onVerify}
                startIcon={<IconChecks size={20} />}
                sx={{ borderRadius: '8px', fontWeight: 600 }}
              >
                Verify
              </Button>
            )}
          </Box>
        )
      }
      title={
        initialData?.id 
          ? (initialData?.verifyStatus === 'Verified' ? `Amend Checklist - ${initialData.seqNo}` : `Edit Checklist - ${initialData.seqNo}`)
          : 'Add New Check List'
      }
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

              <BOSTextField
                select
                label="Assign To (Executor)"
                name="assignTo"
                value={formData.assignTo}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <MenuItem value="">-Select-</MenuItem>
                {employeeList.map(emp => (
                  <MenuItem key={emp} value={emp}>{emp}</MenuItem>
                ))}
              </BOSTextField>
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
                <BOSTextField select label="Photo Required" name="photoRequired" value={formData.photoRequired} onChange={handleChange} disabled={!isEditing} required>
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </BOSTextField>
                <BOSTextField select label="Stock Link" name="stockLink" value={formData.stockLink} onChange={handleChange} disabled={!isEditing} required>
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </BOSTextField>
                <BOSTextField label="Item Code" name="itemCode" value={formData.itemCode} onChange={handleChange} disabled={!isEditing} />
                <Autocomplete
                  multiple
                  options={['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7']}
                  value={formData.levelIds ? formData.levelIds.split(',') : []}
                  disabled={!isEditing}
                  onChange={(e, val) => setFormData(p => ({ ...p, levelIds: val.join(',') }))}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return <Chip key={key} variant="outlined" label={option} size="small" {...tagProps} />;
                    })
                  }
                  renderInput={(params) => (
                    <BOSTextField {...params} label="Levels" placeholder="Select Levels" />
                  )}
                />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                <BOSTextField select label="Dual Check" name="dualCheck" value={formData.dualCheck} onChange={handleChange} disabled={!isEditing} required>
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </BOSTextField>
                <BOSTextField select label="Carry Forward" name="carryForward" value={formData.carryForward} onChange={handleChange} disabled={!isEditing} required>
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </BOSTextField>
                <BOSTextField select label="Verification Required" name="verificationRequired" value={formData.verificationRequired} onChange={handleChange} disabled={!isEditing} required>
                  <MenuItem value="YES">YES</MenuItem>
                  <MenuItem value="NO">NO</MenuItem>
                </BOSTextField>
                <BOSTextField type="number" label="Qty" name="qty" value={formData.qty} onChange={handleChange} disabled={!isEditing} />
              </Box>
              
              {isEditing && initialData?.id && initialData?.verifyStatus === 'Verified' && (
                <Box sx={{ mt: 1, p: 2, border: '1px solid', borderColor: 'warning.light', borderRadius: 1, bgcolor: 'warning.lighter' }}>
                  <Typography variant="subtitle2" color="warning.dark" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Amendment Required: This checklist is already verified. Any changes will create a new version.
                  </Typography>
                  <BOSTextField 
                    fullWidth
                    label="Amendment Reason" 
                    name="amendmentReason" 
                    value={formData.amendmentReason} 
                    onChange={handleChange} 
                    required 
                    placeholder="Describe why you are amending this checklist..."
                    color="warning"
                  />
                </Box>
              )}
              {isEditing && initialData?.id && (
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                  <BOSTextField select label="Status" name="status" value={formData.status} onChange={handleChange} required>
                    <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                    <MenuItem value="INACTIVE">IN ACTIVE</MenuItem>
                  </BOSTextField>
                </Box>
              )}
              {initialData?.rejReason && (
                <BOSTextField
                  label="Rejection Reason"
                  value={initialData.rejReason}
                  multiline
                  rows={2}
                  disabled
                  color="error"
                  sx={{ mt: 1, '& .MuiOutlinedInput-root': { bgcolor: 'error.lighter', color: 'error.main' } }}
                />
              )}
            </Stack>
          </BOSFormSection>

        </Stack>

        {/* Right Column: Attachments */}
        <Stack spacing={3}>
          <BOSFormSection title="Attachments" icon={<IconCloudUpload size={20} color={theme.palette.primary.main} />}>
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 2, alignItems: 'center', mb: 3 }}>
                <BOSTextField
                  label="Doc Details"
                  value={docDetails}
                  onChange={(e) => setDocDetails(e.target.value)}
                  disabled={!isEditing}
                />
                <Button component="label" variant="outlined" startIcon={<IconCloudUpload size={18} />} disabled={!isEditing} sx={{ height: 40 }}>
                  {currentFile ? currentFile.name : 'Choose File'}
                  <input type="file" hidden onChange={(e) => setCurrentFile(e.target.files[0])} />
                </Button>
                <Button variant="contained" color="primary" onClick={handleAddFile} disabled={!isEditing} sx={{ height: 40 }}>
                  Add
                </Button>
              </Box>

              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Uploaded Files</Typography>
              <BOSFileGallery 
                files={uploadedFiles}
                onRemove={(idx) => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                isEditing={isEditing}
                maxHeight={200}
              />

              {scannedFiles.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>Scanned Files</Typography>
                  <BOSFileGallery 
                    files={scannedFiles}
                    onRemove={(idx) => setScannedFiles(prev => prev.filter((_, i) => i !== idx))}
                    isEditing={isEditing}
                    maxHeight={200}
                  />
                </>
              )}
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
