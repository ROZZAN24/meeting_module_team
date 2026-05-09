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

// ==============================|| GRADE - ADD/EDIT DIALOG ||============================== //

const VALIDATION_RULES = [
  { field: 'gradeCode', label: 'Grade Code', required: true, maxLength: 20 },
  { field: 'gradeName', label: 'Grade Name', required: true, maxLength: 100 }
];

const INITIAL_STATE = {
  gradeCode: '',
  gradeName: '',
  sequenceNo: 0,
  status: 'Active'
};

const AddGradeDialog = ({ open, handleClose, initialData, readOnly = false }) => {
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
        gradeCode: initialData.gradeCode || '',
        gradeName: initialData.gradeName || '',
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
        await axios.put(`/api/master/hr/grade/${formData.id}`, formData);
        dispatch(openSnackbar({ open: true, message: 'Grade updated successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        await axios.post('/api/master/hr/grade', formData);
        dispatch(openSnackbar({ open: true, message: 'Grade created successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save grade:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to save grade.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`/api/master/hr/grade/${formData.id}`);
      dispatch(openSnackbar({ open: true, message: 'Grade deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      console.error('Failed to delete grade:', error);
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
        title={initialData ? 'Edit Grade' : 'New Grade'}
        isViewOnly={isViewOnly}
        hasId={!!formData.id}
        maxWidth="sm"
      >
        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Grade Details">
          <BOSTextField
            name="gradeCode"
            label="Grade Code"
            value={formData.gradeCode}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            maxLength={20}
            error={!!errors.gradeCode}
            helperText={errors.gradeCode}
          />
          <BOSTextField
            name="gradeName"
            label="Grade Name"
            value={formData.gradeName}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            maxLength={100}
            error={!!errors.gradeName}
            helperText={errors.gradeName}
          />
          <BOSTextField
            name="sequenceNo"
            label="Seq.No"
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
        title="Delete Grade"
        message="Are you sure you want to delete this grade? This action cannot be undone."
        itemName={formData.gradeName}
      />
    </>
  );
};

AddGradeDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};

export default AddGradeDialog;
