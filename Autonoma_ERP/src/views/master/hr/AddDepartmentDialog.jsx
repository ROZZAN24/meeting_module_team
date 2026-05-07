import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MenuItem, useTheme } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { IconSettings } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSFormDialog, BOSFormSection, BOSTextField } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useBOSValidation from 'hooks/useBOSValidation';

// ==============================|| DEPARTMENT - ADD/EDIT DIALOG (BOS SOP COMPLIANT) ||============================== //

const VALIDATION_RULES = [
  { field: 'departmentName', label: 'Department Name', required: true, maxLength: 100 },
  { field: 'departmentNo', label: 'Department Number', required: true, type: 'number' }
];

const INITIAL_STATE = {
  departmentName: '',
  departmentNo: 0,
  ndaCertificate: 'No',
  sequenceNo: 0,
  status: 'Active'
};

const AddDepartmentDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { errors, validate, clearErrors } = useBOSValidation();

  const [formData, setFormData] = useState(INITIAL_STATE);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    clearErrors();
    if (initialData) {
      setFormData({
        id: initialData.id,
        departmentName: initialData.departmentName || '',
        departmentNo: initialData.departmentNo || 0,
        ndaCertificate: initialData.ndaCertificate || 'No',
        sequenceNo: initialData.sequenceNo || 0,
        status: initialData.status || 'Active'
      });
      setIsEditing(false);
    } else {
      setFormData(INITIAL_STATE);
      setIsEditing(!readOnly);
    }
  }, [initialData, open, readOnly, clearErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData(INITIAL_STATE);
    clearErrors();
  };

  const handleSave = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;

    try {
      if (formData.id) {
        await axios.put(`/api/hrm/departments/${formData.id}`, formData);
        dispatch(openSnackbar({ open: true, message: 'Department updated successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        await axios.post('/api/hrm/departments', formData);
        dispatch(openSnackbar({ open: true, message: 'Department created successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save department:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to save department.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`/api/hrm/departments/${formData.id}`);
      dispatch(openSnackbar({ open: true, message: 'Department deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      console.error('Failed to delete department:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const isViewOnly = readOnly && !isEditing;

  return (
    <>
      <BOSFormDialog
        open={open}
        onClose={() => handleClose()}
        onSave={handleSave}
        onDelete={() => setDeleteOpen(true)}
        onClear={handleClear}
        onEditClick={() => setIsEditing(true)}
        title={initialData ? 'Edit Department' : 'New Department'}
        isViewOnly={isViewOnly}
        hasId={!!formData.id}
        maxWidth="md"
      >
        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Department Details">
          <BOSTextField
            name="departmentName"
            label="Department Name"
            value={formData.departmentName}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            maxLength={100}
            error={!!errors.departmentName}
            helperText={errors.departmentName}
          />
          <BOSTextField
            name="departmentNo"
            label="Department Number"
            type="number"
            value={formData.departmentNo}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            error={!!errors.departmentNo}
            helperText={errors.departmentNo}
          />
          <BOSTextField
            select
            name="ndaCertificate"
            label="NDA Certificate"
            value={formData.ndaCertificate}
            onChange={handleChange}
            disabled={isViewOnly}
          >
            <MenuItem value="Yes">Yes</MenuItem>
            <MenuItem value="No">No</MenuItem>
          </BOSTextField>
          <BOSTextField
            name="sequenceNo"
            label="Seq. No"
            type="number"
            value={formData.sequenceNo}
            onChange={handleChange}
            disabled={isViewOnly}
          />
          <BOSTextField
            select
            name="status"
            label="Status"
            value={formData.status}
            onChange={handleChange}
            disabled={isViewOnly}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="In Active">In Active</MenuItem>
          </BOSTextField>
        </BOSFormSection>
      </BOSFormDialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone."
        itemName={formData.departmentName}
      />
    </>
  );
};

AddDepartmentDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};

export default AddDepartmentDialog;
