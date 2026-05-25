import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, Chip } from '@mui/material';
import { IconPlus, IconFileText, IconRefresh, IconArrowsExchange, IconFileTypePdf } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useNavigate } from 'react-router-dom';
import MainCard from 'ui-component/cards/MainCard';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import useLookups from 'hooks/useLookups';
import { BOSDataTable, BOSExportButton, btnNew, getStatusChipSx } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import ReassignDialog from './ReassignDialog';
import { isMobile } from 'react-device-detect';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'momNo', label: 'Meeting Min No', minWidth: 200, bold: true },
  { id: 'meetingType', label: 'Type', minWidth: 100 },
  { id: 'momDate', label: 'Meeting Date', minWidth: 120 },
  { id: 'scheduleNo', label: 'Meeting Sch No', minWidth: 180 },
  { id: 'minNo', label: 'Min No', minWidth: 200 },
  { id: 'discussedPoint', label: 'Discussed Point', minWidth: 300 },
  { id: 'materialList', label: 'Material List', minWidth: 120 },
  { id: 'processType', label: 'Process', minWidth: 100 },
  { id: 'assignedTo', label: 'Assigned To', minWidth: 130 },
  { id: 'assignedBy', label: 'Assigned By', minWidth: 130 },
  { id: 'detailStatus', label: 'Status', minWidth: 120 },
  { id: 'targetDate', label: 'Target Date', minWidth: 120 },
  { id: 'reviewDate', label: 'Review Date', minWidth: 120 },
  { id: 'pdf', label: 'PDF', minWidth: 80, align: 'center' },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
];

export default function MomList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const perms = usePagePermissions(PAGE_CODES.QMS_MEETING_MOM);
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
      const createdMs = row._createdAt ? new Date(row._createdAt).getTime() : 0;
      const updatedMs = row._updatedAt ? new Date(row._updatedAt).getTime() : 0;
      const isUnedited = Math.abs(updatedMs - createdMs) < 2000 || !row._updatedAt;

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
        createdBy: row._createdBy || '-',
        createdDate: row._createdAt ? new Date(row._createdAt).toLocaleDateString('en-GB') : '-',
        updatedBy: isUnedited ? '-' : (row._updatedBy || '-'),
        updatedDate: isUnedited ? '-' : new Date(row._updatedAt).toLocaleDateString('en-GB'),
        status: row.status || 'OPEN',
        detailStatus: row.status || 'OPEN', // specifically for the status chip column
        momNo: row._momNo || '-'
      };
    });
  }, [flatRows]);

  // ── GLOBAL FILTER CONFIG ──
  useEffect(() => {
    dispatch(setFilterConfig([
      {
        id: 'status', label: 'Status', type: 'select', isStarred: true,
        options: [
          { value: 'PENDING', label: 'Pending (Open / In Progress)' },
          { value: 'CLOSED', label: 'Closed' },
          { value: 'PENDING FOR APPROVAL', label: 'Pending For Approval' },
          { value: 'CANCELLED', label: 'Cancelled' },
          { value: 'All', label: 'All' }
        ],
        defaultValue: 'PENDING'
      },
      { id: 'fromDate', label: 'From Date', type: 'date', isStarred: true },
      { id: 'toDate', label: 'To Date', type: 'date', isStarred: true },
      {
        id: 'considerDate', label: 'Consider Date?', type: 'select', isStarred: true,
        options: [{ value: 'YES', label: 'Yes' }, { value: 'NO', label: 'No' }],
        defaultValue: 'NO'
      }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  // ── FILTERED ROWS (apply status + date filters) ──
  const filteredRows = useMemo(() => {
    return resolvedRows.filter((row) => {
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
      const data = Array.isArray(response.data) ? response.data : [];
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
              _meetingType: mom.meetingType?.meetingName || '-',
              _momDate: mom.momDate,
              _scheduleNo: mom.scheduleNo,
              _createdBy: mom.createdBy,
              _createdAt: mom.createdAt,
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
    if (col.id === 'detailStatus') {
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
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconFileText size={24} />
          <Typography variant="h3">Minutes of Meeting</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchData} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          {perms.export && <BOSExportButton
            data={filteredRows}
            filename="Minutes_of_Meeting"
            columns={[
              { header: 'Meeting Min No', key: 'momNo' },
              { header: 'Type', key: 'meetingType' },
              { header: 'Meeting Date', key: 'momDate' },
              { header: 'Schedule No', key: 'scheduleNo' },
              { header: 'Discussed Point', key: 'discussedPoint' },
              { header: 'Process', key: 'processType' },
              { header: 'Status', key: 'status' }
            ]}
          />}
          <Tooltip title="Reassign selected action">
            <Button
              variant="outlined"
              color="warning"
              size="medium"
              onClick={handleReassignClick}
              sx={{ borderRadius: '12px', fontWeight: 700 }}
              startIcon={<IconArrowsExchange size={18} />}
            >
              Reassign
            </Button>
          </Tooltip>
          {perms.write && <Tooltip title={shortcutTooltip('Create New MOM', 'Ctrl + N')}>
            <Button variant="contained" color="primary" size="medium" onClick={handleAdd} sx={btnNew}>
              + New
            </Button>
          </Tooltip>}
        </Stack>
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
        onDoubleClickRow={handleEdit}
        onClickRow={(row) => setSelectedRow(row)}
        selectedRowId={selectedRow?.id}
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
