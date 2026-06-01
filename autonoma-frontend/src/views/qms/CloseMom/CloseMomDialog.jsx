import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Stack, Typography, Box, Divider } from '@mui/material';
import { BOSFormDialog, BOSTextField, BOSFormSection, BOSFileUpload } from 'ui-component/bos';
import { IconCircleCheck, IconPaperclip } from '@tabler/icons-react';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import useAuth from 'hooks/useAuth';

const CloseMomDialog = ({ open, onClose, item, onSave }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [actionTaken, setActionTaken] = useState('');
  const [actionObservation, setActionObservation] = useState('');
  const [isEditable, setIsEditable] = useState(true);
  const [isAttachmentRequired, setIsAttachmentRequired] = useState(false);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (open && item) {
      setActionTaken(item.actionTaken || '');
      setActionObservation(item.actionObservation || '');
      // Editable only for OPEN, REJECTED, CREATED statuses
      const editableStatuses = ['OPEN', 'REJECTED', 'CREATED', 'UNRESOLVED'];
      setIsEditable(editableStatuses.includes(item.status));
      setIsAttachmentRequired(item.attachmentRequired === 'YES');

      if (item.attachmentInfo) {
        try {
          setAttachments(JSON.parse(item.attachmentInfo));
        } catch {
          setAttachments([]);
        }
      } else {
        setAttachments([]);
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

  const handleSave = async () => {
    if (!actionTaken.trim()) {
      dispatch(openSnackbar({ open: true, message: 'Please enter Action Taken', variant: 'alert', severity: 'warning' }));
      return;
    }
    try {
      await axios.put(`${API_PATHS.QMS.MOMS}/${item._momId}/details/${item.id}/close`, {
        actionTaken: actionTaken.toUpperCase(),
        actionObservation: actionObservation.toUpperCase(),
        status: 'PENDING FOR APPROVAL',
        attachmentInfo: JSON.stringify(attachments.map(att => ({
          id: att.id,
          fileName: att.fileName,
          fileType: att.fileType || 'FILE',
          serverFileName: att.serverFileName,
          docDetails: att.docDetails || ''
        })))
      });
      dispatch(openSnackbar({ open: true, message: 'Action submitted for approval', variant: 'alert', severity: 'success' }));
      onSave();
    } catch {
      dispatch(openSnackbar({ open: true, message: 'Failed to save action', variant: 'alert', severity: 'error' }));
    }
  };

  if (!item) return null;

  const delayDays = getDelayDays();
  const isAssignedToMe = user && item && (user.name === (item.assignedTo?.employeeName || item.assignedTo));

  return (
    <BOSFormDialog
      open={open}
      onClose={onClose}
      onSave={isEditable && isAssignedToMe ? handleSave : undefined}
      title="Close MOM Action"
      maxWidth="md"
      isViewOnly={!isEditable}
      onEditClick={() => setIsEditable(true)}
    >
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
          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Meeting Action Number
          </Typography>
          <Typography variant="subtitle1" fontWeight={800} color="primary.main" noWrap sx={{ mt: 0.5 }}>
            {item._momNo || '-'}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed', alignSelf: 'stretch', my: 0.5 }} />
        <Box sx={{ flex: 1, minWidth: 0, px: 1 }}>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            MOM Date
          </Typography>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.5 }}>
            {item._momDate || '-'}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed', alignSelf: 'stretch', my: 0.5 }} />
        <Box sx={{ flex: 1, minWidth: 0, px: 1 }}>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Assign By
          </Typography>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mt: 0.5 }}>
            {item.assignedBy?.employeeName || '-'}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed', alignSelf: 'stretch', my: 0.5 }} />
        <Box sx={{ flex: 1, minWidth: 0, px: 1 }}>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Target Date
          </Typography>
          <Typography variant="subtitle1" fontWeight={800} color="warning.dark" sx={{ mt: 0.5 }}>
            {item.targetDate || '-'}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed', alignSelf: 'stretch', my: 0.5 }} />
        <Box sx={{ flex: 1, minWidth: 0, px: 1 }}>
          <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Delay Days
          </Typography>
          <Typography 
            variant="subtitle1" 
            fontWeight={800} 
            color={delayDays > 0 ? 'error.main' : 'success.main'}
            sx={{ mt: 0.5 }}
          >
            {delayDays} Days
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {!isAssignedToMe && item && isEditable && (
        <Box sx={{ p: 1.5, bgcolor: 'error.lighter', borderRadius: 2, border: '1px solid', borderColor: 'error.main', mb: 2 }}>
          <Typography variant="body2" color="error.dark" fontWeight={700}>
            🚨 Access Restricted: This action is assigned to <b>{item.assignedTo?.employeeName || item.assignedTo}</b>. Only they can submit for closure.
          </Typography>
        </Box>
      )}

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

      {isAttachmentRequired && (
        <BOSFormSection title="Attachments" icon={<IconPaperclip size={22} />}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <BOSFileUpload
              files={attachments}
              onChange={setAttachments}
              module="QMS"
              multiple={true}
              disabled={!isEditable}
            />
          </Stack>
        </BOSFormSection>
      )}
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
