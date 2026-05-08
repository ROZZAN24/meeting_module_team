import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Divider,
  Box,
  Stack,
  Chip
} from '@mui/material';
import { IconFileDescription, IconUser, IconCalendar, IconInfoCircle, IconChecks } from '@tabler/icons-react';
import { BOSFileGallery, getStatusChipSx } from 'ui-component/bos';

const ExecutionVerifyDialog = ({ open, handleClose, data, onVerify, onReject }) => {
  if (!data) return null;

  // Assignments have a nested checklist object, Master records don't
  const isAssignment = !!data.checklist;
  const master = isAssignment ? data.checklist : data;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconChecks size={24} />
          <Typography variant="h4" color="inherit">
            {isAssignment ? 'Verify Execution' : 'Verify Master Record'}
          </Typography>
        </Stack>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {/* Header Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="textSecondary">Assign To</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconUser size={18} color="#666" />
              <Typography variant="body1" fontWeight="600">{data.assignedTo || master.assignTo || 'N/A'}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="textSecondary">Date</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconCalendar size={18} color="#666" />
              <Typography variant="body1">{data.checklistDate ? new Date(data.checklistDate).toLocaleDateString() : 'N/A'}</Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="textSecondary">Assign Type</Typography>
            <Typography variant="body1">{data.assignType || master.assignType || 'NONE'}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="textSecondary">Seq No</Typography>
            <Typography variant="body1" fontWeight="bold" color="primary">{master.seqNo}</Typography>
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          {/* Main Content */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">Renewal Point</Typography>
            <Typography variant="h4" sx={{ mt: 0.5 }}>{master.checkingPoint}</Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">Descriptions</Typography>
            <Typography variant="body1" sx={{ mt: 0.5, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              {master.description || 'No additional description provided.'}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">Status</Typography>
            <Chip 
              label={data.status || master.status || 'STARTED'} 
              sx={{ mt: 1, ...getStatusChipSx('PENDING') }} 
            />
          </Grid>

          <Grid item xs={12}><Divider /></Grid>

          {/* Documents Section */}
          <Grid item xs={12}>
            <Typography variant="h5" sx={{ mb: 2 }}>Upload Documents</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconFileDescription size={18} /> SAMPLES
                </Typography>
                <BOSFileGallery 
                  files={master.uploadedFiles || []} 
                  isEditing={false} 
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom color="secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconChecks size={18} /> ACTUAL
                </Typography>
                <BOSFileGallery 
                  files={data.actualFiles || []} 
                  isEditing={false} 
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button variant="outlined" color="inherit" onClick={handleClose}>
          Clear
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" color="error" onClick={onReject}>
          Reject
        </Button>
        <Button variant="contained" color="success" onClick={onVerify}>
          Save / Verify
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExecutionVerifyDialog;
