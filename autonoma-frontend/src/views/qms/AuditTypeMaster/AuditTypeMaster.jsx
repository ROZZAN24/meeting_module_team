import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, Checkbox, IconButton, Chip } from '@mui/material';
import { IconFileDownload, IconListCheck, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddAuditTypeDialog from './AddAuditTypeDialog';
import { exportToExcel } from 'utils/excelExport';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnExport, btnNew } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';

// ==============================|| AUDIT TYPE MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'auditType', label: 'Audit Type', minWidth: 150, bold: true },
  { id: 'standard', label: 'Standard', minWidth: 120 },
  { id: 'description', label: 'Description', minWidth: 200, maxWidth: 250 },
  { id: 'criteriaMinCount', label: 'Min Count', minWidth: 100 },
  { id: 'customerAuditArea', label: 'Cust. Audit Area', minWidth: 120 },
  { id: 'auditArea', label: 'Audit Area', minWidth: 150 },
  { id: 'criteriaType', label: 'Audit Criteria Type', minWidth: 150 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created User', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated User', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
];

export default function AuditTypeMaster() {
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
  const [totalElements, setTotalElements] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  useEffect(() => {
    const config = [
      {
        id: 'status', label: 'Status', type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'ACTIVE', label: 'ACTIVE' },
          { value: 'INACTIVE', label: 'INACTIVE' }
        ],
        defaultValue: 'ACTIVE',
        isStarred: true
      },
      { id: 'auditType', label: 'Audit Type', type: 'text', placeholder: 'Filter by Type...', isStarred: true },
      { id: 'standard', label: 'Standard', type: 'text', placeholder: 'Filter by Standard...' },
      { id: 'description', label: 'Description', type: 'text', placeholder: 'Filter by Description...' },
      { id: 'auditArea', label: 'Audit Area', type: 'text', placeholder: 'Filter by Area...' },
      { id: 'criteriaType', label: 'Criteria Type', type: 'select', 
        options: [{value: 'All', label: 'ALL'}, {value: 'Fixed', label: 'Fixed'}, {value: 'Variable', label: 'Variable'}] 
      },
      { id: 'createdBy', label: 'Created User', type: 'text' },
      { id: 'updatedBy', label: 'Updated User', type: 'text' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchAuditTypes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.QMS.AUDIT_TYPE, {
        params: {
          page, size,
          search: globalQuery,
          status: globalFilters?.status === 'All' ? '' : globalFilters?.status
        }
      });
      setRows(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch audit types:', error);
      setRows([
        { id: 1, auditType: 'Internal Audit', standard: 'ISO 9001', description: 'Internal quality assessment', createdBy: 'Admin', createdDate: new Date(), updatedBy: 'Admin', updatedDate: new Date(), status: 'ACTIVE' },
        { id: 2, auditType: 'External Audit', standard: 'AS9100', description: 'Third party certification', createdBy: 'System', createdDate: new Date(), updatedBy: 'Admin', updatedDate: new Date(), status: 'ACTIVE' }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAuditTypes(); }, [fetchAuditTypes]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchAuditTypes(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.auditType || `Type #${row.id}`);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.QMS.AUDIT_TYPE}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Audit Type deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchAuditTypes();
    } catch (error) {
      console.error('Failed to delete audit type:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => { if (dialogOpen) handleCloseDialog(); }
  });

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      'Audit Type': r.auditType,
      Standard: r.standard,
      Description: r.description,
      'Created User': r.createdBy,
<<<<<<< HEAD
      'Created Date': r.createdDate ? format(new Date(r.createdDate), 'dd/MM/yyyy HH:mm') : '',
      'Updated User': r.updatedBy,
      'Updated Date': r.updatedDate ? format(new Date(r.updatedDate), 'dd/MM/yyyy HH:mm') : '',
=======
      'Created Date': r.createdDate ? format(new Date(r.createdDate), 'dd-MM-yyyy HH:mm') : '',
      'Updated User': r.updatedBy,
      'Updated Date': r.updatedDate ? format(new Date(r.updatedDate), 'dd-MM-yyyy HH:mm') : '',
>>>>>>> origin/chore/repo-cleanup
      Status: r.status
    }));
    exportToExcel(exportData, 'Audit_Type_Details');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusFilter = globalFilters.status || 'ACTIVE';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
      
      const auditTypeFilter = globalFilters.auditType || '';
      const matchesAuditType = !auditTypeFilter || (row.auditType && row.auditType.toLowerCase().includes(auditTypeFilter.toLowerCase()));
      const standardFilter = globalFilters.standard || '';
      const matchesStandard = !standardFilter || (row.standard && row.standard.toLowerCase().includes(standardFilter.toLowerCase()));
      const descriptionFilter = globalFilters.description || '';
      const matchesDescription = !descriptionFilter || (row.description && row.description.toLowerCase().includes(descriptionFilter.toLowerCase()));
      const auditAreaFilter = globalFilters.auditArea || '';
      const matchesAuditArea = !auditAreaFilter || (row.auditArea && row.auditArea.toLowerCase().includes(auditAreaFilter.toLowerCase()));
      const criteriaTypeFilter = globalFilters.criteriaType || 'All';
      const matchesCriteriaType = criteriaTypeFilter === 'All' || row.criteriaType === criteriaTypeFilter;
      const createdByFilter = globalFilters.createdBy || '';
      const matchesCreatedBy = !createdByFilter || (row.createdBy && row.createdBy.toLowerCase().includes(createdByFilter.toLowerCase()));
      const updatedByFilter = globalFilters.updatedBy || '';
      const matchesUpdatedBy = !updatedByFilter || (row.updatedBy && row.updatedBy.toLowerCase().includes(updatedByFilter.toLowerCase()));

      const matchesSearch = !globalQuery ||
        (row.auditType && row.auditType.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.standard && row.standard.toLowerCase().includes(globalQuery.toLowerCase()));
      
      return matchesStatus && matchesAuditType && matchesStandard && matchesDescription && matchesAuditArea && matchesCriteriaType && matchesCreatedBy && matchesUpdatedBy && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconListCheck size={24} />
          <Typography variant="h3">Audit Type Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchAuditTypes} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
            data={filteredRows}
            filename="Audit_Type_Details"
            columns={[
              { header: 'Audit Type', key: 'auditType' },
              { header: 'Standard', key: 'standard' },
              { header: 'Status', key: 'status' }
            ]}
          />
          <Tooltip title={shortcutTooltip('Create New Audit Type', 'Ctrl + N')}>
            <Button variant="contained" color="primary" size="medium" onClick={handleOpenAdd} sx={btnNew}>
              + New
            </Button>
          </Tooltip>
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={filteredRows}
        page={page}
        size={size}
        totalCount={totalElements || filteredRows.length}
        loading={loading}
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={handleOpenEdit}
        onEditRow={handleOpenEdit}
        onDeleteRow={handleDeleteClick}
        renderCell={(col, row) => {
          const val = row[col.id];
          if (col.id === 'index') return rows.indexOf(row) + 1;
          if (col.id === 'createdBy' || col.id === 'updatedBy') return val || 'Admin';
          if (col.id.toLowerCase().includes('date')) {
            if (!val) return '-';
<<<<<<< HEAD
            try { return format(new Date(val), 'dd/MM/yyyy HH:mm'); } catch { return '-'; }
=======
            try { return format(new Date(val), 'dd-MM-yyyy HH:mm'); } catch { return '-'; }
>>>>>>> origin/chore/repo-cleanup
          }
          if (col.id === 'status') return <Chip label={val} size="small" sx={{ bgcolor: val === 'ACTIVE' ? 'success.light' : 'error.light', color: val === 'ACTIVE' ? 'success.dark' : 'error.dark', fontWeight: 700 }} />;
          return val ?? '-';
        }}
      />

      <AddAuditTypeDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Audit Type"
        message="Are you sure you want to delete this audit type? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
