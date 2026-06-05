import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MenuItem, Autocomplete, Chip, Typography, Checkbox } from '@mui/material';
import { BOSFormDialog, BOSTextField, BOSStatusField, BOSFileUpload } from 'ui-component/bos';
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

      onSave({
        ...form,
        employeeName: form.employeeName.join(', ')
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
        getOptionLabel={(option) => option.employeeName}
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
              <Typography variant="body2">{option.employeeName}</Typography>
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

      <BOSStatusField
        isCreate={!item}
        type="string-upper"
        name="status"
        label="Status"
        value={form.status}
        onChange={h}
        sx={compactInputSx}
        className="h-9"
      />

      <BOSFileUpload
        files={form.attachmentUrl ? [{
          fileName: form.attachmentName,
          serverFileName: form.attachmentUrl,
          isServer: true
        }] : []}
        onChange={(files) => {
          if (files.length === 0) {
            setForm(prev => ({ ...prev, attachmentName: '', attachmentUrl: '' }));
          } else {
            const file = files[0];
            setForm(prev => ({
              ...prev,
              attachmentName: file.fileName || file.name,
              attachmentUrl: file.serverFileName
            }));
          }
        }}
        module="MASTER_QMS_MEETING_MEETING_MASTER"
        multiple={false}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
        label="Upload Attachment"
      />
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
