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
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
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
  const globalFilters = useSelector((state) => state.search.filters);

  useEffect(() => {
    const config = [
      {
        id: 'designationName', label: 'Designation Name', type: 'text', placeholder: 'Search Name...', isConstant: true
      },
      {
        id: 'subCategoryLevel', label: 'Sub Category Level', type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'L1', label: 'L1' },
          { value: 'L2', label: 'L2' },
          { value: 'L3', label: 'L3' },
          { value: 'L4', label: 'L4' },
          { value: 'L5', label: 'L5' },
          { value: 'L6', label: 'L6' },
          { value: 'L7', label: 'L7' }
        ],
        defaultValue: 'All',
        isConstant: true
      },
      {
        id: 'appearInCompetency', label: 'Appear in Competency', type: 'select',
        options: [
          { value: 'All', label: 'ALL' },
          { value: 'YES', label: 'YES' },
          { value: 'NO', label: 'NO' }
        ],
        defaultValue: 'All',
        isConstant: true
      },
      {
        id: 'qualification', label: 'Qualification', type: 'text', placeholder: 'Search Qualification...', isConstant: true
      },
      {
        id: 'designationCode', label: 'Designation Code', type: 'text', placeholder: 'Search Code...'
      },
      {
        id: 'experience', label: 'Experience', type: 'text', placeholder: 'Search Experience...'
      },
      {
        id: 'displaySlNo', label: 'Display Serial Number', type: 'text', placeholder: 'Search Serial No...'
      },
      {
        id: 'jobDescription', label: 'Job Description', type: 'text', placeholder: 'Search Description...'
      },
      {
        id: 'orgSeqNo', label: 'Organization Sequence Number', type: 'text', placeholder: 'Search Sequence No...'
      },
      {
        id: 'budgetedPositions', label: 'Budgeted Positions', type: 'text', placeholder: 'Search Budget...'
      },
      {
        id: 'createdBy', label: 'Created By', type: 'text', placeholder: 'Search Created By...'
      },
      {
        id: 'createdDate', label: 'Created Date', type: 'dateRange'
      },
      {
        id: 'updatedBy', label: 'Updated By', type: 'text', placeholder: 'Search Updated By...'
      },
      {
        id: 'updatedDate', label: 'Updated Date', type: 'dateRange'
      }
    ];
    dispatch(setFilterConfig(config));
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
      'Created By': r.createdBy,
      'Created Date': r.createdDate ? format(new Date(r.createdDate), 'dd-MM-yyyy HH:mm') : '',
      'Updated By': r.updatedBy,
      'Updated Date': r.updatedDate ? format(new Date(r.updatedDate), 'dd-MM-yyyy HH:mm') : '',
      Status: r.status
    }));
    exportToExcel(exportData, 'Designation_Master');
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const globalFiltersSafe = globalFilters || {};

      // Designation Name
      const nameFilter = globalFiltersSafe.designationName || '';
      const matchesName = !nameFilter || (row.designationName && row.designationName.toLowerCase().includes(nameFilter.toLowerCase()));

      // Sub Category Level
      const levelFilter = globalFiltersSafe.subCategoryLevel || 'All';
      const matchesLevel = levelFilter === 'All' || row.subCategoryLevel === levelFilter;

      // Appear in Competency
      const appearFilter = globalFiltersSafe.appearInCompetency || 'All';
      const matchesAppear = appearFilter === 'All' || row.appearInCompetency === appearFilter;

      // Qualification
      const qualFilter = globalFiltersSafe.qualification || '';
      const matchesQual = !qualFilter || (row.qualification && row.qualification.toLowerCase().includes(qualFilter.toLowerCase()));

      // Designation Code
      const codeFilter = globalFiltersSafe.designationCode || '';
      const matchesCode = !codeFilter || (row.designationCode && row.designationCode.toLowerCase().includes(codeFilter.toLowerCase()));

      // Experience
      const expFilter = globalFiltersSafe.experience || '';
      const matchesExp = !expFilter || (row.experience && row.experience.toLowerCase().includes(expFilter.toLowerCase()));

      // Display Serial Number
      const slFilter = globalFiltersSafe.displaySlNo || '';
      const matchesSl = !slFilter || (row.displaySlNo && row.displaySlNo.toString().includes(slFilter.toString()));

      // Job Description
      const descFilter = globalFiltersSafe.jobDescription || '';
      const matchesDesc = !descFilter || (row.jobDescription && row.jobDescription.toLowerCase().includes(descFilter.toLowerCase()));

      // Org Sequence Number
      const seqFilter = globalFiltersSafe.orgSeqNo || '';
      const matchesSeq = !seqFilter || (row.orgSeqNo && row.orgSeqNo.toString().includes(seqFilter.toString()));

      // Budgeted Positions
      const budgetFilter = globalFiltersSafe.budgetedPositions || '';
      const matchesBudget = !budgetFilter || (row.budgetedPositions && row.budgetedPositions.toString().includes(budgetFilter.toString()));

      // Created By
      const createdByFilter = globalFiltersSafe.createdBy || '';
      const matchesCreatedBy = !createdByFilter || (row.createdBy && row.createdBy.toLowerCase().includes(createdByFilter.toLowerCase()));

      // Updated By
      const updatedByFilter = globalFiltersSafe.updatedBy || '';
      const matchesUpdatedBy = !updatedByFilter || (row.updatedBy && row.updatedBy.toLowerCase().includes(updatedByFilter.toLowerCase()));

      // Created Date Range
      const createdStart = globalFiltersSafe.createdDateStart;
      const createdEnd = globalFiltersSafe.createdDateEnd;
      let matchesCreatedDate = true;
      if (createdStart || createdEnd) {
        if (!row.createdDate) {
          matchesCreatedDate = false;
        } else {
          const rowDateStr = row.createdDate.split('T')[0];
          if (createdStart && rowDateStr < createdStart) matchesCreatedDate = false;
          if (createdEnd && rowDateStr > createdEnd) matchesCreatedDate = false;
        }
      }

      // Updated Date Range
      const updatedStart = globalFiltersSafe.updatedDateStart;
      const updatedEnd = globalFiltersSafe.updatedDateEnd;
      let matchesUpdatedDate = true;
      if (updatedStart || updatedEnd) {
        if (!row.updatedDate) {
          matchesUpdatedDate = false;
        } else {
          const rowUpdatedStr = row.updatedDate.split('T')[0];
          if (updatedStart && rowUpdatedStr < updatedStart) matchesUpdatedDate = false;
          if (updatedEnd && rowUpdatedStr > updatedEnd) matchesUpdatedDate = false;
        }
      }

      // Global Search
      const q = globalQuery ? globalQuery.toLowerCase() : '';
      const matchesSearch = !q ||
        (row.designationName && row.designationName.toLowerCase().includes(q)) ||
        (row.designationCode && row.designationCode.toLowerCase().includes(q)) ||
        (row.subCategoryLevel && row.subCategoryLevel.toLowerCase().includes(q)) ||
        (row.experience && row.experience.toLowerCase().includes(q)) ||
        (row.appearInCompetency && row.appearInCompetency.toLowerCase().includes(q)) ||
        (row.displaySlNo && row.displaySlNo.toString().toLowerCase().includes(q)) ||
        (row.qualification && row.qualification.toLowerCase().includes(q)) ||
        (row.jobDescription && row.jobDescription.toLowerCase().includes(q)) ||
        (row.orgSeqNo && row.orgSeqNo.toString().toLowerCase().includes(q)) ||
        (row.budgetedPositions && row.budgetedPositions.toString().toLowerCase().includes(q)) ||
        (row.createdBy && row.createdBy.toLowerCase().includes(q)) ||
        (row.createdDate && row.createdDate.toLowerCase().includes(q)) ||
        (row.updatedBy && row.updatedBy.toLowerCase().includes(q)) ||
        (row.updatedDate && row.updatedDate.toLowerCase().includes(q));

      return matchesName && matchesLevel && matchesAppear && matchesQual && matchesCode &&
        matchesExp && matchesSl && matchesDesc && matchesSeq && matchesBudget &&
        matchesCreatedBy && matchesUpdatedBy && matchesCreatedDate && matchesUpdatedDate && matchesSearch;
    });
  }, [rows, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'escape': () => setDialogOpen(false)
  });

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'createdDate') return row.createdDate ? format(new Date(row.createdDate), 'dd-MM-yyyy HH:mm') : '-';
    if (col.id === 'updatedDate') return row.updatedDate ? format(new Date(row.updatedDate), 'dd-MM-yyyy HH:mm') : '-';
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
            Export
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
