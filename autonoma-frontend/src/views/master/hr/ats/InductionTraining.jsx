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
  TextField,
  Radio,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  IconRefresh,
  IconPlayerPlay,
  IconCheck,
  IconClipboardCheck,
  IconInfoCircle,
  IconCloudUpload,
  IconTrash,
  IconX
} from '@tabler/icons-react';

// BOS Components
import MainCard from 'ui-component/cards/MainCard';
import {
  BOSDataTable,
  BOSFormDialog,
  BOSFormSection,
  BOSExportButton,
  BOSFileUpload,
  btnCancel,
  btnSave
} from 'ui-component/bos';
import BOSMovableDialog from 'ui-component/bos/BOSMovableDialog';
import { openSnackbar } from 'store/slices/snackbar';
import { setFilterConfig } from 'store/slices/search';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

// ==============================|| INDUCTION TRAINING (TRAINER PAGE) ||============================== //

const columns = [
  { id: 'index', label: 'Sl.No', minWidth: 60, align: 'center' },
  { id: 'empCode', label: 'Emp Code', bold: true, minWidth: 100 },
  { id: 'empName', label: 'Employee Name', minWidth: 180 },
  { id: 'inductionDate', label: 'Induction Date', minWidth: 140 },
  { id: 'inductionRound', label: 'Induction Round', minWidth: 140 },
  {
    id: 'currentStatus',
    label: 'Current Status',
    minWidth: 120,
    align: 'center',
    render: (row) => (
      <Typography variant="subtitle2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
        {row.currentStatus}
      </Typography>
    )
  },
  {
    id: 'averageRating',
    label: 'Rating',
    minWidth: 100,
    align: 'center',
    render: (row) => (
      <Box sx={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '3px solid #FFC107',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.85rem',
        color: 'text.primary',
        bgcolor: '#FFFDE7',
        mx: 'auto'
      }}>
        {row.averageRating ? row.averageRating.toFixed(1) : '0'}
      </Box>
    )
  },
  {
    id: 'inductionStatus',
    label: 'Induction Status',
    minWidth: 130,
    align: 'center',
    render: (row) => (
      <Box sx={{
        bgcolor: row.inductionStatus === 'COMPLETED' ? '#E8F5E9' : '#FFEBEE',
        color: row.inductionStatus === 'COMPLETED' ? '#2E7D32' : '#C62828',
        py: 0.75,
        px: 1.5,
        borderRadius: '6px',
        fontWeight: 700,
        fontSize: '0.75rem',
        textAlign: 'center',
        textTransform: 'uppercase',
        width: 'fit-content',
        mx: 'auto'
      }}>
        {row.inductionStatus}
      </Box>
    )
  }
];

