import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
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
<<<<<<< HEAD
  TextField
=======
  TextField,
  Popover,
  Badge
>>>>>>> origin/main
} from '@mui/material';
import {
  IconRefresh,
  IconPlayerPlay,
  IconCheck,
<<<<<<< HEAD
  IconClipboardCheck
=======
  IconClipboardCheck,
  IconInfoCircle,
  IconPaperclip,
  IconUpload,
  IconTrash,
  IconExternalLink,
  IconEye
>>>>>>> origin/main
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
<<<<<<< HEAD
    minWidth: 140,
=======
    minWidth: 170, // Increased slightly to accommodate progress text cleanly
>>>>>>> origin/main
    render: (row) => {
      const colors = {
        'PENDING': 'warning',
        'TRAINING STARTED': 'info',
        'TRAINING GIVEN': 'success',
        'COMPLETED': 'success',
        'REJECTED': 'error',
        'RESCHEDULE': 'secondary'
      };
<<<<<<< HEAD
      return (
        <Chip
          label={row.currentStatus}
=======
      
      let statusLabel = row.currentStatus;
      if (row.currentStatus === 'TRAINING STARTED') {
        if (row.totalQuestions !== undefined && row.totalQuestions > 0) {
          statusLabel = `TRAINING STARTED (${row.completedQuestions || 0}/${row.totalQuestions})`;
        }
        
        // Premium modern indigo-violet styling with high contrast and sleek border
        return (
          <Chip
            label={statusLabel}
            size="small"
            sx={{
              fontWeight: 800,
              borderRadius: '8px',
              bgcolor: 'rgba(99, 102, 241, 0.09)', // Smooth transparent indigo
              color: 'rgb(79, 70, 229)', // Premium deep indigo text
              border: '1px solid rgba(99, 102, 241, 0.28)', // Matching thin accent border
              fontSize: '0.8rem',
              px: 0.5
            }}
          />
        );
      }

      return (
        <Chip
          label={statusLabel}
>>>>>>> origin/main
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
<<<<<<< HEAD
    render: (row) => row.averageRating ? `${row.averageRating.toFixed(1)}/5` : '-'
=======
    align: 'center',
    render: (row) => {
      const rating = row.averageRating;
      const isRated = rating !== null && rating !== undefined && rating > 0;
      const displayValue = isRated ? (rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1)) : '0';
      
      // Premium scoring color: green for good ratings, amber/yellow for unrated/0
      const color = isRated ? '#4caf50' : '#ffc107'; 

      return (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: `5px solid ${color}`,
            bgcolor: `${color}10`, // Elegant semi-transparent matching tint
            fontWeight: 800,
            fontSize: '1.05rem',
            color: 'text.primary',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            mx: 'auto'
          }}
        >
          {displayValue}
        </Box>
      );
    }
>>>>>>> origin/main
  },
  {
    id: 'inductionStatus',
    label: 'Induction Status',
    minWidth: 120,
<<<<<<< HEAD
    render: (row) => (
      <Chip
        label={row.inductionStatus}
        variant="outlined"
        size="small"
        color={row.inductionStatus === 'ACTIVE' ? 'success' : 'error'}
      />
    )
=======
    render: (row) => {
      const status = row.inductionStatus;
      let chipColor = 'default';
      if (status === 'ACTIVE') chipColor = 'info';
      else if (status === 'COMPLETED') chipColor = 'success';
      else if (status === 'IN ACTIVE' || status === 'REJECTED') chipColor = 'error';
      else if (status === 'PENDING') chipColor = 'warning';

      return (
        <Chip
          label={status}
          variant="outlined"
          size="small"
          color={chipColor}
        />
      );
    }
>>>>>>> origin/main
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
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchText, setSearchText] = useState('');

<<<<<<< HEAD
=======
  const [attachmentAnchor, setAttachmentAnchor] = useState(null);
  const [activeAttachments, setActiveAttachments] = useState([]);

  const handleOpenAttachments = (event, filesString) => {
    setAttachmentAnchor(event.currentTarget);
    setActiveAttachments(filesString ? filesString.split(',').filter(Boolean) : []);
  };

  const handleCloseAttachments = () => {
    setAttachmentAnchor(null);
    setActiveAttachments([]);
  };

  const [answerAnchor, setAnswerAnchor] = useState(null);
  const [activeAnswer, setActiveAnswer] = useState('');

  const handleOpenAnswer = (event, answerText) => {
    setAnswerAnchor(event.currentTarget);
    setActiveAnswer(answerText);
  };

  const handleCloseAnswer = () => {
    setAnswerAnchor(null);
    setActiveAnswer('');
  };

>>>>>>> origin/main
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
<<<<<<< HEAD
=======
        await fetchRows();
