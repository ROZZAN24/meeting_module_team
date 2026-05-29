import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MenuItem, Autocomplete, Chip, Button, Typography, Stack, IconButton, Box, Checkbox } from '@mui/material';
import { IconUpload, IconX, IconPaperclip } from '@tabler/icons-react';
import { BOSFormDialog, BOSTextField } from 'ui-component/bos';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import useBOSValidation from 'hooks/useBOSValidation';
import { useLookups } from 'hooks/useLookups';

const INITIAL_FORM = {
  meetingName: '',
  meetingDescription: '',
  meetingPrefix: '',
  meetingAgenda: '',
  employeeName: [],
  status: 'ACTIVE',
  attachmentName: '',
  attachmentUrl: ''
};

const compactInputSx = {
  '& .MuiInputBase-root': {
    height: 36,
    fontSize: '0.8125rem',
    borderRadius: '8px'
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.8125rem',
    top: -2
  }
};

const compactMultilineSx = {
  '& .MuiInputBase-root': {
    fontSize: '0.8125rem',
    borderRadius: '8px',
    py: '6px'
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.8125rem'
  }
};

const compactAutocompleteSx = {
  '& .MuiInputBase-root': {
    minHeight: 36,
    py: '1px !important',
    fontSize: '0.8125rem',
    borderRadius: '8px'
  },
  '& .MuiInputLabel-root': {
    fontSize: '0.8125rem',
    top: -2
  },
  '& .MuiAutocomplete-tag': {
    margin: '1px',
    height: 20
  }
};

