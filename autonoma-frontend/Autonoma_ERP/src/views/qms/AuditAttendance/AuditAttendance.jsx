import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, MenuItem, Box, Chip, Divider } from '@mui/material';
import { IconUsers, IconFileDownload, IconPlus, IconEdit, IconTrash, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
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
  { id: 'employeeCode', label: 'Employee Code', minWidth: 120 },
  { id: 'name', label: 'Name', minWidth: 200 },
  { id: 'inTime', label: 'In Time', minWidth: 100 },
  { id: 'outTime', label: 'Out Time', minWidth: 100 },
  { id: 'attendanceStatus', label: 'Attendance Status', minWidth: 150 }
];

const TIME_OPTIONS = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'
];

const VALIDATION_RULES = [
  { field: 'auditScheduleNo', label: 'Schedule No', required: true },
  { field: 'name', label: 'Name', required: true },
  { field: 'attendanceStatus', label: 'Attendance Status', required: true }
];

export default function AuditAttendance() {
  const dispatch = useDispatch();
  const { validate, clearErrors, errors } = useBOSValidation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, auditScheduleNo: '', name: '', employeeCode: '', inTime: '', outTime: '', attendanceStatus: 'PRESENT' });
  const [participants, setParticipants] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [schedules, setSchedules] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [attRes, schRes] = await Promise.all([
        axios.get('/api/qms/audit/attendance'),
        axios.get('/api/qms/audit-schedules')
      ]);
      const data = attRes.data || [];
      console.log('Attendance Data (Final):', data);
      setRows(data);
      setSchedules(schRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpenAdd = () => {
    setFormData({ id: null, auditScheduleNo: '', name: '', employeeCode: '', inTime: '', outTime: '', attendanceStatus: 'PRESENT' });
    clearErrors();
    setDialogOpen(true);
  };

  const handleOpenEdit = (row) => {
    setFormData({ ...row });
    clearErrors();
    setDialogOpen(true);
  };

  useEffect(() => {
    const fetchParticipants = async () => {
      if (formData.auditScheduleNo && !formData.id) {
        try {
          const res = await axios.get(`/api/qms/audit/attendance/participants/${formData.auditScheduleNo}`);
          setParticipants(res.data || []);
          
          const schedule = schedules.find(s => s.scheduleNo === formData.auditScheduleNo);
          if (schedule) {
            const formatTo12h = (t) => {
              if (!t || t.includes('AM') || t.includes('PM')) return t;
              let [h, m] = t.split(':').map(Number);
              const ampm = h >= 12 ? 'PM' : 'AM';
              h = h % 12 || 12;
              return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
            };
            setFormData(prev => ({
              ...prev,
              inTime: formatTo12h(schedule.startTime) || prev.inTime,
              outTime: formatTo12h(schedule.endTime) || prev.outTime
            }));
          }
        } catch (err) {
          setParticipants([]);
        }
      }
    };
    fetchParticipants();
  }, [formData.auditScheduleNo, formData.id, schedules]);

  const handleSave = async () => {
    if (!validate(formData, VALIDATION_RULES)) return;
    try {
      if (formData.id) await axios.put(`/api/qms/audit/attendance/${formData.id}`, formData);
      else await axios.post('/api/qms/audit/attendance', formData);
      dispatch(openSnackbar({ open: true, message: 'Success!', severity: 'success' }));
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed', severity: 'error' }));
    }
  };

  const renderCell = useCallback((col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    let val = row[col.id];

    // Extraction for Employee Code
    if (col.id === 'employeeCode' && (!val || val === '-')) {
      const nameStr = String(row.name || '');
      if (nameStr.includes(' - ')) return nameStr.split(' - ')[1];
    }

    if (col.id === 'attendanceStatus') {
      const st = String(val || 'PRESENT');
      return <Chip label={st} size="small" sx={getStatusChipSx(st === 'PRESENT' ? 'ACTIVE' : 'INACTIVE')} />;
    }

    return String(val || '-');
  }, [page, size]);

  return (
    <MainCard 
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconUsers size={20} />
          <Typography variant="h3">Audit Attendance</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5}>
          <IconButton onClick={fetchData} color="primary" sx={{ border: '1px solid divider', p: 1 }}><IconRefresh size={20} /></IconButton>
          <Button variant="contained" onClick={handleOpenAdd} sx={btnNew}>+ New</Button>
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={rows.slice(page * size, page * size + size)}
        page={page}
        size={size}
        totalCount={rows.length}
        loading={loading}
        onPageChange={setPage}
        onSizeChange={setSize}
        onEditRow={handleOpenEdit}
        onDeleteRow={(r) => { setDeleteTarget(r); setDeleteDialogOpen(true); }}
        renderCell={renderCell}
      />

      <BOSFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSave} title={formData.id ? 'Edit Attendance' : 'Add Attendance'}>
        <BOSFormSection title="Details" icon={<IconPlus size={20} />}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2.5 }}>
            <BOSTextField
              select
              required
              label="Schedule No"
              value={formData.auditScheduleNo}
              onChange={(e) => setFormData({ ...formData, auditScheduleNo: e.target.value })}
              error={!!errors.auditScheduleNo}
              helperText={errors.auditScheduleNo}
            >
              {schedules.map(s => <MenuItem key={s.id} value={s.scheduleNo}>{s.scheduleNo} ({s.startTime})</MenuItem>)}
            </BOSTextField>
            
            <BOSTextField
              select
              required
              label="Name"
              value={formData.name && formData.employeeCode ? formData.name + '|' + formData.employeeCode : ''}
              onChange={(e) => {
                const [n, c] = e.target.value.split('|');
                setFormData({ ...formData, name: n, employeeCode: c });
              }}
              error={!!errors.name}
              helperText={errors.name}
            >
              {participants.length > 0 ? (
                participants.map(p => <MenuItem key={p.code + p.name} value={p.name + '|' + p.code}>{p.name} ({p.code})</MenuItem>)
              ) : (
                formData.name && <MenuItem value={formData.name + '|' + formData.employeeCode}>{formData.name} ({formData.employeeCode})</MenuItem>
              )}
            </BOSTextField>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <BOSTextField
                select
                label="In Time"
                disabled={formData.attendanceStatus === 'ABSENT'}
                value={formData.inTime}
                onChange={(e) => setFormData({ ...formData, inTime: e.target.value })}
                error={!!errors.inTime}
                helperText={errors.inTime}
              >
                {TIME_OPTIONS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </BOSTextField>
              <BOSTextField
                select
                label="Out Time"
                disabled={formData.attendanceStatus === 'ABSENT'}
                value={formData.outTime}
                onChange={(e) => setFormData({ ...formData, outTime: e.target.value })}
                error={!!errors.outTime}
                helperText={errors.outTime}
              >
                {TIME_OPTIONS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </BOSTextField>
            </Box>

            <BOSTextField
              select
              required
              label="Attendance Status"
              value={formData.attendanceStatus}
              onChange={(e) => {
                const s = e.target.value;
                setFormData(prev => ({ ...prev, attendanceStatus: s, inTime: s === 'ABSENT' ? '' : prev.inTime, outTime: s === 'ABSENT' ? '' : prev.outTime }));
              }}
              error={!!errors.attendanceStatus}
              helperText={errors.attendanceStatus}
            >
              <MenuItem value="PRESENT">PRESENT</MenuItem>
              <MenuItem value="ABSENT">ABSENT</MenuItem>
            </BOSTextField>
          </Box>
        </BOSFormSection>
      </BOSFormDialog>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={async () => {
          try {
            await axios.delete(`/api/qms/audit/attendance/${deleteTarget.id}`);
            dispatch(openSnackbar({ open: true, message: 'Deleted!', severity: 'success' }));
            setDeleteDialogOpen(false);
            fetchData();
          } catch (error) {
            dispatch(openSnackbar({ open: true, message: 'Failed', severity: 'error' }));
          }
        }}
        itemName={deleteTarget?.name}
      />
    </MainCard>
  );
}
