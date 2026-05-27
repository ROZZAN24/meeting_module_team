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
    >
      <BOSTextField
        name="meetingName"
        label="Meeting Name"
        value={form.meetingName || ''}
        onChange={h}
        onBlur={handleBlur}
        error={!!errors.meetingName}
        helperText={errors.meetingName}
        sx={{ '& input': { textTransform: 'uppercase' } }}
        required
      />
      <BOSTextField
        name="meetingDescription"
        label="Meeting Description"
        value={form.meetingDescription || ''}
        onChange={h}
        onBlur={handleBlur}
        error={!!errors.meetingDescription}
        helperText={errors.meetingDescription}
        sx={{ '& textarea': { textTransform: 'uppercase' } }}
        multiline
        rows={3}
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
        sx={{ '& input': { textTransform: 'uppercase' } }}
        required
      />
      <BOSTextField
        name="meetingAgenda"
        label="Meeting Agenda"
        value={form.meetingAgenda || ''}
        onChange={h}
        onBlur={handleBlur}
        error={!!errors.meetingAgenda}
        helperText={errors.meetingAgenda}
        sx={{ '& textarea': { textTransform: 'uppercase' } }}
        multiline
        rows={4}
        required
      />
      
      <Autocomplete
        multiple
        disableCloseOnSelect
        options={employeeOptions}
        getOptionLabel={(option) => option.empCode === 'ALL' ? option.employeeName : `${option.employeeName} (${option.empCode})`}
        value={filteredEmployees.filter(emp => form.employeeName?.some(val => val.split(' - ')[0] === emp.empCode))}
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
                <Checkbox checked={isAllSelected} />
                <Typography fontWeight="bold">Select All</Typography>
              </MenuItem>
            );
          }
          return (
            <MenuItem {...props}>
              <Checkbox checked={selected} />
              {`${option.employeeName} (${option.empCode})`}
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
      >
        <MenuItem value="ACTIVE">ACTIVE</MenuItem>
        <MenuItem value="INACTIVE">INACTIVE</MenuItem>
      </BOSTextField>

      <Box sx={{ mt: 2, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconPaperclip size={24} color="#888" />
            <Box>
              <Typography variant="subtitle2">Attachment</Typography>
              <Typography variant="caption" color="textSecondary">Max 5MB (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG)</Typography>
            </Box>
          </Stack>
          {!form.attachmentName ? (
            <Button variant="outlined" component="label" startIcon={<IconUpload size={18} />}>
              Attach File
              <input type="file" hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={handleFileChange} />
            </Button>
          ) : (
            <Chip 
              label={form.attachmentName} 
              onDelete={removeFile} 
              color="primary" 
              variant="outlined" 
            />
          )}
        </Stack>
      </Box>

      {item && (
        <>
          <BOSTextField
            name="createdUser"
            label="Created User"
            value={form.createdUser || form.createdBy || '-'}
            disabled
          />
          <BOSTextField
            name="updatedUser"
            label="Updated User"
            value={form.updatedUser || form.updatedBy || '-'}
            disabled
          />
        </>
      )}
    </BOSFormDialog>
  );
};

AddMeetingMasterDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  item: PropTypes.object
};

export default AddMeetingMasterDialog;