const AddMeetingMasterDialog = ({ open, onClose, onSave, item, existingData = [] }) => {
  const { employees = [], users = [] } = useLookups(['EMPLOYEES', 'USERS']);
  const { errors, validate, clearErrors, handleInputChange, setErrors } = useBOSValidation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [selectedFile, setSelectedFile] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (open) {
      if (item) {
        setForm({
          ...item,
          employeeName: item.employeeName ? item.employeeName.split(',').map(s => s.trim()).filter(Boolean) : []
        });
      } else {
        setForm(INITIAL_FORM);
      }
      setSelectedFile(null);
      clearErrors();
    }
  }, [open, item, clearErrors]);

  const h = (e) => handleInputChange(e, setForm);

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name !== 'employeeName' && typeof value === 'string') {
      setForm(prev => ({ ...prev, [name]: value.toUpperCase() }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];
    const isValidType = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValidType) {
      dispatch(openSnackbar({ open: true, message: 'Invalid file type. Accepted: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG', variant: 'alert', alert: { variant: 'filled' }, severity: 'error' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      dispatch(openSnackbar({ open: true, message: 'File size exceeds 5MB limit', variant: 'alert', alert: { variant: 'filled' }, severity: 'error' }));
      return;
    }

    setSelectedFile(file);
    setForm(prev => ({ ...prev, attachmentName: file.name }));
  };

  const removeFile = () => {
    setSelectedFile(null);
    setForm(prev => ({ ...prev, attachmentName: '', attachmentUrl: '' }));
  };

  const handleSave = async () => {
    const rules = [
      { field: 'meetingName', label: 'Meeting Name', required: true },
      { field: 'meetingDescription', label: 'Meeting Description', required: true },
      { field: 'meetingPrefix', label: 'Meeting Prefix', required: true },
      { field: 'meetingAgenda', label: 'Meeting Agenda', required: true },
      { field: 'employeeName', label: 'Employee Name', required: true, type: 'array' }
    ];

    if (validate(form, rules)) {
      const isDuplicate = existingData.some(m => 
        m.meetingName?.trim()?.toLowerCase() === form.meetingName?.trim()?.toLowerCase() && 
        m.id !== item?.id
      );

      if (isDuplicate) {
        setErrors(prev => ({ ...prev, meetingName: 'A meeting with this name already exists' }));
        dispatch(openSnackbar({
          open: true,
          message: `Meeting "${form.meetingName.trim()}" already exists. Please use a different name.`,
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: 'warning'
        }));
        return;
      }

      let finalForm = { ...form };

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
          const uploadRes = await axios.post('/api/files/upload?module=meeting_master', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          finalForm.attachmentUrl = uploadRes.data;
          finalForm.attachmentName = selectedFile.name;
        } catch (err) {
          dispatch(openSnackbar({ open: true, message: 'Failed to upload attachment', variant: 'alert', alert: { variant: 'filled' }, severity: 'error' }));
          return; 
        }
      }

      onSave({
        ...finalForm,
        employeeName: finalForm.employeeName.join(', ')
      });
    }
  };

  const filteredEmployees = employees.filter(emp => users.some(u => u.empId === emp.id));
  const isAllSelected = filteredEmployees.length > 0 && form.employeeName?.length === filteredEmployees.length;
  const employeeOptions = [{ id: 'select-all', employeeName: 'Select All', empCode: 'ALL' }, ...filteredEmployees];

  return (
    <BOSFormDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title="Meeting Master"
      maxWidth="md"
      contentSx={{ 
        px: 2.5, 
        py: '8px !important', 
        pt: '8px !important',
        pb: '8px !important',
        overflowY: 'hidden',
        '& > div': { gap: '12px !important' }
      }}
      sx={{
        '& .MuiPaper-root': {
          '& > div[class*="MuiBox-root"]': {
            '&:last-of-type': {
              py: '8px !important',
              px: '20px !important'
            }
          }
        }
      }}
    >
      <BOSTextField
        name="meetingName"
        label="Meeting Name"
        value={form.meetingName || ''}
        onChange={h}
        onBlur={handleBlur}
        error={!!errors.meetingName}
        helperText={errors.meetingName}
        sx={{ ...compactInputSx, '& input': { textTransform: 'uppercase' } }}
        required
        className="h-9"
      />
      <BOSTextField
        name="meetingDescription"
        label="Meeting Description"
        value={form.meetingDescription || ''}
        onChange={h}
        onBlur={handleBlur}
        error={!!errors.meetingDescription}
        helperText={errors.meetingDescription}
        sx={{ ...compactMultilineSx, '& textarea': { textTransform: 'uppercase' } }}
        multiline
        rows={2}
        required
      />
      <BOSTextField
        name="meetingPrefix"
        label="Meeting Prefix"
        value={form.meetingPrefix || ''}
        onChange={h}
        onBlur={handleBlur}
        error={!!errors.meetingPrefix}
        helperText={errors.meetingPrefix}
        sx={{ ...compactInputSx, '& input': { textTransform: 'uppercase' } }}
        required
        className="h-9"
      />
      <BOSTextField
        name="meetingAgenda"
        label="Meeting Agenda"
        value={form.meetingAgenda || ''}
        onChange={h}
        onBlur={handleBlur}
        error={!!errors.meetingAgenda}
        helperText={errors.meetingAgenda}
        sx={{ ...compactMultilineSx, '& textarea': { textTransform: 'uppercase' } }}
        multiline
        rows={2}
        required
      />
      
      <Autocomplete
        multiple
        disableCloseOnSelect
        limitTags={3}
        options={employeeOptions}
        getOptionLabel={(option) => option.empCode === 'ALL' ? option.employeeName : `${option.employeeName} (${option.empCode})`}
        value={filteredEmployees.filter(emp => form.employeeName?.some(val => val.split(' - ')[0] === emp.empCode))}
        sx={compactAutocompleteSx}
        onChange={(e, newValue, reason, details) => {
          if (details?.option?.empCode === 'ALL') {
            if (isAllSelected) {
              setForm(p => ({ ...p, employeeName: [] }));
            } else {
              setForm(p => ({ ...p, employeeName: filteredEmployees.map(v => `${v.empCode} - ${v.employeeName}`) }));
            }
          } else {
            const finalValues = newValue.filter(v => v.empCode !== 'ALL');
            setForm(p => ({ ...p, employeeName: finalValues.map(v => `${v.empCode} - ${v.employeeName}`) }));
          }
          if (errors.employeeName) clearErrors('employeeName');
        }}
        renderOption={(props, option, { selected }) => {
          if (option.empCode === 'ALL') {
            return (
              <MenuItem {...props}>
                <Checkbox checked={isAllSelected} size="small" />
                <Typography fontWeight="bold" variant="body2">Select All</Typography>
              </MenuItem>
            );
          }
          return (
            <MenuItem {...props}>
              <Checkbox checked={selected} size="small" />
              <Typography variant="body2">{`${option.employeeName} (${option.empCode})`}</Typography>
            </MenuItem>
          );
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => {
            const { key, ...tagProps } = getTagProps({ index });
            return (
              <Chip
                key={key}
                label={option.employeeName}
                color="primary"
                variant="filled"
                size="small"
                sx={{ height: 20, fontSize: '0.75rem' }}
                {...tagProps}
              />
            );
          })
        }
        renderInput={(params) => (
          <BOSTextField
            {...params}
            label="Employee Name"
            required
            error={!!errors.employeeName}
            helperText={errors.employeeName}
          />
        )}
      />

      <BOSTextField
        select
        name="status"
        label="Status"
        value={form.status || 'ACTIVE'}
        onChange={h}
        disabled={!item}
        sx={compactInputSx}
        className="h-9"
      >
        <MenuItem value="ACTIVE">ACTIVE</MenuItem>
        <MenuItem value="INACTIVE">INACTIVE</MenuItem>
      </BOSTextField>

      <Box 
        className="flex items-center justify-between p-2 border border-dashed border-divider rounded bg-action-hover h-11"
        sx={{ 
          p: 1.25, 
          border: '1px dashed', 
          borderColor: 'divider', 
          borderRadius: 1,
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 44,
          boxSizing: 'border-box'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconPaperclip size={18} color="#666" />
          <Typography variant="caption" fontWeight="medium" color="text.secondary" className="text-xs">
            Attachment <span style={{ opacity: 0.7 }}>(Max 5MB PDF, DOC, XLS, IMG)</span>
          </Typography>
        </Stack>
        
        {!form.attachmentName ? (
          <Button 
            variant="outlined" 
            component="label" 
            size="small" 
            startIcon={<IconUpload size={14} />}
            sx={{ 
              py: 0.25, 
              px: 1.5, 
              fontSize: '0.75rem',
              height: 28,
              textTransform: 'none'
            }}
            className="h-7 text-xs py-1 px-3"
          >
            Upload File
            <input type="file" hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={handleFileChange} />
          </Button>
        ) : (
          <Chip 
            label={form.attachmentName} 
            onDelete={removeFile} 
            color="primary" 
            variant="outlined" 
            size="small"
            sx={{ 
              height: 24, 
              fontSize: '0.75rem',
              maxWidth: 220 
            }}
            className="h-6 text-xs"
          />
        )}
      </Box>
    </BOSFormDialog>
  );
};

AddMeetingMasterDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  item: PropTypes.object,
  existingData: PropTypes.array
};

export default AddMeetingMasterDialog;
