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

AddCheckListDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  onSave: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool,
  onVerify: PropTypes.func,
  onReject: PropTypes.func
};
