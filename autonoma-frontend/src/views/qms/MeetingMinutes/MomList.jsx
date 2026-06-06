import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, Chip } from '@mui/material';
import { IconPlus, IconFileText, IconRefresh, IconArrowsExchange, IconFileTypePdf } from '@tabler/icons-react';
import axios from 'utils/axios';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import useLookups from 'hooks/useLookups';
import { BOSDataTable, getStatusChipSx, BOSTableToolbar, getCommonDateFilters, matchCommonDateFilters } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import ReassignDialog from './ReassignDialog';
import { isMobile } from 'react-device-detect';
import useAuth from 'hooks/useAuth';

const columns = [
  { id: 'index', label: '#', minWidth: 50, align: 'center' },
  { id: 'momNo', label: 'Meeting Min No', minWidth: 200, bold: true, align: 'center' },
  { id: 'meetingType', label: 'Type', minWidth: 100, align: 'center' },
  { id: 'momDate', label: 'Meeting Date', minWidth: 120, align: 'center' },
  { id: 'scheduleNo', label: 'Meeting Sch No', minWidth: 180, align: 'center' },
  { id: 'minNo', label: 'Min No', minWidth: 200, align: 'center' },
  { id: 'discussedPoint', label: 'Discussed Point', minWidth: 300, align: 'center' },
  { id: 'materialList', label: 'Material List', minWidth: 120, align: 'center' },
  { id: 'processType', label: 'Process', minWidth: 100, align: 'center' },
  { id: 'assignedTo', label: 'Assigned To', minWidth: 130, align: 'center' },
  { id: 'assignedBy', label: 'Assigned By', minWidth: 130, align: 'center' },
  { id: 'detailStatus', label: 'Status', minWidth: 120, align: 'center' },
  { id: 'targetDate', label: 'Target Date', minWidth: 120, align: 'center' },
  { id: 'reviewDate', label: 'Review Date', minWidth: 120, align: 'center' },
  { id: 'pdf', label: 'PDF', minWidth: 80, align: 'center' },
  { id: 'createdUser', label: 'CREATED USER', minWidth: 120, align: 'center' },
  { id: 'createdDate', label: 'CREATED DATE', minWidth: 150, align: 'center' },
  { id: 'updatedUser', label: 'UPDATED USER', minWidth: 120, align: 'center' },
  { id: 'updatedDate', label: 'UPDATED DATE', minWidth: 150, align: 'center' }
];

const formatDateTime = (dateVal) => {
  if (!dateVal || dateVal === '-') return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const dateStr = `${day}/${month}/${year}`;
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, '0');
    const timeStr = `${hoursStr}:${minutes} ${ampm}`;
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ width: '100%', textAlign: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {dateStr}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {timeStr}
        </Typography>
      </Stack>
    );
  } catch (e) {
    return '-';
  }
};

