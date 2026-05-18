import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MenuItem, Autocomplete, Chip } from '@mui/material';
import { BOSFormDialog, BOSTextField } from 'ui-component/bos';
import useBOSValidation from 'hooks/useBOSValidation';
import { useLookups } from 'hooks/useLookups';

const INITIAL_FORM = {
  meetingName: '',
  meetingDescription: '',
  meetingPrefix: '',
  meetingAgenda: '',
  employeeName: [],
  status: 'ACTIVE'
};

const AddMeetingMasterDialog = ({ open, onClose, onSave, item }) => {
  const { employees = [], users = [] } = useLookups(['EMPLOYEES', 'USERS']);
<<<<<<< HEAD
  const { errors, validate, clearErrors, handleInputChange } = useBOSValidation();
=======
  const { errors, validate, clearErrors } = useBOSValidation();
>>>>>>> origin/chore/repo-cleanup
  const [form, setForm] = useState(INITIAL_FORM);

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

<<<<<<< HEAD
  const h = (e) => handleInputChange(e, setForm);
=======
  const h = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
>>>>>>> origin/chore/repo-cleanup

  const handleSave = () => {
    const rules = [
      { field: 'meetingName', label: 'Meeting Name', required: true },
      { field: 'meetingDescription', label: 'Meeting Description', required: true },
      { field: 'meetingPrefix', label: 'Meeting Prefix', required: true },
      { field: 'meetingAgenda', label: 'Meeting Agenda', required: true },
      { field: 'employeeName', label: 'Employee Name', required: true, type: 'array' }
    ];

    if (validate(form, rules)) {
      onSave({
        ...form,
        employeeName: form.employeeName.join(', ')
      });
    }
  };

  return (
    <BOSFormDialog
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title={item ? 'Edit Meeting Master' : 'Add Meeting Master'}
      maxWidth="md"
    >
      <BOSTextField
        name="meetingName"
        label="Meeting Name"
        value={form.meetingName || ''}
        onChange={h}
        error={!!errors.meetingName}
        helperText={errors.meetingName}
        required
      />
      <BOSTextField
        name="meetingDescription"
        label="Meeting Description"
        value={form.meetingDescription || ''}
        onChange={h}
        error={!!errors.meetingDescription}
        helperText={errors.meetingDescription}
        multiline
        rows={3}
        required
      />
      <BOSTextField
        name="meetingPrefix"
        label="Meeting Prefix"
        value={form.meetingPrefix || ''}
        onChange={h}
        error={!!errors.meetingPrefix}
        helperText={errors.meetingPrefix}
        required
      />
      <BOSTextField
        name="meetingAgenda"
        label="Meeting Agenda"
        value={form.meetingAgenda || ''}
        onChange={h}
        error={!!errors.meetingAgenda}
        helperText={errors.meetingAgenda}
        multiline
        rows={4}
        required
      />
      
      <Autocomplete
        multiple
        options={employees.filter(emp => users.some(u => u.empId === emp.id))}
        getOptionLabel={(option) => `${option.employeeName} (${option.empCode})`}
<<<<<<< HEAD
        value={employees.filter(emp => form.employeeName?.some(val => val.split(' - ')[0] === emp.empCode))}
        onChange={(e, newValue) => {
          setForm(p => ({ ...p, employeeName: newValue.map(v => `${v.empCode} - ${v.employeeName}`) }));
          if (errors.employeeName) clearErrors('employeeName');
=======
        value={employees.filter(emp => form.employeeName?.some(val => val.split(';')[0] === emp.empCode))}
        onChange={(e, newValue) => {
          setForm(p => ({ ...p, employeeName: newValue.map(v => `${v.empCode};${v.employeeName}`) }));
>>>>>>> origin/chore/repo-cleanup
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
