import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MenuItem, Stack, Box, Typography, Paper, useTheme } from '@mui/material';
import { IconUserCircle, IconInfoCircle, IconAlertCircle, IconPhone, IconMail, IconMapPin } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import { BOSFormDialog, BOSFormSection, BOSTextField, errorStyle } from 'ui-component/bos';
import useBOSForm from 'hooks/useBOSForm';

// ==============================|| SM - SUPPLIER PROFESSIONAL TEMPLATE ||============================== //

export default function AddSupplierDialog({ open, handleClose, initialData, readOnly = false }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(!readOnly);

  const { formData, setFormData, handleFormChange, errors, validate, resetForm } = useBOSForm({
    supplierName: '',
    supplierCode: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstNo: '',
    status: 'Active'
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData);
        setIsEditing(false);
      } else {
        resetForm();
        setIsEditing(!readOnly);
      }
    }
  }, [initialData, open, readOnly, setFormData, resetForm]);

  const handleSave = async () => {
    const { isValid, firstMissing } = validate([
      { field: 'supplierName', label: 'Supplier Name' },
      { field: 'supplierCode', label: 'Supplier Code' }
    ]);

    if (!isValid) {
      dispatch(openSnackbar({
        open: true,
        message: `Field ${firstMissing} is mandatory.`,
        variant: 'alert',
        severity: 'error',
        alert: { variant: 'filled' }
      }));
      return;
    }

    try {
      if (initialData?.id) {
        await axios.put(`${API_PATHS.SM.SUPPLIERS}/${initialData.id}`, formData);
        dispatch(openSnackbar({ open: true, message: 'Supplier updated successfully!', severity: 'success', variant: 'alert' }));
      } else {
        await axios.post(API_PATHS.SM.SUPPLIERS, formData);
        dispatch(openSnackbar({ open: true, message: 'Supplier created successfully!', severity: 'success', variant: 'alert' }));
      }
      handleClose(true);
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Error saving supplier.', severity: 'error', variant: 'alert' }));
    }
  };

  const isViewOnly = readOnly && !isEditing;

  return (
    <BOSFormDialog
      open={open}
      onClose={() => handleClose(false)}
      onSave={handleSave}
      onClear={isEditing ? resetForm : null}
      onEditClick={() => setIsEditing(true)}
      isViewOnly={isViewOnly}
      title={initialData ? 'Edit Supplier' : 'New Supplier'}
      maxWidth="lg"
      sidebar={
        <Stack spacing={3}>
          <Paper sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: '12px', border: '1px solid', borderColor: 'primary.light' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <IconInfoCircle size={20} color={theme.palette.primary.main} />
              <Typography variant="subtitle2" color="primary.main" fontWeight={700}>System Audit</Typography>
            </Stack>
            <Typography variant="caption" display="block">Supplier ID: {initialData?.id || 'Draft'}</Typography>
            <Typography variant="caption" display="block">Lifecycle: {formData.status}</Typography>
          </Paper>

          <Paper sx={{ p: 2, bgcolor: 'secondary.lighter', borderRadius: '12px', border: '1px solid', borderColor: 'secondary.light' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <IconAlertCircle size={20} color={theme.palette.secondary.main} />
              <Typography variant="subtitle2" color="secondary.main" fontWeight={700}>Compliance</Typography>
            </Stack>
            <Typography variant="caption" display="block">Ensure GST details are verified against the GST portal for input tax credit eligibility.</Typography>
          </Paper>
        </Stack>
      }
    >
      <Stack spacing={3}>
        <BOSFormSection icon={<IconUserCircle size={22} color={theme.palette.primary.main} />} title="Identity & Contact">
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            <BOSTextField
              required
              label="Supplier Name"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleFormChange}
              disabled={isViewOnly}
              error={errors.supplierName}
              sx={errorStyle(errors.supplierName)}
            />
            <BOSTextField
              required
              label="Supplier Code"
              name="supplierCode"
              value={formData.supplierCode}
              onChange={handleFormChange}
              disabled={isViewOnly}
              error={errors.supplierCode}
              sx={errorStyle(errors.supplierCode)}
            />
            <BOSTextField
              label="Contact Person"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleFormChange}
              disabled={isViewOnly}
            />
            <BOSTextField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              disabled={isViewOnly}
              InputProps={{ startAdornment: <IconMail size={18} style={{ marginRight: 8, opacity: 0.5 }} /> }}
            />
            <BOSTextField
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleFormChange}
              disabled={isViewOnly}
              InputProps={{ startAdornment: <IconPhone size={18} style={{ marginRight: 8, opacity: 0.5 }} /> }}
            />
            <BOSTextField
              select
              label="Lifecycle Status"
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              disabled={isViewOnly}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </BOSTextField>
          </Box>
        </BOSFormSection>

        <BOSFormSection icon={<IconMapPin size={22} color={theme.palette.secondary.main} />} title="Fiscal & Location Info">
          <BOSTextField
            fullWidth
            label="GST Registration Number"
            name="gstNo"
            value={formData.gstNo}
            onChange={handleFormChange}
            disabled={isViewOnly}
            placeholder="e.g. 22AAAAA0000A1Z5"
          />
          <BOSTextField
            fullWidth
            multiline
            rows={4}
            label="Registered Office Address"
            name="address"
            value={formData.address}
            onChange={handleFormChange}
            disabled={isViewOnly}
            sx={{ mt: 3 }}
          />
        </BOSFormSection>
      </Stack>
    </BOSFormDialog>
  );
}

AddSupplierDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  initialData: PropTypes.object,
  readOnly: PropTypes.bool
};
