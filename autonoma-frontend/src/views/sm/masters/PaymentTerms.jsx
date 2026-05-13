import { useState, useEffect } from 'react';
import { 
  Typography, Stack, Button, Dialog, DialogTitle, DialogContent, 
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
];

export default function PaymentTerms() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    termCode: '',
    termName: '',
    dueDays: '',
    description: '',
    status: 'Active'
  });

  const fetchRows = async () => {
    try {
      const res = await axios.get('http://localhost:8081/api/payment-terms');
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
        await axios.put(`http://localhost:8081/api/payment-terms/${editId}`, formData);
      } else {
        await axios.post('http://localhost:8081/api/payment-terms', formData);
      }
      handleClose();
      fetchRows();
    } catch (err) {
      console.error(err);
    }
  };

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
          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => handleOpen()}>
            New Term
          </Button>
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={formattedRows}
        page={page}
        size={size}
        totalCount={rows.length}
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
      />

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Payment Term' : 'New Payment Term'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Term Code"
              fullWidth
              value={formData.termCode}
              onChange={(e) => setFormData({ ...formData, termCode: e.target.value })}
            />
            <TextField
              label="Term Name"
              fullWidth
              value={formData.termName}
              onChange={(e) => setFormData({ ...formData, termName: e.target.value })}
            />
            <TextField
              label="Due Days"
              fullWidth
              type="number"
              value={formData.dueDays}
              onChange={(e) => setFormData({ ...formData, dueDays: e.target.value })}
            />
            <TextField
              label="Description"
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
    </MainCard>
  );
}
