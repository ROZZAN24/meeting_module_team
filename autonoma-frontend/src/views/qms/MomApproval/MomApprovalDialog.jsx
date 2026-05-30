import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Stack, Typography, Box, Grid, Divider, Button, Dialog, DialogTitle, DialogContent, DialogActions, Skeleton } from '@mui/material';
import { BOSFormDialog, BOSTextField, BOSFormSection } from 'ui-component/bos';
import { IconShieldCheck, IconX, IconPaperclip } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import { getFileViewUrl } from 'utils/upload-helper';
import useAuth from 'hooks/useAuth';

const MomApprovalDialog = ({ open, onClose, item, onAction }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectComments, setRejectComments] = useState('');

  const [loadingSample, setLoadingSample] = useState(false);
  const [sampleAttachment, setSampleAttachment] = useState(null);

  const [loadingOriginal, setLoadingOriginal] = useState(false);
  const [originalAttachments, setOriginalAttachments] = useState([]);

  useEffect(() => {
    if (open && item) {
      setRejectComments('');
      setSampleAttachment(null);
      setOriginalAttachments([]);

      const meetingMasterId = item._mom?.schedule?.meetingType?.id;
      if (meetingMasterId) {
        setLoadingSample(true);
        axios
          .get(`${API_PATHS.QMS.MEETINGS}/${meetingMasterId}`)
          .then((res) => {
            if (res.data && res.data.attachmentUrl) {
              setSampleAttachment({
                name: res.data.attachmentName || 'Sample Template',
                url: res.data.attachmentUrl
              });
            } else {
              setSampleAttachment(null);
            }
          })
          .catch((err) => {
            console.error('Failed to fetch meeting master:', err);
            setSampleAttachment(null);
          })
          .finally(() => {
            setLoadingSample(false);
          });
      } else {
        setSampleAttachment(null);
      }

      if (item._momId && item.id) {
        setLoadingOriginal(true);
        axios
          .get(`${API_PATHS.QMS.MOMS}/${item._momId}`)
          .then((res) => {
            if (res.data && res.data.details) {
              const matchedDetail = res.data.details.find((d) => d.id === item.id);
              if (matchedDetail && matchedDetail.attachmentInfo) {
                try {
                  setOriginalAttachments(JSON.parse(matchedDetail.attachmentInfo));
                } catch {
                  setOriginalAttachments([]);
                }
              } else {
                setOriginalAttachments([]);
              }
            } else {
              setOriginalAttachments([]);
            }
          })
          .catch((err) => {
            console.error('Failed to fetch transactional MOM details:', err);
            setOriginalAttachments([]);
          })
          .finally(() => {
            setLoadingOriginal(false);
          });
      } else {
        setOriginalAttachments([]);
      }
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

  const handleVerify = async () => {
    try {
      await axios.put(`${API_PATHS.QMS.MOMS}/${item._momId}/details/${item.id}/approve`, {
        status: 'APPROVED'
      });
      dispatch(openSnackbar({ open: true, message: 'MOM Approved Successfully...', variant: 'alert', severity: 'success' }));
      onAction();
    } catch {
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
    } catch {
      dispatch(openSnackbar({ open: true, message: 'Failed to reject', variant: 'alert', severity: 'error' }));
    }
  };

  if (!item) return null;

  const delayDays = getDelayDays();
  const isReadonly = item.status === 'APPROVED' || item.status === 'CLOSED' || item.status === 'REJECTED';

  // Authorization checks
  const assignedById = item?.assignedBy?.id || item?.assignedBy;
  const isAssignedByMe = Boolean(
    user &&
      assignedById &&
      (String(user.empId) === String(assignedById) ||
        String(user.id) === String(assignedById) ||
        String(user.name || '').toLowerCase() === String(item.assignedBy?.employeeName || '').toLowerCase() ||
        String(user.id || '').toLowerCase() === String(item.assignedBy?.employeeName || '').toLowerCase())
  );
  const isAdmin = Boolean(user && (user.isBosAdmin === 1 || user.id?.toLowerCase() === 'admin'));
  const showApprovalActions = Boolean(isAssignedByMe || isAdmin);

  return (
    <>
      <BOSFormDialog open={open} onClose={onClose} title="MOM Verify / Approval" maxWidth="md" hideFooter={true}>
        {/* Header Info */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            width: '100%',
            mb: 2
          }}
        >
          <Box sx={{ flex: 1.2, minWidth: 0, px: 1 }}>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
              sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              Meeting Action Number
            </Typography>
            <Typography variant="subtitle1" fontWeight={800} color="primary.main" noWrap sx={{ mt: 0.5 }}>
              {item._momNo || '-'}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed', alignSelf: 'stretch', my: 0.5 }} />
          <Box sx={{ flex: 1.1, minWidth: 0, px: 1 }}>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
              sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              Date
            </Typography>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.5 }}>
              {item._createdAt
                ? new Date(item._createdAt).toLocaleDateString('en-GB') +
                  ' ' +
                  new Date(item._createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                : '-'}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed', alignSelf: 'stretch', my: 0.5 }} />
          <Box sx={{ flex: 1, minWidth: 0, px: 1 }}>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
              sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              Assign To
            </Typography>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.5 }}>
              {item.assignedTo?.employeeName || '-'}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed', alignSelf: 'stretch', my: 0.5 }} />
          <Box sx={{ flex: 1, minWidth: 0, px: 1 }}>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
              sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              Target Date
            </Typography>
            <Typography variant="subtitle1" fontWeight={800} color="warning.dark" sx={{ mt: 0.5 }}>
              {item.targetDate || '-'}
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed', alignSelf: 'stretch', my: 0.5 }} />
          <Box sx={{ flex: 1, minWidth: 0, px: 1 }}>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
              sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}
            >
              Delay Days
            </Typography>
            <Typography variant="subtitle1" fontWeight={800} color={delayDays > 0 ? 'error.main' : 'success.main'} sx={{ mt: 0.5 }}>
              {delayDays} Days
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        <BOSFormSection title="Action Review" icon={<IconShieldCheck size={22} />}>
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
              value={item.actionTaken || ''}
              multiline
              rows={3}
              InputProps={{ readOnly: true }}
              fullWidth
              sx={{ bgcolor: 'grey.50' }}
            />
            <BOSTextField
              label="Action Observation"
              value={item.actionObservation || ''}
              multiline
              rows={3}
              InputProps={{ readOnly: true }}
              fullWidth
              sx={{ bgcolor: 'grey.50' }}
            />
          </Stack>
        </BOSFormSection>

        <BOSFormSection title="Attachments" icon={<IconPaperclip size={22} />}>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
                SAMPLE ATTACHMENT
              </Typography>
              {loadingSample ? (
                <Skeleton variant="rectangular" height={54} sx={{ borderRadius: 2 }} />
              ) : sampleAttachment ? (
                <Box
                  sx={{
                    p: 1.5,
                    border: '1px solid',
                    borderColor: 'primary.light',
                    borderRadius: 2,
                    bgcolor: 'primary.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(33, 150, 243, 0.15)',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                    <IconPaperclip size={20} style={{ color: '#2196f3' }} />
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ color: 'primary.dark' }}>
                      {sampleAttachment.name}
                    </Typography>
                  </Stack>
                  <Button
                    variant="outlined"
                    size="small"
                    href={getFileViewUrl(sampleAttachment.url)}
                    target="_blank"
                    sx={{ ml: 1, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                  >
                    View
                  </Button>
                </Box>
              ) : (
                <Box
                  sx={{ p: 1.5, border: '1px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center', bgcolor: 'grey.50' }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    No Sample Template Attached
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
                ORIGINAL ATTACHMENT
              </Typography>
              {loadingOriginal ? (
                <Skeleton variant="rectangular" height={54} sx={{ borderRadius: 2 }} />
              ) : originalAttachments.length > 0 ? (
                <Stack spacing={1}>
                  {originalAttachments.map((file, i) => (
                    <Box
                      key={file.id || i}
                      sx={{
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'success.light',
                        borderRadius: 2,
                        bgcolor: 'success.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(76, 175, 80, 0.15)',
                          borderColor: 'success.main'
                        }
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                        <IconPaperclip size={20} style={{ color: '#4caf50' }} />
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ color: 'success.dark' }}>
                          {file.fileName || 'Attachment'}
                        </Typography>
                      </Stack>
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        href={getFileViewUrl(file.serverFileName)}
                        target="_blank"
                        sx={{ ml: 1, borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
                      >
                        View
                      </Button>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Box
                  sx={{ p: 1.5, border: '1px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center', bgcolor: 'grey.50' }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    No Files Uploaded
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </BOSFormSection>

        {/* Action Buttons / Verification Status Banner */}
        {showApprovalActions && (
          <Box sx={{ mt: 2 }}>
            {!isReadonly ? (
              <Stack direction="row" spacing={2} justifyContent="flex-end">
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
            ) : (
              <Box
                sx={{
                  p: 2,
                  bgcolor: item.status === 'APPROVED' || item.status === 'CLOSED' ? 'success.lighter' : 'error.lighter',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: item.status === 'APPROVED' || item.status === 'CLOSED' ? 'success.main' : 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                {item.status === 'APPROVED' || item.status === 'CLOSED' ? (
                  <IconShieldCheck size={20} style={{ color: '#4caf50' }} />
                ) : (
                  <IconX size={20} style={{ color: '#f44336' }} />
                )}
                <Typography
                  variant="body2"
                  color={item.status === 'APPROVED' || item.status === 'CLOSED' ? 'success.dark' : 'error.dark'}
                  fontWeight={700}
                >
                  Verification Status: {item.status}{' '}
                  {item.status === 'REJECTED' && item.cancelRemarks ? `- Reason: ${item.cancelRemarks}` : ''}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </BOSFormDialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'error.lighter', borderBottom: '2px solid', borderColor: 'error.main' }}>Reject MOM Action</DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <BOSTextField
              label="Rejection Comments *"
              value={rejectComments}
              onChange={(e) => setRejectComments(e.target.value)}
              multiline
              rows={4}
              fullWidth
              placeholder="Please enter rejection reason..."
              inputProps={{ maxLength: 1000 }}
            />
            <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Upload rejection documents (optional)
              </Typography>
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
