import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, Tooltip, IconButton, Button } from '@mui/material';
import { IconFileDownload, IconRefresh, IconMail, IconPlus } from '@tabler/icons-react';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig } from 'store/slices/search';
import { openSnackbar } from 'store/slices/snackbar';
import { format } from 'date-fns';

import MainCard from 'ui-component/cards/MainCard';
import { BOSDataTable, BOSExportButton, btnExport, btnNew } from 'ui-component/bos';
import { exportToExcel } from 'utils/excelExport';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';
import AddWorkItemDialog from './AddWorkItemDialog';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';

const columns = [
  { id: 'wiNo', label: 'WI NO', minWidth: 80, bold: true },
  { id: 'dateTime', label: 'DATE & TIME', minWidth: 150 },
  { id: 'category', label: 'CATEGORY', minWidth: 130 },
  { id: 'custCode', label: 'CUST CODE', minWidth: 100 },
  { id: 'custName', label: 'CUST NAME', minWidth: 180 },
  { id: 'from', label: 'FROM', minWidth: 180 },
  { id: 'to', label: 'TO', minWidth: 80 },
  { id: 'subject', label: 'SUBJECT', minWidth: 250 },
  { id: 'noOfItems', label: 'NO OF ITEMS', minWidth: 100 },
  { id: 'enquiryNo', label: 'Enquiry No', minWidth: 120 },
  { id: 'enqEntry', label: 'Enq Entry', minWidth: 100 },
  { id: 'quoteNo', label: 'Quote No', minWidth: 120 },
  { id: 'quoteEntry', label: 'Quote Entry', minWidth: 120 },
  { id: 'saleOrderNo', label: 'Sale Order No', minWidth: 140 },
  { id: 'saleOrderEntr', label: 'Sale Order Entr', minWidth: 140 },
  { id: 'att', label: 'Att', minWidth: 60 },
  { id: 'mode', label: 'Mode', minWidth: 100 },
  { id: 'updatedUserId', label: 'Updated User Id', minWidth: 130 },
  { id: 'updatedDateTime', label: 'Updated Date Tim', minWidth: 150 }
];

