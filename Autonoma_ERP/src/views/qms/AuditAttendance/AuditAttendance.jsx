import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, MenuItem, Box, Chip } from '@mui/material';
import { IconUsers, IconFileDownload, IconPlus, IconEdit, IconTrash, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { BOSDataTable, BOSFormDialog, BOSFormSection, BOSTextField, btnExport, btnNew, getStatusChipSx } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import useBOSValidation from 'hooks/useBOSValidation';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'auditScheduleNo', label: 'Audit Schedule No', minWidth: 150, bold: true },
  { id: 'name', label: 'Name', minWidth: 200 },
  { id: 'inTime', label: 'In Time', minWidth: 100 },
  { id: 'outTime', label: 'Out Time', minWidth: 100 },
  { id: 'attendanceStatus', label: 'Attendance Status', minWidth: 150 }
];

const VALIDATION_RULES = [
  { field: 'auditScheduleNo', label: 'Schedule No', required: true },
  { field: 'name', label: 'Name', required: true },
  { field: 'attendanceStatus', label: 'Attendance Status', required: true }
];

export default function AuditAttendance() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const { errors, validate, clearErrors } = useBOSValidation();

  const [rows, setRows] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, auditScheduleNo: '', name: '', inTime: '', outTime: '', attendanceStatus: 'PRESENT' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(setFilterConfig([
      {
        id: 'attendanceStatus',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'PRESENT', label: 'PRESENT' },
          { value: 'ABSENT', label: 'ABSENT' }
        ],
        defaultValue: 'All'
      }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [attRes, schRes] = await Promise.all([
        axios.get('/api/qms/audit/attendance'),
        axios.get('/api/qms/audit-schedules')
      ]);
      setRows(attRes.data || []);
      setSchedules(schRes.data || []);
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenAdd = () => {
    setFormData({ id: null, auditScheduleNo: '', name: '', inTime: '', outTime: '', attendanceStatus: 'PRESENT' });
    clearErrors();
    setDialogOpen(true);
  };

  const handleOpenEdit = (row) => {
    setFormData({ ...row });
    clearErrors();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;
    try {
      if (formData.id) {
        await axios.put(`/api/qms/audit/attendance/${formData.id}`, formData);
      } else {
        await axios.post('/api/qms/audit/attendance', formData);
      }
      dispatch(openSnackbar({ open: true, message: `Attendance ${formData.id ? 'updated' : 'saved'} successfully!`, severity: 'success', variant: 'alert' }));
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save attendance', severity: 'error', variant: 'alert' }));
    }
  };

  const handleDeleteClick = (row) => {
    setDeleteTarget(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/qms/audit/attendance/${deleteTarget.id}`);
      dispatch(openSnackbar({ open: true, message: 'Attendance record deleted!', severity: 'success', variant: 'alert' }));
      setDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete record', severity: 'error', variant: 'alert' }));
    }
  };

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'Audit Schedule No': r.auditScheduleNo,
      'Name': r.name,
      'In Time': r.inTime,
      'Out Time': r.outTime,
      'Status': r.attendanceStatus
    }));
    exportToExcel(exportData, 'Audit_User_Attendance');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusFilter = globalFilters.attendanceStatus || 'All';
      const matchesStatus = statusFilter === 'All' || row.attendanceStatus === statusFilter;
      const matchesSearch = !globalQuery || 
        (row.name && row.name.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.auditScheduleNo && row.auditScheduleNo.toLowerCase().includes(globalQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => setDialogOpen(false)
  });

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'attendanceStatus') return <Chip label={row.attendanceStatus} size="small" sx={getStatusChipSx(row.attendanceStatus === 'PRESENT' ? 'ACTIVE' : 'INACTIVE')} />;
    return row[col.id] || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconUsers size={24} />
          <Typography variant="h3">Audit User Attendance</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" color="primary" size="medium" startIcon={<IconFileDownload size={18} />} onClick={handleExport} sx={btnExport}>
            Export Excel
          </Button>
          <Tooltip title={shortcutTooltip('Add Attendance', 'Ctrl + N')}>
            <Button variant="contained" color="primary" size="medium" onClick={handleOpenAdd} sx={btnNew}>
              + New
            </Button>
          </Tooltip>
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={paginatedRows}
        page={page}
        size={size}
        totalCount={filteredRows.length}
        loading={loading}
        onPageChange={setPage}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onEditRow={handleOpenEdit}
        onDeleteRow={handleDeleteClick}
        renderCell={renderCell}
      />

      <BOSFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        title={formData.id ? 'Edit Attendance' : 'Add Attendance'}
        maxWidth="sm"
      >
        <Stack spacing={3}>
          <BOSFormSection title="Attendance Details" icon={<IconPlus size={20} />}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2.5 }}>
              <BOSTextField
                select
                required
                label="Schedule No"
                name="auditScheduleNo"
                value={formData.auditScheduleNo}
                onChange={(e) => setFormData({ ...formData, auditScheduleNo: e.target.value })}
                error={!!errors.auditScheduleNo}
                helperText={errors.auditScheduleNo}
              >
                {schedules.map(s => <MenuItem key={s.id} value={s.scheduleNo}>{s.scheduleNo} ({format(new Date(s.auditDate || s.scheduleDate), 'dd-MM-yyyy')})</MenuItem>)}
              </BOSTextField>
              <BOSTextField
                required
                label="Name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={!!errors.name}
                helperText={errors.name}
              />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <BOSTextField
                  label="In Time"
                  type="time"
                  value={formData.inTime}
                  onChange={(e) => setFormData({ ...formData, inTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
                <BOSTextField
                  label="Out Time"
                  type="time"
                  value={formData.outTime}
                  onChange={(e) => setFormData({ ...formData, outTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <BOSTextField
                select
                required
                label="Attendance Status"
                name="attendanceStatus"
                value={formData.attendanceStatus}
                onChange={(e) => setFormData({ ...formData, attendanceStatus: e.target.value })}
              >
                <MenuItem value="PRESENT">PRESENT</MenuItem>
                <MenuItem value="ABSENT">ABSENT</MenuItem>
              </BOSTextField>
            </Box>
          </BOSFormSection>
        </Stack>
      </BOSFormDialog>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Attendance"
        message="Are you sure you want to delete this attendance record?"
        itemName={deleteTarget?.name}
      />
    </MainCard>
  );
}
