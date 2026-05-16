import { useState, useEffect } from 'react';
import { 
  Typography, Stack, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem
} from '@mui/material';
import { IconSettings, IconPlus } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { setFilterConfig } from 'store/slices/search';
import { BOSDataTable, BOSExportButton } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'serviceCode', label: 'Service Code', minWidth: 120, bold: true },
  { id: 'serviceName', label: 'Service Name', minWidth: 250 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
];

export default function TypeOfService() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [formData, setFormData] = useState({
    serviceCode: '',
    serviceName: '',
    description: '',
    status: 'Active'
  });

  const fetchRows = async () => {
    try {
      const res = await axios.get('/api/type-of-service');
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
        serviceCode: row.serviceCode,
        serviceName: row.serviceName,
        description: row.description || '',
        status: row.status
      });
    } else {
      setEditId(null);
      setFormData({
        serviceCode: '',
        serviceName: '',
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
        await axios.put(`/api/type-of-service/${editId}`, formData);
      } else {
        await axios.post('/api/type-of-service', formData);
      }
      handleClose();
      fetchRows();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClick = (row) => {
    setDeleteId(row.id);
    setDeleteName(row.serviceName);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/type-of-service/${deleteId}`);
      setDeleteOpen(false);
      setDeleteId(null);
      setDeleteName('');
      fetchRows();
    } catch (err) {
      console.error(err);
    }
  };

  const formattedRows = rows.map((row, index) => ({
    ...row,
    index: index + 1
  }));

  
  useEffect(() => {
    const config = [
      { id: 'serviceCode', label: 'Service Code', type: 'text' },
      { id: 'serviceName', label: 'Service Name', type: 'text' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const filteredRows = useMemo(() => {
    const q = (globalQuery || '').toLowerCase();
    const sourceRows = typeof resolvedRows !== 'undefined' ? resolvedRows : rows; // handle if resolvedRows exists (like SupplierList)
    if (!q) return sourceRows.map((r, i) => ({ ...r, index: i + 1 }));
    return sourceRows.filter(row =>
      (row.serviceCode && row.serviceCode.toString().toLowerCase().includes(q)) ||
      (row.serviceName && row.serviceName.toString().toLowerCase().includes(q))
    ).map((r, i) => ({ ...r, index: i + 1 }));
  }, [rows, globalQuery]);
return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconSettings size={24} />
          <Typography variant="h3">Type of Service</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <BOSExportButton
            data={formattedRows}
            filename="Type_Of_Service"
            columns={[
              { header: 'Service Code', key: 'serviceCode' },
              { header: 'Service Name', key: 'serviceName' },
              { header: 'Status', key: 'status' }
            ]}
          />
          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => handleOpen()}>
            New Service Type
          </Button>
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
        onDeleteRow={handleDeleteClick}
      />

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Service Type' : 'New Service Type'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Service Code"
              fullWidth
              value={formData.serviceCode}
              onChange={(e) => setFormData({ ...formData, serviceCode: e.target.value })}
            />
            <TextField
              label="Service Name"
              fullWidth
              value={formData.serviceName}
              onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
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

      <ConfirmDeleteDialog 
        open={deleteOpen} 
        onClose={() => setDeleteOpen(false)} 
        onConfirm={handleDeleteConfirm} 
        title="Delete Service Type" 
        message="Are you sure you want to delete this service type?" 
        itemName={deleteName} 
      />
    </MainCard>
  );
}
