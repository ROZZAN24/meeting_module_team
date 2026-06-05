import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, MenuItem, Grid, Box, Chip, Tooltip, IconButton } from '@mui/material';
import axios from 'utils/axios';
import { IconCalendar, IconDeviceFloppy, IconX, IconPlus, IconSearch } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import { BOSDataTable, BOSFormDialog, BOSTextField, BOSTableToolbar, BOSExportButton } from 'ui-component/bos';
import { matchDateRange } from 'ui-component/bos/BOSUtils';
import { useLookups } from 'hooks/useLookups';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import { setFilterConfig, resetFilters, setFilters, setQuery } from 'store/slices/search';

const MINUTES_LIST = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const BUSINESS_HOURS_LIST = ['10', '11', '12', '13', '14', '15', '16', '17'];

const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function InterviewProcess() {
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
  const [selectedRow, setSelectedRow] = useState(null);

  // Lookups
  const { departments = [], designations = [], employees = [] } = useLookups(['DEPARTMENTS', 'DESIGNATIONS', 'EMPLOYEES']);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    id: null,
    screeningLevel: '',
    round: '',
    interviewDate: '',
    startTimeHour: '',
    startTimeMinute: '',
    endTimeHour: '',
    endTimeMinute: '',
    interviewPerson: '',
    interviewStatus: 'PENDING',
    status: 'ACTIVE'
  });
  const [errors, setErrors] = useState({});

  // Load interviews
  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/hra/applicants/all-interviews');
      setRows(data || []);
    } catch (e) {
      console.error('Failed to load interview list', e);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to load scheduled interviews.',
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
    const config = [
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'ALL', label: 'ALL' },
          { value: 'PENDING', label: 'PENDING' },
          { value: 'SELECTED', label: 'SELECTED' },
          { value: 'REJECTED', label: 'REJECTED' },
          { value: 'ON HOLD', label: 'ON HOLD' },
          { value: 'WAITING FOR PROGRESS', label: 'WAITING FOR PROGRESS' }
        ],
        defaultValue: 'ALL',
        isStarred: true
      },
      {
        id: 'interviewDate',
        label: 'Interview Date',
        type: 'dateRange',
        isStarred: true
      },
      {
        id: 'searchBy',
        label: 'Search By',
        type: 'select',
        options: [
          { value: 'candidateCode', label: 'Applicant Id' },
          { value: 'candidateName', label: 'Applicant Name' },
          { value: 'department', label: 'Department' },
          { value: 'positionLookFor', label: 'Designation' }
        ],
        defaultValue: 'candidateCode',
        isStarred: true
      }
    ];

    dispatch(setFilterConfig(config));

    // Initialize defaults
    dispatch(
      setFilters({
        status: 'ALL',
        interviewDateStart: '2026-06-01',
        interviewDateEnd: '2026-06-03',
        searchBy: 'candidateCode',
        interviewDateConsider: 'Yes'
      })
    );

    return () => {
      dispatch(setFilterConfig(null));
      dispatch(resetFilters());
      dispatch(setQuery(''));
    };
  }, [dispatch]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  // Open Edit Dialog
  const handleOpenEdit = (row) => {
    const [startH, startM] = (row.startTime || '').split(':');
    const [endH, endM] = (row.endTime || '').split(':');

    setEditData({
      id: row.id,
      screeningLevel: row.screeningLevel || '',
      round: row.round || '',
      interviewDate: row.interviewDate || '',
      startTimeHour: startH || '',
      startTimeMinute: startM || '',
      endTimeHour: endH || '',
      endTimeMinute: endM || '',
      interviewPerson: row.interviewPerson || '',
      interviewStatus: row.interviewStatus || 'PENDING',
      status: row.status || 'ACTIVE'
    });
    setErrors({});
    setDialogOpen(true);
  };

  // Save Edit Details
  const handleSave = async () => {
    const errs = {};
    if (!editData.screeningLevel) errs.screeningLevel = 'Screening Level is required';
    if (!editData.round) errs.round = 'Round is required';
    if (!editData.interviewDate) errs.interviewDate = 'Interview Date is required';
    if (!editData.startTimeHour || !editData.startTimeMinute) errs.startTime = 'Start Time is required';
    if (!editData.endTimeHour || !editData.endTimeMinute) errs.endTime = 'End Time is required';
    if (!editData.interviewPerson) errs.interviewPerson = 'Interview Person is required';

    if (editData.startTimeHour) {
      const startH = parseInt(editData.startTimeHour, 10);
      if (startH < 10 || startH > 17) {
        errs.startTime = 'Start hour must be between 10 AM and 5 PM';
      }
    }
    if (editData.endTimeHour) {
      const endH = parseInt(editData.endTimeHour, 10);
      if (endH < 10 || endH > 17) {
        errs.endTime = 'End hour must be between 10 AM and 5 PM';
      }
    }

    if (editData.startTimeHour && editData.startTimeMinute && editData.endTimeHour && editData.endTimeMinute) {
      const startTotal = parseInt(editData.startTimeHour, 10) * 60 + parseInt(editData.startTimeMinute, 10);
      const endTotal = parseInt(editData.endTimeHour, 10) * 60 + parseInt(editData.endTimeMinute, 10);
      if (startTotal >= endTotal) {
        errs.endTime = 'End time must be after start time';
      }
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        screeningLevel: editData.screeningLevel,
        round: editData.round,
        interviewDate: editData.interviewDate,
        startTime: `${editData.startTimeHour}:${editData.startTimeMinute}`,
        endTime: `${editData.endTimeHour}:${editData.endTimeMinute}`,
        interviewPerson: editData.interviewPerson,
        interviewStatus: editData.interviewStatus,
        status: editData.status
      };

      await axios.put(`/api/hra/applicants/interviews/${editData.id}`, payload);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Interview process updated successfully!',
          variant: 'alert',
          severity: 'success'
        })
      );
      setDialogOpen(false);
      fetchInterviews();
    } catch (e) {
      console.error('Failed to update interview', e);
      dispatch(
        openSnackbar({
          open: true,
          message: 'Failed to update interview process details.',
          variant: 'alert',
          severity: 'error'
        })
      );
    } finally {
      setSaving(false);
    }
  };

  // Filter rows dynamically using global filters and query
  const resolvedRows = useMemo(() => {
    return rows
      .filter((row) => {
        // 1. Date range filter
        if (!matchDateRange(row, globalFilters, 'interviewDate')) return false;

        // 2. Status filter
        const statusVal = globalFilters.status || 'ALL';
        const matchesStatus = statusVal === 'ALL' || (row.interviewStatus || 'PENDING') === statusVal;

        // 3. Search text query filter
        const searchByVal = globalFilters.searchBy || 'candidateCode';
        const term = globalQuery ? globalQuery.toLowerCase() : '';
        let matchesSearch = true;
        if (term) {
          let cellValue = '';
          if (searchByVal === 'department') {
            const dept = departments.find((d) => d.id.toString() === row.department || d.departmentName === row.department);
            cellValue = dept ? dept.departmentName : row.department || '';
          } else if (searchByVal === 'positionLookFor') {
            const desig = designations.find((d) => d.id.toString() === row.positionLookFor || d.designationName === row.positionLookFor);
            cellValue = desig ? desig.designationName : row.positionLookFor || '';
          } else {
            cellValue = row[searchByVal] || '';
          }
          matchesSearch = cellValue.toString().toLowerCase().includes(term);
        }

        return matchesStatus && matchesSearch;
      })
      .map((r, i) => ({
        ...r,
        index: i + 1
      }));
  }, [rows, globalFilters, globalQuery, departments, designations]);

  // Table Columns
  const tableColumns = useMemo(
    () => [
      { id: 'index', label: 'Sl No', minWidth: 60 },
      { id: 'candidateCode', label: 'Applicant Id', minWidth: 120, bold: true, color: 'primary.main' },
      { id: 'candidateName', label: 'Applicant Name', minWidth: 150 },
      {
        id: 'department',
        label: 'Department',
        minWidth: 150,
        render: (row) => {
          const dept = departments.find((d) => d.id.toString() === row.department || d.departmentName === row.department);
          return dept ? dept.departmentName : row.department || '-';
        }
      },
      {
        id: 'positionLookFor',
        label: 'Designation',
        minWidth: 150,
        render: (row) => {
          const desig = designations.find((d) => d.id.toString() === row.positionLookFor || d.designationName === row.positionLookFor);
          return desig ? desig.designationName : row.positionLookFor || '-';
        }
      },
      { id: 'round', label: 'Interview Round', minWidth: 120 },
      { id: 'screeningLevel', label: 'Screening Level', minWidth: 120 },
      { id: 'interviewDate', label: 'Interview Date', minWidth: 120 },
      {
        id: 'interviewStatus',
        label: 'Interview Status',
        minWidth: 130,
        render: (row) => {
          const status = row.interviewStatus || 'PENDING';
          let color = 'default';
          if (status === 'SELECTED') color = 'success';
          else if (status === 'REJECTED') color = 'error';
          else if (status === 'ON HOLD') color = 'warning';
          else if (status === 'PENDING') color = 'info';
          else if (status === 'WAITING FOR PROGRESS') color = 'secondary';
          return <Chip label={status} size="small" color={color} sx={{ fontWeight: 'bold' }} />;
        }
      },
      { id: 'createdBy', label: 'Created By', minWidth: 120 },
      {
        id: 'createdDate',
        label: 'Created Date',
        minWidth: 150,
        render: (row) => (row.createdDate ? new Date(row.createdDate).toLocaleDateString('en-GB') : '-')
      }
    ],
    [departments, designations]
  );

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconCalendar size={22} style={{ color: '#2196f3' }} />
          <Typography variant="h3">Interview Process</Typography>
        </Stack>
      }
      secondary={
        <BOSTableToolbar
          onRefresh={fetchInterviews}
          exportData={resolvedRows}
          exportFilename="Interview_Process"
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
        {/* Status Filter */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}>
            Status
          </Typography>
          <BOSTextField
            select
            size="small"
            value={globalFilters.status || 'ALL'}
            onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
            sx={{
              minWidth: 110,
              '& .MuiOutlinedInput-root': { borderRadius: '6px', height: '34px', bgcolor: 'background.paper' }
            }}
          >
            <MenuItem value="ALL">ALL</MenuItem>
            <MenuItem value="PENDING">PENDING</MenuItem>
            <MenuItem value="SELECTED">SELECTED</MenuItem>
            <MenuItem value="REJECTED">REJECTED</MenuItem>
            <MenuItem value="ON HOLD">ON HOLD</MenuItem>
            <MenuItem value="WAITING FOR PROGRESS">WAITING FOR PROGRESS</MenuItem>
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
            value={globalFilters.searchBy || 'candidateCode'}
            onChange={(e) => dispatch(setFilters({ searchBy: e.target.value }))}
            sx={{
              minWidth: 130,
              '& .MuiOutlinedInput-root': { borderRadius: '6px', height: '34px', bgcolor: 'background.paper' }
            }}
          >
            <MenuItem value="candidateCode">Applicant Id</MenuItem>
            <MenuItem value="candidateName">Applicant Name</MenuItem>
            <MenuItem value="department">Department</MenuItem>
            <MenuItem value="positionLookFor">Designation</MenuItem>
          </BOSTextField>
        </Stack>

        {/* Search Here Input & Action Buttons */}
        <Box sx={{ flexGrow: 1, minWidth: 220, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BOSTextField
            fullWidth
            size="small"
            placeholder="Search Here..."
            value={globalQuery || ''}
            onChange={(e) => dispatch(setQuery(e.target.value))}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '6px', height: '34px', bgcolor: 'background.paper' }
            }}
          />
          {/* Action Icons */}
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
              filename="Interview_Process"
              columns={[
                { header: 'Applicant Id', key: 'candidateCode' },
                { header: 'Applicant Name', key: 'candidateName' },
                { header: 'Department', key: 'department' },
                { header: 'Designation', key: 'positionLookFor' },
                { header: 'Interview Round', key: 'round' },
                { header: 'Screening Level', key: 'screeningLevel' },
                { header: 'Interview Date', key: 'interviewDate' },
                { header: 'Interview Status', key: 'interviewStatus' },
                { header: 'Created By', key: 'createdBy' },
                { header: 'Created Date', key: 'createdDate' }
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
        onClickRow={(row) => setSelectedRow(row)}
        selectedRowId={selectedRow?.id}
        showActions={false}
      />

      {/* Centered Bottom Process Action Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
        <Button
          id="btn-process-interview"
          variant="contained"
          disabled={!selectedRow}
          onClick={() => handleOpenEdit(selectedRow)}
          startIcon={<IconPlus size={18} />}
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
          Process
        </Button>
      </Box>

      {/* Edit Process Dialog */}
      <BOSFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Edit Interview Process Details"
        maxWidth="md"
        onSave={handleSave}
        hideFooter={true}
      >
        <Grid container spacing={2.5}>
          {/* Screening Level */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'block', mb: 0.5 }}>
              Screening Level<span style={{ color: 'red' }}>*</span>
            </Typography>
            <BOSTextField
              select
              size="small"
              value={editData.screeningLevel}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (selected === '' || selected === undefined || selected === null) {
                    return <span style={{ color: '#9e9e9e' }}>-select-</span>;
                  }
                  return selected;
                }
              }}
              onChange={(e) => {
                setEditData((prev) => ({ ...prev, screeningLevel: e.target.value }));
                if (errors.screeningLevel) setErrors((prev) => ({ ...prev, screeningLevel: '' }));
              }}
              error={!!errors.screeningLevel}
              helperText={errors.screeningLevel}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
            >
              <MenuItem value="">-select-</MenuItem>
              <MenuItem value="1">1</MenuItem>
              <MenuItem value="2">2</MenuItem>
              <MenuItem value="3">3</MenuItem>
              <MenuItem value="4">4</MenuItem>
            </BOSTextField>
          </Grid>

          {/* Round */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'block', mb: 0.5 }}>
              Round<span style={{ color: 'red' }}>*</span>
            </Typography>
            <BOSTextField
              select
              size="small"
              value={editData.round}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (selected === '' || selected === undefined || selected === null) {
                    return <span style={{ color: '#9e9e9e' }}>-select-</span>;
                  }
                  return selected;
                }
              }}
              onChange={(e) => {
                setEditData((prev) => ({ ...prev, round: e.target.value }));
                if (errors.round) setErrors((prev) => ({ ...prev, round: '' }));
              }}
              error={!!errors.round}
              helperText={errors.round}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
            >
              <MenuItem value="">-select-</MenuItem>
              <MenuItem value="TECHNICAL">TECHNICAL</MenuItem>
              <MenuItem value="HR">HR</MenuItem>
              <MenuItem value="MANAGEMENT">MANAGEMENT</MenuItem>
              <MenuItem value="SPECIAL ROUND">SPECIAL ROUND</MenuItem>
            </BOSTextField>
          </Grid>

          {/* Interview Date */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'block', mb: 0.5 }}>
              Interview Date<span style={{ color: 'red' }}>*</span>
            </Typography>
            <BOSTextField
              type="date"
              size="small"
              value={editData.interviewDate}
              onChange={(e) => {
                setEditData((prev) => ({ ...prev, interviewDate: e.target.value }));
                if (errors.interviewDate) setErrors((prev) => ({ ...prev, interviewDate: '' }));
              }}
              inputProps={{ min: getTodayDateString() }}
              error={!!errors.interviewDate}
              helperText={errors.interviewDate}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
            />
          </Grid>

          {/* Time & End time Row */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'block', mb: 0.5 }}>
              Interview Status<span style={{ color: 'red' }}>*</span>
            </Typography>
            <BOSTextField
              select
              size="small"
              value={editData.interviewStatus}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (selected === '' || selected === undefined || selected === null) {
                    return <span style={{ color: '#9e9e9e' }}>-select-</span>;
                  }
                  return selected;
                }
              }}
              onChange={(e) => {
                setEditData((prev) => ({ ...prev, interviewStatus: e.target.value }));
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
            >
              <MenuItem value="PENDING">PENDING</MenuItem>
              <MenuItem value="SELECTED">SELECTED</MenuItem>
              <MenuItem value="REJECTED">REJECTED</MenuItem>
              <MenuItem value="ON HOLD">ON HOLD</MenuItem>
              <MenuItem value="WAITING FOR PROGRESS">WAITING FOR PROGRESS</MenuItem>
            </BOSTextField>
          </Grid>

          {/* Start Time */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'block', mb: 0.5 }}>
              Start Time<span style={{ color: 'red' }}>*</span>
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <BOSTextField
                select
                size="small"
                value={editData.startTimeHour}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (selected === '' || selected === undefined || selected === null) {
                      return <span style={{ color: '#9e9e9e' }}>-select-</span>;
                    }
                    return selected;
                  }
                }}
                onChange={(e) => {
                  setEditData((prev) => ({ ...prev, startTimeHour: e.target.value }));
                  if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: '' }));
                }}
                error={!!errors.startTime}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
              >
                <MenuItem value="">-select-</MenuItem>
                {BUSINESS_HOURS_LIST.map((h) => (
                  <MenuItem key={h} value={h}>
                    {h}
                  </MenuItem>
                ))}
              </BOSTextField>
              <Typography sx={{ fontWeight: 'bold' }}>:</Typography>
              <BOSTextField
                select
                size="small"
                value={editData.startTimeMinute}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (selected === '' || selected === undefined || selected === null) {
                      return <span style={{ color: '#9e9e9e' }}>-select-</span>;
                    }
                    return selected;
                  }
                }}
                onChange={(e) => {
                  setEditData((prev) => ({ ...prev, startTimeMinute: e.target.value }));
                  if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: '' }));
                }}
                error={!!errors.startTime}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
              >
                <MenuItem value="">-select-</MenuItem>
                {MINUTES_LIST.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </BOSTextField>
            </Stack>
            {errors.startTime && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.startTime}
              </Typography>
            )}
          </Grid>

          {/* End Time */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'block', mb: 0.5 }}>
              End Time<span style={{ color: 'red' }}>*</span>
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <BOSTextField
                select
                size="small"
                value={editData.endTimeHour}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (selected === '' || selected === undefined || selected === null) {
                      return <span style={{ color: '#9e9e9e' }}>-select-</span>;
                    }
                    return selected;
                  }
                }}
                onChange={(e) => {
                  setEditData((prev) => ({ ...prev, endTimeHour: e.target.value }));
                  if (errors.endTime) setErrors((prev) => ({ ...prev, endTime: '' }));
                }}
                error={!!errors.endTime}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
              >
                <MenuItem value="">-select-</MenuItem>
                {BUSINESS_HOURS_LIST.map((h) => (
                  <MenuItem key={h} value={h}>
                    {h}
                  </MenuItem>
                ))}
              </BOSTextField>
              <Typography sx={{ fontWeight: 'bold' }}>:</Typography>
              <BOSTextField
                select
                size="small"
                value={editData.endTimeMinute}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (selected === '' || selected === undefined || selected === null) {
                      return <span style={{ color: '#9e9e9e' }}>-select-</span>;
                    }
                    return selected;
                  }
                }}
                onChange={(e) => {
                  setEditData((prev) => ({ ...prev, endTimeMinute: e.target.value }));
                  if (errors.endTime) setErrors((prev) => ({ ...prev, endTime: '' }));
                }}
                error={!!errors.endTime}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
              >
                <MenuItem value="">-select-</MenuItem>
                {MINUTES_LIST.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </BOSTextField>
            </Stack>
            {errors.endTime && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {errors.endTime}
              </Typography>
            )}
          </Grid>

          {/* Active status */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'block', mb: 0.5 }}>
              Status<span style={{ color: 'red' }}>*</span>
            </Typography>
            <BOSTextField
              select
              size="small"
              value={editData.status}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (selected === '' || selected === undefined || selected === null) {
                    return <span style={{ color: '#9e9e9e' }}>-select-</span>;
                  }
                  return selected;
                }
              }}
              onChange={(e) => {
                setEditData((prev) => ({ ...prev, status: e.target.value }));
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
            >
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </BOSTextField>
          </Grid>

          {/* Interview Person */}
          <Grid item xs={12}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.primary', display: 'block', mb: 0.5 }}>
              Interview Person<span style={{ color: 'red' }}>*</span>
            </Typography>
            <BOSTextField
              select
              size="small"
              value={editData.interviewPerson}
              SelectProps={{
                displayEmpty: true,
                renderValue: (selected) => {
                  if (selected === '' || selected === undefined || selected === null) {
                    return <span style={{ color: '#9e9e9e' }}>-select-</span>;
                  }
                  return selected;
                }
              }}
              onChange={(e) => {
                setEditData((prev) => ({ ...prev, interviewPerson: e.target.value }));
                if (errors.interviewPerson) setErrors((prev) => ({ ...prev, interviewPerson: '' }));
              }}
              error={!!errors.interviewPerson}
              helperText={errors.interviewPerson}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '6px' } }}
            >
              <MenuItem value="">-select-</MenuItem>
              {employees.map((emp) => {
                const fullName = emp.employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.empCode;
                const valueStr = `${emp.empCode} - ${fullName}`;
                return (
                  <MenuItem key={emp.id} value={valueStr}>
                    {valueStr}
                  </MenuItem>
                );
              })}
            </BOSTextField>
          </Grid>
        </Grid>

        {/* Buttons Centered */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            onClick={() => setDialogOpen(false)}
            sx={{
              bgcolor: '#5A738E',
              color: '#fff',
              '&:hover': { bgcolor: '#4b5e75' },
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: '24px',
              px: 4,
              py: 1
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
              bgcolor: '#2196F3',
              color: '#fff',
              '&:hover': { bgcolor: '#1976D2' },
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: '24px',
              px: 4,
              py: 1
            }}
            startIcon={<IconDeviceFloppy size={18} />}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </BOSFormDialog>
    </MainCard>
  );
}