export default function WorkItems() {
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const globalFilters = useSelector((state) => state.search.filters);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Configure global search filters
  useEffect(() => {
    const config = [
      { id: 'wiNo', label: 'Work Item No', type: 'text', placeholder: 'Search by WI No...' },
      { id: 'custName', label: 'Customer Name', type: 'text', placeholder: 'Search by Customer...' },
      { id: 'category', label: 'Category', type: 'select', options: [
          { value: 'All', label: 'All' },
          { value: 'QUOTATION_REQUEST', label: 'Quotation Request' },
          { value: 'INVOICE_REQUEST', label: 'Invoice Request' },
          { value: 'GENERAL_INQUIRY', label: 'General Inquiry' }
        ]
      },
      { id: 'status', label: 'Status', type: 'select', options: [
          { value: 'All', label: 'All' },
          { value: 'Workitem Pending', label: 'Workitem Pending' },
          { value: 'Completed', label: 'Completed' }
        ],
        defaultValue: 'Workitem Pending'
      }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const fetchWorkItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_PATHS.OCR.PROCESSING);
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkItems();
  }, [fetchWorkItems]);

  const handleOpenAdd = () => { setSelectedRow(null); setIsReadOnly(false); setDialogOpen(true); };
  const handleOpenEdit = (row) => { 
    // Find original object from data array using id
    const original = data.find(d => d.id === row.id);
    setSelectedRow(original); 
    setIsReadOnly(false); 
    setDialogOpen(true); 
  };
  const handleCloseDialog = (refresh) => { setDialogOpen(false); if (refresh === true) fetchWorkItems(); };

  const handleDeleteClick = (row) => {
    setDeleteTarget(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(API_PATHS.OCR.PROCESSING_BY_ID(deleteTarget.id));
      dispatch(openSnackbar({ open: true, message: 'Work Item deleted successfully!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchWorkItems();
    } catch (error) {
      console.error('Failed to delete work item:', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to delete work item.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleExport = () => {
    const exportData = filteredRows.map((r) => ({
      'WI NO': r.wiNo,
      'DATE & TIME': r.dateTime,
      'CATEGORY': r.category,
      'CUST CODE': r.custCode,
      'CUST NAME': r.custName,
      'FROM': r.from,
      'TO': r.to,
      'SUBJECT': r.subject,
      'NO OF ITEMS': r.noOfItems,
      'Enquiry No': r.enquiryNo,
      'Enq Entry': r.enqEntry,
      'Quote No': r.quoteNo,
      'Quote Entry': r.quoteEntry,
      'Sale Order No': r.saleOrderNo,
      'Sale Order Entr': r.saleOrderEntr,
      'Att': r.att,
      'Mode': r.mode,
      'Updated User Id': r.updatedUserId,
      'Updated Date Tim': r.updatedDateTime
    }));
    exportToExcel(exportData, 'Work_Items');
  };

  const filteredRows = useMemo(() => {
    return data
      .map((row) => ({
        id: row.id,
        wiNo: `#${row.id}`,
        dateTime: row.emailReceivedAt ? format(new Date(row.emailReceivedAt), 'dd/MM/yyyy, hh:mm:ss a') : '-',
        category: row.intent || 'GENERAL_INQUIRY',
        custCode: '-',
        custName: row.customerName || '-',
        from: row.emailFrom || '-',
        to: '-',
        subject: row.emailSubject || '-',
        noOfItems: row.noOfItems || '-',
        enquiryNo: row.quotationNo || row.invoiceNo || '-',
        enqEntry: '-',
        quoteNo: row.quotationNo || '-',
        quoteEntry: '-',
        saleOrderNo: '-',
        saleOrderEntr: '-',
        att: '-',
        mode: row.mode || '-',
        updatedUserId: '-',
        updatedDateTime: '-'
      }))
      .filter((row) => {
        const q = (globalQuery || '').toLowerCase();
        const wiFilter = (globalFilters.wiNo || '').toLowerCase();
        const custFilter = (globalFilters.custName || '').toLowerCase();
        const catFilter = globalFilters.category || 'All';

        const matchesQuery = !q || 
          row.wiNo.toLowerCase().includes(q) || 
          row.custName.toLowerCase().includes(q) || 
          row.subject.toLowerCase().includes(q);

        const matchesWi = !wiFilter || row.wiNo.toLowerCase().includes(wiFilter);
        const matchesCust = !custFilter || row.custName.toLowerCase().includes(custFilter);
        const matchesCat = catFilter === 'All' || row.category === catFilter;
        
        return matchesQuery && matchesWi && matchesCust && matchesCat;
      });
  }, [data, globalQuery, globalFilters]);

  const paginatedRows = useMemo(() => filteredRows.slice(page * size, page * size + size), [filteredRows, page, size]);

  useKeyboardShortcuts({
    'ctrl+n': handleOpenAdd,
    'ctrl+r': fetchWorkItems,
    'escape': () => { if (dialogOpen) setDialogOpen(false); }
  });

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconMail size={24} />
          <Typography variant="h3">Work Items</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Tooltip title="Refresh">
            <IconButton onClick={fetchWorkItems} color="primary" size="small" sx={{
              border: '2px solid', borderColor: 'divider', borderRadius: '8px', p: 1,
              transition: 'all 0.2s', '&:hover': { bgcolor: 'primary.light', transform: 'scale(1.05)' }
            }}>
              <IconRefresh size={20} />
            </IconButton>
          </Tooltip>
          <BOSExportButton
            data={filteredRows}
            filename="Work_Items"
            columns={[
              { header: 'WI NO', key: 'wiNo' },
              { header: 'Date', key: 'dateTime' },
              { header: 'Category', key: 'category' },
              { header: 'Customer', key: 'custName' },
              { header: 'Subject', key: 'subject' }
            ]}
          />
          <Tooltip title={shortcutTooltip('Create New Work Item', 'Ctrl + N')}>
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
        onEditRow={handleOpenEdit}
        onDeleteRow={handleDeleteClick}
        onDoubleClickRow={handleOpenEdit}
      />

      <AddWorkItemDialog open={dialogOpen} handleClose={handleCloseDialog} initialData={selectedRow} readOnly={isReadOnly} />
      
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Work Item"
        message="Are you sure you want to delete this work item? This action cannot be undone."
        itemName={deleteTarget ? `#${deleteTarget.id}` : ''}
      />
    </MainCard>
  );
}
