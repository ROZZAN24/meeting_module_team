import React, { useState, useEffect } from 'react';
import {
  MenuItem,
  Stack,
  Box,
  Typography,
  Chip,
  Button,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  IconUser, 
  IconCalendar, 
  IconChecks, 
  IconFileText, 
  IconStatusChange,
  IconMessageDots,
  IconCloudUpload,
  IconBan,
  IconDeviceFloppy
} from '@tabler/icons-react';
import { 
  BOSFormDialog, 
  BOSFormSection, 
  BOSTextField, 
  getStatusChipSx,
  BOSFileGallery 
} from 'ui-component/bos';

/**
 * ExecutionVerifyDialog - Standardized BOS Template for Verification & Execution
 * Handles:
 * 1. Master Template verification (Admin)
 * 2. Assignment Execution verification (Auditor)
 * 3. Assignment Execution reporting (Executor - Editable mode)
 */
const ExecutionVerifyDialog = ({ open, handleClose, data, onVerify, onReject, onNotAccept, onSave, isExecution = false }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    status: '',
    remarks: '',
    actualFiles: []
  });
  const [verifyRemarks, setVerifyRemarks] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState('');

  useEffect(() => {
    if (data) {
      let currentStatus = '';
      if (typeof data.status === 'object' && data.status !== null) {
        currentStatus = data.status.name;
      } else {
        currentStatus = data.status || '';
      }

      setFormData({
        status: currentStatus,
        remarks: data.remarks || '',
        actualFiles: (data.actualFiles || []).map(f => {
          if (typeof f === 'string') {
            const [name, ...detailsParts] = f.split('|');
            const details = detailsParts.join('|');
            // IMPORTANT: serverFileName must be ONLY the filename for the API to work
            return { 
              name: name, 
              docDetails: details || '', 
              isServer: true, 
              serverFileName: name 
            };
          }
          return f;
        })
      });
      setVerifyRemarks('');
      setRejectOpen(false);
      setRejectComment('');
    }
  }, [data, open]);

  const handleClear = () => {
    setFormData({
      status: '',
      remarks: '',
      actualFiles: []
    });
  };

  if (!data) return null;

  // Assignments have a nested checklist object, Master records don't
  const isAssignment = !!data.checklist;
  const master = isAssignment ? data.checklist : data;

  const statusRaw = data.status;
  const statusText = (typeof statusRaw === 'object' ? statusRaw?.name : statusRaw) || 
                     (typeof master.status === 'object' ? master.status?.name : master.status) || 'Pending';

  // Helper for status chip
  let chipStatus = 'PENDING';
  if (statusText === 'Verified' || statusText === 'Accepted' || statusText === 'COMPLETED') chipStatus = 'ACTIVE';
  if (statusText === 'Rejected' || statusText === 'Missed' || statusText === 'NOT COMPLETED') chipStatus = 'INACTIVE';

  const EXECUTION_STATUSES = ['-Select-', 'Started', '25%', '50%', '75%', 'Completed'];

  // Helper to convert filename|details strings to BOS file objects
  const parseFile = (f) => {
    if (typeof f === 'string') {
      const [name, ...detailsParts] = f.split('|');
      const details = detailsParts.join('|');
      return { 
        name: name, 
        docDetails: details || '', 
        isServer: true, 
        serverFileName: name 
      };
    }
    return f;
  };

  return (
    <BOSFormDialog
      open={open}
      onClose={handleClose}
      onSave={isExecution ? () => {
        if (formData.status === 'Completed' && master.photoRequired === 'YES' && formData.actualFiles.length === 0) {
          alert('Photo is mandatory for this checklist item before completion.');
          return;
        }
        onSave({ ...formData });
      } : null}
      onClear={isExecution ? handleClear : null}
      title={isExecution ? `Update Progress - ${master.seqNo}` : (isAssignment ? `Verify Execution - ${master.seqNo}` : `Verify Master Record - ${master.seqNo}`)}
      maxWidth="lg"
      isViewOnly={!isExecution}
      secondaryActions={
        (onVerify || onReject) && (
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setRejectComment('');
                setRejectOpen(true);
              }}
              startIcon={<IconBan size={20} />}
              sx={{ borderRadius: '8px', fontWeight: 600 }}
            >
              Reject
            </Button>
            {onNotAccept && (
              <Button
                variant="contained"
                color="warning"
                onClick={() => onNotAccept(verifyRemarks)}
                sx={{ borderRadius: '8px', fontWeight: 600 }}
              >
                Not Accepted
              </Button>
            )}
            <Button
              variant="contained"
              color="success"
              onClick={() => onVerify(verifyRemarks)}
              startIcon={<IconChecks size={20} />}
              sx={{ borderRadius: '8px', fontWeight: 600 }}
            >
              Verify
            </Button>
          </Stack>
        )
      }
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Left Column: Core Data */}
        <Stack spacing={3}>
          <BOSFormSection title="Assignment Header" icon={<IconUser size={20} color={theme.palette.primary.main} />}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5, mb: 2 }}>
              <BOSTextField label="Assign To" value={data.assignedTo || master.assignTo || 'N/A'} disabled />
              <BOSTextField label="Date" value={data.checklistDate ? new Date(data.checklistDate).toLocaleDateString() : 'N/A'} disabled />
              <BOSTextField label="Assign Type" value={data.assignType || 'PRIMARY'} disabled />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
              <BOSTextField label="Frequency" value={master.frequency || '-'} disabled />
              <BOSTextField label="Seq No" value={master.seqNo} disabled />
              <BOSTextField label="Dual Check" value={master.dualCheck || 'NO'} disabled />
            </Box>
            {master.stockLink === 'YES' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5, mt: 2.5 }}>
                <BOSTextField label="Item Code" value={master.itemCode || '-'} disabled />
                <BOSTextField label="Qty" value={master.qty || '-'} disabled />
              </Box>
            )}
          </BOSFormSection>

          <BOSFormSection title="Task Details" icon={<IconFileText size={20} color={theme.palette.success.main} />}>
            <Stack spacing={2.5}>
              <BOSTextField label="Checking Point" value={master.checkingPoint || '-'} multiline rows={2} disabled />
              <BOSTextField label="Description / SOP" value={master.description || '-'} multiline rows={4} disabled />
            </Stack>
          </BOSFormSection>

          <BOSFormSection title={isExecution ? "Execution Update" : "Status & Feedback"} icon={<IconStatusChange size={20} color={theme.palette.warning.main} />}>
            <Stack spacing={2.5}>
              {!isExecution && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>Status:</Typography>
                  <Chip label={statusText} sx={getStatusChipSx(chipStatus)} />
                </Box>
              )}
              
              {isExecution ? (
                <>
                  {data.remarks && (
                    <BOSTextField 
                      label="Previous Remarks / Manager Feedback" 
                      value={data.remarks} 
                      multiline 
                      rows={3} 
                      disabled 
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fff8f0' } }}
                    />
                  )}
                  <BOSTextField 
                    select 
                    label="Status" 
                    value={
                      (formData.status === 'Pending for Verified' || 
                       formData.status === 'Rejected' ||
                       formData.status === 'Pending' ||
                       formData.status === 'Started')
                        ? (formData.status === 'Started' ? 'Started' : 'Completed')
                        : formData.status
                    } 
                    onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                    required
                  >
                    {EXECUTION_STATUSES.map(s => <MenuItem key={s} value={s === '-Select-' ? '' : s}>{s}</MenuItem>)}
                  </BOSTextField>
                  <BOSTextField 
                    label="Execution Comments" 
                    value={formData.remarks} 
                    onChange={(e) => setFormData(p => ({ ...p, remarks: e.target.value }))}
                    multiline 
                    rows={3} 
                    placeholder="Describe your progress..."
                  />
                </>
              ) : (
                <>
                  <BOSTextField 
                    label="Execution Comments" 
                    value={data.remarks || 'No comments provided.'} 
                    multiline 
                    rows={2} 
                    disabled 
                  />
                  {!isExecution && (formData.status?.name === 'Pending for Verified' || formData.status === 'Pending for Verified' || formData.status?.name === 'Completed' || formData.status === 'Completed') && (
                    <BOSTextField 
                      label="Verification Remarks" 
                      value={verifyRemarks} 
                      onChange={(e) => setVerifyRemarks(e.target.value)}
                      multiline 
                      rows={2} 
                      placeholder="Enter verification comments..."
                    />
                  )}
                </>
              )}
              
              {data.rejReason && (
                <BOSTextField 
                  label="Rejection Comments" 
                  value={data.rejReason} 
                  multiline 
                  rows={2} 
                  disabled 
                  color="error"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'error.lighter' } }}
                />
              )}
            </Stack>
          </BOSFormSection>
        </Stack>

        {/* Right Column: Attachments */}
        <Stack spacing={3}>
          <BOSFormSection title="Samples (Template)" icon={<IconCloudUpload size={20} color={theme.palette.secondary.main} />}>
             <BOSFileGallery 
               files={(master.uploadedFiles || []).map(parseFile)} 
               isEditing={false}
               title="SAMPLES"
             />
          </BOSFormSection>

          <BOSFormSection title="Actual Proof (Execution)" icon={<IconCloudUpload size={20} color={theme.palette.primary.main} />}>
             {isExecution && (
               <Box sx={{ mb: 2 }}>
                 <Button 
                   component="label" 
                   variant="contained" 
                   fullWidth
                   startIcon={<IconCloudUpload size={18} />} 
                   sx={{ height: 45, borderRadius: 2 }}
                 >
                   Upload Document
                   <input 
                     type="file" 
                     hidden 
                     onChange={(e) => {
                       const file = e.target.files[0];
                       if (file) {
                         const fileEntry = {
                           name: file.name,
                           docDetails: 'N/A',
                           file: file,
                           isServer: false
                         };
                         setFormData(prev => ({
                           ...prev,
                           actualFiles: [...prev.actualFiles, fileEntry]
                         }));
                       }
                       e.target.value = '';
                     }} 
                   />
                 </Button>
               </Box>
             )}
             <BOSFileGallery 
               files={(formData.actualFiles || []).map(parseFile)} 
               isEditing={isExecution}
               onRemove={isExecution ? (idx) => {
                 setFormData(prev => ({
                   ...prev,
                   actualFiles: prev.actualFiles.filter((_, i) => i !== idx)
                 }));
               } : null}
               title="ACTUAL"
             />
          </BOSFormSection>
        </Stack>
      </Box>

      {/* MANDATORY REJECTION COMMENTS POPUP */}
      <Dialog 
        open={rejectOpen} 
        onClose={() => setRejectOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: 1400 }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: theme.palette.error.light, color: theme.palette.error.dark }}>
          <IconBan size={24} />
          <Typography component="span" variant="h3" color="inherit">Reject Checklist - {master.seqNo}</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: '24px !important' }}>
          <Stack spacing={2.5}>
            <Typography variant="body1" color="text.secondary">
              Please enter a comment explaining the reason for rejecting this checklist item. Comments are mandatory to reject.
            </Typography>
            <BOSTextField
              label="Rejection Comments"
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              multiline
              rows={4}
              placeholder="Provide detailed rejection feedback here..."
              required
              error={!rejectComment.trim()}
              helperText={!rejectComment.trim() ? "Comment is required to proceed with rejection." : ""}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setRejectOpen(false)} variant="outlined" color="primary" sx={{ borderRadius: '8px', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (rejectComment.trim()) {
                onReject(rejectComment.trim());
                setRejectOpen(false);
              }
            }} 
            variant="contained" 
            color="error" 
            disabled={!rejectComment.trim()}
            sx={{ borderRadius: '8px', fontWeight: 600 }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </BOSFormDialog>
  );
};

export default ExecutionVerifyDialog;
