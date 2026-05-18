import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
<<<<<<< HEAD
import { IconFileDownload, IconRefresh, IconAward } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { format } from 'date-fns';
import MainCard from 'ui-component/cards/MainCard';
import AddGradeDialog from './AddGradeDialog';
import { exportToExcel } from 'utils/excelExport';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnExport, btnNew } from 'ui-component/bos';

// ==============================|| GRADE MASTER ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'gradeCode', label: 'Grade Code', minWidth: 150, bold: true, required: true },
  { id: 'sequenceNo', label: 'Seq No.', minWidth: 100 },
  { id: 'gradeName', label: 'Grade Name', minWidth: 200, required: true },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
];

export default function GradeDetails() {
  const dispatch = useDispatch();
=======
import { IconSettings, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddModelDialog from './AddModelDialog';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnNew } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';

// ==============================|| PRODUCT MODEL MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 70 },
  { id: 'oem.oemShortName', label: 'OEM Short Name', minWidth: 180, bold: true },
  { id: 'modelNo', label: 'Model No', minWidth: 150, bold: true },
  { id: 'rotorDiameter', label: 'Rotor Diameter (in Meter)', minWidth: 200 },
  { id: 'status', label: 'Model Status', minWidth: 130, status: true },
  { id: 'createdBy', label: 'CREATED USER', minWidth: 140 },
  { id: 'createdAt', label: 'CREATED DATE', minWidth: 160 },
  { id: 'updatedBy', label: 'UPDATED USER', minWidth: 140 },
  { id: 'updatedAt', label: 'UPDATED DATE', minWidth: 160 }
];

export default function ModelMaster() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
>>>>>>> origin/chore/repo-cleanup

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
  // ── RESOLVED ROWS (SOP #16 Standard) ──
  const resolvedRows = useMemo(() => {
    if (!Array.isArray(rows)) return [];
    return rows.map(row => ({
      ...row,
      createdDate: row.createdDate ? format(new Date(row.createdDate), 'dd/MM/yyyy HH:mm') : '-',
      updatedDate: row.updatedDate ? format(new Date(row.updatedDate), 'dd/MM/yyyy HH:mm') : '-',
      status: row.status || 'Active'
    }));
  }, [rows]);

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/master/hr/grade');
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch grades:', error);
=======
  // Dispatch starred filter configuration matching Model No and Status
  useEffect(() => {
    const config = [
      {
        id: 'modelNoContains',
        label: 'Model No Contains',
        type: 'text',
        defaultValue: '',
        isStarred: true
      },
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'ACTIVE', label: 'ACTIVE' },
          { value: 'INACTIVE', label: 'INACTIVE' }
        ],
<<<<<<<< HEAD:autonoma-frontend/src/views/npd/Model/ModelMaster.jsx
        defaultValue: 'ACTIVE',
        isStarred: true
      }
========
        defaultValue: 'Active',
        isConstant: true
      },
      { id: 'gradeName', label: 'Grade Name', type: 'text', placeholder: 'Search by Name...', isConstant: true }
>>>>>>>> origin/chore/repo-cleanup:autonoma-frontend/src/views/master/hr/GradeDetails.jsx
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.NPD.ITEM_MODEL);
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch Models:', error);
      setRows([]);
>>>>>>> origin/chore/repo-cleanup
    } finally {
      setLoading(false);
    }
  }, []);

<<<<<<< HEAD
  useEffect(() => { fetchGrades(); }, [fetchGrades]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchGrades(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.gradeName || `Grade ${row.gradeCode}`);
=======
  useEffect(() => { fetchModels(); }, [fetchModels]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchModels(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.modelNo);
>>>>>>> origin/chore/repo-cleanup
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
<<<<<<< HEAD
      await axios.delete(`/api/master/hr/grade/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Grade deleted successfully!', variant: 'alert', severity: 'success' }));
      fetchGrades();
    } catch (error) {
      console.error('Failed to delete grade:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete grade.', variant: 'alert', severity: 'error' }));
=======
      await axios.delete(`${API_PATHS.NPD.ITEM_MODEL}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Model deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchModels();
    } catch (error) {
      console.error('Failed to delete model:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete model.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
>>>>>>> origin/chore/repo-cleanup
    }
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => { if (dialogOpen) handleCloseDialog(); }
  });

<<<<<<< HEAD
=======
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // 1. Status Filter
      const statusFilter = globalFilters.status || 'ACTIVE';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;

      // 2. Model No Contains Text Filter
      const modelNoContains = globalFilters.modelNoContains || '';
      const matchesModelNoContains = !modelNoContains ||
        (row.modelNo && row.modelNo.toLowerCase().includes(modelNoContains.toLowerCase()));

      // 3. Search query
      const matchesSearch = !globalQuery ||
        (row.modelNo && row.modelNo.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.oem && row.oem.oemShortName && row.oem.oemShortName.toLowerCase().includes(globalQuery.toLowerCase()));

      return matchesStatus && matchesModelNoContains && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

>>>>>>> origin/chore/repo-cleanup
  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
<<<<<<< HEAD
          <IconAward size={24} />
          <Typography variant="h3">Grade Master</Typography>
=======
          <IconSettings size={24} />
          <Typography variant="h3">Product Model Master</Typography>
>>>>>>> origin/chore/repo-cleanup
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
<<<<<<< HEAD
            <IconButton onClick={fetchGrades} color="primary" size="small" sx={{
              border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
            }}>
=======
            <IconButton onClick={fetchModels} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
>>>>>>> origin/chore/repo-cleanup
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
<<<<<<< HEAD
            data={resolvedRows}
            filename="Grade_Details"
            columns={[
              { header: 'Grade Code', key: 'gradeCode' },
              { header: 'Grade Name', key: 'gradeName' },
              { header: 'Sequence No', key: 'sequenceNo' },
              { header: 'Status', key: 'status' }
            ]}
          />
          <Tooltip title={shortcutTooltip('Create New Grade', 'Ctrl + N')}>
=======
            data={filteredRows}
            filename="Product_Model_Master"
            columns={[
              { header: 'OEM Short Name', key: 'oem.oemShortName' },
              { header: 'Model No', key: 'modelNo' },
              { header: 'Rotor Diameter', key: 'rotorDiameter' },
              { header: 'Status', key: 'status' },
              { header: 'Created By', key: 'createdBy' },
              { header: 'Created Date', key: 'createdAt' }
            ]}
          />
          <Tooltip title={shortcutTooltip('Create New Model', 'Ctrl + N')}>
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
<<<<<<< HEAD
        rows={resolvedRows}
        page={page}
        size={size}
=======
        rows={paginatedRows}
        page={page}
        size={size}
        totalCount={filteredRows.length}
>>>>>>> origin/chore/repo-cleanup
        loading={loading}
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleOpenEdit}
        onEditRow={handleOpenEdit}
        onDeleteRow={handleDeleteClick}
      />

<<<<<<< HEAD
      <AddGradeDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
=======
      <AddModelDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
>>>>>>> origin/chore/repo-cleanup
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
<<<<<<< HEAD
        title="Delete Grade"
        message="Are you sure you want to delete this grade? This action cannot be undone."
=======
        title="Delete Model details"
        message="Are you sure you want to delete this Model? This action cannot be undone."
>>>>>>> origin/chore/repo-cleanup
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
