import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'utils/axios';
import { useTheme } from '@mui/material/styles';
import useAuth from 'hooks/useAuth';

// MUI & Icons
import {
  Box,
  Typography,
  Stack,
  Tooltip,
  IconButton,
  MenuItem,
  Button,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField
} from '@mui/material';
import {
  IconRefresh,
  IconCheck,
  IconUserCheck
} from '@tabler/icons-react';

// BOS Components
import MainCard from 'ui-component/cards/MainCard';
import {
  BOSDataTable,
  BOSFormDialog,
  BOSFormSection,
  BOSTextField,
  BOSExportButton,
  errorStyle
} from 'ui-component/bos';
import { openSnackbar } from 'store/slices/snackbar';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

// ==============================|| INDUCTION TRAINEE (EMPLOYEE PAGE) ||============================== //

const TRAINEE_STATUS_OPTIONS = [
  { value: 'UNDERSTOOD', label: 'UNDERSTOOD', color: 'success' },
  { value: 'NEED MORE TRAINING', label: 'NEED MORE TRAINING', color: 'error' }
];

const columns = [
  { id: 'index', label: 'Sl.No', minWidth: 60 },
  { id: 'inductionDate', label: 'Induction Date', minWidth: 120 },
  { id: 'inductionRound', label: 'Induction Round', minWidth: 130 },
  { id: 'trainerName', label: 'Trainer', minWidth: 150 },
  { id: 'department', label: 'Department', minWidth: 150 },
  {
    id: 'averageRating',
    label: 'Rating',
    minWidth: 80,
    render: (row) => row.averageRating ? `${row.averageRating.toFixed(1)}/5` : '-'
  },
  {
    id: 'currentStatus',
    label: 'Current Status',
    minWidth: 140,
    render: (row) => (
      <Chip
        label={row.currentStatus}
        size="small"
        color="info"
        sx={{ fontWeight: 700, borderRadius: '6px' }}
      />
    )
  }
];

