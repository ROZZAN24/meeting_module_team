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
import { API_PATHS } from 'utils/api-constants';
import useAuth from 'hooks/useAuth';

// ==============================|| AUDIT AREA - ADD/EDIT DIALOG (BOS SOP COMPLIANT) ||============================== //

const VALIDATION_RULES = [
  { field: 'description', label: 'Description', required: true, maxLength: 255 },
  { field: 'type', label: 'Type', required: true }
];

const INITIAL_STATE = { type: 'AREA', description: '', status: 'ACTIVE' };

const AddAuditAreaDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const { errors, validate, clearErrors } = useBOSValidation();

  const [formData, setFormData] = useState(INITIAL_STATE);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    clearErrors();
    if (initialData) {
      setFormData({
        id: initialData.id,
        type: initialData.type || 'AREA',
        description: initialData.description || '',
        status: initialData.status || 'ACTIVE',
        createdBy: initialData.createdBy
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
      const payload = {
        ...formData,
        createdBy: formData.id ? formData.createdBy : (user?.name || 'Admin'),
        updatedBy: user?.name || 'Admin'
      };

      if (formData.id) {
        await axios.put(`${API_PATHS.QMS.AUDIT_AREA}/${formData.id}`, payload);
        dispatch(openSnackbar({ open: true, message: 'Audit Area updated successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        await axios.post(API_PATHS.QMS.AUDIT_AREA, payload);
        dispatch(openSnackbar({ open: true, message: 'Audit Area created successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save audit area:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to save audit area.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`${API_PATHS.QMS.AUDIT_AREA}/${formData.id}`);
      dispatch(openSnackbar({ open: true, message: 'Audit Area deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      console.error('Failed to delete audit area:', error);
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
        title={initialData ? 'Edit Audit Area' : 'New Audit Area'}
        isViewOnly={isViewOnly}
        hasId={!!formData.id}
        maxWidth="md"
      >
        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Area Details">
          <BOSTextField
            select
            name="type"
            label="Type"
            value={formData.type}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            error={!!errors.type}
            helperText={errors.type}
          >
            <MenuItem value="AREA">AREA</MenuItem>
            <MenuItem value="ZONE">ZONE</MenuItem>
          </BOSTextField>

          <BOSTextField
            name="description"
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            maxLength={255}
            error={!!errors.description}
            helperText={errors.description}
          />

          <BOSTextField
            select
            name="status"
            label="Status"
            value={formData.status}
            onChange={handleChange}
            disabled={isViewOnly}
          >
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
          </BOSTextField>
        </BOSFormSection>
      </BOSFormDialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Audit Area"
        message="Are you sure you want to delete this audit area? This action cannot be undone."
        itemName={formData.description}
      />
    </>
  );
};

AddAuditAreaDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};

export default AddAuditAreaDialog;
