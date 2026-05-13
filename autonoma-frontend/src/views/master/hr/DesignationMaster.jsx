import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Button, Stack, Tooltip, IconButton } from '@mui/material';
import { IconBriefcase, IconFileDownload, IconRefresh } from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { BOSDataTable, btnExport, btnNew } from 'ui-component/bos';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import AddDesignationDialog from './AddDesignationDialog';
import { format } from 'date-fns';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'designationCode', label: 'Designation Code', minWidth: 150, bold: true },
  { id: 'designationName', label: 'Designation Name', minWidth: 200 },
  { id: 'subCategoryLevel', label: 'Sub Category Level', minWidth: 150 },
  { id: 'experience', label: 'Experience', minWidth: 120 },
  { id: 'appearInCompetency', label: 'Appear in Competency', minWidth: 150 },
  { id: 'displaySlNo', label: 'Display Serial Number', minWidth: 150 },
  { id: 'qualification', label: 'Qualification', minWidth: 120 },
  { id: 'jobDescription', label: 'Job Description', minWidth: 250 },
  { id: 'orgSeqNo', label: 'Organization Sequence Number', minWidth: 200 },
  { id: 'budgetedPositions', label: 'Number of Positions (Budget)', minWidth: 180 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 }
];

export default function DesignationMaster() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const globalQuery = useSelector((state) => state.search.query);

  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'designationName', label: 'Designation Name', type: 'text', placeholder: 'Search name...' }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchDesignations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/hrm/designations');
      setRows(response.data || []);
    } catch (error) {
      console.error('Failed to fetch designations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDesignations(); }, [fetchDesignations]);

  const handleOpenAdd = () => { setSelectedRow(null); setDialogOpen(true); };
  const handleOpenEdit = (row) => { setSelectedRow(row); setDialogOpen(true); };

  const handleDeleteConfirm = async () => {
    if (!selectedRow) return;
    try {
      await axios.delete(`/api/hrm/designations/${selectedRow.id}`);
      dispatch(openSnackbar({ open: true, message: 'Designation deleted successfully', severity: 'success', variant: 'alert' }));
      fetchDesignations();
      setDeleteDialogOpen(false);
    } catch (err) {
      dispatch(openSnackbar({ open: true, message: 'Failed to delete', severity: 'error', variant: 'alert' }));
    }
  };

  const handleExport = () => {
    const exportData = filteredRows.map((r, i) => ({
      '#': i + 1,
      Code: r.designationCode,
      Name: r.designationName,
      Level: r.subCategoryLevel,
      Experience: r.experience,
      Qualification: r.qualification,
      'Job Description': r.jobDescription,
      Status: r.status
    }));
    exportToExcel(exportData, 'Designation_Master');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = !globalQuery || 
        (row.designationName && row.designationName.toLowerCase().includes(globalQuery.toLowerCase())) ||
        (row.designationCode && row.designationCode.toLowerCase().includes(globalQuery.toLowerCase()));
      return matchesSearch;
    });
  }, [rows, globalQuery]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => setDialogOpen(false)
  });

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'createdDate') return row.createdDate ? format(new Date(row.createdDate), 'dd-MM-yyyy HH:mm') : '-';
    return row[col.id] || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconBriefcase size={24} />
          <Typography variant="h3">Designation Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton
              onClick={fetchDesignations}
              color="primary"
              size="small"
              sx={{
                border: '2px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                p: 1,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
              }}
            >
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" color="primary" size="medium" startIcon={<IconFileDownload size={18} />} onClick={handleExport} sx={btnExport}>
            Export Excel
          </Button>
          <Tooltip title={shortcutTooltip('Create New Designation', 'Ctrl + N')}>
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
        onDoubleClickRow={handleOpenEdit}
        onEditRow={handleOpenEdit}
        onDeleteRow={(row) => { setSelectedRow(row); setDeleteDialogOpen(true); }}
        renderCell={renderCell}
      />

      <AddDesignationDialog
        open={dialogOpen}
        handleClose={(refresh) => { setDialogOpen(false); if (refresh) fetchDesignations(); }}
        initialData={selectedRow}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Designation"
        message="Are you sure you want to delete this designation?"
        itemName={selectedRow?.designationName}
      />
    </MainCard>
  );
}
