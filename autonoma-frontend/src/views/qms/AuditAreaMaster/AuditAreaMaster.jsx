import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
<<<<<<< HEAD
import { IconFileDownload, IconMapPin, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddAuditAreaDialog from './AddAuditAreaDialog';
import { exportToExcel } from 'utils/excelExport';
import { format } from 'date-fns';
=======
import { IconListCheck, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddModelNameDialog from './AddModelNameDialog';
>>>>>>> origin/chore/repo-cleanup
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
<<<<<<< HEAD
import { BOSDataTable, BOSExportButton, btnExport, btnNew } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';

// ==============================|| AUDIT AREA MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'type', label: 'Type', minWidth: 100, bold: true },
  { id: 'description', label: 'Description', minWidth: 300 },
  { id: 'createdBy', label: 'Created User', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated User', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 },
  { id: 'status', label: 'Status', minWidth: 100 }
];

export default function AuditAreaMaster() {
=======
import { BOSDataTable, BOSExportButton, btnNew } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';

// ==============================|| MODEL NAME MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 70 },
  { id: 'modelName', label: 'Model Name', minWidth: 180, bold: true },
  { id: 'description', label: 'Description', minWidth: 220 },
  { id: 'status', label: 'Status', minWidth: 120, status: true },
  { id: 'createdBy', label: 'CREATED USER', minWidth: 140 },
  { id: 'createdAt', label: 'CREATED DATE', minWidth: 160 },
  { id: 'updatedBy', label: 'UPDATED USER', minWidth: 140 },
  { id: 'updatedAt', label: 'UPDATED DATE', minWidth: 160 }
];

export default function ModelNameMaster() {
>>>>>>> origin/chore/repo-cleanup
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

<<<<<<< HEAD
  useEffect(() => {
    const config = [
      {
        id: 'status', label: 'Status', type: 'select',
=======
  // Dispatch starred filter configuration matching Model Name and Status
  useEffect(() => {
    const config = [
      {
        id: 'modelNameContains',
        label: 'Model Name Contains',
        type: 'text',
        defaultValue: '',
        isStarred: true
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
>>>>>>> origin/chore/repo-cleanup
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'ACTIVE', label: 'ACTIVE' },
          { value: 'INACTIVE', label: 'INACTIVE' }
        ],
        defaultValue: 'ACTIVE',
        isStarred: true
<<<<<<< HEAD
      },
      {
        id: 'type', label: 'Type', type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'AREA', label: 'AREA' },
          { value: 'ZONE', label: 'ZONE' }
        ],
        defaultValue: 'All',
        isStarred: true
=======
>>>>>>> origin/chore/repo-cleanup
      }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

<<<<<<< HEAD
  const fetchAuditAreas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.QMS.AUDIT_AREA);
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch audit areas:', error);
=======
  const fetchModelNames = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.QMS.MODEL_NAME);
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch Model Names:', error);
>>>>>>> origin/chore/repo-cleanup
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

<<<<<<< HEAD
  useEffect(() => { fetchAuditAreas(); }, [fetchAuditAreas]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchAuditAreas(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.description || `Area ${row.type}`);
=======
  useEffect(() => { fetchModelNames(); }, [fetchModelNames]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchModelNames(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.modelName);
>>>>>>> origin/chore/repo-cleanup
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
<<<<<<< HEAD
      await axios.delete(`${API_PATHS.QMS.AUDIT_AREA}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Audit Area deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchAuditAreas();
    } catch (error) {
      console.error('Failed to delete audit area:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete audit area.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
=======
      await axios.delete(`${API_PATHS.QMS.MODEL_NAME}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Model Name deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchModelNames();
    } catch (error) {
      console.error('Failed to delete Model Name:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete Model Name.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
>>>>>>> origin/chore/repo-cleanup
    }
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => { if (dialogOpen) handleCloseDialog(); }
  });

<<<<<<< HEAD
  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      Type: r.type,
      Description: r.description,
      'Created User': r.createdBy,
      'Created Date': r.createdDate ? format(new Date(r.createdDate), 'dd/MM/yyyy HH:mm') : '',
      'Updated User': r.updatedBy,
      'Updated Date': r.updatedDate ? format(new Date(r.updatedDate), 'dd/MM/yyyy HH:mm') : '',
      Status: r.status
    }));
    exportToExcel(exportData, 'Audit_Area_Details');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusFilter = globalFilters.status || 'ACTIVE';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
      const typeFilter = globalFilters.type || 'All';
      const matchesType = typeFilter === 'All' || row.type === typeFilter;
      const matchesSearch = !globalQuery ||
        (row.description && row.description.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.type && row.type.toLowerCase().includes(globalQuery.toLowerCase()));
      return matchesStatus && matchesType && matchesSearch;
=======
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // 1. Status Filter
      const statusFilter = globalFilters.status || 'ACTIVE';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;

      // 2. Model Name Contains Filter
      const modelNameContains = globalFilters.modelNameContains || '';
      const matchesModelNameContains = !modelNameContains ||
        (row.modelName && row.modelName.toLowerCase().includes(modelNameContains.toLowerCase()));

      // 3. Search query
      const matchesSearch = !globalQuery ||
        (row.modelName && row.modelName.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.description && row.description.toLowerCase().includes(globalQuery.toLowerCase()));

      return matchesStatus && matchesModelNameContains && matchesSearch;
>>>>>>> origin/chore/repo-cleanup
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
<<<<<<< HEAD
          <IconMapPin size={24} />
          <Typography variant="h3">Audit Area Master</Typography>
=======
          <IconListCheck size={24} />
          <Typography variant="h3">Model Name Master</Typography>
>>>>>>> origin/chore/repo-cleanup
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
<<<<<<< HEAD
            <IconButton onClick={fetchAuditAreas} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
=======
            <IconButton onClick={fetchModelNames} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
>>>>>>> origin/chore/repo-cleanup
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
            data={filteredRows}
<<<<<<< HEAD
            filename="Audit_Area_Details"
            columns={[
              { header: 'Type', key: 'type' },
              { header: 'Description', key: 'description' },
              { header: 'Status', key: 'status' }
            ]}
          />
          <Tooltip title={shortcutTooltip('Create New Audit Area', 'Ctrl + N')}>
=======
            filename="Model_Name_Master"
            columns={[
              { header: 'Model Name', key: 'modelName' },
              { header: 'Description', key: 'description' },
              { header: 'Status', key: 'status' },
              { header: 'Created By', key: 'createdBy' },
              { header: 'Created Date', key: 'createdAt' }
            ]}
          />
          <Tooltip title={shortcutTooltip('Create New Model Name', 'Ctrl + N')}>
>>>>>>> origin/chore/repo-cleanup
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
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleOpenEdit}
        onEditRow={handleOpenEdit}
        onDeleteRow={handleDeleteClick}
      />

<<<<<<< HEAD
      <AddAuditAreaDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
=======
      <AddModelNameDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
>>>>>>> origin/chore/repo-cleanup
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
<<<<<<< HEAD
        title="Delete Audit Area"
        message="Are you sure you want to delete this audit area? This action cannot be undone."
=======
        title="Delete Model Name details"
        message="Are you sure you want to delete this Model Name? This action cannot be undone."
>>>>>>> origin/chore/repo-cleanup
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