>>>>>>> origin/main
      }

      // Load training detail items
      const { data } = await axios.get(`/api/hr/induction-training/${row.id}/details`);
      setTrainingDetails(data || []);
      setDialogOpen(true);
    } catch (error) {
<<<<<<< HEAD
      const msg = error.response?.data || 'Failed to start training';
      dispatch(openSnackbar({ open: true, message: typeof msg === 'string' ? msg : JSON.stringify(msg), variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);
=======
      const msg = typeof error === 'string' ? error : (error?.message || 'Failed to start training');
      dispatch(openSnackbar({ open: true, message: msg, variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch, fetchRows]);
>>>>>>> origin/main

  // Update a detail item locally
  const updateDetail = (detailId, field, value) => {
    setTrainingDetails(prev =>
      prev.map(d => d.id === detailId ? { ...d, [field]: value } : d)
    );
  };

<<<<<<< HEAD
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
=======
  // Save progress & complete level
  const handleSaveProgress = async () => {
    setSaving(true);
    try {
      // Save details first
      await axios.put(`/api/hr/induction-training/${selectedAssignment.id}/details`, trainingDetails);
      
      // If ALL items are completed, automatically complete the level
      if (completedCount === totalCount && totalCount > 0) {
        // Validate skill ratings are selected for all completed items
        const missingRatings = trainingDetails.some(d => !d.skillRating || d.skillRating < 1);
        if (missingRatings) {
          dispatch(openSnackbar({ open: true, message: 'Please select skill matrix rating for all completed items.', variant: 'alert', severity: 'error' }));
          setSaving(false);
          return;
        }
        
        const { data } = await axios.post(`/api/hr/induction-training/${selectedAssignment.id}/complete`);
        let message = 'Induction Training Completed!';
        if (data.currentStatus === 'RESCHEDULE') {
          message = 'Level completed successfully! Ready for the next level.';
        } else {
          message = 'Induction Training Completed! All levels successfully cleared!';
        }
        dispatch(openSnackbar({ open: true, message, variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      } else {
        dispatch(openSnackbar({ open: true, message: 'Training progress saved successfully', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      }
      
      setDialogOpen(false);
      fetchRows();
    } catch (error) {
      const msg = typeof error === 'string' ? error : (error?.message || 'Failed to save progress');
      dispatch(openSnackbar({ open: true, message: msg, variant: 'alert', severity: 'error' }));
>>>>>>> origin/main
    } finally {
      setSaving(false);
    }
  };

  // Filter rows
  const resolvedRows = useMemo(() => {
    let filtered = rows;
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(r => r.currentStatus === statusFilter);
    }
    if (searchText) {
      const s = searchText.toLowerCase();
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
  }, [rows, statusFilter, searchText]);

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
          <BOSTextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="ALL">All Status</MenuItem>
            <MenuItem value="PENDING">PENDING</MenuItem>
            <MenuItem value="TRAINING STARTED">TRAINING STARTED</MenuItem>
            <MenuItem value="TRAINING GIVEN">TRAINING GIVEN</MenuItem>
            <MenuItem value="COMPLETED">COMPLETED</MenuItem>
          </BOSTextField>
          <BOSTextField
            size="small"
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ minWidth: 200 }}
          />
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
<<<<<<< HEAD
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
=======
        saveLabel={completedCount === totalCount && totalCount > 0 ? "Complete Level" : "Save Progress"}
>>>>>>> origin/main
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
<<<<<<< HEAD
                      <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Induction Details</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 150 }}>Expected Answer</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 140 }}>Trainer Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 160 }}>Skill Rating</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>Trainer Comments</TableCell>
=======
                      <TableCell sx={{ fontWeight: 700, width: 60 }}>Sl.No</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>Induction Details</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 80, textAlign: 'center' }}>Answer</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 100 }}>Round</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 140 }}>Trainer Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 170 }}>Skill Matrix</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 180 }}>Comments</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 160 }}>Attachment</TableCell>
