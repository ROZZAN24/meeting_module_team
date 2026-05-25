import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Stack,
  Typography,
  IconButton,
  Box,
  Chip,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  IconX,
  IconCheck,
  IconEraser,
  IconFileText,
  IconCalendarEvent,
  IconReportAnalytics,
  IconEdit
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSFormSection, BOSTextField } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import { useLookups } from 'hooks/useLookups';

// ==============================|| ADD / EDIT AUDIT REPORT DIALOG ||============================== //

const EMPTY_FORM = {
  observationNo: '',
  observationDate: new Date().toISOString().split('T')[0],
  auditScheduleNo: '',
  auditType: '',
  departmentName: '',
  auditee: '',
  auditor: '',
  ncrApprovedBy: '',
  status: 'PENDING'
};

/**
 * @param {object}   initialData  – row data when editing; null/undefined for new
 * @param {boolean}  open
 * @param {function} onClose(refresh: boolean)
 */
export default function AddAuditReportDialog({ open, onClose, initialData }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { auditSchedules: schedules = [] } = useLookups(['AUDIT_SCHEDULE']);

  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Populate form each time dialog opens
  useEffect(() => {
    if (!open) return;
    if (isEditing) {
      // Edit mode – load from row data, then fetch full record for details
      setFormData({
        ...EMPTY_FORM,
        ...initialData,
        observationNo: initialData.observationNo || '',
        observationDate: initialData.observationDate || new Date().toISOString().split('T')[0],
        auditScheduleNo: initialData.auditScheduleNo || initialData.scheduleNo || '',
        auditType: typeof initialData.auditType === 'object'
          ? initialData.auditType?.name
          : (initialData.auditType || ''),
        departmentName: initialData.departmentName || '',
        auditee: initialData.auditee || '',
        auditor: initialData.auditor || '',
        ncrApprovedBy: initialData.ncrApprovedBy || '',
        status: initialData.status || 'PENDING'
      });
    } else {
      // New mode – reset and auto-generate observation no
      setFormData(EMPTY_FORM);
      generateObservationNo();
    }
  }, [open, initialData]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateObservationNo = async () => {
    try {
      const res = await axios.get(`${API_PATHS.QMS.AUDIT_OBSERVATION}/next-no`);
      setFormData(prev => ({ ...prev, observationNo: res.data || 'OB-001' }));
    } catch {
      setFormData(prev => ({ ...prev, observationNo: 'OB-001' }));
    }
  };

  const handleScheduleChange = (e) => {
    const schNo = e.target.value;
    const sch = schedules.find(s => s.scheduleNo === schNo);
    if (sch) {
      setFormData(prev => ({
        ...prev,
        auditScheduleNo: schNo,
        auditType: sch.auditType || '',
        departmentName: sch.department || '',
        auditee: sch.auditee || '',
        auditor: sch.auditor || '',
        ncrApprovedBy: sch.ncrApprovedBy || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        auditScheduleNo: schNo,
        auditType: '',
        departmentName: '',
        auditee: '',
        auditor: '',
        ncrApprovedBy: ''
      }));
    }
  };

  const handleClear = () => {
    if (isEditing) {
      // Reset to original row data
      setFormData({
        ...EMPTY_FORM,
        ...initialData,
        auditType: typeof initialData.auditType === 'object'
          ? initialData.auditType?.name
          : (initialData.auditType || ''),
        status: initialData.status || 'PENDING'
      });
    } else {
      setFormData(EMPTY_FORM);
      generateObservationNo();
    }
  };

  const handleSave = async () => {
    if (!formData.observationDate) {
      dispatch(openSnackbar({ open: true, message: 'Observation Date is required.', severity: 'error', variant: 'alert' }));
      return;
    }
    if (!formData.auditScheduleNo) {
      dispatch(openSnackbar({ open: true, message: 'Schedule No is required.', severity: 'error', variant: 'alert' }));
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await axios.put(`${API_PATHS.QMS.AUDIT_OBSERVATION}/${initialData.id}`, formData);
        dispatch(openSnackbar({ open: true, message: 'Observation updated successfully!', severity: 'success', variant: 'alert' }));
      } else {
        await axios.post(API_PATHS.QMS.AUDIT_OBSERVATION, { ...formData, details: [] });
        dispatch(openSnackbar({ open: true, message: 'Audit observation created successfully!', severity: 'success', variant: 'alert' }));
      }
      onClose(true); // true = refresh table
    } catch (e) {
      dispatch(openSnackbar({
        open: true,
        message: e?.response?.data?.message || 'Failed to save observation.',
        severity: 'error',
        variant: 'alert'
      }));
    } finally {
      setSaving(false);
    }
  };

  // Status chip color mapping
  const statusColor = formData.status === 'APPROVED' ? 'success'
    : formData.status === 'REJECTED' ? 'error'
    : 'warning';

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      {/* ── Title Bar ── */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: isEditing ? theme.palette.secondary.main : theme.palette.primary.main,
          color: '#fff',
          px: 3,
          py: 2
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {isEditing ? <IconEdit size={22} /> : <IconFileText size={22} />}
          <Typography variant="h4" fontWeight={700} color="#fff">
            {isEditing ? `Edit Observation — ${formData.observationNo}` : 'New Audit Observation'}
          </Typography>
        </Stack>
        <IconButton size="small" onClick={() => onClose(false)} sx={{ color: '#fff' }}>
          <IconX size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* ── Observation Header ── */}
          <BOSFormSection
            icon={<IconCalendarEvent size={20} color={theme.palette.primary.main} />}
            title="Observation Details"
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
                gap: 2.5
              }}
            >
              <BOSTextField
                label="Observation No"
                value={formData.observationNo}
                inputProps={{ readOnly: true }}
              />

              <BOSTextField
                required
                type="date"
                label="Observation Date"
                name="observationDate"
                value={formData.observationDate}
                onChange={(e) => setFormData(prev => ({ ...prev, observationDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />

              <BOSTextField
                required
                select
                label="Schedule No"
                name="auditScheduleNo"
                value={formData.auditScheduleNo}
                onChange={handleScheduleChange}
                disabled={isEditing} // Schedule cannot be changed in edit mode
              >
                <MenuItem value=""><em>— Select —</em></MenuItem>
                {schedules.map(s => (
                  <MenuItem key={s.id} value={s.scheduleNo}>{s.scheduleNo}</MenuItem>
                ))}
              </BOSTextField>
            </Box>
          </BOSFormSection>

          <Divider />

          {/* ── Auto-filled Schedule Info ── */}
          <BOSFormSection
            icon={<IconReportAnalytics size={20} color={theme.palette.secondary.main} />}
            title="Schedule Information (Auto-filled)"
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
                gap: 2.5
              }}
            >
              <BOSTextField
                label="Audit Type"
                value={formData.auditType}
                inputProps={{ readOnly: true }}
                helperText="Auto-filled from schedule"
              />
              <BOSTextField
                label="Department"
                value={formData.departmentName}
                inputProps={{ readOnly: true }}
                helperText="Auto-filled from schedule"
              />
              <BOSTextField
                label="Auditee"
                value={formData.auditee}
                inputProps={{ readOnly: true }}
                helperText="Auto-filled from schedule"
              />
              <BOSTextField
                label="Auditor"
                value={formData.auditor}
                inputProps={{ readOnly: true }}
                helperText="Auto-filled from schedule"
              />
              <BOSTextField
                label="NC Approved By"
                value={formData.ncrApprovedBy}
                inputProps={{ readOnly: true }}
                helperText="Auto-filled from schedule"
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Typography variant="body2" color="text.secondary">Status:</Typography>
                <Chip
                  label={formData.status}
                  size="small"
                  color={statusColor}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </Box>
          </BOSFormSection>
        </Stack>
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          justifyContent: 'space-between'
        }}
      >
        <Button
          variant="outlined"
          startIcon={<IconEraser size={18} />}
          onClick={handleClear}
          disabled={saving}
        >
          Reset
        </Button>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="inherit" onClick={() => onClose(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={isEditing ? 'secondary' : 'primary'}
            startIcon={<IconCheck size={18} />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : isEditing ? 'Update' : 'Save'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

AddAuditReportDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object  // null/undefined = new, object with id = edit
};
