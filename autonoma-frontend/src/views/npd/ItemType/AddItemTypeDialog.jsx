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

// ==============================|| PRODUCT ITEM TYPE - ADD/EDIT DIALOG (BOS SOP COMPLIANT) ||============================== //

const VALIDATION_RULES = [
  { field: 'groupId', label: 'Item Group', required: true },
  { field: 'itemType', label: 'Item Type', required: true, maxLength: 100 },
  { field: 'isAutoGenerateCode', label: 'Is Auto Generate Code', required: true },
  { field: 'prefixBased', label: 'Prefix Based', required: true }
];

const INITIAL_STATE = {
  groupId: '',
  itemType: '',
  groupPrefix: '',
  itemPrefix: '',
  isAutoGenerateCode: 'NO',
  prefixBased: 'GROUP',
  status: 'ACTIVE'
};

const AddItemTypeDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { errors, validate, clearErrors } = useBOSValidation();

  const [formData, setFormData] = useState(INITIAL_STATE);
  const [groups, setGroups] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axios.get(API_PATHS.NPD.ITEM_GROUP);
        // Filter only active groups for selection
        setGroups(response.data.filter(g => g.status === 'ACTIVE'));
      } catch (error) {
        console.error('Failed to fetch groups for dropdown:', error);
      }
    };
    if (open) {
      fetchGroups();
    }
  }, [open]);

  useEffect(() => {
    clearErrors();
    if (initialData) {
      setFormData({
        id: initialData.id,
        groupId: initialData.group?.id || '',
        itemType: initialData.itemType || '',
        groupPrefix: initialData.groupPrefix || '',
        itemPrefix: initialData.itemPrefix || '',
        isAutoGenerateCode: initialData.isAutoGenerateCode || 'NO',
        prefixBased: initialData.prefixBased || 'GROUP',
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
      const selectedGroup = groups.find(g => g.id === formData.groupId);
      const payload = {
        id: formData.id,
        group: selectedGroup,
        itemType: formData.itemType,
        groupPrefix: formData.groupPrefix,
        itemPrefix: formData.itemPrefix,
        isAutoGenerateCode: formData.isAutoGenerateCode,
        prefixBased: formData.prefixBased,
        status: formData.status,
        createdBy: formData.id ? formData.createdBy : (user?.name || 'Admin'),
        updatedBy: user?.name || 'Admin'
      };

      if (formData.id) {
        await axios.put(`${API_PATHS.NPD.ITEM_TYPE}/${formData.id}`, payload);
        dispatch(openSnackbar({ open: true, message: 'Item Type updated successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      } else {
        await axios.post(API_PATHS.NPD.ITEM_TYPE, payload);
        dispatch(openSnackbar({ open: true, message: 'Item Type created successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      }
      handleClose(true);
    } catch (error) {
      console.error('Failed to save item type:', error);
      const errorMsg = error.response?.data || 'Failed to save item type.';
      dispatch(openSnackbar({ open: true, message: errorMsg, variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`${API_PATHS.NPD.ITEM_TYPE}/${formData.id}`);
      dispatch(openSnackbar({ open: true, message: 'Item Type deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      handleClose(true);
    } catch (error) {
      console.error('Failed to delete item type:', error);
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
        title={initialData ? 'Edit Item Type' : 'New Item Type'}
        isViewOnly={isViewOnly}
        hasId={!!formData.id}
        maxWidth="md"
      >
        <BOSFormSection icon={<IconSettings size={20} color={theme.palette.primary.main} />} title="Item Type Details">
          <Autocomplete
            value={groups.find(g => g.id === formData.groupId) || null}
            onChange={(event, newValue) => {
              setFormData((prev) => ({
                ...prev,
                groupId: newValue ? newValue.id : ''
              }));
            }}
            disabled={isViewOnly}
            options={groups}
            getOptionLabel={(option) => option.groupName || ''}
            freeSolo={false}
            renderInput={(params) => (
              <MuiTextField
                {...params}
                label="Item Group"
                variant="outlined"
                size="small"
                required
                error={!!errors.groupId}
                helperText={errors.groupId}
                sx={{ mt: 1, mb: 1, '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            noOptionsText="No groups found"
          />

          <BOSTextField
            name="itemType"
            label="Item Type"
            value={formData.itemType}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            maxLength={100}
            error={!!errors.itemType}
            helperText={errors.itemType}
          />

          <BOSTextField
            name="groupPrefix"
            label="Group Prefix"
            value={formData.groupPrefix}
            onChange={handleChange}
            disabled={isViewOnly}
            maxLength={50}
            error={!!errors.groupPrefix}
            helperText={errors.groupPrefix}
          />

          <BOSTextField
            name="itemPrefix"
            label="Item Prefix"
            value={formData.itemPrefix}
            onChange={handleChange}
            disabled={isViewOnly}
            maxLength={50}
            error={!!errors.itemPrefix}
            helperText={errors.itemPrefix}
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
            select
            name="prefixBased"
            label="Prefix Based"
            value={formData.prefixBased}
            onChange={handleChange}
            disabled={isViewOnly}
            required
            error={!!errors.prefixBased}
            helperText={errors.prefixBased}
          >
            <MenuItem value="GROUP">Group</MenuItem>
            <MenuItem value="TYPE">Type</MenuItem>
          </BOSTextField>

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
        title="Delete Item Type"
        message="Are you sure you want to delete this item type? This action cannot be undone."
        itemName={formData.itemType}
      />
    </>
  );
};

AddItemTypeDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};

export default AddItemTypeDialog;