export default function InductionTraining() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [trainingDetails, setTrainingDetails] = useState([]);
  const [initialDetails, setInitialDetails] = useState([]);
  const [saving, setSaving] = useState(false);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [activeDetailId, setActiveDetailId] = useState(null);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [answerModalOpen, setAnswerModalOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [selectedCriteriaDetail, setSelectedCriteriaDetail] = useState('');

  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const perms = usePagePermissions(PAGE_CODES.ATS_INDUCTION_TRAINING);

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
      
      // Group by empCode to avoid duplicate rows for the same employee
      const grouped = {};
      (data || []).forEach(item => {
        const code = item.empCode;
        if (!grouped[code]) {
          grouped[code] = {
            empCode: item.empCode,
            empName: item.empName,
            department: item.department,
            designation: item.designation,
            assignments: []
          };
        }
        // Avoid duplicate assignment entries
        if (!grouped[code].assignments.some(a => a.id === item.id)) {
          grouped[code].assignments.push(item);
        }
      });
      
      setRows(Object.values(grouped));
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
      // Start training for any PENDING or RESCHEDULE assignments of this employee
      const startPromises = row.assignments
        .filter(a => a.currentStatus === 'PENDING' || a.currentStatus === 'RESCHEDULE')
        .map(a => axios.post(`/api/hr/induction-training/${a.id}/start`));
      
      if (startPromises.length > 0) {
        await Promise.all(startPromises);
        dispatch(openSnackbar({ 
          open: true, 
          message: 'Training sessions initialized!', 
          variant: 'alert', 
          alert: { variant: 'filled' }, 
          severity: 'success' 
        }));
      }

      // Load details for all assignments of this employee in parallel
      const detailsPromises = row.assignments.map(a => axios.get(`/api/hr/induction-training/${a.id}/details`));
      const detailsResponses = await Promise.all(detailsPromises);
      
      // Flatten all training detail records cleanly without duplicates
      const allDetails = detailsResponses.flatMap(res => res.data || []);

      // Synchronize/merge details sharing the same inductionMasterId (source of truth synchronization on load)
      const masterIdToMerged = {};
      allDetails.forEach(d => {
        if (!d.inductionMasterId) return;
        const mid = d.inductionMasterId;
        if (!masterIdToMerged[mid]) {
          masterIdToMerged[mid] = {
            trainerStatus: 'PENDING',
            skillRating: null,
            trainerComments: '',
            attachmentPath: ''
          };
        }
        const current = masterIdToMerged[mid];
        if (d.trainerStatus === 'COMPLETED') {
          current.trainerStatus = 'COMPLETED';
        }
        if (d.skillRating && (!current.skillRating || d.skillRating > current.skillRating)) {
          current.skillRating = d.skillRating;
        }
        if (d.trainerComments && d.trainerComments.length > current.trainerComments.length) {
          current.trainerComments = d.trainerComments;
        }
        if (d.attachmentPath && d.attachmentPath.length > current.attachmentPath.length) {
          current.attachmentPath = d.attachmentPath;
        }
      });

      const synchronizedDetails = allDetails.map(d => {
        if (!d.inductionMasterId) return d;
        const merged = masterIdToMerged[d.inductionMasterId];
        return {
          ...d,
          trainerStatus: d.trainerStatus === 'COMPLETED' ? 'COMPLETED' : merged.trainerStatus,
          skillRating: d.skillRating || merged.skillRating,
          trainerComments: d.trainerComments || merged.trainerComments,
          attachmentPath: d.attachmentPath || merged.attachmentPath
        };
      });

      setTrainingDetails(synchronizedDetails);
      setInitialDetails(JSON.parse(JSON.stringify(synchronizedDetails)));
      setDialogOpen(true);
    } catch (error) {
      console.error('Failed to start training/load details:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to load training details', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Update a detail item locally, updating all entries that share the same criteria
  const updateDetail = (detailId, field, value) => {
    const targetDetail = trainingDetails.find(d => d.id === detailId);
    if (!targetDetail) return;

    setTrainingDetails(prev =>
      prev.map(d => {
        if (d.id === detailId || (d.inductionMasterId && d.inductionMasterId === targetDetail.inductionMasterId)) {
          return { ...d, [field]: value };
        }
        return d;
      })
    );
  };

  const handleOpenAttachmentDialog = (detail) => {
    setActiveDetailId(detail.id);
    const files = detail.attachmentPath
      ? detail.attachmentPath.split(',').filter(Boolean).map(path => ({
          id: path,
          serverFileName: path,
          fileName: path.split('/').pop(),
          isServer: true
        }))
      : [];
    setAttachmentFiles(files);
    setAttachmentDialogOpen(true);
  };

  const handleSaveAttachments = () => {
    const pathStr = attachmentFiles
      .map(f => f.serverFileName || f)
      .filter(Boolean)
      .join(',');
    updateDetail(activeDetailId, 'attachmentPath', pathStr);
    setAttachmentDialogOpen(false);
  };

  const attachmentDialogActions = (
    <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ width: '100%' }}>
      <Button variant="contained" sx={btnCancel} onClick={() => setAttachmentDialogOpen(false)}>
        Close
      </Button>
    </Stack>
  );

  // Save all progress
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // 1. Validation before saving:
      // If any item is marked COMPLETED, check that a skill rating has been selected.
      const incompleteItems = trainingDetails.filter(d => d.trainerStatus === 'COMPLETED' && (!d.skillRating || d.skillRating < 1));
      if (incompleteItems.length > 0) {
        dispatch(openSnackbar({
          open: true,
          message: 'Skill Matrix rating is mandatory for completed criteria items!',
          variant: 'alert',
          alert: { variant: 'filled' },
          severity: 'warning'
        }));
        setSaving(false);
        return;
      }

      // Find modified details by comparing trainingDetails with initialDetails
      const modifiedDetails = trainingDetails.filter(d => {
        const initial = initialDetails.find(i => i.id === d.id);
        if (!initial) return true; // new item
        return (
          initial.trainerStatus !== d.trainerStatus ||
          initial.skillRating !== d.skillRating ||
          initial.trainerComments !== d.trainerComments ||
          initial.attachmentPath !== d.attachmentPath
        );
      });

      if (modifiedDetails.length === 0) {
        dispatch(openSnackbar({ open: true, message: 'No changes to save.', variant: 'alert', alert: { variant: 'filled' }, severity: 'info' }));
        return;
      }

      // Group modified details by assignmentId for proper batch updates
      const grouped = {};
      modifiedDetails.forEach(d => {
        if (!grouped[d.assignmentId]) {
          grouped[d.assignmentId] = [];
        }
        grouped[d.assignmentId].push(d);
      });

      // Save progress for each assignment group
      const savePromises = Object.keys(grouped).map(assignmentId => 
        axios.put(`/api/hr/induction-training/${assignmentId}/details`, grouped[assignmentId])
      );
      await Promise.all(savePromises);

      // Check and complete assignments if all criteria are filled
      const completePromises = [];
      const assignmentIdsToCheck = [...new Set(trainingDetails.map(d => d.assignmentId))];
      
      assignmentIdsToCheck.forEach(assignmentId => {
        const details = trainingDetails.filter(d => d.assignmentId === assignmentId);
        const allCompleted = details.every(d => d.trainerStatus === 'COMPLETED');
        const allRated = details.every(d => d.skillRating !== null && d.skillRating >= 1);
        
        const assignment = selectedAssignment.assignments.find(a => String(a.id) === String(assignmentId));
        if (assignment && !['COMPLETED', 'TRAINING GIVEN'].includes(assignment.currentStatus) && allCompleted && allRated) {
          completePromises.push(axios.post(`/api/hr/induction-training/${assignmentId}/complete`));
        }
      });

      if (completePromises.length > 0) {
        await Promise.all(completePromises);
        dispatch(openSnackbar({ open: true, message: 'Training completed successfully for finished rounds!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      } else {
        dispatch(openSnackbar({ open: true, message: 'Progress saved successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success' }));
      }

      // Re-fetch all details from the backend to rehydrate the UI state and prevent resets
      const detailsPromises = selectedAssignment.assignments.map(a => axios.get(`/api/hr/induction-training/${a.id}/details`));
      const detailsResponses = await Promise.all(detailsPromises);
      const allDetails = detailsResponses.flatMap(res => res.data || []);

      // Synchronize/merge details sharing the same inductionMasterId
      const masterIdToMerged = {};
      allDetails.forEach(d => {
        if (!d.inductionMasterId) return;
        const mid = d.inductionMasterId;
        if (!masterIdToMerged[mid]) {
          masterIdToMerged[mid] = {
            trainerStatus: 'PENDING',
            skillRating: null,
            trainerComments: '',
            attachmentPath: ''
          };
        }
        const current = masterIdToMerged[mid];
        if (d.trainerStatus === 'COMPLETED') {
          current.trainerStatus = 'COMPLETED';
        }
        if (d.skillRating && (!current.skillRating || d.skillRating > current.skillRating)) {
          current.skillRating = d.skillRating;
        }
        if (d.trainerComments && d.trainerComments.length > current.trainerComments.length) {
          current.trainerComments = d.trainerComments;
        }
        if (d.attachmentPath && d.attachmentPath.length > current.attachmentPath.length) {
          current.attachmentPath = d.attachmentPath;
        }
      });

      const synchronizedDetails = allDetails.map(d => {
        if (!d.inductionMasterId) return d;
        const merged = masterIdToMerged[d.inductionMasterId];
        return {
          ...d,
          trainerStatus: d.trainerStatus === 'COMPLETED' ? 'COMPLETED' : merged.trainerStatus,
          skillRating: d.skillRating || merged.skillRating,
          trainerComments: d.trainerComments || merged.trainerComments,
          attachmentPath: d.attachmentPath || merged.attachmentPath
        };
      });

      setTrainingDetails(synchronizedDetails);
      setInitialDetails(JSON.parse(JSON.stringify(synchronizedDetails)));

      // Also update selectedAssignment assignments status since some might have completed
      const { data } = await axios.get('/api/hr/induction-training');
      const updatedEmpRow = (data || []).find(r => r.empCode === selectedAssignment.empCode);
      if (updatedEmpRow) {
        setSelectedAssignment(prev => ({
          ...prev,
          assignments: updatedEmpRow.assignments || prev.assignments
        }));
      }

      fetchRows();
    } catch (error) {
      console.error('Save error details:', error);
      const msg = error.response?.data || 'Failed to save';
      dispatch(openSnackbar({ open: true, message: typeof msg === 'string' ? msg : JSON.stringify(msg), variant: 'alert', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  // Filter trainingDetails to show only unique criteria items in UI
  const uniqueTrainingDetails = useMemo(() => {
    const seenMasterIds = new Set();
    const unique = [];
    trainingDetails.forEach(d => {
      if (d.inductionMasterId) {
        if (!seenMasterIds.has(d.inductionMasterId)) {
          seenMasterIds.add(d.inductionMasterId);
          unique.push(d);
        }
      } else {
        unique.push(d);
      }
    });
    return unique;
  }, [trainingDetails]);

  // Filter rows dynamically
  const resolvedRows = useMemo(() => {
    let filtered = rows;
    const statusVal = globalFilters.status || 'ALL';
    if (statusVal !== 'ALL') {
      filtered = filtered.filter(r => {
        const completedCount = r.assignments.filter(a => ['TRAINING GIVEN', 'COMPLETED'].includes(a.currentStatus)).length;
        const totalCount = r.assignments.length;
        const isCompleted = completedCount === totalCount;
        
        if (statusVal === 'PENDING') {
          return !isCompleted;
        } else {
          return isCompleted;
        }
      });
    }

    if (globalQuery) {
      const s = globalQuery.toLowerCase();
      filtered = filtered.filter(r =>
        (r.empCode || '').toLowerCase().includes(s) ||
        (r.empName || '').toLowerCase().includes(s) ||
        (r.department || '').toLowerCase().includes(s)
      );
    }

    return filtered.map((r, i) => {
      const completedCount = r.assignments.filter(a => ['TRAINING GIVEN', 'COMPLETED'].includes(a.currentStatus)).length;
      const totalCount = r.assignments.length;

      const ratedAssignments = r.assignments.filter(a => a.averageRating !== null && a.averageRating !== undefined && a.averageRating > 0);
      const averageRating = ratedAssignments.length > 0
        ? ratedAssignments.reduce((sum, a) => sum + a.averageRating, 0) / ratedAssignments.length
        : 0;

      const uniqueDates = Array.from(new Set(r.assignments.map(a => a.inductionDate ? new Date(a.inductionDate).toLocaleDateString('en-GB') : '-')));
      const inductionDateStr = uniqueDates.filter(d => d !== '-').join(', ') || '-';
      
      const roundsStr = r.assignments.map(a => a.inductionRound).join(', ');
      const isCompleted = completedCount === totalCount;

      return {
        ...r,
        index: i + 1,
        inductionDate: inductionDateStr,
        inductionRound: roundsStr,
        completedCount,
        totalCount,
        averageRating,
        isCompleted,
        currentStatus: `${completedCount}/${totalCount}`,
        inductionStatus: isCompleted ? 'COMPLETED' : 'PENDING'
      };
    });
  }, [rows, globalFilters.status, globalQuery]);

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
          {perms.export && <BOSExportButton
            data={resolvedRows}
            filename="Induction_Training"
            columns={columns.filter(c => c.id !== 'index').map(c => ({ header: c.label, key: c.id }))}
          />}
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={resolvedRows}
        loading={loading}
        onDoubleClickRow={handleStartTraining}
        actionColumn={{
          render: (row) => (
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<IconPlayerPlay size={16} />}
              onClick={() => handleStartTraining(row)}
              sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
            >
              Process Induction
            </Button>
          )
        }}
      />

      {/* Training Dialog */}
      <BOSFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Induction Process"
        fullWidth
        maxWidth="xl"
        onSave={perms.write ? handleSaveAll : null}
        isViewOnly={!perms.write}
        saveLabel="Save"
        saveLoading={saving}
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
                  <Typography variant="caption" color="text.secondary">ROUNDS</Typography>
                  <Typography variant="h4">{selectedAssignment.inductionRound}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">COMPLETED STATUS</Typography>
                  <Typography variant="h4">{selectedAssignment.currentStatus}</Typography>
                </Box>
              </Box>
            </BOSFormSection>

            <Divider sx={{ my: 2 }} />

            {/* Training Items Table */}
            <BOSFormSection title="Induction Training Process">
               <TableContainer component={Paper} variant="outlined" sx={{ 
                 borderRadius: '10px', 
                 maxHeight: 'calc(100vh - 380px)', 
                 minHeight: '250px',
                 overflowY: 'auto',
                 position: 'relative'
               }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: 60, bgcolor: 'background.paper', zIndex: 10 }}>SI.No</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 200, bgcolor: 'background.paper', zIndex: 10 }}>Induction Details</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 80, align: 'center', bgcolor: 'background.paper', zIndex: 10 }}>Answer</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 80, bgcolor: 'background.paper', zIndex: 10 }}>Round</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 220, bgcolor: 'background.paper', zIndex: 10 }}>Trainer Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 340, bgcolor: 'background.paper', zIndex: 10 }}>Skill Matrix</TableCell>
                      <TableCell sx={{ fontWeight: 700, minWidth: 150, bgcolor: 'background.paper', zIndex: 10 }}>Comments</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: 100, align: 'center', bgcolor: 'background.paper', zIndex: 10 }}>Attachment</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {uniqueTrainingDetails.map((detail, idx) => (
                      <TableRow key={detail.id || idx} sx={{
                        bgcolor: detail.trainerStatus === 'COMPLETED' ? 'success.lighter' : 'inherit',
                        '&:hover': { bgcolor: 'action.hover' }
                      }}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {detail.inductionDetails || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip 
                            title={
                              <Box sx={{ p: 0.5, maxWidth: 300 }}>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.4, color: 'common.white' }}>
                                  {detail.answer || "No expected answer provided"}
                                </Typography>
                              </Box>
                            } 
                            arrow 
                            placement="top"
                          >
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => {
                                setSelectedAnswer(detail.answer);
                                setSelectedCriteriaDetail(detail.inductionDetails);
                                setAnswerModalOpen(true);
                              }}
                            >
                              <IconInfoCircle size={18} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                        <TableCell>{detail.inductionRound || '-'}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <FormControlLabel
                              control={
                                <Radio
                                  checked={(detail.trainerStatus || 'PENDING') === 'PENDING'}
                                  onChange={() => updateDetail(detail.id, 'trainerStatus', 'PENDING')}
                                  disabled={!perms.write}
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2" sx={{ fontWeight: 500 }}>PENDING</Typography>}
                            />
                            <FormControlLabel
                              control={
                                <Radio
                                  checked={detail.trainerStatus === 'COMPLETED'}
                                  onChange={() => updateDetail(detail.id, 'trainerStatus', 'COMPLETED')}
                                  disabled={!perms.write}
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2" sx={{ fontWeight: 500 }}>COMPLETED</Typography>}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <FormControlLabel
                              control={
                                <Radio
                                  checked={detail.skillRating === 4 || detail.skillRating === 3}
                                  onChange={() => updateDetail(detail.id, 'skillRating', 4)}
                                  disabled={!perms.write}
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2" sx={{ fontWeight: 500 }}>ADVANCE LEVEL</Typography>}
                            />
                            <FormControlLabel
                              control={
                                <Radio
                                  checked={detail.skillRating === 2 || detail.skillRating === 1}
                                  onChange={() => updateDetail(detail.id, 'skillRating', 2)}
                                  disabled={!perms.write}
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2" sx={{ fontWeight: 500 }}>BASIC LEVEL</Typography>}
                            />
                            <FormControlLabel
                              control={
                                <Radio
                                  checked={detail.skillRating === 5}
                                  onChange={() => updateDetail(detail.id, 'skillRating', 5)}
                                  disabled={!perms.write}
                                  size="small"
                                />
                              }
                              label={<Typography variant="body2" sx={{ fontWeight: 500 }}>EXPERT</Typography>}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            multiline
                            maxRows={3}
                            value={detail.trainerComments || ''}
                            onChange={(e) => updateDetail(detail.id, 'trainerComments', e.target.value)}
                            disabled={!perms.write}
                            placeholder="Comments..."
                            fullWidth
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <IconButton 
                              size="small" 
                              color={detail.attachmentPath ? "success" : "primary"}
                              onClick={() => handleOpenAttachmentDialog(detail)}
                            >
                              <IconCloudUpload size={18} />
                            </IconButton>
                            {detail.attachmentPath && (
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                ({detail.attachmentPath.split(',').filter(Boolean).length})
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {trainingDetails.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">No criteria items loaded.</Typography>
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

      {/* Attachment Dialog */}
      <BOSMovableDialog
        open={attachmentDialogOpen}
        onClose={() => setAttachmentDialogOpen(false)}
        title="Upload Attachments"
        defaultWidth={640}
        defaultHeight={500}
        actions={attachmentDialogActions}
      >
        <BOSFormSection title="Files">
          <BOSFileUpload
            multiple={true}
            files={attachmentFiles}
            disabled={true}
            onChange={(newFiles) => {
              setAttachmentFiles(newFiles);
            }}
            onPreview={(file) => {
              const path = file.serverFileName || file.filePath || file;
              window.open(`${axios.defaults.baseURL}/api/files/download?path=${encodeURIComponent(path)}`, '_blank');
            }}
          />
        </BOSFormSection>
      </BOSMovableDialog>

      {/* Answer Details Dialog */}
      <Dialog
        open={answerModalOpen}
        onClose={() => setAnswerModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(15, 23, 42, 0.3)',
              backdropFilter: 'blur(4px)'
            }
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
            p: 3,
            position: 'relative'
          }
        }}
      >
        <DialogTitle sx={{ p: 0, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Answer Details
          </Typography>
          <IconButton onClick={() => setAnswerModalOpen(false)} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
            <IconX size={20} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, maxHeight: '60vh', overflowY: 'auto' }}>
          {selectedCriteriaDetail && (
            <Box sx={{ mb: 2.5, p: 2, bgcolor: 'grey.50', borderRadius: '8px', borderLeft: '4px solid', borderColor: 'primary.main' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                CRITERIA / QUESTION
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', whiteSpace: 'pre-line' }}>
                {selectedCriteriaDetail}
              </Typography>
            </Box>
          )}
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
              EXPECTED ANSWER / GUIDELINES
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.primary', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
              {selectedAnswer || 'No expected answer provided.'}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 0, mt: 3, justifyContent: 'flex-end' }}>
          <Button variant="contained" sx={btnCancel} onClick={() => setAnswerModalOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}
