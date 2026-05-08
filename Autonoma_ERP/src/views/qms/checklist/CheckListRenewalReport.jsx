import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Box, Button, Stack, Chip, IconButton, Tooltip } from '@mui/material';
import {
  IconFileDownload,
  IconReportAnalytics,
  IconRefresh
} from '@tabler/icons-react';
import axios from 'utils/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import MainCard from 'ui-component/cards/MainCard';
import { exportToExcel } from 'utils/excelExport';
import { BOSDataTable, btnExport, getStatusChipSx } from 'ui-component/bos';
import AddCheckListDialog from './AddCheckListDialog';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'category', label: 'Category', minWidth: 120 },
  { id: 'checkingPoint', label: 'Check Point', minWidth: 200, bold: true },
  { id: 'department', label: 'Dept', minWidth: 150 },
  { id: 'frequency', label: 'Frequency', minWidth: 120 },
  { id: 'stockLink', label: 'Stock Link', minWidth: 100 },
  { id: 'remarks', label: 'Comments', minWidth: 200 },
  { id: 'verificationRequired', label: 'Verify Req', minWidth: 100 },
  { id: 'assignedTo', label: 'Assigned To', minWidth: 120 },
  { id: 'assignedBy', label: 'Assigned By', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 150 }
];

export default function CheckListRenewalReport() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const globalQuery = useSelector((state) => state.search.query);
  const filters = useSelector((state) => state.search.filters);

  useEffect(() => {
    dispatch(setFilterConfig([
      { id: 'fromDate', label: 'From Date', type: 'date' },
      { id: 'toDate', label: 'To Date', type: 'date' },
      {
        id: 'status', label: 'Status', type: 'select',
        options: [
          { label: 'All Status', value: 'All' },
          { label: 'Open', value: 'Open' },
          { label: 'Pending for Verified', value: 'Pending for Verified' },
          { label: 'Verified', value: 'Verified' }
        ],
        defaultValue: 'All'
      }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, size,
        status: filters.status !== 'All' ? filters.status : undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        searchValue: globalQuery || undefined
      };
      const response = await axios.get('/api/qms/checklist/assignments', { params });
      setRows(response.data.content || []);
      setTotalElements(response.data.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters, globalQuery]);

  useEffect(() => { fetchReportData(); }, [fetchReportData]);

  const handleExport = () => {
    const exportData = rows.map((r, i) => ({
      '#': i + 1,
      Category: r.checklist?.category,
      'Check Point': r.checklist?.checkingPoint,
      Status: typeof r.status === 'object' ? r.status?.name : r.status
    }));
    exportToExcel(exportData, 'Checklist_Report');
  };

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    if (col.id === 'category') return row.checklist?.category;
    if (col.id === 'checkingPoint') return row.checklist?.checkingPoint;
    if (col.id === 'frequency') return row.checklist?.frequency;
    if (col.id === 'stockLink') return row.checklist?.stockLink;
    if (col.id === 'verificationRequired') return row.checklist?.verificationRequired;
    if (col.id === 'department') return (row.checklist?.departments || []).map((d) => d.departmentName).join(', ');
    if (col.id === 'status') {
      const s = typeof row.status === 'object' ? row.status?.name : row.status;
      let chipStatus = 'PENDING';
      if (s === 'Verified') chipStatus = 'ACTIVE';
      if (s === 'Open') chipStatus = 'PENDING';
      return <Chip label={s || 'Open'} size="small" sx={getStatusChipSx(chipStatus)} />;
    }
    return row[col.id] || '-';
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconReportAnalytics size={24} />
          <Typography variant="h3">Check List / Renewal Report</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchReportData} color="primary" size="small" sx={{ border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1, transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' } }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <Button variant="outlined" color="primary" size="medium" startIcon={<IconFileDownload size={18} />} onClick={handleExport} sx={btnExport}>
            Export Excel
          </Button>
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={rows}
        page={page}
        size={size}
        totalCount={totalElements}
        loading={loading}
        onPageChange={setPage}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onDoubleClickRow={() => setDialogOpen(true)}
        onClickRow={setSelectedRow}
        selectedRowId={selectedRow?.id}
        showActions={false}
        renderCell={renderCell}
        id="renewal-report-table"
      />

      <AddCheckListDialog
        open={dialogOpen}
        handleClose={() => setDialogOpen(false)}
        initialData={selectedRow?.checklist}
        readOnly={true}
      />
    </MainCard>
  );
}
