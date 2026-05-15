import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Stack, Box, Typography, Grid, MenuItem, Button, Tooltip } from '@mui/material';
import { BOSFormDialog, BOSTextField, BOSFormSection } from 'ui-component/bos';
import { IconChecklist, IconClock, IconMessageReport } from '@tabler/icons-react';
import useBOSValidation from 'hooks/useBOSValidation';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import useAuth from 'hooks/useAuth';

const INITIAL_FORM = {
  actionTaken: '',
  actionObservation: '',
  cancelRemarks: '' // For rejection
};

const MomActionClosureDialog = ({ open, item, onClose, onSave }) => {
  const dispatch = useDispatch();
  const { errors, validate, clearErrors } = useBOSValidation();
  const { user } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  // Derive delay days based on SOP
  const getDelayDays = () => {
    if (!item || !item.targetDate) return 0;
    const target = new Date(item.targetDate).getTime();
    // In a real app, if status is PENDING FOR APPROVAL, compare with approval date instead of today.
    // Assuming today for open actions.
    const now = new Date().getTime();
    const diff = now - target;
    if (diff <= 0) return 0;
    return Math.floor(diff / (1000 * 3600 * 24));
  };

  const delayDays = getDelayDays();
  const isReadonly = item && !['OPEN', 'REJECTED', 'CREATED'].includes(item.status);
  const isAssignedToMe = user && item && user.name === item.assignedTo;

  useEffect(() => {
    if (open) {
      if (item) {
        setForm({
          actionTaken: item.actionTaken || '',
          actionObservation: item.actionObservation || '',
          cancelRemarks: item.cancelRemarks || ''
        });
      } else {
        setForm(INITIAL_FORM);
      }
      clearErrors();
    }
  }, [open, item, clearErrors]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value.toUpperCase() });

  const handleAction = async (actionType) => {
    // Basic validation
    if (actionType === 'CLOSE') {
      if (!form.actionTaken) {
        dispatch(openSnackbar({ open: true, message: 'Action Taken is mandatory to submit for closure.', variant: 'alert', severity: 'error' }));
        return;
      }
      // If SOP says Attachment Req = YES, validate file upload here. 
      // (File upload UI omitted for brevity, but logic goes here).
    }

    if (actionType === 'REJECT') {
      if (!form.cancelRemarks) {
        dispatch(openSnackbar({ open: true, message: 'Rejection comments are mandatory.', variant: 'alert', severity: 'error' }));
        return;
      }
    }

    setLoading(true);
    try {
      let endpoint = '';
      const payload = { ...form };

      if (actionType === 'CLOSE') endpoint = `${API_PATHS.QMS.MOMS}/${item.momId}/details/${item.id}/close`;
      if (actionType === 'APPROVE') endpoint = `${API_PATHS.QMS.MOMS}/${item.momId}/details/${item.id}/approve`;
      if (actionType === 'REJECT') {
        endpoint = `${API_PATHS.QMS.MOMS}/${item.momId}/details/${item.id}/reject`;
        payload.comments = form.cancelRemarks;
      }

      await axios.put(endpoint, payload);
      dispatch(openSnackbar({ open: true, message: `Action ${actionType} successful.`, variant: 'alert', severity: 'success' }));
      onSave();
    } catch (error) {
      console.error(error);
      dispatch(openSnackbar({ open: true, message: `Failed to perform ${actionType}`, variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const renderCustomActions = () => {
    if (!item) return null;
    return (
      <Stack direction="row" spacing={1.5}>
        {['OPEN', 'REJECTED'].includes(item.status) && (
          <Tooltip title={!isAssignedToMe ? `This action is assigned to ${item.assignedTo}. Only they can submit for closure.` : ''}>
            <span>
              <Button variant="contained" color="secondary" onClick={() => handleAction('CLOSE')} disabled={loading || !isAssignedToMe}>
                Submit For Closure
              </Button>
            </span>
          </Tooltip>
        )}
        {item.status === 'PENDING FOR APPROVAL' && (
          <>
            <Button variant="contained" color="error" onClick={() => handleAction('REJECT')} disabled={loading}>
              Reject
            </Button>
            <Button variant="contained" color="success" onClick={() => handleAction('APPROVE')} disabled={loading}>
              Approve & Close
            </Button>
          </>
        )}
      </Stack>
    );
  };

  return (
    <BOSFormDialog
      open={open}
      onClose={onClose}
      title="Action Details"
      maxWidth="md"
      hideSaveButton // We use custom action buttons
      customActions={renderCustomActions()}
    >
      <Stack spacing={4}>
        {!isAssignedToMe && item && ['OPEN', 'REJECTED'].includes(item.status) && (
          <Box sx={{ p: 1.5, bgcolor: 'error.lighter', borderRadius: 2, border: '1px solid', borderColor: 'error.main' }}>
            <Typography variant="body2" color="error.dark" fontWeight={700}>
              🚨 Access Restricted: This action is assigned to <b>{item.assignedTo}</b>. Only they can submit for closure.
            </Typography>
          </Box>
        )}
        {/* HEADER */}
        <Grid container spacing={2} sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 2, border: '1px solid', borderColor: 'primary.light' }}>
          <Grid item xs={3}>
            <Typography variant="caption" color="text.secondary">Meeting Action Number</Typography>
            <Typography variant="subtitle1" fontWeight={800} color="primary.main">{item?.momNo}</Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="caption" color="text.secondary">MOM Date</Typography>
            <Typography variant="subtitle1" fontWeight={800}>{item?.momDate}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="caption" color="text.secondary">Assign By</Typography>
            <Typography variant="subtitle1" fontWeight={800}>{item?.assignedBy || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="caption" color="text.secondary">Target Date</Typography>
            <Typography variant="subtitle1" fontWeight={800}>{item?.targetDate || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography variant="caption" color="text.secondary">Delay Days</Typography>
            <Typography variant="subtitle1" fontWeight={800} color={delayDays > 0 ? 'error.main' : 'success.main'}>
              {delayDays} Days
            </Typography>
          </Grid>
        </Grid>

        {/* DETAILS SECTION */}
        <BOSFormSection title="1. Action Details" icon={<IconChecklist size={22} />}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <BOSTextField
              label="Discussed Point"
              value={item?.discussedPoint || ''}
              multiline rows={2}
              InputProps={{ readOnly: true }}
              sx={{ bgcolor: 'grey.50' }}
            />
            
            <BOSTextField
              label="Action Taken *"
              name="actionTaken"
              value={form.actionTaken}
              onChange={handleChange}
              multiline rows={3}
              disabled={isReadonly}
              required
            />

            <BOSTextField
              label="Action Observation"
              name="actionObservation"
              value={form.actionObservation}
              onChange={handleChange}
              multiline rows={2}
              disabled={isReadonly}
            />

            <Stack direction="row" spacing={2}>
              <BOSTextField
                label="Status"
                value={item?.status || ''}
                InputProps={{ readOnly: true }}
                sx={{ 
                  bgcolor: item?.status === 'OPEN' ? 'error.lighter' : 'grey.50',
                  '& .MuiInputBase-input': { fontWeight: 800, color: item?.status === 'OPEN' ? 'error.dark' : 'inherit' }
                }}
              />
            </Stack>

            {item?.status === 'REJECTED' && (
              <BOSTextField
                label="Rejection Comments"
                name="cancelRemarks"
                value={form.cancelRemarks}
                onChange={handleChange}
                multiline rows={2}
                InputProps={{ readOnly: item?.status !== 'PENDING FOR APPROVAL' }} // Approver enters it during reject action
                sx={{ bgcolor: 'warning.lighter', '& .MuiInputBase-input': { fontWeight: 800, color: 'warning.dark' } }}
              />
            )}
            
            {/* If approver is rejecting, they need a place to enter comments */}
            {item?.status === 'PENDING FOR APPROVAL' && (
              <BOSTextField
                label="Approver Rejection Comments (Fill only if Rejecting)"
                name="cancelRemarks"
                value={form.cancelRemarks}
                onChange={handleChange}
                multiline rows={2}
              />
            )}
          </Stack>
        </BOSFormSection>
      </Stack>
    </BOSFormDialog>
  );
};

MomActionClosureDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  item: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default MomActionClosureDialog;
