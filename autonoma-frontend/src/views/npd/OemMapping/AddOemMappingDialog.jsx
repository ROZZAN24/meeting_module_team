import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MenuItem, useTheme } from '@mui/material';
import { IconSettings } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSFormDialog, BOSFormSection, BOSTextField } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useBOSValidation from 'hooks/useBOSValidation';
import { API_PATHS } from 'utils/api-constants';
import useAuth from 'hooks/useAuth';

// ==============================|| PRODUCT OEM MAPPING - ADD/EDIT DIALOG (BOS SOP COMPLIANT) ||============================== //

const VALIDATION_RULES = [
  { field: 'partNo', label: 'Part No', required: true, maxLength: 100 },
  { field: 'oemPartNo', label: 'OEM Part No', required: true, maxLength: 100 }
];

const INITIAL_STATE = {
  partNo: '',
  oemPartNo: '',
  oemDescription: '',
  status: 'ACTIVE'
};

const AddOemMappingDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
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
        partNo: initialData.partNo || '',
        oemPartNo: initialData.oemPartNo || '',
        oemDescription: initialData.oemDescription || '',
        status: initialData.status || 'ACTIVE',
        createdBy: initialData.createdBy,
        createdAt: initialData.createdAt
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
        id: formData.id,
        partNo: formData.partNo,
        oemPartNo: formData.oemPartNo,
        oemDescription: formData.oemDescription,
        status: formData.status,
        createdBy: formData.id ? formData.createdBy : (user?.name || 'Admin'),
        updatedBy: user?.name || 'Admin',
        createdAt: formData.createdAt
      };

      if (formData.id) {
        await axios.put(`${API_PATHS.NPD.ITEM_OEM_MAPPING}/${formData.id}`, payload);
        dispatch(openSnackbar({ open: true, message: 'OEM Mapping updated successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        await axios.post(API_PATHS.NPD.ITEM_OEM_MAPPING, payload);
        dispatch(openSnackbar({ open: true, message: 'OEM Mapping created successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save OEM mapping:', error);
      const errorMsg = error.response?.data || 'Failed to save OEM mapping.';
      dispatch(openSnackbar({ open: true, message: errorMsg, variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`${API_PATHS.NPD.ITEM_OEM_MAPPING}/${formData.id}`);
      dispatch(openSnackbar({ open: true, message: 'OEM Mapping deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      console.error('Failed to delete mapping:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete mapping.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
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
        title={initialData ? 'Edit OEM Mapping' : 'New OEM Mapping'}
        isViewOnly={isViewOnly}
        hasId={!!formData.id}
        maxWidth="md"
      >
        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Mapping Details">
          <BOSTextField
            name="partNo"
            label="Part No"
            value={formData.partNo}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            maxLength={100}
            error={!!errors.partNo}
            helperText={errors.partNo}
          />

          <BOSTextField
            name="oemPartNo"
            label="OEM Part No"
            value={formData.oemPartNo}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            maxLength={100}
            error={!!errors.oemPartNo}
            helperText={errors.oemPartNo}
          />

          <BOSTextField
            name="oemDescription"
            label="OEM Description"
            value={formData.oemDescription}
            onChange={handleChange}
            disabled={isViewOnly}
            multiline
            rows={2}
            error={!!errors.oemDescription}
            helperText={errors.oemDescription}
          />

          <BOSTextField
            select
            name="status"
            label="Status"
            value={formData.status}
            onChange={handleChange}
            disabled={isViewOnly}
            required
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
        title="Delete OEM Mapping"
        message="Are you sure you want to delete this mapping? This action cannot be undone."
        itemName={formData.partNo}
      />
    </>
  );
};

AddOemMappingDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};

export default AddOemMappingDialog;
