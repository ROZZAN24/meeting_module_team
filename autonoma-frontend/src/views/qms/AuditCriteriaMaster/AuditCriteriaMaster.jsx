import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, Link, IconButton } from '@mui/material';
import { IconFileDownload, IconChecks, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import AddAuditCriteriaDialog from './AddAuditCriteriaDialog';
import { exportToExcel } from 'utils/excelExport';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import { BOSDataTable, BOSExportButton, btnExport, btnNew, getStatusChipSx } from 'ui-component/bos';
import { API_PATHS } from 'utils/api-constants';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';
import { Chip } from '@mui/material';

// ==============================|| AUDIT CRITERIA MASTER (BOS SOP COMPLIANT) ||============================== //

const columns = [
  { id: 'seqNo', label: 'Seq No', minWidth: 80 },
  { id: 'auditType', label: 'Type', minWidth: 120, bold: true },
  { id: 'clause', label: 'Clause', minWidth: 100 },
  { id: 'criteriaText', label: 'Criteria', minWidth: 250 },
  { id: 'department', label: 'Department', minWidth: 120 },
  { id: 'attachmentRequired', label: 'Attachment Req', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created User', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated User', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
];

export default function AuditCriteriaMaster() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);
  const perms = usePagePermissions(PAGE_CODES.QMS_AUDIT_CRITERIA);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [nextSeq, setNextSeq] = useState('1');
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
      { id: 'clause', label: 'Clause', type: 'text', placeholder: 'Filter by Clause...', isStarred: true },
      { id: 'criteriaText', label: 'Criteria', type: 'text', placeholder: 'Filter by Criteria...' },
      { id: 'department', label: 'Department', type: 'text', placeholder: 'Filter by Department...' },
      { id: 'createdBy', label: 'Created User', type: 'text' },
      { id: 'updatedBy', label: 'Updated User', type: 'text' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchAuditCriteria = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_PATHS.QMS.AUDIT_CRITERIA);
      setRows(response.data);
    } catch (error) {
      console.error('Failed to fetch audit criteria:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAuditCriteria(); }, [fetchAuditCriteria]);

  const handleOpenAdd = async () => {
    setSelectedRow(null);
    setIsReadOnly(false);
    try {
      const res = await axios.get(`${API_PATHS.QMS.AUDIT_CRITERIA}/next-seq`);
      setNextSeq(res.data);
    } catch (e) {
      setNextSeq('1');
    }
    setDialogOpen(true);
  };

  const handleOpenEdit = (row) => { setSelectedRow(row); setIsReadOnly(false); setDialogOpen(true); };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchAuditCriteria(); };

  const handleDeleteClick = (row) => {
    setDeleteTargetId(row.id);
    setDeleteTargetName(row.criteriaText || `Criteria #${row.seqNo}`);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`${API_PATHS.QMS.AUDIT_CRITERIA}/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'Audit Criteria deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchAuditCriteria();
    } catch (error) {
      console.error('Failed to delete audit criteria:', error);
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
      'Clause': r.clause,
      'Criteria': r.criteriaText,
      'Department': r.department,
      'Created User': r.createdBy || 'Admin',
      'Created Date': r.createdDate ? format(new Date(r.createdDate), 'dd/MM/yyyy HH:mm') : '',
      'Updated User': r.updatedBy || 'Admin',
      'Updated Date': r.updatedDate ? format(new Date(r.updatedDate), 'dd/MM/yyyy HH:mm') : '',
      Status: r.status
    }));
    exportToExcel(exportData, 'Audit_Criteria_Details');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusFilter = globalFilters.status || 'ACTIVE';
      const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
      const auditTypeFilter = globalFilters.auditType || '';
      const matchesAuditType = !auditTypeFilter || (row.auditType && row.auditType.toLowerCase().includes(auditTypeFilter.toLowerCase()));
      const clauseFilter = globalFilters.clause || '';
      const matchesClause = !clauseFilter || (row.clause && row.clause.toLowerCase().includes(clauseFilter.toLowerCase()));
      const criteriaFilter = globalFilters.criteriaText || '';
      const matchesCriteria = !criteriaFilter || (row.criteriaText && row.criteriaText.toLowerCase().includes(criteriaFilter.toLowerCase()));
      const departmentFilter = globalFilters.department || '';
      const matchesDepartment = !departmentFilter || (row.department && row.department.toLowerCase().includes(departmentFilter.toLowerCase()));
      const createdByFilter = globalFilters.createdBy || '';
      const matchesCreatedBy = !createdByFilter || (row.createdBy && row.createdBy.toLowerCase().includes(createdByFilter.toLowerCase()));
      const updatedByFilter = globalFilters.updatedBy || '';
      const matchesUpdatedBy = !updatedByFilter || (row.updatedBy && row.updatedBy.toLowerCase().includes(updatedByFilter.toLowerCase()));

      const matchesSearch = !globalQuery ||
        (row.criteriaText && row.criteriaText.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.auditType && row.auditType.toLowerCase().includes(globalQuery.toLowerCase()));
      
      return matchesStatus && matchesAuditType && matchesClause && matchesCriteria && matchesDepartment && matchesCreatedBy && matchesUpdatedBy && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  // Custom cell renderer for criteria text link
  const renderCell = (col, row, idx) => {
    const val = row[col.id];
    if (col.id === 'seqNo') return row.seqNo || page * size + idx + 1;
    if (col.id === 'criteriaText') {
      return (
        <Link
          component="button"
          variant="body2"
          onClick={() => handleOpenEdit(row)}
          sx={{ textAlign: 'left', textDecoration: 'none', color: 'secondary.main', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
        >
          {val}
        </Link>
      );
    }
    if (col.id === 'status') return <Chip label={val} size="small" sx={getStatusChipSx(val)} />;
    if (col.id === 'createdBy' || col.id === 'updatedBy') return val || 'Admin';
    if (col.id.toLowerCase().includes('date')) {
      if (!val) return '-';
      try { return format(new Date(val), 'dd/MM/yyyy HH:mm'); } catch { return '-'; }
    }
    return val ?? '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconChecks size={24} />
          <Typography variant="h3">Audit Criteria Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchAuditCriteria} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          {perms.export && <BOSExportButton
            data={filteredRows}
            filename="Audit_Criteria_Details"
            columns={[
              { header: 'Audit Type', key: 'auditType' },
              { header: 'Clause', key: 'clause' },
              { header: 'Criteria', key: 'criteriaText' },
              { header: 'Status', key: 'status' }
            ]}
          />}
          {perms.write && <Tooltip title={shortcutTooltip('Create New Criteria', 'Ctrl + N')}>
            <Button variant="contained" color="primary" size="medium" onClick={handleOpenAdd} sx={btnNew}>
              + New
            </Button>
          </Tooltip>}
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
        onEditRow={perms.write ? handleOpenEdit : undefined}
        onDeleteRow={perms.delete ? handleDeleteClick : undefined}
        renderCell={renderCell}
      />

      <AddAuditCriteriaDialog
        open={dialogOpen}
        handleClose={handleCloseDialog}
        initialData={selectedRow}
        readOnly={isReadOnly}
        nextSeq={nextSeq}
      />
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Audit Criteria"
        message="Are you sure you want to delete this audit criteria? This action cannot be undone."
        itemName={deleteTargetName}
      />
    </MainCard>
  );
}
