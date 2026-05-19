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
  Rating,
  TextField
} from '@mui/material';
import {
  IconRefresh,
  IconPlayerPlay,
  IconCheck,
  IconClipboardCheck
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
import { setFilterConfig } from 'store/slices/search';

// ==============================|| INDUCTION TRAINING (TRAINER PAGE) ||============================== //

const columns = [
  { id: 'index', label: 'Sl.No', minWidth: 60 },
  { id: 'empCode', label: 'Emp Code', bold: true, minWidth: 100 },
  { id: 'empName', label: 'Employee Name', minWidth: 180 },
  { id: 'inductionDate', label: 'Induction Date', minWidth: 120 },
  { id: 'inductionRound', label: 'Induction Round', minWidth: 130 },
  {
    id: 'currentStatus',
    label: 'Current Status',
    minWidth: 140,
    render: (row) => {
      const colors = {
        'PENDING': 'warning',
        'TRAINING STARTED': 'info',
        'TRAINING GIVEN': 'success',
        'COMPLETED': 'success',
        'REJECTED': 'error',
        'RESCHEDULE': 'secondary'
      };
      return (
        <Chip
          label={row.currentStatus}
          size="small"
          color={colors[row.currentStatus] || 'default'}
          sx={{ fontWeight: 700, borderRadius: '6px' }}
        />
      );
    }
  },
  {
    id: 'averageRating',
    label: 'Rating',
    minWidth: 100,
    render: (row) => row.averageRating ? `${row.averageRating.toFixed(1)}/5` : '-'
  },
  {
    id: 'inductionStatus',
    label: 'Induction Status',
    minWidth: 120,
    render: (row) => (
      <Chip
        label={row.inductionStatus}
        variant="outlined"
        size="small"
        color={row.inductionStatus === 'ACTIVE' ? 'success' : 'error'}
      />
    )
  }
];

const SKILL_LABELS = {
  1: 'Poor',
  2: 'Average',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
};

export default function InductionTraining() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [trainingDetails, setTrainingDetails] = useState([]);
  const [saving, setSaving] = useState(false);

  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  // Dispatch starred filter configuration matching Status
  useEffect(() => {
    const config = [
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'ALL', label: 'ALL' },
          { value: 'PENDING', label: 'PENDING' },
          { value: 'TRAINING STARTED', label: 'TRAINING STARTED' },
          { value: 'TRAINING GIVEN', label: 'TRAINING GIVEN' },
          { value: 'COMPLETED', label: 'COMPLETED' }
        ],
        defaultValue: 'ALL',
        isStarred: true
      }
    ];
    dispatch(setFilterConfig(config));
    return () => {
      dispatch(setFilterConfig(null));
    };
  }, [dispatch]);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/hr/induction-training');
      setRows(data || []);
    } catch (error) {
      console.error('Failed to fetch training assignments:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to load data', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  // Open training dialog
  const handleStartTraining = useCallback(async (row) => {
    setSelectedAssignment(row);
    setLoading(true);
    try {
      // If PENDING, start the training first
      if (row.currentStatus === 'PENDING' || row.currentStatus === 'RESCHEDULE') {
        await axios.post(`/api/hr/induction-training/${row.id}/start`);
        dispatch(openSnackbar({ open: true, message: 'Training session started!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      }

      // Load training detail items
      const { data } = await axios.get(`/api/hr/induction-training/${row.id}/details`);
      setTrainingDetails(data || []);
      setDialogOpen(true);
    } catch (error) {
      const msg = error.response?.data || 'Failed to start training';
      dispatch(openSnackbar({ open: true, message: typeof msg === 'string' ? msg : JSON.stringify(msg), variant: 'alert', severity: 'error' }));
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

  // Save progress
  const handleSaveProgress = async () => {
    setSaving(true);
    try {
      await axios.put(`/api/hr/induction-training/${selectedAssignment.id}/details`, trainingDetails);
      dispatch(openSnackbar({ open: true, message: 'Training progress saved', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
    } catch (error) {
      const msg = error.response?.data || 'Failed to save progress';
      dispatch(openSnackbar({ open: true, message: typeof msg === 'string' ? msg : JSON.stringify(msg), variant: 'alert', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  // Complete training
  const handleCompleteTraining = async () => {
    setSaving(true);
    try {
      // Save progress first
      await axios.put(`/api/hr/induction-training/${selectedAssignment.id}/details`, trainingDetails);
      // Then complete
      await axios.post(`/api/hr/induction-training/${selectedAssignment.id}/complete`);
      dispatch(openSnackbar({ open: true, message: 'Induction Training Given Successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      setDialogOpen(false);
      fetchRows();
    } catch (error) {
      const msg = error.response?.data || 'Failed to complete training';
      dispatch(openSnackbar({ open: true, message: typeof msg === 'string' ? msg : JSON.stringify(msg), variant: 'alert', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  // Filter rows
  const resolvedRows = useMemo(() => {
    let filtered = rows;
    const statusVal = globalFilters.status || 'ALL';
    if (statusVal !== 'ALL') {
      filtered = filtered.filter(r => r.currentStatus === statusVal);
    }
    if (globalQuery) {
      const s = globalQuery.toLowerCase();
      filtered = filtered.filter(r =>
        (r.empCode || '').toLowerCase().includes(s) ||
        (r.empName || '').toLowerCase().includes(s) ||
        (r.department || '').toLowerCase().includes(s)
      );
    }
    return filtered.map((r, i) => ({
      ...r,
      index: i + 1,
      inductionDate: r.inductionDate ? new Date(r.inductionDate).toLocaleDateString('en-GB') : '-'
    }));
  }, [rows, globalFilters.status, globalQuery]);

  // Count completed items
  const completedCount = trainingDetails.filter(d => d.trainerStatus === 'COMPLETED').length;
  const totalCount = trainingDetails.length;

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconClipboardCheck size={24} />
          <Typography variant="h3">Induction Training</Typography>
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
          <BOSExportButton
            data={resolvedRows}
            filename="Induction_Training"
            columns={columns.filter(c => c.id !== 'index').map(c => ({ header: c.label, key: c.id }))}
          />
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={resolvedRows}
        loading={loading}
        onDoubleClickRow={(row) => {
          if (['PENDING', 'RESCHEDULE', 'TRAINING STARTED'].includes(row.currentStatus)) {
            handleStartTraining(row);
          }
        }}
        actionColumn={{
          render: (row) => (
            ['PENDING', 'RESCHEDULE', 'TRAINING STARTED'].includes(row.currentStatus) ? (
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<IconPlayerPlay size={16} />}
                onClick={() => handleStartTraining(row)}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
              >
                {row.currentStatus === 'TRAINING STARTED' ? 'Continue' : 'Start Training'}
              </Button>
            ) : (
              <Chip label={row.currentStatus} size="small" color="success" variant="outlined" />
            )
          )
        }}
      />

      {/* Training Dialog */}
      <BOSFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Induction Training Process"
        fullWidth
        maxWidth="xl"
        onSave={handleSaveProgress}
        saveLabel="Save Progress"
        extraActions={
          <Button
            variant="contained"
            color="success"
            onClick={handleCompleteTraining}
            disabled={saving || completedCount < totalCount}
            startIcon={<IconCheck size={18} />}
            sx={{ fontWeight: 700, borderRadius: '8px', textTransform: 'none' }}
          >
            Complete Training ({completedCount}/{totalCount})
          </Button>
        }
      >
        {selectedAssignment && (
          <>
            {/* Summary Header */}
            <BOSFormSection title="Employee Information">
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">EMPLOYEE</Typography>
                  <Typography variant="h4">{selectedAssignment.empCode} — {selectedAssignment.empName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">DEPARTMENT</Typography>
                  <Typography variant="h4">{selectedAssignment.department || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">ROUND</Typography>
                  <Typography variant="h4">{selectedAssignment.inductionRound}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">LEVEL</Typography>
                  <Typography variant="h4">{selectedAssignment.screeningLevel || '-'}</Typography>
                </Box>
              </Box>
            </BOSFormSection>

            <Divider sx={{ my: 2 }} />

            {/* Training Items Table */}
            <BOSFormSection title={`Training Criteria (${completedCount}/${totalCount} completed)`}>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '10px' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'primary.light' }}>
                      <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Induction Details</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>Expected Answer</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 140 }}>Trainer Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 160 }}>Skill Rating</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Trainer Comments</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trainingDetails.map((detail, idx) => (
                      <TableRow key={detail.id} sx={{
                        bgcolor: detail.trainerStatus === 'COMPLETED' ? 'success.lighter' : 'inherit',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {detail.inductionDetails || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {detail.answer || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={detail.trainerStatus || 'PENDING'}
                            onChange={(e) => updateDetail(detail.id, 'trainerStatus', e.target.value)}
                            fullWidth
                            sx={{ minWidth: 120 }}
                          >
                            <MenuItem value="PENDING">PENDING</MenuItem>
                            <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating
                              value={detail.skillRating || 0}
                              onChange={(e, newValue) => updateDetail(detail.id, 'skillRating', newValue)}
                              size="small"
                              max={5}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {detail.skillRating ? SKILL_LABELS[detail.skillRating] : ''}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            multiline
                            maxRows={3}
                            value={detail.trainerComments || ''}
                            onChange={(e) => updateDetail(detail.id, 'trainerComments', e.target.value)}
                            placeholder="Comments..."
                            fullWidth
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {trainingDetails.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">No criteria items loaded. Click "Start Training" first.</Typography>
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
