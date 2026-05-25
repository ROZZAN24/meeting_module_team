import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BOSFormDialog, BOSTextField, BOSAutocomplete } from 'ui-component/bos';
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
  const { errors, validate, clearErrors, handleInputChange } = useBOSValidation();
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

  const h = (e) => handleInputChange(e, setForm);

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
      
      <BOSAutocomplete
        multiple
        label="Employee Name"
        name="employeeName"
        options={employees.filter(emp => users.some(u => u.empId === emp.id))}
        getOptionLabel={(option) => `${option.employeeName} (${option.empCode})`}
        value={employees.filter(emp => form.employeeName?.some(val => val.split(' - ')[0] === emp.empCode))}
        onChange={(newValue) => {
          setForm(p => ({ ...p, employeeName: newValue.map(v => `${v.empCode} - ${v.employeeName}`) }));
          if (errors.employeeName) clearErrors('employeeName');
        }}
        required
        error={!!errors.employeeName}
        helperText={errors.employeeName}
      />

      <BOSAutocomplete
        name="status"
        label="Status"
        value={form.status || 'ACTIVE'}
        options={['ACTIVE', 'INACTIVE']}
        onChange={(newValue) => setForm(p => ({ ...p, status: newValue }))}
        required
      />
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
