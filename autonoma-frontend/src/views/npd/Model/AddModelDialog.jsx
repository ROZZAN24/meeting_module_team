import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MenuItem, useTheme, Autocomplete, TextField as MuiTextField } from '@mui/material';
import { IconSettings } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSFormDialog, BOSFormSection, BOSTextField } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useBOSValidation from 'hooks/useBOSValidation';
import { API_PATHS } from 'utils/api-constants';
import useAuth from 'hooks/useAuth';

// ==============================|| PRODUCT MODEL - ADD/EDIT DIALOG (BOS SOP COMPLIANT) ||============================== //

const VALIDATION_RULES = [
  { field: 'oemId', label: 'OEM Short Name', required: true },
  { field: 'modelNo', label: 'Model No', required: true, maxLength: 100 },
  { field: 'rotorDiameter', label: 'Rotor Diameter', required: true }
];

const INITIAL_STATE = {
  oemId: '',
  modelNo: '',
  rotorDiameter: 0.0,
  status: 'ACTIVE'
};

const AddModelDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { errors, validate, clearErrors } = useBOSValidation();

  const [formData, setFormData] = useState(INITIAL_STATE);
  const [oems, setOems] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Fetch OEMs dynamically
  useEffect(() => {
    if (open) {
      axios.get(API_PATHS.NPD.ITEM_OEM)
        .then((res) => {
          // List only ACTIVE oems for selection, or all if none
          const activeOems = res.data.filter(o => o.status === 'ACTIVE');
          setOems(activeOems.length > 0 ? activeOems : res.data);
        })
        .catch((err) => {
          console.error('Failed to fetch OEMs:', err);
        });
    }
  }, [open]);

  useEffect(() => {
    clearErrors();
    if (initialData) {
      setFormData({
        id: initialData.id,
        oemId: initialData.oem?.id || '',
        modelNo: initialData.modelNo || '',
        rotorDiameter: initialData.rotorDiameter !== undefined ? initialData.rotorDiameter : 0.0,
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
        oem: { id: formData.oemId },
        modelNo: formData.modelNo,
        rotorDiameter: parseFloat(formData.rotorDiameter),
        status: formData.status,
        createdBy: formData.id ? formData.createdBy : (user?.name || 'Admin'),
        updatedBy: user?.name || 'Admin',
        createdAt: formData.createdAt
      };

      if (formData.id) {
        await axios.put(`${API_PATHS.NPD.ITEM_MODEL}/${formData.id}`, payload);
        dispatch(openSnackbar({ open: true, message: 'Model updated successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        await axios.post(API_PATHS.NPD.ITEM_MODEL, payload);
        dispatch(openSnackbar({ open: true, message: 'Model created successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save Model:', error);
      const errorMsg = error.response?.data || 'Failed to save Model.';
      dispatch(openSnackbar({ open: true, message: errorMsg, variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`${API_PATHS.NPD.ITEM_MODEL}/${formData.id}`);
      dispatch(openSnackbar({ open: true, message: 'Model deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      console.error('Failed to delete model:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete model.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
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
        title={initialData ? 'Edit Model details' : 'New Model details'}
        isViewOnly={isViewOnly}
        hasId={!!formData.id}
        maxWidth="md"
      >
        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Model Details">
          <Autocomplete
            value={oems.find(o => o.id === formData.oemId) || null}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                oemId: newValue ? newValue.id : ''
              }));
            }}
            disabled={isViewOnly}
            options={oems}
            getOptionLabel={(option) => option.oemShortName || ''}
            freeSolo={false}
            renderInput={(params) => (
              <MuiTextField
                {...params}
                label="OEM ShortName"
                variant="outlined"
                size="small"
                required
                error={!!errors.oemId}
                helperText={errors.oemId}
                sx={{ mt: 1, mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="No OEMs found"
          />

          <BOSTextField
            name="modelNo"
            label="Model No"
            value={formData.modelNo}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            maxLength={100}
            error={!!errors.modelNo}
            helperText={errors.modelNo}
          />

          <BOSTextField
            name="rotorDiameter"
            label="Rotor Diameter (in Meter)"
            type="number"
            value={formData.rotorDiameter}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            inputProps={{ step: '0.01' }}
            error={!!errors.rotorDiameter}
            helperText={errors.rotorDiameter}
          />

          <BOSTextField
            select
            name="status"
            label="Model Status"
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
        title="Delete Model details"
        message="Are you sure you want to delete this Model? This action cannot be undone."
        itemName={formData.modelNo}
      />
    </>
  );
};

AddModelDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};

export default AddModelDialog;
