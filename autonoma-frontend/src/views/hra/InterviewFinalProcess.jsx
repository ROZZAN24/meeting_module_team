import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Typography,
  Button,
  Stack,
  MenuItem,
  Grid,
  Box,
  Chip,
  Tooltip,
  IconButton,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  Checkbox
} from '@mui/material';
import axios from 'utils/axios';
import { IconUserCheck, IconDeviceFloppy, IconX, IconSearch, IconArrowLeft } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import { BOSDataTable, BOSFormDialog, BOSTextField, BOSTableToolbar, BOSExportButton } from 'ui-component/bos';
import { matchDateRange } from 'ui-component/bos/BOSUtils';
import { useLookups } from 'hooks/useLookups';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import { setFilterConfig, resetFilters, setFilters, setQuery } from 'store/slices/search';

export default function InterviewFinalProcess() {
  const dispatch = useDispatch();
  const perms = usePagePermissions(PAGE_CODES.HRA_ATS);

  // Redux Search Filters
  const globalFilters = useSelector((state) => state.search.filters);
  const globalQuery = useSelector((state) => state.search.query);

  // Data State
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);

  // Lookups
  const { departments = [], designations = [] } = useLookups(['DEPARTMENTS', 'DESIGNATIONS']);

  // Dialog & History State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [editData, setEditData] = useState({
    id: null,
    candidateCode: '',
    candidateName: '',
    positionLookFor: '',
    status: 'INTERVIEWING',
    comments: ''
  });

  // Load candidates
  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/hra/applicants/final-process-candidates');
      setRows(data || []);
      setSelectedIds([]);
    } catch (e) {
      console.error('Failed to load final process candidates', e);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to load candidates.',
          variant: 'alert',
          severity: 'error'
        })
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Search Filter Registration
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const config = [
      {
        id: 'status',
        label: 'Final Resolution',
        type: 'select',
        options: [
          { value: 'PENDING', label: 'PENDING' },
          { value: 'SELECTED', label: 'SELECTED' },
          { value: 'REJECTED', label: 'REJECTED' },
          { value: 'ON HOLD', label: 'ON HOLD' },
          { value: 'ALL', label: 'ALL' }
        ],
        defaultValue: 'PENDING',
        isStarred: true
      },
      {
        id: 'interviewDateStart',
        label: 'From Date',
        type: 'date',
        defaultValue: today,
        isStarred: true
      },
      {
        id: 'interviewDateEnd',
        label: 'To Date',
        type: 'date',
        defaultValue: today,
        isStarred: true
      },
      {
        id: 'interviewDateConsider',
        label: 'Consider Date?',
        type: 'select',
        options: [
          { value: 'Yes', label: 'YES' },
          { value: 'No', label: 'NO' }
        ],
        defaultValue: 'Yes',
        isStarred: true
      },
      {
        id: 'searchBy',
        label: 'Search By',
        type: 'select',
        options: [
          { value: 'ALL', label: 'All' },
          { value: 'candidateCode', label: 'Applicant ID' },
          { value: 'candidateName', label: 'Employee Name' },
          { value: 'status', label: 'Current Status' },
          { value: 'subject', label: 'Subject' }
        ],
        defaultValue: 'ALL',
        isStarred: true
      }
    ];

    dispatch(setFilterConfig(config));

    // Initialize defaults
    dispatch(
      setFilters({
        status: 'PENDING',
        searchBy: 'ALL',
        interviewDateConsider: 'Yes',
        interviewDateStart: today,
        interviewDateEnd: today
      })
    );

    return () => {
      dispatch(setFilterConfig(null));
      dispatch(resetFilters());
      dispatch(setQuery(''));
    };
  }, [dispatch]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Filter rows dynamically using global filters and query
  const resolvedRows = useMemo(() => {
    return rows
      .filter((row) => {
        // 1. Date range filter
        if (!matchDateRange(row, globalFilters, 'interviewDate')) return false;

        // 2. Status filter
        const statusVal = globalFilters.status || 'PENDING';
        let matchesStatus = true;
        if (statusVal === 'PENDING') {
          matchesStatus = !['SELECTED', 'OFFERED', 'REJECTED', 'ON HOLD'].includes(row.status);
        } else if (statusVal !== 'ALL') {
          matchesStatus = row.status === statusVal;
        }

        // 3. Search text query filter
        const searchByVal = globalFilters.searchBy || 'ALL';
        const term = globalQuery ? globalQuery.toLowerCase() : '';
        let matchesSearch = true;
        if (term) {
          if (searchByVal === 'ALL') {
            const dept = departments.find((d) => d.id.toString() === row.department || d.departmentName === row.department);
            const deptName = dept ? dept.departmentName : row.department || '';
            const desig = designations.find((d) => d.id.toString() === row.positionLookFor || d.designationName === row.positionLookFor);
            const desigName = desig ? desig.designationName : row.positionLookFor || '';

            matchesSearch =
              (row.candidateCode || '').toString().toLowerCase().includes(term) ||
              (row.candidateName || '').toString().toLowerCase().includes(term) ||
              (row.emailId || '').toString().toLowerCase().includes(term) ||
              deptName.toLowerCase().includes(term) ||
              desigName.toLowerCase().includes(term) ||
              (row.latestRoundStatus || '').toString().toLowerCase().includes(term) ||
              (row.status || '').toString().toLowerCase().includes(term);
          } else {
            let cellValue = '';
            if (searchByVal === 'candidateCode') {
              cellValue = row.candidateCode || '';
            } else if (searchByVal === 'candidateName') {
              cellValue = row.candidateName || '';
            } else if (searchByVal === 'status') {
              cellValue = row.latestRoundStatus || '';
            } else if (searchByVal === 'subject') {
              const desig = designations.find((d) => d.id.toString() === row.positionLookFor || d.designationName === row.positionLookFor);
              cellValue = desig ? desig.designationName : row.positionLookFor || '';
            }
            matchesSearch = cellValue.toString().toLowerCase().includes(term);
          }
        }

        return matchesStatus && matchesSearch;
      })
      .map((r, i) => ({
        ...r,
        index: i + 1
      }));
  }, [rows, globalFilters, globalQuery, departments, designations]);

  // Checkbox selection handlers
  const handleSelectAll = useCallback(
    (checked) => {
      if (checked) {
        setSelectedIds(resolvedRows.map((r) => r.id));
      } else {
        setSelectedIds([]);
      }
    },
    [resolvedRows]
  );

  const handleSelectRow = useCallback((id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }, []);

  // Open Edit Dialog & Fetch Candidate History
  const handleOpenEdit = async (row) => {
    setEditData({
      id: row.id,
      candidateCode: row.candidateCode,
      candidateName: row.candidateName,
      positionLookFor: row.positionLookFor,
      status: row.status || 'INTERVIEWING',
      comments: row.comments || ''
    });
    setInterviewHistory([]);
    setDialogOpen(true);
    setHistoryLoading(true);
    try {
      const { data } = await axios.get(`/api/hra/applicants/${row.id}/interviews`);
      setInterviewHistory(data || []);
    } catch (e) {
      console.error('Failed to load candidate interview history', e);
      setInterviewHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleOpenFinalResolution = () => {
    if (selectedIds.length === 1) {
      const target = resolvedRows.find((r) => r.id === selectedIds[0]);
      if (target) {
        handleOpenEdit(target);
      }
    }
  };

  // Save Final Decision
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        status: editData.status,
        comments: editData.comments
      };

      await axios.put(`/api/hra/applicants/final-process/${editData.id}`, payload);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Applicant decision finalized successfully!',
          variant: 'alert',
          severity: 'success'
        })
      );
      setDialogOpen(false);
      fetchCandidates();
      setSelectedIds([]);
    } catch (e) {
      console.error('Failed to finalize applicant', e);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to finalize decision.',
          variant: 'alert',
          severity: 'error'
        })
      );
    } finally {
      setSaving(false);
    }
  };

  // Table Columns
  const tableColumns = useMemo(
    () => [
      {
        id: 'select',
        label: (
          <Checkbox
            indeterminate={selectedIds.length > 0 && selectedIds.length < resolvedRows.length}
            checked={resolvedRows.length > 0 && selectedIds.length === resolvedRows.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
            size="small"
            sx={{ p: 0, color: 'inherit', '&.Mui-checked': { color: 'inherit' } }}
          />
        ),
        minWidth: 40,
        render: (row) => (
          <Checkbox
            checked={selectedIds.includes(row.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleSelectRow(row.id);
            }}
            size="small"
            sx={{ p: 0 }}
          />
        )
      },
      { id: 'index', label: 'Sl.No', minWidth: 60 },
      { id: 'candidateCode', label: 'Applicant ID', minWidth: 120, bold: true, color: 'primary.main' },
      { id: 'candidateName', label: 'Employee Name', minWidth: 150 },
      { id: 'interviewDate', label: 'Interview Date', minWidth: 120 },
      { id: 'emailId', label: 'To Email-Id', minWidth: 180 },
      {
        id: 'positionLookFor',
        label: 'Subject',
        minWidth: 150,
        render: (row) => {
          const desig = designations.find((d) => d.id.toString() === row.positionLookFor || d.designationName === row.positionLookFor);
          return desig ? desig.designationName : row.positionLookFor || '-';
        }
      },
      {
        id: 'latestRoundStatus',
        label: 'Current Status',
        minWidth: 150,
        render: (row) => {
          const status = row.latestRoundStatus || '-';
          if (status === '-') return '-';
          let color = 'default';
          if (status === 'SELECTED') color = 'success';
          else if (status === 'REJECTED') color = 'error';
          else if (status === 'ON HOLD') color = 'warning';
          else if (status === 'PENDING') color = 'info';
          else if (status === 'WAITING FOR PROGRESS') color = 'secondary';
          return <Chip label={status} size="small" color={color} sx={{ fontWeight: 'bold' }} />;
        }
      },
      { id: 'latestRound', label: 'Interview Process', minWidth: 130 },
      {
        id: 'rating',
        label: 'Rating',
        minWidth: 80,
        render: () => '-'
      },
      {
        id: 'status',
        label: 'Final Resolution',
        minWidth: 130,
        render: (row) => {
          const status = row.status || 'APPLIED';
          let color = 'primary';
          if (status === 'OFFERED' || status === 'ON-ROLL') color = 'success';
          else if (status === 'REJECTED') color = 'error';
          else if (status === 'ON HOLD') color = 'warning';
          return <Chip label={status} size="small" color={color} sx={{ fontWeight: 'bold' }} />;
        }
      }
    ],
    [selectedIds, resolvedRows, designations, handleSelectAll, handleSelectRow]
  );

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconUserCheck size={22} style={{ color: '#2196f3' }} />
          <Typography variant="h3">Interview Final Process</Typography>
        </Stack>
      }
      secondary={
        <BOSTableToolbar
          onRefresh={fetchCandidates}
          exportData={resolvedRows}
          exportFilename="Interview_Final_Process"
          hasExportPermission={perms.export}
          columns={tableColumns}
          hasWritePermission={false}
        />
      }
    >
      {/* Horizontal Search Filter Bar */}
      <Box
        sx={{
          mb: 2.5,
          p: 1.5,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc'),
          borderRadius: '8px',
          border: '1px solid',
          borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0'),
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        {/* Final Resolution Filter */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>
            Final Resolution
          </Typography>
          <BOSTextField
            select
            size="small"
            value={globalFilters.status || 'PENDING'}
            onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
            sx={{
              minWidth: 120,
              '& .MuiOutlinedInput-root': { borderRadius: '6px', height: '34px', bgcolor: 'background.paper' }
            }}
          >
            <MenuItem value="PENDING">PENDING</MenuItem>
            <MenuItem value="SELECTED">SELECTED</MenuItem>
            <MenuItem value="REJECTED">REJECTED</MenuItem>
            <MenuItem value="ON HOLD">ON HOLD</MenuItem>
            <MenuItem value="ALL">ALL</MenuItem>
          </BOSTextField>
        </Stack>

        {/* From Date Filter */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>
            From Date
          </Typography>
          <BOSTextField
            type="date"
            size="small"
            value={globalFilters.interviewDateStart || ''}
            onChange={(e) => dispatch(setFilters({ interviewDateStart: e.target.value }))}
            sx={{
              width: 145,
              '& .MuiOutlinedInput-root': { borderRadius: '6px', height: '34px', bgcolor: 'background.paper' }
            }}
          />
        </Stack>

        {/* To Date Filter */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>
            To Date
          </Typography>
          <BOSTextField
            type="date"
            size="small"
            value={globalFilters.interviewDateEnd || ''}
            onChange={(e) => dispatch(setFilters({ interviewDateEnd: e.target.value }))}
            sx={{
              width: 145,
              '& .MuiOutlinedInput-root': { borderRadius: '6px', height: '34px', bgcolor: 'background.paper' }
            }}
          />
        </Stack>

        {/* Consider Date Filter */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>
            Consider Date?
          </Typography>
          <BOSTextField
            select
            size="small"
            value={globalFilters.interviewDateConsider || 'Yes'}
            onChange={(e) => dispatch(setFilters({ interviewDateConsider: e.target.value }))}
            sx={{
              minWidth: 80,
              '& .MuiOutlinedInput-root': { borderRadius: '6px', height: '34px', bgcolor: 'background.paper' }
            }}
          >
            <MenuItem value="Yes">YES</MenuItem>
            <MenuItem value="No">NO</MenuItem>
          </BOSTextField>
        </Stack>

        {/* Search By Filter */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>
            Search By
          </Typography>
          <BOSTextField
            select
            size="small"
            value={globalFilters.searchBy || 'ALL'}
            onChange={(e) => dispatch(setFilters({ searchBy: e.target.value }))}
            sx={{
              minWidth: 120,
              '& .MuiOutlinedInput-root': { borderRadius: '6px', height: '34px', bgcolor: 'background.paper' }
            }}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="candidateCode">Applicant ID</MenuItem>
            <MenuItem value="candidateName">Employee Name</MenuItem>
            <MenuItem value="status">Current Status</MenuItem>
            <MenuItem value="subject">Subject</MenuItem>
          </BOSTextField>
        </Stack>

        {/* Search Input */}
        <Box sx={{ flexGrow: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BOSTextField
            fullWidth
            size="small"
            placeholder="Search Here"
            value={globalQuery || ''}
            onChange={(e) => dispatch(setQuery(e.target.value))}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '6px', height: '34px', bgcolor: 'background.paper' }
            }}
          />
          <Tooltip title="Search">
            <IconButton
              size="small"
              sx={{
                bgcolor: '#5b7290',
                color: '#fff',
                width: 34,
                height: 34,
                borderRadius: '6px',
                '&:hover': { bgcolor: '#4a5d76' }
              }}
            >
              <IconSearch size={18} />
            </IconButton>
          </Tooltip>

          {perms.export && (
            <BOSExportButton
              data={resolvedRows}
              filename="Interview_Final_Process"
              columns={[
                { header: 'Applicant ID', key: 'candidateCode' },
                { header: 'Employee Name', key: 'candidateName' },
                { header: 'Interview Date', key: 'interviewDate' },
                { header: 'To Email-Id', key: 'emailId' },
                { header: 'Subject', key: 'positionLookFor' },
                { header: 'Current Status', key: 'latestRoundStatus' },
                { header: 'Interview Process', key: 'latestRound' },
                { header: 'Final Resolution', key: 'status' }
              ]}
              variant="contained"
              sx={{
                minWidth: 34,
                width: 34,
                height: 34,
                p: 0,
                borderRadius: '6px',
                '& .MuiButton-startIcon': { margin: 0 },
                fontSize: 0,
                bgcolor: '#5b7290',
                color: '#fff',
                '&:hover': { bgcolor: '#4a5d76' }
              }}
            />
          )}
        </Box>
      </Box>

      <BOSDataTable
        columns={tableColumns}
        rows={resolvedRows}
        page={page}
        size={size}
        loading={loading}
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => {
          setSize(s);
          setPage(0);
        }}
        onDoubleClickRow={perms.write ? handleOpenEdit : null}
        onClickRow={(row) => handleSelectRow(row.id)}
        selectedRowId={selectedIds}
        showActions={false}
      />

      {/* Bottom Actions Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 1 }}>
        <Button
          id="btn-back"
          variant="contained"
          onClick={() => window.history.back()}
          startIcon={<IconArrowLeft size={18} />}
          sx={{
            bgcolor: '#5b7290',
            color: '#fff',
            '&:hover': { bgcolor: '#4a5d76' },
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: '4px',
            px: 4,
            py: 1,
            boxShadow: 'none'
          }}
        >
          Back
        </Button>
        <Button
          id="btn-finalize-decision"
          variant="contained"
          disabled={selectedIds.length !== 1}
          onClick={handleOpenFinalResolution}
          startIcon={<IconUserCheck size={18} />}
          sx={{
            bgcolor: '#5b7290',
            color: '#fff',
            '&:hover': { bgcolor: '#4a5d76' },
            '&.Mui-disabled': { bgcolor: 'rgba(91, 114, 144, 0.4)', color: 'rgba(255, 255, 255, 0.6)' },
            textTransform: 'none',
            fontWeight: 'bold',
            borderRadius: '4px',
            px: 4,
            py: 1,
            boxShadow: 'none'
          }}
        >
          Finalize Decision
        </Button>
      </Box>

      {/* Final Decision Dialog */}
      <BOSFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Finalize Applicant Decision"
        maxWidth="md"
        onSave={handleSave}
        hideFooter={true}
      >
        <Grid container spacing={2.5}>
          {/* Candidate Info Summary Header (Read-only) */}
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.01)' : '#f8fafc'),
                borderRadius: '6px',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                    Applicant Code
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {editData.candidateCode}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                    Applicant Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {editData.candidateName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                    Designation Looked For
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {designations.find(
                      (d) => d.id.toString() === editData.positionLookFor || d.designationName === editData.positionLookFor
                    )?.designationName ||
                      editData.positionLookFor ||
                      '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Interview History Title */}
          <Grid item xs={12} sx={{ mt: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 'bold',
                mb: 1,
                color: 'text.secondary',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.5px'
              }}
            >
              Completed Interview Rounds
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 220, overflowY: 'auto', borderRadius: '8px' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {['#', 'Screening Level', 'Round', 'Date', 'Start Time', 'End Time', 'Interviewed By', 'Status'].map((col) => (
                      <TableCell
                        key={col}
                        sx={{
                          bgcolor: '#5A738E',
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: '0.75rem',
                          py: 0.8
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : interviewHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No completed interview rounds found for this applicant.
                      </TableCell>
                    </TableRow>
                  ) : (
                    interviewHistory.map((item, idx) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>{idx + 1}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>{item.screeningLevel}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>
                          <Chip
                            label={item.round}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>{item.interviewDate}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>{item.startTime}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>{item.endTime}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>{item.interviewPerson}</TableCell>
                        <TableCell sx={{ fontSize: '0.75rem', py: 0.5 }}>
                          <Chip
                            label={item.interviewStatus}
                            size="small"
                            color={
                              item.interviewStatus === 'SELECTED'
                                ? 'success'
                                : item.interviewStatus === 'REJECTED'
                                  ? 'error'
                                  : item.interviewStatus === 'ON HOLD'
                                    ? 'warning'
                                    : item.interviewStatus === 'PENDING'
                                      ? 'info'
                                      : 'secondary'
                            }
                            sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Decision Inputs */}
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'block', mb: 0.5 }}>
              Final Decision Status<span style={{ color: 'red' }}>*</span>
            </Typography>
            <BOSTextField
              select
              size="small"
              value={editData.status}
              onChange={(e) => setEditData((prev) => ({ ...prev, status: e.target.value }))}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
            >
              <MenuItem value="INTERVIEWING">INTERVIEWING</MenuItem>
              <MenuItem value="SELECTED">SELECTED</MenuItem>
              <MenuItem value="REJECTED">REJECTED</MenuItem>
              <MenuItem value="ON HOLD">ON HOLD</MenuItem>
            </BOSTextField>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'block', mb: 0.5 }}>
              HR Remarks / Final Comments
            </Typography>
            <BOSTextField
              fullWidth
              size="small"
              multiline
              rows={2}
              value={editData.comments}
              onChange={(e) => setEditData((prev) => ({ ...prev, comments: e.target.value }))}
              placeholder="Enter final decision feedback remarks..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
            />
          </Grid>

          {/* Dialog Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, mb: 1 }}>
              <Button
                variant="contained"
                onClick={() => setDialogOpen(false)}
                sx={{
                  bgcolor: '#5A738E',
                  color: '#fff',
                  '&:hover': { bgcolor: '#4b5e75' },
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 4,
                  py: 0.75,
                  borderRadius: '4px'
                }}
                startIcon={<IconX size={18} />}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                sx={{
                  bgcolor: '#4b6584',
                  color: '#fff',
                  '&:hover': { bgcolor: '#3d526b' },
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 4,
                  py: 0.75,
                  borderRadius: '4px'
                }}
                startIcon={<IconDeviceFloppy size={18} />}
              >
                {saving ? 'Saving...' : 'Save Decision'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </BOSFormDialog>
    </MainCard>
  );
}
