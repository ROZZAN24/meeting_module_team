import { useState, useEffect, useMemo } from 'react';
import { 
  Typography, Stack, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, MenuItem
} from '@mui/material';
import { IconCreditCard, IconPlus } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { setFilterConfig } from 'store/slices/search';
import { BOSDataTable, BOSExportButton, BOSTextField } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'termName', label: 'Payment Term', minWidth: 200, bold: true },
  { id: 'description', label: 'Payment Term Description', minWidth: 300 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
];

export default function PaymentTerms() {
  const [rows, setRows] = useState([]);
  const perms = usePagePermissions(PAGE_CODES.LOG_PAYMENT_TERMS);
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [formData, setFormData] = useState({
    termCode: '',
    termName: '',
    dueDays: '',
    description: '',
    status: 'Active'
  });

  const fetchRows = async () => {
    try {
      const res = await axios.get('/api/payment-terms');
      setRows(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const handleOpen = (row = null) => {
    if (row) {
      setEditId(row.id);
      setFormData({
        termCode: row.termCode,
        termName: row.termName,
        dueDays: row.dueDays || '',
        description: row.description || '',
        status: row.status
      });
    } else {
      setEditId(null);
      setFormData({
        termCode: '',
        termName: '',
        dueDays: '',
        description: '',
        status: 'Active'
      });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`/api/payment-terms/${editId}`, formData);
      } else {
        await axios.post('/api/payment-terms', formData);
      }
      handleClose();
      fetchRows();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.response?.data || 'An error occurred while saving.';
      alert(typeof errorMsg === 'string' ? errorMsg : 'Duplicate value or error occurred.');
    }
  };

  const handleDeleteClick = (row) => {
    setDeleteId(row.id);
    setDeleteName(row.termName);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/payment-terms/${deleteId}`);
      setDeleteOpen(false);
      setDeleteId(null);
      setDeleteName('');
      fetchRows();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const config = [
      { id: 'termName', label: 'Payment Term', type: 'text' },
      { id: 'description', label: 'Payment Term Description', type: 'text' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const filteredRows = useMemo(() => {
    const q = (globalQuery || '').toLowerCase();
    const sourceRows = rows || [];
    if (!q) return sourceRows.map((r, i) => ({ ...r, index: i + 1 }));
    return sourceRows.filter(row =>
      (row.termName && row.termName.toString().toLowerCase().includes(q)) ||
      (row.description && row.description.toString().toLowerCase().includes(q))
    ).map((r, i) => ({ ...r, index: i + 1 }));
  }, [rows, globalQuery]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconCreditCard size={24} />
          <Typography variant="h3">Payment Terms Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          {perms.export && <BOSExportButton
            data={rows}
            filename="Payment_Terms"
            columns={[
              { header: 'Payment Term', key: 'termName' },
              { header: 'Description', key: 'description' },
              { header: 'Status', key: 'status' }
            ]}
          />}
          {perms.write && (
            <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => handleOpen()}>
              New Term
            </Button>
          )}
        </Stack>
      }
    >
      <BOSDataTable columns={columns}
        rows={filteredRows}
        page={page}
        size={size}
        totalCount={rows.length}
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onEditRow={(row) => handleOpen(row)}
        onDeleteRow={perms.delete ? handleDeleteClick : undefined}
      />

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Payment Term' : 'New Payment Term'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <BOSTextField
              disabled={!perms.write}
              label="Payment Term"
              fullWidth
              value={formData.termName}
              onChange={(e) => setFormData({ ...formData, termName: e.target.value })}
            />
            <BOSTextField
              disabled={!perms.write}
              label="Payment Term Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <BOSTextField
              select
              disabled={!perms.write}
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="InActive">InActive</MenuItem>
            </BOSTextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {perms.write && (
            <Button variant="contained" onClick={handleSubmit}>
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog 
        open={deleteOpen} 
        onClose={() => setDeleteOpen(false)} 
        onConfirm={handleDeleteConfirm} 
        title="Delete Payment Term" 
        message="Are you sure you want to delete this payment term?" 
        itemName={deleteName} 
      />
    </MainCard>
  );
}