export default function InductionTrainee() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const perms = usePagePermissions(PAGE_CODES.ATS_INDUCTION_TRAINEE);
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [trainingDetails, setTrainingDetails] = useState([]);
  const [saving, setSaving] = useState(false);

  const globalQuery = useSelector((state) => state.search.query);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/hr/induction-trainee');
      setRows(data || []);
    } catch (error) {
      console.error('Failed to fetch trainee records:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to load data', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  // Open trainee review dialog
  const handleUpdateTraining = useCallback(async (row) => {
    setSelectedAssignment(row);
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/hr/induction-trainee/${row.id}/details`);
      setTrainingDetails(data || []);
      setDialogOpen(true);
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to load training details', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Update a detail item locally
  const updateDetail = (detailId, field, value) => {
    setTrainingDetails(prev =>
      prev.map(d => d.id === detailId ? { ...d, [field]: value } : d)
    );
  };

  // Submit responses
  const handleSubmit = async () => {
    // Client-side validation
    for (const detail of trainingDetails) {
      if (!detail.traineeStatus) {
        dispatch(openSnackbar({ open: true, message: 'Please select trainee status for all items.', variant: 'alert', severity: 'error' }));
        return;
      }
      if (!detail.traineeComments || !detail.traineeComments.trim()) {
        dispatch(openSnackbar({ open: true, message: 'Comments should not be empty for all items.', variant: 'alert', severity: 'error' }));
        return;
      }
    }

    setSaving(true);
    try {
      const result = await axios.put(`/api/hr/induction-trainee/${selectedAssignment.id}/respond`, trainingDetails);
      const newStatus = result.data?.currentStatus;

      if (newStatus === 'COMPLETED') {
        dispatch(openSnackbar({
          open: true,
          message: 'Induction round completed successfully! 🎉',
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: 'success'
        }));
      } else if (newStatus === 'REJECTED') {
        dispatch(openSnackbar({
          open: true,
          message: 'Training marked for re-training. The trainer will be notified.',
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: 'warning'
        }));
      }

      setDialogOpen(false);
      fetchRows();
    } catch (error) {
      const msg = error.response?.data || 'Failed to submit responses';
      dispatch(openSnackbar({ open: true, message: typeof msg === 'string' ? msg : JSON.stringify(msg), variant: 'alert', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  // Filter rows
  const resolvedRows = useMemo(() => {
    let filtered = rows;
    if (globalQuery) {
      const s = globalQuery.toLowerCase();
      filtered = filtered.filter(r =>
        (r.inductionRound || '').toLowerCase().includes(s) ||
        (r.trainerName || '').toLowerCase().includes(s) ||
        (r.department || '').toLowerCase().includes(s)
      );
    }
    return filtered.map((r, i) => ({
      ...r,
      index: i + 1,
      inductionDate: r.inductionDate ? new Date(r.inductionDate).toLocaleDateString('en-GB') : '-'
    }));
  }, [rows, globalQuery]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconUserCheck size={24} />
          <Typography variant="h3">Induction Trainee</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchRows} color="primary" size="small" sx={{
              border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
            }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          {perms.export && <BOSExportButton
            data={resolvedRows}
            filename="Induction_Trainee"
            columns={columns.filter(c => c.id !== 'index').map(c => ({ header: c.label, key: c.id }))}
          />}
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={resolvedRows}
        loading={loading}
        onDoubleClickRow={handleUpdateTraining}
        actionColumn={{
          render: (row) => (
            <Button
              size="small"
              variant="contained"
              color="info"
              startIcon={<IconCheck size={16} />}
              onClick={() => handleUpdateTraining(row)}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
            >
              Update Training
            </Button>
          )
        }}
      />

      {/* Trainee Review Dialog */}
      <BOSFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Induction Review — Trainee Response"
        fullWidth
        maxWidth="xl"
        onSave={perms.write ? handleSubmit : null}
        isViewOnly={!perms.write}
        saveLabel="Submit Response"
      >
        {selectedAssignment && (
          <>
            {/* Summary Header */}
            <BOSFormSection title="Training Information">
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">ROUND</Typography>
                  <Typography variant="h4">{selectedAssignment.inductionRound}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">TRAINER</Typography>
                  <Typography variant="h4">{selectedAssignment.trainerName || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">DEPARTMENT</Typography>
                  <Typography variant="h4">{selectedAssignment.department || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">DATE</Typography>
                  <Typography variant="h4">{selectedAssignment.inductionDate || '-'}</Typography>
                </Box>
                {selectedAssignment.averageRating && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">TRAINER RATING</Typography>
                    <Typography variant="h4">{selectedAssignment.averageRating.toFixed(1)} / 5</Typography>
                  </Box>
                )}
              </Box>
            </BOSFormSection>

            <Divider sx={{ my: 2 }} />

            {/* Training Items Table */}
            <BOSFormSection title="Induction Details — Your Response">
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '10px' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'info.lighter' }}>
                      <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Induction Details</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 120 }}>Round</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 120 }}>Trainer Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 170 }}>Trainee Status *</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Trainee Comments *</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trainingDetails.map((detail, idx) => (
                      <TableRow key={detail.id} sx={{
                        bgcolor: detail.traineeStatus === 'UNDERSTOOD' ? 'success.lighter' :
                                 detail.traineeStatus === 'NEED MORE TRAINING' ? 'error.lighter' : 'inherit',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {detail.inductionDetails || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>{detail.inductionRound || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={detail.trainerStatus}
                            size="small"
                            color={detail.trainerStatus === 'COMPLETED' ? 'success' : 'warning'}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={detail.traineeStatus || ''}
                            onChange={(e) => updateDetail(detail.id, 'traineeStatus', e.target.value)}
                            disabled={!perms.write}
                            fullWidth
                            sx={{ minWidth: 150 }}
                          >
                            <MenuItem value="">-Select-</MenuItem>
                            {TRAINEE_STATUS_OPTIONS.map(opt => (
                              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            multiline
                            maxRows={3}
                            value={detail.traineeComments || ''}
                            onChange={(e) => updateDetail(detail.id, 'traineeComments', e.target.value)}
                            disabled={!perms.write}
                            placeholder="Your comments... (mandatory)"
                            fullWidth
                            required
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {trainingDetails.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">No training details found.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </BOSFormSection>
          </>
        )}
      </BOSFormDialog>
    </MainCard>
  );
}
