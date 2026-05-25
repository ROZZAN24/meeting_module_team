import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconRefresh, IconLayoutColumns } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { format } from 'date-fns';
import MainCard from 'ui-component/cards/MainCard';
import AddDivisionDialog from './AddDivisionDialog';
import { exportToExcel } from 'utils/excelExport';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnNew } from 'ui-component/bos';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

// ==============================|| DIVISION MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'divisionName', label: 'Division Name', minWidth: 200 },
  { id: 'companyName', label: 'Company', minWidth: 180 },
  { id: 'city', label: 'City', minWidth: 120 },
  { id: 'state', label: 'State', minWidth: 120 },
  { id: 'description', label: 'Description', minWidth: 200 },
  { id: 'sequenceNo', label: 'Seq No', minWidth: 90 },
  { id: 'createdBy', label: 'Created User', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated User', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 },
  { id: 'statusLabel', label: 'Status', minWidth: 100 }  // rendered from boolean
];

export default function DivisionMaster() {
  const dispatch = useDispatch();
  const perms = usePagePermissions(PAGE_CODES.AD_DIVISION);
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [companies, setCompanies] = useState([]);   // [{value, label}]
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');


  // ── Load company list for filter dropdown ─────────────────────────────────
  useEffect(() => {
    axios.get('/api/company-profile/all')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : [];
        const opts = [
          { value: 'All', label: 'ALL COMPANIES' },
          ...list.map(c => ({ value: String(c.id), label: c.companyName }))
        ];
        setCompanies(opts);
      })
      .catch(() => {/* silently ignore */ });
  }, []);

  // ── Register search/filter config ─────────────────────────────────────────
  useEffect(() => {
    const config = [
      {
        id: 'status', label: 'Status', type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: '1', label: 'ACTIVE' },
          { value: '0', label: 'INACTIVE' }
        ],
        defaultValue: 'All'
      },
      {
        id: 'companyId', label: 'Company', type: 'select',
        options: companies.length ? companies : [{ value: 'All', label: 'ALL COMPANIES' }],
        defaultValue: 'All'
      },
      { id: 'divisionName', label: 'Division Name', type: 'text', placeholder: 'Search by Name...' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch, companies]);

  // ── Fetch data ────────────────────────────────────────────────────────────
  const fetchDivisions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/divisions');
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch divisions:', error);
      dispatch(openSnackbar({
        open: true, message: 'Failed to load divisions.',
        variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false
      }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { fetchDivisions(); }, [fetchDivisions]);

  // ── Dialog handlers ───────────────────────────────────────────────────────
  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(!perms.write); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchDivisions(); };

  // ── Delete handlers ───────────────────────────────────────────────────────
  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.divisionName || `Division ${row.divisionCode}`);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`/api/admin/divisions/${deleteTargetId}`);
      dispatch(openSnackbar({
        open: true, message: 'Division deleted successfully!',
        variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false
      }));
      fetchDivisions();
    } catch (error) {
      console.error('Failed to delete division:', error);
      dispatch(openSnackbar({
        open: true, message: 'Failed to delete division.',
        variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false
      }));
    }
  };

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => { if (dialogOpen) handleCloseDialog(); }
  });




  // ── Filter / Paginate ─────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    return rows
      .map(r => ({ ...r, statusLabel: r.status ? 'Active' : 'Inactive' }))
      .filter((row) => {
        // Status filter: '1' = active, '0' = inactive, 'All' = both
        const statusFilter = globalFilters.status || 'All';
        const matchesStatus =
          statusFilter === 'All' ||
          (statusFilter === '1' && row.status === true) ||
          (statusFilter === '0' && row.status === false);

        // Company filter
        const companyFilter = globalFilters.companyId || 'All';
        const matchesCompany = companyFilter === 'All' || String(row.companyId) === companyFilter;

        // Name text filter
        const nameFilter = globalFilters.divisionName || '';
        const matchesName = !nameFilter ||
          (row.divisionName && row.divisionName.toLowerCase().includes(nameFilter.toLowerCase()));

        // Global search
        const matchesSearch = !globalQuery ||
          (row.divisionName && row.divisionName.toLowerCase().includes(globalQuery.toLowerCase())) ||
          (row.companyName && row.companyName.toLowerCase().includes(globalQuery.toLowerCase()));

        return matchesStatus && matchesCompany && matchesName && matchesSearch;
      });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(
    () => filteredRows.slice(page * size, page * size + size),
    [filteredRows, page, size]
  );

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconLayoutColumns size={24} />
          <Typography variant="h3">Division Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchDivisions} color="primary" size="small" sx={{
              border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
            }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          {perms.export && (
            <BOSExportButton
              data={filteredRows}
              filename="Division_Master"
              columns={[
                { header: 'Division Name', key: 'divisionName' },
                { header: 'Company', key: 'companyName' },
                { header: 'City', key: 'city' },
                { header: 'State', key: 'state' },
                { header: 'Description', key: 'description' },
                { header: 'Seq No', key: 'sequenceNo' },
                { header: 'Status', key: 'statusLabel' }
              ]}
            />
          )}
          {perms.write && (
            <Tooltip title={shortcutTooltip('Create New Division', 'Ctrl + N')}>
              <Button variant="contained" color="primary" size="medium" onClick={handleOpenAdd} sx={btnNew}>
                + New
              </Button>
            </Tooltip>
          )}
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
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleOpenEdit}
        onEditRow={handleOpenEdit}
        onDeleteRow={perms.delete ? handleDeleteClick : null}
      />

      <AddDivisionDialog
        open={dialogOpen}
        handleClose={handleCloseDialog}
        initialData={selectedRow}
        readOnly={isReadOnly}
      />



      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Division"
        message="Are you sure you want to delete this division? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
