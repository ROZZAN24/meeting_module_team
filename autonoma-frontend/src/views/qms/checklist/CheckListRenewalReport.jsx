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
import { BOSDataTable, BOSExportButton, btnExport, getStatusChipSx } from 'ui-component/bos';
import { AddCheckListDialog } from './AddCheckListDialog';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'seqNo', label: 'Seq No', minWidth: 80, bold: true },
  { id: 'checkingPoint', label: 'Checking Point', minWidth: 200 },
  { id: 'category', label: 'Category', minWidth: 120 },
  { id: 'frequency', label: 'Frequency', minWidth: 100 },
  { id: 'department', label: 'Department', minWidth: 150 },
  { id: 'photoRequired', label: 'Photo Req', minWidth: 90 },
  { id: 'verificationRequired', label: 'Verify Req', minWidth: 90 },
  { id: 'stockLink', label: 'Stock Link', minWidth: 90 },
  { id: 'assignTo', label: 'Assigned To', minWidth: 120 },
  { id: 'assignedBy', label: 'Assigned By', minWidth: 120 },
  { id: 'checklistDate', label: 'Checklist Date', minWidth: 120 },
  { id: 'remarks', label: 'Comments', minWidth: 200 },
  { id: 'status', label: 'Status', minWidth: 130 }
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
      { id: 'status', label: 'Status', type: 'select', isStarred: true, options: [{ label: 'All', value: 'All' }, { label: 'Open', value: 'Open' }, { label: 'Pending for Verified', value: 'Pending for Verified' }, { label: 'Verified', value: 'Verified' }, { label: 'Rejected', value: 'Rejected' }, { label: 'Accepted', value: 'Accepted' }], defaultValue: 'All' },
      { id: 'category', label: 'Category', type: 'select', isStarred: true, options: [{ label: 'All', value: 'All' }, { label: 'Renewal', value: 'RENEWAL' }, { label: 'Check List', value: 'CHECK LIST' }], defaultValue: 'All' },
      { id: 'considerDate', label: 'Consider Date?', type: 'select', isStarred: true, options: [{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }], defaultValue: 'No' },
      { id: 'fromDate', label: 'From Date', type: 'date', isStarred: true },
      { id: 'toDate', label: 'To Date', type: 'date', isStarred: true },
      { id: 'seqNo', label: 'Seq No', type: 'text' },
      { id: 'checkingPoint', label: 'Checking Point', type: 'text' },
      { id: 'frequency', label: 'Frequency', type: 'select', options: [{ label: 'All', value: 'All' }, { label: 'DAILY', value: 'DAILY' }, { label: 'WEEKLY', value: 'WEEKLY' }, { label: 'MONTHLY', value: 'MONTHLY' }, { label: 'YEARLY', value: 'YEARLY' }], defaultValue: 'All' },
      { id: 'searchBy', label: 'Search by', type: 'select', options: [{ label: 'Seq No', value: 'seqNo' }, { label: 'Checking Point', value: 'checkingPoint' }, { label: 'Category', value: 'category' }], defaultValue: 'checkingPoint' }
    ]));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page, size,
        status: filters.status !== 'All' ? filters.status : undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        seqNo: filters.seqNo || undefined,
        checkingPoint: filters.checkingPoint || undefined,
        frequency: filters.frequency !== 'All' ? filters.frequency : undefined,
        fromDate: filters.considerDate === 'Yes' ? filters.fromDate : undefined,
        toDate: filters.considerDate === 'Yes' ? filters.toDate : undefined,
        searchBy: filters.searchBy !== 'All' ? filters.searchBy : undefined,
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
    const exportData = rows.map((r, i) => {
      const m = r.checklist || {};
      return {
        '#': i + 1,
        'Seq No': m.seqNo,
        'Checking Point': m.checkingPoint,
        'Category': m.category,
        'Frequency': m.frequency,
        'Department': (m.departments || []).map((d) => d.departmentName).join(', '),
        'Photo Required': m.photoRequired || '-',
        'Verification Required': m.dualCheck || '-',
        'Stock Link': m.stockLink || '-',
        'Assigned To': r.assignedTo || m.assignTo || '-',
        'Assigned By': r.assignedBy || '-',
        'Checklist Date': r.checklistDate ? new Date(r.checklistDate).toLocaleDateString() : '-',
        'Comments': r.remarks || '-',
        'Status': typeof r.status === 'object' ? r.status?.name : r.status
      };
    });
    exportToExcel(exportData, 'Checklist_Report');
  };

  const renderCell = (col, row, idx) => {
    if (col.id === 'index') return idx + 1 + page * size;
    
    const master = row.checklist || {};
    
    if (col.id === 'seqNo') return master.seqNo;
    if (col.id === 'checkingPoint') return master.checkingPoint;
    if (col.id === 'category') return master.category;
    if (col.id === 'frequency') return master.frequency;
    if (col.id === 'department') return (master.departments || []).map((d) => d.departmentName).join(', ');
    if (col.id === 'photoRequired') return master.photoRequired || '-';
    if (col.id === 'verificationRequired') return master.dualCheck || '-';
    if (col.id === 'stockLink') return master.stockLink || '-';
    if (col.id === 'assignTo') return row.assignedTo || master.assignTo || '-';
    if (col.id === 'assignedBy') return row.assignedBy || '-';
    if (col.id === 'checklistDate') return row.checklistDate ? new Date(row.checklistDate).toLocaleDateString() : '-';
    if (col.id === 'remarks') return row.remarks || '-';
    if (col.id === 'status') {
      const s = typeof row.status === 'object' ? row.status?.name : row.status;
      let chipStatus = 'PENDING';
      if (s === 'Verified' || s === 'Completed' || s === 'Accepted') chipStatus = 'ACTIVE';
      if (s === 'Rejected' || s === 'Missed' || s === 'Unresolved') chipStatus = 'INACTIVE';
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
          <BOSExportButton
            data={rows}
            filename="Checklist_Report"
            columns={[
              { header: 'Seq No', key: 'seqNo' },
              { header: 'Checking Point', key: 'checkingPoint' },
              { header: 'Category', key: 'category' },
              { header: 'Status', key: 'status' }
            ]}
          />
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