export default function MomList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const perms = usePagePermissions(PAGE_CODES.QMS_MEETING_MOM);
  const { user } = useAuth();
  const lookups = useLookups(['DEPARTMENTS']);

  const [rows, setRows] = useState([]);
  const [flatRows, setFlatRows] = useState([]); // flattened detail rows
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [selectedForReassign, setSelectedForReassign] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // ── RESOLVED ROWS (SOP #16 Standard) ──
  // Resolve all complex objects into flat strings for BOSDataTable to handle filtering/extraction
  const resolvedRows = useMemo(() => {
    if (!Array.isArray(flatRows)) return [];
    return flatRows.map(row => {
      return {
        ...row,
        meetingType: row._meetingType || '-',
        momDate: row._momDate || '-',
        scheduleNo: row._scheduleNo || '-',
        minNo: row.id ? `${row._momNo}/${String(row.id).padStart(3, '0')}` : '-',
        discussedPoint: row.discussedPoint || '-',
        processType: row.processType || '-',
        assignedTo: row.assignedTo?.employeeName || '-',
        assignedBy: row.assignedBy?.employeeName || '-',
        targetDate: row.targetDate || '-',
        reviewDate: row.reviewDate || '-',
        createdUser: row._createdUser || row._createdBy || '-',
        createdDate: row._createdAt ? format(new Date(row._createdAt), 'dd/MM/yyyy HH:mm') : '-',
        updatedUser: row._updatedUser || row._updatedBy || '-',
        updatedDate: row._updatedAt ? format(new Date(row._updatedAt), 'dd/MM/yyyy HH:mm') : '-',
        status: row.status || 'OPEN',
        detailStatus: row.status || 'OPEN', // specifically for the status chip column
        momNo: row._momNo || '-'
      };
    });
  }, [flatRows]);

  // ── GLOBAL FILTER CONFIG ──
  useEffect(() => {
    dispatch(setFilterConfig([{
        id: 'status', label: 'Status', type: 'select', isStarred: true,
        options: [
          { value: 'PENDING', label: 'Pending (Open / In Progress)' },
          { value: 'CLOSED', label: 'Closed' },
          { value: 'PENDING FOR APPROVAL', label: 'Pending For Approval' },
          { value: 'CANCELLED', label: 'Cancelled' },
          { value: 'All', label: 'All' }
        ],
        defaultValue: 'All'
      },
      { id: 'fromDate', label: 'From Date', type: 'date', isStarred: true },
      { id: 'toDate', label: 'To Date', type: 'date', isStarred: true },
      {
        id: 'considerDate', label: 'Consider Date?', type: 'select', isStarred: true,
        options: [{ value: 'YES', label: 'Yes' }, { value: 'NO', label: 'No' }],
        defaultValue: 'NO'
      },
      ...getCommonDateFilters('createdDate', 'updatedDate')]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  // ── FILTERED ROWS (apply status + date filters) ──
  const filteredRows = useMemo(() => {
    return resolvedRows.filter((row) => {
      if (!matchCommonDateFilters(row, globalFilters, 'createdDate', 'updatedDate')) return false;

      // Status Filter
      const statusFilter = globalFilters.status || 'PENDING';
      if (statusFilter !== 'All') {
        const rowStatus = (row.status || 'OPEN').toUpperCase();
        if (statusFilter === 'PENDING') {
          // PENDING shows everything except CLOSED and CANCELLED
          if (rowStatus === 'CLOSED' || rowStatus === 'CANCELLED') return false;
        } else {
          if (rowStatus !== statusFilter) return false;
        }
      }

      // Date Filtering
      if (globalFilters.considerDate === 'YES' && globalFilters.fromDate && globalFilters.toDate) {
        const dateVal = row.momDate || '';
        if (dateVal && dateVal !== '-') {
          if (dateVal < globalFilters.fromDate || dateVal > globalFilters.toDate) return false;
        }
      }

      // Global Quick Search
      if (globalQuery) {
        const q = globalQuery.toLowerCase();
        return (row.momNo || '').toLowerCase().includes(q) ||
               (row.discussedPoint || '').toLowerCase().includes(q) ||
               (row.assignedTo || '').toLowerCase().includes(q) ||
               (row.scheduleNo || '').toLowerCase().includes(q);
      }

      return true;
    });
  }, [resolvedRows, globalQuery, globalFilters]);

  // ── HANDLERS ──
  const handleAdd = () => {
    if (!perms.write) return;
    navigate('/qms/minutesofmeeting/add');
  };
  const handleEdit = (item) => {
    const momId = item._momId || item.id;
    navigate(`/qms/minutesofmeeting/edit/${momId}`);
  };
  const handleDeleteClick = (row) => { setDeleteTarget(row); setDeleteDialogOpen(true); };

  const handleReassignClick = () => {
    if (!selectedRow) {
      dispatch(openSnackbar({ open: true, message: 'Please select any one Record', variant: 'alert', severity: 'warning' }));
      return;
    }
    if (selectedRow.status === 'CLOSED') {
      dispatch(openSnackbar({ open: true, message: 'This Record is already Closed...so you can\'t cancel this Record...', variant: 'alert', severity: 'error' }));
      return;
    }
    if (selectedRow.status === 'CANCELLED') {
      dispatch(openSnackbar({ open: true, message: 'This Record is already Cancelled...', variant: 'alert', severity: 'error' }));
      return;
    }
    setSelectedForReassign(selectedRow);
    setReassignOpen(true);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.QMS.MOMS);
      const rawData = Array.isArray(response.data) ? response.data : [];
      const data = [...rawData].sort((a, b) => b.id - a.id);
      setRows(data);
      
      // Flatten detail rows for the list view
      const details = [];
      data.forEach((mom) => {
        if (Array.isArray(mom.details)) {
          mom.details.forEach((det) => {
            details.push({
              ...det,
              _momId: mom.id,
              _momNo: mom.momNo,
              _meetingType: mom.schedule?.meetingType?.meetingName || '-',
              _momDate: mom.momDate,
              _scheduleNo: mom.schedule?.scheduleNo || '-',
              _hostId: mom.schedule?.hostBy?.id || null,
              _createdUser: mom.createdUser,
              _createdBy: mom.createdBy,
              _createdAt: mom.createdAt,
              _updatedUser: mom.updatedUser,
              _updatedBy: mom.updatedBy,
              _updatedAt: mom.updatedAt
            });
          });
        }
      });
      setFlatRows(details);
    } catch (error) {
      console.error('Failed to fetch MOMs:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to fetch MOM records', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      const momId = deleteTarget._momId || deleteTarget.id;
      await axios.delete(`${API_PATHS.QMS.MOMS}/${momId}`);
      dispatch(openSnackbar({ open: true, message: 'Record deleted', variant: 'alert', severity: 'success' }));
      fetchData();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Cannot delete records', variant: 'alert', severity: 'error' }));
    }
  };

  useKeyboardShortcuts({ 'ctrl+n': handleAdd });

  // ── RENDER CELL ──
  const renderCell = (col, row, idx) => {
    if (col.id === 'pdf') {
      return (
        <Tooltip title="Download MOM PDF">
          <IconButton
            size="small"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              const momId = row._momId || row.id;
              window.open(`${axios.defaults.baseURL}${API_PATHS.QMS.MOMS}/${momId}/pdf`, '_blank');
            }}
          >
            <IconFileTypePdf size={20} />
          </IconButton>
        </Tooltip>
      );
    }

    let val;
    if (col.id === 'createdDate') {
      val = formatDateTime(row._createdAt);
    } else if (col.id === 'updatedDate') {
      val = formatDateTime(row._updatedAt);
    } else if (col.id === 'detailStatus') {
      const s = row.status || 'OPEN';
      let chipStatus = 'ACTIVE';
      if (s === 'CLOSED') chipStatus = 'ACTIVE';
      if (s === 'OPEN') chipStatus = 'PENDING';
      if (s === 'CANCELLED') chipStatus = 'INACTIVE';
      if (s === 'OVERDUE') chipStatus = 'INACTIVE';
      if (s === 'PENDING FOR APPROVAL') chipStatus = 'PENDING';
      val = <Chip label={s} size="small" sx={getStatusChipSx(chipStatus)} />;
    } else if (col.id === 'index') {
      val = idx + 1 + page * size;
    } else {
      let rawVal = row[col.id];
      if (rawVal === undefined || rawVal === null) {
        const snakeCaseId = col.id.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        rawVal = row[snakeCaseId];
      }
      if (typeof rawVal === 'boolean') {
        val = rawVal ? 'Yes' : 'No';
      } else if (typeof rawVal === 'object' && rawVal !== null) {
        val = rawVal.name || rawVal.label || rawVal.id || '-';
      } else {
        val = (rawVal !== null && rawVal !== undefined && rawVal !== '') ? String(rawVal) : '-';
      }
    }

    const tooltipText = isMobile ? 'Double-tap to edit' : 'Double-click to edit';
    return (
      <Tooltip title={tooltipText} placement="top" followCursor enterDelay={300}>
        <div style={{ width: '100%' }}>
          {val}
        </div>
      </Tooltip>
    );
  };

  return (
    <MainCard fullWidth
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconFileText size={24} />
          <Typography variant="h3">Minutes of Meeting</Typography>
        </Stack>
      }
      secondary={
        <BOSTableToolbar
          onRefresh={fetchData}
          onNew={handleAdd}
          newTooltip={shortcutTooltip('Create New MOM', 'Ctrl + N')}
          hasWritePermission={perms.write}
          exportData={filteredRows}
          
          exportFilename="Minutes_of_Meeting"
          hasExportPermission={perms.export}
          onReassign={perms.write ? handleReassignClick : null}
          reassignDisabled={!selectedRow}
          reassignTooltip="Reassign selected action"
          reassignVariant="contained"
          reassignSx={{
            bgcolor: '#FFD700', // Vibrant Gold/Yellow
            color: '#000000',   // Black text
            fontWeight: 'bold',
            '&:hover': {
              bgcolor: '#E6BE00', // Darker yellow/gold on hover
              color: '#000000'
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.26)'
            }
          }}
          columns={columns} />
      }
    >
      <BOSDataTable
        columns={columns}
        rows={filteredRows}
        page={page}
        size={size}
        loading={loading}
        onPageChange={setPage}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={perms.write || perms.read ? handleEdit : undefined}
        onClickRow={(row) => setSelectedRow(row)}
        selectedRowId={selectedRow?.id}
        onEditRow={perms.write || perms.read ? handleEdit : undefined}
        onDeleteRow={perms.delete ? handleDeleteClick : undefined}
        renderCell={renderCell}
        id="mom-list-table"
      />

      <ReassignDialog
        open={reassignOpen}
        onClose={() => { setReassignOpen(false); setSelectedForReassign(null); }}
        item={selectedForReassign}
        onConfirm={() => { setReassignOpen(false); fetchData(); }}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete MOM"
        message="Are you sure you want to delete this record?"
        itemName={deleteTarget?._momNo}
      />
    </MainCard>
  );
}
