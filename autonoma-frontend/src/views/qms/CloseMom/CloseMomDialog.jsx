import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Stack, Typography, Box, Grid, Divider } from '@mui/material';
import { BOSFormDialog, BOSTextField, BOSFormSection } from 'ui-component/bos';
import { IconCircleCheck, IconPaperclip } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
<<<<<<< HEAD
import useAuth from 'hooks/useAuth';

const CloseMomDialog = ({ open, onClose, item, onSave }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
=======

const CloseMomDialog = ({ open, onClose, item, onSave }) => {
  const dispatch = useDispatch();
>>>>>>> origin/chore/repo-cleanup
  const [actionTaken, setActionTaken] = useState('');
  const [actionObservation, setActionObservation] = useState('');
  const [isEditable, setIsEditable] = useState(true);

  useEffect(() => {
    if (open && item) {
      setActionTaken('');
      setActionObservation('');
      // Editable only for OPEN, REJECTED, CREATED statuses
      const editableStatuses = ['OPEN', 'REJECTED', 'CREATED', 'UNRESOLVED'];
      setIsEditable(editableStatuses.includes(item.status));
    }
  }, [open, item]);

  // Calculate delay days
  const getDelayDays = () => {
    if (!item?.targetDate) return 0;
    const target = new Date(item.targetDate);
    const now = new Date();
    const diff = Math.floor((now - target) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleSave = async () => {
    if (!actionTaken.trim()) {
      dispatch(openSnackbar({ open: true, message: 'Please enter Action Taken', variant: 'alert', severity: 'warning' }));
      return;
    }
    try {
      await axios.put(`${API_PATHS.QMS.MOMS}/${item._momId}/details/${item.id}/close`, {
        actionTaken: actionTaken.toUpperCase(),
        actionObservation: actionObservation.toUpperCase(),
        status: 'PENDING FOR APPROVAL'
      });
      dispatch(openSnackbar({ open: true, message: 'Action submitted for approval', variant: 'alert', severity: 'success' }));
      onSave();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save action', variant: 'alert', severity: 'error' }));
    }
  };

  if (!item) return null;

  const delayDays = getDelayDays();
<<<<<<< HEAD
  const isAssignedToMe = user && item && (user.name === (item.assignedTo?.employeeName || item.assignedTo));
=======
>>>>>>> origin/chore/repo-cleanup

  return (
    <BOSFormDialog
      open={open}
      onClose={onClose}
<<<<<<< HEAD
      onSave={isEditable && isAssignedToMe ? handleSave : undefined}
=======
      onSave={isEditable ? handleSave : undefined}
>>>>>>> origin/chore/repo-cleanup
      title="Close MOM Action"
      maxWidth="md"
      isViewOnly={!isEditable}
      onEditClick={() => setIsEditable(true)}
    >
      {/* Header Info */}
      <Box sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 2, border: '1px solid', borderColor: 'primary.light' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" color="text.secondary">Meeting Action No</Typography>
            <Typography variant="subtitle1" fontWeight={700}>{item._momNo || '-'}</Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="caption" color="text.secondary">MOM Date</Typography>
            <Typography variant="subtitle1" fontWeight={700}>{item._momDate || '-'}</Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="caption" color="text.secondary">Assign By</Typography>
            <Typography variant="subtitle1" fontWeight={700}>{item.assignedBy?.employeeName || '-'}</Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="caption" color="text.secondary">Target Date</Typography>
            <Typography variant="subtitle1" fontWeight={700}>{item.targetDate || '-'}</Typography>
          </Grid>
          <Grid item xs={6} sm={2}>
            <Typography variant="caption" color="text.secondary">Delay Days</Typography>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              color={delayDays > 0 ? 'error.main' : 'success.main'}
            >
              {delayDays}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 1 }} />

<<<<<<< HEAD
      {!isAssignedToMe && item && isEditable && (
        <Box sx={{ p: 1.5, bgcolor: 'error.lighter', borderRadius: 2, border: '1px solid', borderColor: 'error.main', mb: 2 }}>
          <Typography variant="body2" color="error.dark" fontWeight={700}>
            🚨 Access Restricted: This action is assigned to <b>{item.assignedTo?.employeeName || item.assignedTo}</b>. Only they can submit for closure.
          </Typography>
        </Box>
      )}

=======
>>>>>>> origin/chore/repo-cleanup
      <BOSFormSection title="Action Details" icon={<IconCircleCheck size={22} />}>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <BOSTextField
            label="Discussed Point"
            value={item.discussedPoint || ''}
            multiline
            rows={4}
            InputProps={{ readOnly: true }}
            fullWidth
            sx={{ bgcolor: 'grey.50' }}
          />

          <BOSTextField
            label="Action Taken"
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value.toUpperCase())}
            multiline
            rows={3}
            fullWidth
            required
            InputProps={{ readOnly: !isEditable }}
            sx={!isEditable ? { bgcolor: 'grey.50' } : {}}
          />

          <BOSTextField
            label="Action Observation"
            value={actionObservation}
            onChange={(e) => setActionObservation(e.target.value.toUpperCase())}
            multiline
            rows={3}
            fullWidth
            InputProps={{ readOnly: !isEditable }}
            sx={!isEditable ? { bgcolor: 'grey.50' } : {}}
          />

          <BOSTextField
            label="Status"
            value={item.status || 'OPEN'}
            InputProps={{ readOnly: true }}
            fullWidth
            sx={{
              bgcolor: item.status === 'OPEN' ? 'warning.lighter' : item.status === 'CLOSED' ? 'success.lighter' : 'grey.50',
              '& .MuiInputBase-input': { fontWeight: 700 }
            }}
          />

          {item.status === 'REJECTED' && item.cancelRemarks && (
            <BOSTextField
              label="Rejection Comments"
              value={item.cancelRemarks || ''}
              multiline
              rows={2}
              InputProps={{ readOnly: true }}
              fullWidth
              sx={{ bgcolor: 'error.lighter' }}
            />
          )}
        </Stack>
      </BOSFormSection>

      <BOSFormSection title="Attachments" icon={<IconPaperclip size={22} />}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Samples & Documents section — Upload corrective action files here
            </Typography>
          </Box>
        </Stack>
      </BOSFormSection>
    </BOSFormDialog>
  );
};

CloseMomDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.object,
  onSave: PropTypes.func.isRequired
};

export default CloseMomDialog;
