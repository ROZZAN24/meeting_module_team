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

// ==============================|| PRODUCT ITEM SUB TYPE - ADD/EDIT DIALOG (BOS SOP COMPLIANT) ||============================== //

const VALIDATION_RULES = [
  { field: 'typeId', label: 'Item Type', required: true },
  { field: 'subType', label: 'Sub Type', required: true, maxLength: 100 },
  { field: 'isAutoGenerateCode', label: 'Is Auto Generate Code', required: true }
];

const INITIAL_STATE = {
  typeId: '',
  subType: '',
  subItemPrefix: '',
  isAutoGenerateCode: 'YES',
  prefixBased: '',
  status: 'ACTIVE'
};

const AddItemSubtypeDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { errors, validate, clearErrors } = useBOSValidation();

  const [formData, setFormData] = useState(INITIAL_STATE);
  const [types, setTypes] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await axios.get(API_PATHS.NPD.ITEM_TYPE);
        setTypes(response.data.filter(t => t.status === 'ACTIVE'));
      } catch (error) {
        console.error('Failed to fetch item types for dropdown:', error);
      }
    };
    if (open) {
      fetchTypes();
    }
  }, [open]);

  useEffect(() => {
    clearErrors();
    if (initialData) {
      let resolvedPrefix = initialData.prefixBased || '';
      if (initialData.type) {
        if (initialData.type.prefixBased === 'GROUP') {
          resolvedPrefix = initialData.type.groupPrefix || '';
        } else if (initialData.type.prefixBased === 'TYPE') {
          resolvedPrefix = initialData.type.itemPrefix || '';
        }
      }
      setFormData({
        id: initialData.id,
        typeId: initialData.type?.id || '',
        subType: initialData.subType || '',
        subItemPrefix: initialData.subItemPrefix || '',
        isAutoGenerateCode: initialData.isAutoGenerateCode || 'YES',
        prefixBased: resolvedPrefix,
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
      const selectedType = types.find(t => t.id === formData.typeId);
      const payload = {
        id: formData.id,
        type: selectedType,
        subType: formData.subType,
        subItemPrefix: formData.subItemPrefix,
        isAutoGenerateCode: formData.isAutoGenerateCode,
        prefixBased: formData.prefixBased,
        status: formData.status,
        createdBy: formData.id ? formData.createdBy : (user?.name || 'Admin'),
        updatedBy: user?.name || 'Admin'
      };

      if (formData.id) {
        await axios.put(`${API_PATHS.NPD.ITEM_SUBTYPE}/${formData.id}`, payload);
        dispatch(openSnackbar({ open: true, message: 'Item Sub Type updated successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        await axios.post(API_PATHS.NPD.ITEM_SUBTYPE, payload);
        dispatch(openSnackbar({ open: true, message: 'Item Sub Type created successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save item subtype:', error);
      const errorMsg = error.response?.data || 'Failed to save item subtype.';
      dispatch(openSnackbar({ open: true, message: errorMsg, variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`${API_PATHS.NPD.ITEM_SUBTYPE}/${formData.id}`);
      dispatch(openSnackbar({ open: true, message: 'Item Sub Type deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      console.error('Failed to delete item subtype:', error);
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
        title={initialData ? 'Edit Item Sub Type' : 'New Item Sub Type'}
        isViewOnly={isViewOnly}
        hasId={!!formData.id}
        maxWidth="md"
      >
        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Item Sub Type Details">
          <Autocomplete
            value={types.find(t => t.id === formData.typeId) || null}
            onChange={(event, newValue) => {
              setFormData((prev) => {
                const newTypeId = newValue ? newValue.id : '';
                let resolvedPrefix = '';
                if (newValue) {
                  if (newValue.prefixBased === 'GROUP') {
                    resolvedPrefix = newValue.groupPrefix || '';
                  } else if (newValue.prefixBased === 'TYPE') {
                    resolvedPrefix = newValue.itemPrefix || '';
                  }
                }
                return {
                  ...prev,
                  typeId: newTypeId,
                  prefixBased: resolvedPrefix
                };
              });
            }}
            disabled={isViewOnly}
            options={types}
            getOptionLabel={(option) => option.itemType || ''}
            freeSolo={false}
            renderInput={(params) => (
              <MuiTextField
                {...params}
                label="Item Type"
                variant="outlined"
                size="small"
                required
                error={!!errors.typeId}
                helperText={errors.typeId}
                sx={{ mt: 1, mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="No types found"
          />

          <BOSTextField
            name="subType"
            label="Sub Item Type"
            value={formData.subType}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            maxLength={100}
            error={!!errors.subType}
            helperText={errors.subType}
          />

          <BOSTextField
            name="subItemPrefix"
            label="Sub Item Prefix"
            value={formData.subItemPrefix}
            onChange={handleChange}
            disabled={isViewOnly}
            maxLength={50}
            error={!!errors.subItemPrefix}
            helperText={errors.subItemPrefix}
          />

          <BOSTextField
            select
            name="isAutoGenerateCode"
            label="Is Auto Generate Code"
            value={formData.isAutoGenerateCode}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            error={!!errors.isAutoGenerateCode}
            helperText={errors.isAutoGenerateCode}
          >
            <MenuItem value="YES">Yes</MenuItem>
            <MenuItem value="NO">No</MenuItem>
          </BOSTextField>

          <BOSTextField
            name="prefixBased"
            label="Prefix Based"
            value={formData.prefixBased || ''}
            disabled
            required
            helperText="Prefix Based is resolved from Item Type"
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
        title="Delete Item Sub Type"
        message="Are you sure you want to delete this item sub type? This action cannot be undone."
        itemName={formData.subType}
      />
    </>
  );
};

AddItemSubtypeDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};

export default AddItemSubtypeDialog;
