import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MenuItem, Stack, Box, Typography, Paper, useTheme } from '@mui/material';
import { IconSettings, IconInfoCircle, IconAlertCircle } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSFormDialog, BOSFormSection, BOSTextField, errorStyle } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useBOSForm from 'hooks/useBOSForm';

// ==============================|| DEPARTMENT - PROFESSIONAL TEMPLATE ||============================== //

const AddDepartmentDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { formData, setFormData, handleFormChange, errors, validate, resetForm } = useBOSForm({
    departmentName: '',
    departmentNo: 0,
    ndaCertificate: 'No',
    sequenceNo: 0,
    status: 'Active'
  });

  useEffect(() => {
    if (open) {
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
        resetForm();
        setIsEditing(!readOnly);
        fetchNextValues();
      }
    }
  }, [initialData, open, readOnly, setFormData, resetForm]);

  const fetchNextValues = async () => {
    try {
      const [codeRes, seqRes] = await Promise.all([
        axios.get('/api/hrm/departments/next-code'),
        axios.get('/api/hrm/departments/next-seq')
      ]);
      setFormData(prev => ({ ...prev, departmentNo: codeRes.data, sequenceNo: seqRes.data }));
    } catch (e) {
      console.error('Failed to fetch next values');
    }
  };

  const handleSave = async () => {
    const { isValid, firstMissing } = validate([
      { field: 'departmentName', label: 'Department Name' },
      { field: 'departmentNo', label: 'Department Number' }
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
      if (formData.id) {
        await axios.put(`/api/hrm/departments/${formData.id}`, formData);
        dispatch(openSnackbar({ open: true, message: 'Department updated successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      } else {
        await axios.post('/api/hrm/departments', formData);
        dispatch(openSnackbar({ open: true, message: 'Department created successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      }
      handleClose(true);
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save department.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error' }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`/api/hrm/departments/${formData.id}`);
      dispatch(openSnackbar({ open: true, message: 'Department deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      handleClose(true);
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error' }));
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
        onClear={isEditing ? resetForm : null}
        onEditClick={() => setIsEditing(true)}
        title={initialData ? 'Edit Department' : 'New Department'}
        isViewOnly={isViewOnly}
        hasId={!!formData.id}
        maxWidth="lg"
        sidebar={
          <Stack spacing={3}>
            <Paper sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: '12px', border: '1px solid', borderColor: 'primary.light' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <IconInfoCircle size={20} color={theme.palette.primary.main} />
                <Typography variant="subtitle2" color="primary.main" fontWeight={700}>Audit Log</Typography>
              </Stack>
              <Typography variant="caption" display="block">System ID: {formData.id || 'Draft'}</Typography>
              <Typography variant="caption" display="block">Status: {formData.status}</Typography>
              {initialData?.updatedAt && (
                <Typography variant="caption" display="block">Last Sync: {new Date(initialData.updatedAt).toLocaleDateString()}</Typography>
              )}
            </Paper>

            <Paper sx={{ p: 2, bgcolor: 'secondary.lighter', borderRadius: '12px', border: '1px solid', borderColor: 'secondary.light' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <IconAlertCircle size={20} color={theme.palette.secondary.main} />
                <Typography variant="subtitle2" color="secondary.main" fontWeight={700}>SOP Reminder</Typography>
              </Stack>
              <Typography variant="caption" display="block">Ensure department codes follow the standard alphanumeric pattern (e.g., DEPT-001).</Typography>
            </Paper>
          </Stack>
        }
      >
        <BOSFormSection icon={<IconSettings size={22} color={theme.palette.primary.main} />} title="Core Configuration">
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            <BOSTextField
              name="departmentName"
              label="Department Name"
              value={formData.departmentName}
              onChange={handleFormChange}
              disabled={isViewOnly}
              required
              error={errors.departmentName}
              sx={errorStyle(errors.departmentName)}
            />
            <BOSTextField
              name="departmentNo"
              label="Department Number"
              type="number"
              value={formData.departmentNo}
              onChange={handleFormChange}
              disabled={isViewOnly}
              required
              error={errors.departmentNo}
              sx={errorStyle(errors.departmentNo)}
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, mt: 3 }}>
            <BOSTextField
              select
              name="ndaCertificate"
              label="NDA Required"
              value={formData.ndaCertificate}
              onChange={handleFormChange}
              disabled={isViewOnly}
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </BOSTextField>
            <BOSTextField
              name="sequenceNo"
              label="Org Sequence"
              type="number"
              value={formData.sequenceNo}
              onChange={handleFormChange}
              disabled={isViewOnly}
            />
            <BOSTextField
              select
              name="status"
              label="Status"
              value={formData.status}
              onChange={handleFormChange}
              disabled={isViewOnly}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="In Active">In Active</MenuItem>
            </BOSTextField>
          </Box>
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