>>>>>>> origin/main
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trainingDetails.map((detail, idx) => (
                      <TableRow key={detail.id} sx={{
                        bgcolor: detail.trainerStatus === 'COMPLETED' ? 'success.lighter' : 'inherit',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}>
<<<<<<< HEAD
                        <TableCell>{idx + 1}</TableCell>
=======
                        {/* Sl.No */}
                        <TableCell>{idx + 1}</TableCell>

                        {/* Induction Details */}
>>>>>>> origin/main
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {detail.inductionDetails || '-'}
                          </Typography>
                        </TableCell>
<<<<<<< HEAD
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {detail.answer || '-'}
                          </Typography>
                        </TableCell>
=======

                        {/* Answer Icon (Eye Icon with expected answer details in Tooltip & Popover on click) */}
                        <TableCell align="center">
                          {detail.answer ? (
                            <Tooltip title="Hover to preview / Click to view full details" arrow placement="top">
                              <IconButton 
                                size="small" 
                                color="secondary"
                                onClick={(e) => handleOpenAnswer(e, detail.answer)}
                                sx={{
                                  bgcolor: 'secondary.light',
                                  '&:hover': { bgcolor: 'secondary.main', color: '#fff' },
                                  transition: 'all 0.2s ease',
                                  borderRadius: '8px',
                                  p: 0.75
                                }}
                              >
                                <IconEye size={18} />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            '-'
                          )}
                        </TableCell>

                        {/* Round */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {detail.inductionRound || 'HR'}
                          </Typography>
                        </TableCell>

                        {/* Trainer Status (PENDING/COMPLETED) */}
>>>>>>> origin/main
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={detail.trainerStatus || 'PENDING'}
                            onChange={(e) => updateDetail(detail.id, 'trainerStatus', e.target.value)}
                            fullWidth
<<<<<<< HEAD
                            sx={{ minWidth: 120 }}
=======
                            sx={{ minWidth: 110 }}
>>>>>>> origin/main
                          >
                            <MenuItem value="PENDING">PENDING</MenuItem>
                            <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                          </TextField>
                        </TableCell>
<<<<<<< HEAD
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
=======

                        {/* Skill Matrix (BASIC LEVEL, ADVANCE LEVEL, EXPERT) */}
                        <TableCell>
                          <TextField
                            select
                            size="small"
                            value={detail.skillRating || ''}
                            onChange={(e) => updateDetail(detail.id, 'skillRating', e.target.value)}
                            fullWidth
                            sx={{ minWidth: 155 }}
                          >
                            <MenuItem value="" disabled>-Select-</MenuItem>
                            <MenuItem value={4}>BASIC LEVEL</MenuItem>
                            <MenuItem value={7}>ADVANCE LEVEL</MenuItem>
                            <MenuItem value={10}>EXPERT</MenuItem>
                          </TextField>
                        </TableCell>

                        {/* Comments */}
>>>>>>> origin/main
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
<<<<<<< HEAD
=======

                        {/* Attachment (Eye/Paperclip Icon with Popover for Multi-File Viewing) */}
                        <TableCell align="center">
                          {detail.inductionAttachment ? (
                            (() => {
                              const filesList = detail.inductionAttachment.split(',').filter(Boolean);
                              const count = filesList.length;
                              return (
                                <Badge 
                                  badgeContent={count} 
                                  color="secondary"
                                  sx={{
                                    '& .MuiBadge-badge': {
                                      fontWeight: 800,
                                      fontSize: '0.68rem',
                                      height: 18,
                                      minWidth: 18,
                                      borderRadius: '50%',
                                      top: 2,
                                      right: 2
                                    }
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    color="secondary"
                                    onClick={(e) => handleOpenAttachments(e, detail.inductionAttachment)}
                                    sx={{
                                      bgcolor: 'secondary.light',
                                      '&:hover': { bgcolor: 'secondary.main', color: '#fff' },
                                      transition: 'all 0.2s ease',
                                      borderRadius: '8px',
                                      p: 0.75
                                    }}
                                  >
                                    <IconPaperclip size={18} />
                                  </IconButton>
                                </Badge>
                              );
                            })()
                          ) : (
                            '-'
                          )}
                        </TableCell>
>>>>>>> origin/main
                      </TableRow>
                    ))}
                    {trainingDetails.length === 0 && (
                      <TableRow>
<<<<<<< HEAD
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
=======
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
>>>>>>> origin/main
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
<<<<<<< HEAD
=======

      {/* Attachments Viewer Popover */}
      <Popover
        open={Boolean(attachmentAnchor)}
        anchorEl={attachmentAnchor}
        onClose={handleCloseAttachments}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            p: 2,
            width: 290,
            borderRadius: '12px',
            boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: 'divider',
            mt: 0.5
          }
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconPaperclip size={18} style={{ color: 'var(--secondary-main)' }} />
          Reference Docs ({activeAttachments.length})
        </Typography>
        <Divider sx={{ mb: 1.5 }} />
        <Stack spacing={1}>
          {activeAttachments.map((filePath, fIdx) => {
            const fileName = filePath.split('/').pop() || 'File';
            const viewUrl = `/api/files/view?path=${encodeURIComponent(filePath)}`;
            return (
              <Box 
                key={fIdx} 
                onClick={() => {
                  window.open(viewUrl, '_blank');
                  handleCloseAttachments();
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'secondary.light',
                    borderColor: 'secondary.main',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <IconPaperclip size={16} style={{ color: 'var(--secondary-main)' }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600, 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    flex: 1
                  }}
                >
                  {fileName.length > 20 ? `${fileName.substring(0, 17)}...` : fileName}
                </Typography>
                <IconExternalLink size={14} style={{ opacity: 0.6 }} />
              </Box>
            );
          })}
        </Stack>
      </Popover>

      {/* Answer Viewer Popover */}
      <Popover
        open={Boolean(answerAnchor)}
        anchorEl={answerAnchor}
        onClose={handleCloseAnswer}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            p: 2.5,
            width: 320,
            borderRadius: '12px',
            boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: 'divider',
            mt: 0.5
          }
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconEye size={18} style={{ color: 'var(--secondary-main)' }} />
          Expected Answer / SOP
        </Typography>
        <Divider sx={{ mb: 1.5 }} />
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontWeight: 500 }}>
          {activeAnswer}
        </Typography>
      </Popover>
>>>>>>> origin/main
    </MainCard>
  );
}
