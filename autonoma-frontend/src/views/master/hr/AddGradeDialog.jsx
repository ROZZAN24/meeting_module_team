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

// ==============================|| GRADE - PROFESSIONAL TEMPLATE ||============================== //

const AddGradeDialog = ({ open, handleClose, initialData, readOnly = false }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(!readOnly);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { formData, setFormData, handleFormChange, errors, validate, resetForm } = useBOSForm({
    gradeCode: '',
    gradeName: '',
    sequenceNo: 0,
    status: 'Active'
  });

  useEffect(() => {
    const fetchNextCode = async () => {
      try {
        const { data } = await axios.get('/api/master/hr/grade/next-no');
        setFormData(prev => ({ ...prev, gradeCode: data }));
      } catch (e) {
        setFormData(prev => ({ ...prev, gradeCode: 'GRD-001' }));
      }
    };

    if (open) {
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
        resetForm();
        fetchNextCode();
        setIsEditing(!readOnly);
      }
    }
  }, [initialData, open, readOnly, setFormData, resetForm]);

  const handleSave = async () => {
    const { isValid, firstMissing } = validate([
      { field: 'gradeCode', label: 'Grade Code' },
      { field: 'gradeName', label: 'Grade Name' }
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
        await axios.put(`/api/master/hr/grade/${formData.id}`, formData);
        dispatch(openSnackbar({ open: true, message: 'Grade updated successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      } else {
        await axios.post('/api/master/hr/grade', formData);
        dispatch(openSnackbar({ open: true, message: 'Grade created successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      }
      handleClose(true);
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save grade.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error' }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteOpen(false);
    try {
      await axios.delete(`/api/master/hr/grade/${formData.id}`);
      dispatch(openSnackbar({ open: true, message: 'Grade deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      handleClose(true);
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error' }));
    }
  };

  const isViewOnly = readOnly && !isEditing;

  const handleClear = async () => {
    resetForm();
    try {
      const { data } = await axios.get('/api/master/hr/grade/next-no');
      setFormData(prev => ({ ...prev, gradeCode: data }));
    } catch (e) {
      setFormData(prev => ({ ...prev, gradeCode: 'GRD-001' }));
    }
  };

  return (
    <>
      <BOSFormDialog
        open={open}
        onClose={() => handleClose()}
        onSave={handleSave}
        onDelete={() => setDeleteOpen(true)}
        onClear={isEditing ? handleClear : null}
        onEditClick={() => setIsEditing(true)}
        title={initialData ? 'Edit Grade' : 'New Grade'}
        isViewOnly={isViewOnly}
        hasId={!!formData.id}
        maxWidth="md"
        sidebar={
          <Stack spacing={3}>
            <Paper sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: '12px', border: '1px solid', borderColor: 'primary.light' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <IconInfoCircle size={20} color={theme.palette.primary.main} />
                <Typography variant="subtitle2" color="primary.main" fontWeight={700}>Audit Info</Typography>
              </Stack>
              <Typography variant="caption" display="block">System ID: {formData.id || 'New'}</Typography>
              <Typography variant="caption" display="block">Status: {formData.status}</Typography>
            </Paper>

            <Paper sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: '12px', border: '1px solid', borderColor: 'info.light' }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <IconAlertCircle size={20} color={theme.palette.info.main} />
                <Typography variant="subtitle2" color="info.main" fontWeight={700}>HR SOP</Typography>
              </Stack>
              <Typography variant="caption" display="block">Grades determine the compensation hierarchy and eligibility rules for the organization.</Typography>
            </Paper>
          </Stack>
        }
      >
        <BOSFormSection icon={<IconSettings size={22} color={theme.palette.primary.main} />} title="Grade Configuration">
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            <BOSTextField
              name="gradeCode"
              label="Grade Code"
              value={formData.gradeCode}
<<<<<<< HEAD
              InputProps={{ readOnly: true }}
              sx={{ bgcolor: 'grey.50' }}
              required
              error={errors.gradeCode}
=======
              onChange={handleFormChange}
              disabled={isViewOnly}
              required
              error={errors.gradeCode}
              sx={errorStyle(errors.gradeCode)}
>>>>>>> origin/chore/repo-cleanup
            />
            <BOSTextField
              name="gradeName"
              label="Grade Name"
              value={formData.gradeName}
              onChange={handleFormChange}
              disabled={isViewOnly}
              required
              error={errors.gradeName}
              sx={errorStyle(errors.gradeName)}
            />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mt: 3 }}>
            <BOSTextField
              name="sequenceNo"
              label="Hierarchy Sequence"
              type="number"
              value={formData.sequenceNo}
              onChange={handleFormChange}
              disabled={isViewOnly}
            />
            <BOSTextField
              select
              name="status"
              label="Operational Status"
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
