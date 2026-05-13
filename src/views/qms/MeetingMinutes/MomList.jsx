import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Button, Tooltip, IconButton, Chip } from '@mui/material';
import { IconPlus, IconFileText, IconRefresh, IconArrowsExchange } from '@tabler/icons-react';
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
import ReassignDialog from './ReassignDialog';

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
  { id: 'createdBy', label: 'Create User', minWidth: 120 }
];

export default function MomList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
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

  // ── GLOBAL FILTER CONFIG ──
  useEffect(() => {
    dispatch(setFilterConfig([
      {
        id: 'department', label: 'Department', type: 'select', isStarred: true,
        options: [
          { value: 'All', label: 'All' },
          ...(lookups.departments || []).map(d => ({ label: d.departmentName, value: d.departmentName }))
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
      {
        id: 'status', label: 'Status', type: 'select', isStarred: true,
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'OPEN', label: 'OPEN' },
          { value: 'CLOSED', label: 'CLOSED' },
          { value: 'CANCELLED', label: 'CANCELLED' },
          { value: 'PENDING FOR APPROVAL', label: 'PENDING FOR APPROVAL' },
          { value: 'OVERDUE', label: 'OVERDUE' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'processFilter', label: 'Process', type: 'select', isStarred: true,
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'INFO', label: 'INFO' },
          { value: 'ACTION', label: 'ACTION' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'searchBy', label: 'Search By', type: 'select', isStarred: true,
        options: [
          { value: 'momNo', label: 'Meeting Min No' },
          { value: 'scheduleNo', label: 'Meeting Sch No' },
          { value: 'discussedPoint', label: 'Discussed Point' }
        ],
        defaultValue: 'momNo'
      },
      { id: 'searchText', label: 'Search', type: 'text', placeholder: 'Search...', isStarred: true }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch, lookups.departments]);

  // ── FETCH ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.QMS.MOMS);
      const momsRaw = Array.isArray(response.data) ? response.data : [];
      setRows(momsRaw);
      // Flatten: each MOM detail becomes a row, grouped under parent MOM
      const flat = [];
      momsRaw.forEach(mom => {
        if (mom.details && mom.details.length > 0) {
          mom.details.forEach(detail => {
            flat.push({
              ...detail,
              _momId: mom.id,
              _momNo: mom.momNo,
              _momDate: mom.momDate,
              _scheduleNo: mom.schedule?.scheduleNo || '',
              _meetingType: mom.schedule?.meetingType?.meetingPrefix || mom.schedule?.meetingType?.meetingName || '',
              _createdBy: mom.createdBy || '',
              _mom: mom
            });
          });
        } else {
          // Show parent row even without details
          flat.push({
            id: `mom-${mom.id}`,
            _momId: mom.id,
            _momNo: mom.momNo,
            _momDate: mom.momDate,
            _scheduleNo: mom.schedule?.scheduleNo || '',
            _meetingType: mom.schedule?.meetingType?.meetingPrefix || '',
            _createdBy: mom.createdBy || '',
            _mom: mom,
            processType: '-',
            status: mom.status
          });
        }
      });
      setFlatRows(flat);
    } catch (error) {
      console.error('Failed to fetch MOMs:', error);
      setRows([]);
      setFlatRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── FILTERING ──
  const filteredRows = useMemo(() => {
    return flatRows.filter((row) => {
      const statusFilter = globalFilters.status || 'All';
      if (statusFilter !== 'All' && (row.status || '') !== statusFilter) return false;

      const processFilter = globalFilters.processFilter || 'All';
      if (processFilter !== 'All' && (row.processType || '') !== processFilter) return false;

      const searchText = globalFilters.searchText || '';
      if (searchText) {
        const q = searchText.toLowerCase();
        const field = globalFilters.searchBy || 'momNo';
        if (field === 'momNo' && !(row._momNo || '').toLowerCase().includes(q)) return false;
        if (field === 'scheduleNo' && !(row._scheduleNo || '').toLowerCase().includes(q)) return false;
        if (field === 'discussedPoint' && !(row.discussedPoint || '').toLowerCase().includes(q)) return false;
      }

      if (globalQuery) {
        const q = globalQuery.toLowerCase();
        return (row._momNo || '').toLowerCase().includes(q) || (row.discussedPoint || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [flatRows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  // ── HANDLERS ──
  const handleAdd = () => { navigate('/qms/minutesofmeeting/add'); };
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

  const handleSave = async (formData) => {
    try {
      if (selectedItem) {
        await axios.put(`${API_PATHS.QMS.MOMS}/${selectedItem.id}`, formData);
        dispatch(openSnackbar({ open: true, message: 'Meeting Minutes update Successfully...', variant: 'alert', severity: 'success' }));
      } else {
        await axios.post(API_PATHS.QMS.MOMS, formData);
        dispatch(openSnackbar({ open: true, message: 'Meeting Minutes saved Successfully..', variant: 'alert', severity: 'success' }));
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Failed to save MOM', variant: 'alert', severity: 'error' }));
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      const momId = deleteTarget._momId || deleteTarget.id;
      await axios.delete(`${API_PATHS.QMS.MOMS}/${momId}`);
      dispatch(openSnackbar({ open: true, message: 'Record deleted', variant: 'alert', severity: 'success' }));
      fetchData();
    } catch (error) {
      dispatch(openSnackbar({ open: true, message: 'Cannot delete closed records', variant: 'alert', severity: 'error' }));
    }
  };

  useKeyboardShortcuts({ 'ctrl+n': handleAdd });

  // ── RENDER CELL ──
  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'momNo') return row._momNo || '-';
    if (col.id === 'meetingType') return row._meetingType || '-';
    if (col.id === 'momDate') return row._momDate || '-';
    if (col.id === 'scheduleNo') return row._scheduleNo || '-';
    if (col.id === 'minNo') return row.id ? `${row._momNo}/${String(row.id).padStart(3, '0')}` : '-';
    if (col.id === 'discussedPoint') return row.discussedPoint || '-';
    if (col.id === 'processType') return row.processType || '-';
    if (col.id === 'assignedTo') return row.assignedTo?.employeeName || '-';
    if (col.id === 'assignedBy') return row.assignedBy?.employeeName || '-';
    if (col.id === 'targetDate') return row.targetDate || '-';
    if (col.id === 'reviewDate') return row.reviewDate || '-';
    if (col.id === 'createdBy') return row._createdBy || '-';
    if (col.id === 'detailStatus') {
      const s = row.status || 'OPEN';
      let chipStatus = 'ACTIVE';
      if (s === 'CLOSED') chipStatus = 'ACTIVE';
      if (s === 'OPEN') chipStatus = 'PENDING';
      if (s === 'CANCELLED') chipStatus = 'INACTIVE';
      if (s === 'OVERDUE') chipStatus = 'INACTIVE';
      if (s === 'PENDING FOR APPROVAL') chipStatus = 'PENDING';
      return <Chip label={s} size="small" sx={getStatusChipSx(chipStatus)} />;
    }
    return row[col.id] || '-';
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
          <BOSExportButton
            data={filteredRows}
            filename="Minutes_of_Meeting"
            columns={[
              { header: 'Meeting Min No', key: '_momNo' },
              { header: 'Type', key: '_meetingType' },
              { header: 'Meeting Date', key: '_momDate' },
              { header: 'Schedule No', key: '_scheduleNo' },
              { header: 'Discussed Point', key: 'discussedPoint' },
              { header: 'Process', key: 'processType' },
              { header: 'Status', key: 'status' }
            ]}
          />
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
          <Tooltip title={shortcutTooltip('Create New MOM', 'Ctrl + N')}>
            <Button variant="contained" color="secondary" size="medium" onClick={handleAdd} sx={btnNew}>
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
        onDoubleClickRow={handleEdit}
        onClickRow={(row) => setSelectedRow(row)}
        selectedRowId={selectedRow?.id}
        onEditRow={handleEdit}
        onDeleteRow={handleDeleteClick}
        renderCell={renderCell}
        id="mom-list-table"
      />

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
