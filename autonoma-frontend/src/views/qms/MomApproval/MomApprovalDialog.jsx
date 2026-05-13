import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Stack, Typography, Box, Grid, Divider, Button,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { BOSFormDialog, BOSTextField, BOSFormSection } from 'ui-component/bos';
import { IconShieldCheck, IconX, IconPaperclip } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';

const MomApprovalDialog = ({ open, onClose, item, onAction }) => {
  const dispatch = useDispatch();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectComments, setRejectComments] = useState('');

  useEffect(() => {
    if (open) {
      setRejectComments('');
    }
  }, [open]);

  // Calculate delay days
  const getDelayDays = () => {
    if (!item?.targetDate) return 0;
    const target = new Date(item.targetDate);
    const now = new Date();
    const diff = Math.floor((now - target) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleVerify = async () => {
    try {
      await axios.put(`${API_PATHS.QMS.MOMS}/${item._momId}/details/${item.id}/approve`, {
        status: 'APPROVED'
      });
      dispatch(openSnackbar({ open: true, message: 'MOM Approved Successfully...', variant: 'alert', severity: 'success' }));
      onAction();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to approve', variant: 'alert', severity: 'error' }));
    }
  };

  const handleReject = async () => {
    if (!rejectComments.trim()) {
      dispatch(openSnackbar({ open: true, message: 'Please Enter the Rejection Comments...', variant: 'alert', severity: 'warning' }));
      return;
    }
    try {
      await axios.put(`${API_PATHS.QMS.MOMS}/${item._momId}/details/${item.id}/reject`, {
        status: 'REJECTED',
        comments: rejectComments.toUpperCase()
      });
      dispatch(openSnackbar({ open: true, message: 'MOM Rejected...', variant: 'alert', severity: 'warning' }));
      setRejectDialogOpen(false);
      onAction();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to reject', variant: 'alert', severity: 'error' }));
    }
  };

  if (!item) return null;

  const delayDays = getDelayDays();
  const isReadonly = item.status === 'APPROVED' || item.status === 'CLOSED' || item.status === 'REJECTED';

  return (
    <>
      <BOSFormDialog
        open={open}
        onClose={onClose}
        title="MOM Verify / Approval"
        maxWidth="md"
        hideFooter={true}
      >
        {/* Header Info */}
        <Box sx={{ p: 2, bgcolor: 'primary.lighter', borderRadius: 2, border: '1px solid', borderColor: 'primary.light' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="text.secondary">Meeting Action No</Typography>
              <Typography variant="subtitle1" fontWeight={700}>{item._momNo || '-'}</Typography>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="caption" color="text.secondary">Date</Typography>
              <Typography variant="subtitle1" fontWeight={700}>
                {item._createdAt ? new Date(item._createdAt).toLocaleDateString('en-GB') + ' ' + new Date(item._createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '-'}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="caption" color="text.secondary">Assign To</Typography>
              <Typography variant="subtitle1" fontWeight={700}>{item.assignedTo?.employeeName || '-'}</Typography>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="caption" color="text.secondary">Target Date</Typography>
              <Typography variant="subtitle1" fontWeight={700}>{item.targetDate || '-'}</Typography>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Typography variant="caption" color="text.secondary">Delay Days</Typography>
              <Typography variant="subtitle1" fontWeight={700} color={delayDays > 0 ? 'error.main' : 'success.main'}>
                {delayDays}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 1 }} />

        <BOSFormSection title="Action Review" icon={<IconShieldCheck size={22} />}>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <BOSTextField
              label="Discussed Point"
              value={item.discussedPoint || ''}
              multiline rows={4}
              InputProps={{ readOnly: true }}
              fullWidth
              sx={{ bgcolor: 'grey.50' }}
            />
            <BOSTextField
              label="Action Taken"
              value={item.actionTaken || ''}
              multiline rows={3}
              InputProps={{ readOnly: true }}
              fullWidth
              sx={{ bgcolor: 'grey.50' }}
            />
            <BOSTextField
              label="Action Observation"
              value={item.actionObservation || ''}
              multiline rows={3}
              InputProps={{ readOnly: true }}
              fullWidth
              sx={{ bgcolor: 'grey.50' }}
            />
          </Stack>
        </BOSFormSection>

        <BOSFormSection title="Attachments" icon={<IconPaperclip size={22} />}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>SAMPLES</Typography>
              <Typography variant="body2" color="text.secondary">No attachments</Typography>
            </Box>
            <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>ACTUAL</Typography>
              <Typography variant="body2" color="text.secondary">No attachments</Typography>
            </Box>
          </Stack>
        </BOSFormSection>

        {/* Action Buttons */}
        {!isReadonly && (
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => setRejectDialogOpen(true)}
              startIcon={<IconX size={18} />}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleVerify}
              startIcon={<IconShieldCheck size={18} />}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
              Verify
            </Button>
          </Stack>
        )}
      </BOSFormDialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'error.lighter', borderBottom: '2px solid', borderColor: 'error.main' }}>
          Reject MOM Action
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <BOSTextField
              label="Rejection Comments *"
              value={rejectComments}
              onChange={(e) => setRejectComments(e.target.value)}
              multiline rows={4}
              fullWidth
              placeholder="Please enter rejection reason..."
              inputProps={{ maxLength: 1000 }}
            />
            <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Upload rejection documents (optional)</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleReject} disabled={!rejectComments.trim()}>
            Confirm Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

MomApprovalDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.object,
  onAction: PropTypes.func.isRequired
};

export default MomApprovalDialog;
