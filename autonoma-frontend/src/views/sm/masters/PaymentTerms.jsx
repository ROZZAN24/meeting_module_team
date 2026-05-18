import { useState, useEffect } from 'react';
import { 
  Typography, Stack, Button, Dialog, DialogTitle, DialogContent, 
<<<<<<< HEAD
  DialogActions, TextField, MenuItem
} from '@mui/material';
import { IconCreditCard, IconPlus } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { setFilterConfig } from 'store/slices/search';
import { BOSDataTable, BOSExportButton } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'termName', label: 'Payment Term', minWidth: 200, bold: true },
  { id: 'description', label: 'Payment Term Description', minWidth: 300 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
=======
  DialogActions, TextField, MenuItem, IconButton, Tooltip 
} from '@mui/material';
import { IconCreditCard, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { BOSDataTable } from 'ui-component/bos';
import axios from 'axios';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'termCode', label: 'Term Code', minWidth: 120, bold: true },
  { id: 'termName', label: 'Term Name', minWidth: 250 },
  { id: 'dueDays', label: 'Due Days', minWidth: 100 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'actions', label: 'Actions', minWidth: 100, align: 'right' }
>>>>>>> origin/chore/repo-cleanup
];

export default function PaymentTerms() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
<<<<<<< HEAD
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
=======
>>>>>>> origin/chore/repo-cleanup
  const [formData, setFormData] = useState({
    termCode: '',
    termName: '',
    dueDays: '',
    description: '',
    status: 'Active'
  });

  const fetchRows = async () => {
    try {
<<<<<<< HEAD
      const res = await axios.get('/api/payment-terms');
=======
      const res = await axios.get('http://localhost:8081/api/payment-terms');
>>>>>>> origin/chore/repo-cleanup
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
<<<<<<< HEAD
        await axios.put(`/api/payment-terms/${editId}`, formData);
      } else {
        await axios.post('/api/payment-terms', formData);
=======
        await axios.put(`http://localhost:8081/api/payment-terms/${editId}`, formData);
      } else {
        await axios.post('http://localhost:8081/api/payment-terms', formData);
>>>>>>> origin/chore/repo-cleanup
      }
      handleClose();
      fetchRows();
    } catch (err) {
      console.error(err);
    }
  };

<<<<<<< HEAD
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
    const sourceRows = typeof resolvedRows !== 'undefined' ? resolvedRows : rows; // handle if resolvedRows exists (like SupplierList)
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
          <BOSExportButton
            data={rows}
            filename="Payment_Terms"
            columns={[
              { header: 'Payment Term', key: 'termName' },
              { header: 'Description', key: 'description' },
              { header: 'Status', key: 'status' }
            ]}
          />
=======
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this term?')) {
      try {
        await axios.delete(`http://localhost:8081/api/payment-terms/${id}`);
        fetchRows();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formattedRows = rows.map((row, index) => ({
    ...row,
    index: index + 1,
    actions: (
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        <Tooltip title="Edit">
          <IconButton size="small" color="primary" onClick={() => handleOpen(row)}>
            <IconEdit size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
            <IconTrash size={18} />
          </IconButton>
        </Tooltip>
      </Stack>
    )
  }));

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconCreditCard size={24} />
            <Typography variant="h3">Payment Terms</Typography>
          </Stack>
>>>>>>> origin/chore/repo-cleanup
          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => handleOpen()}>
            New Term
          </Button>
        </Stack>
      }
    >
<<<<<<< HEAD
      <BOSDataTable columns={columns}
        rows={filteredRows}
=======
      <BOSDataTable
        columns={columns}
        rows={formattedRows}
>>>>>>> origin/chore/repo-cleanup
        page={page}
        size={size}
        totalCount={rows.length}
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
<<<<<<< HEAD
        onEditRow={(row) => handleOpen(row)}
        onDeleteRow={handleDeleteClick}
=======
>>>>>>> origin/chore/repo-cleanup
      />

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Payment Term' : 'New Payment Term'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
<<<<<<< HEAD
              label="Payment Term"
=======
              label="Term Code"
              fullWidth
              value={formData.termCode}
              onChange={(e) => setFormData({ ...formData, termCode: e.target.value })}
            />
            <TextField
              label="Term Name"
>>>>>>> origin/chore/repo-cleanup
              fullWidth
              value={formData.termName}
              onChange={(e) => setFormData({ ...formData, termName: e.target.value })}
            />
            <TextField
<<<<<<< HEAD
              label="Payment Term Description"
=======
              label="Due Days"
              fullWidth
              type="number"
              value={formData.dueDays}
              onChange={(e) => setFormData({ ...formData, dueDays: e.target.value })}
            />
            <TextField
              label="Description"
>>>>>>> origin/chore/repo-cleanup
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              select
              label="Status"
              fullWidth
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="InActive">InActive</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
<<<<<<< HEAD

      <ConfirmDeleteDialog 
        open={deleteOpen} 
        onClose={() => setDeleteOpen(false)} 
        onConfirm={handleDeleteConfirm} 
        title="Delete Payment Term" 
        message="Are you sure you want to delete this payment term?" 
        itemName={deleteName} 
      />
=======
>>>>>>> origin/chore/repo-cleanup
    </MainCard>
  );
}
