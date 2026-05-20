import { useState, useEffect, useCallback, useMemo } from 'react';
import { Typography, Stack, MenuItem, useTheme, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { IconTractor, IconPlus, IconX, IconDeviceFloppy } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { setFilterConfig } from 'store/slices/search';
import { BOSDataTable, BOSExportButton, BOSTextField, BOSAutocomplete } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import axios from 'axios';
import { openSnackbar } from 'store/slices/snackbar';
import { useSelector, useDispatch } from 'react-redux';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'freightType', label: 'Freight Type', minWidth: 200, bold: true },
  { id: 'description', label: 'Description', minWidth: 300 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
];

const INITIAL = { freightType: '', description: '', status: 'Active' };

export default function Freight() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const perms = usePagePermissions(PAGE_CODES.LOG_FREIGHT);
  const globalQuery = useSelector((state) => state.search.query);
  const [rows, setRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL);
  const [selectedId, setSelectedId] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/sm/freight');
      setRows(data.map((r, i) => ({ ...r, index: i + 1 })));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const h = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.freightType) {
      dispatch(openSnackbar({
        open: true,
        message: 'Please fill the Freight Type.',
        variant: 'alert',
        alert: { variant: 'filled' },
        severity: 'error',
        close: false
      }));
      return;
    }
    try {
      if (selectedId) {
        await axios.put(`/api/sm/freight/${selectedId}`, form);
      } else {
        await axios.post('/api/sm/freight', form);
      }
      
      dispatch(openSnackbar({
        open: true,
        message: `Freight Type ${selectedId ? 'updated' : 'created'} successfully!`,
        variant: 'alert',
        alert: { variant: 'filled' },
        severity: 'success',
        close: false
      }));
      setShowForm(false);
      setForm(INITIAL);
      setSelectedId(null);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteClick = (row) => {
    setDeleteId(row.id);
    setDeleteName(row.freightType);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/sm/freight/${deleteId}`);
      dispatch(openSnackbar({
        open: true,
        message: 'Freight Type deleted successfully!',
        variant: 'alert',
        alert: { variant: 'filled' },
        severity: 'success',
        close: false
      }));
      setDeleteOpen(false);
      setDeleteId(null);
      setDeleteName('');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const config = [
      { id: 'freightType', label: 'Freight Type', type: 'text' },
      { id: 'description', label: 'Description', type: 'text' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const filteredRows = useMemo(() => {
    const q = (globalQuery || '').toLowerCase();
    if (!q) return rows;
    return rows.filter(row =>
      (row.freightType && row.freightType.toLowerCase().includes(q)) ||
      (row.description && row.description.toLowerCase().includes(q))
    ).map((r, i) => ({ ...r, index: i + 1 }));
  }, [rows, globalQuery]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconTractor size={24} />
          <Typography variant="h3">Freight Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          {perms.export && (
            <BOSExportButton
              data={rows}
              filename="Freight_Master"
              columns={[
                { header: 'Freight Type', key: 'freightType' },
                { header: 'Description', key: 'description' },
                { header: 'Status', key: 'status' }
              ]}
            />
          )}
          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => setShowForm(true)}>
            Add New
          </Button>
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={filteredRows}
        page={page}
        size={size}
        totalCount={rows.length}
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
        onEditRow={(row) => { setForm(row); setSelectedId(row.id); setShowForm(true); }}
        onDeleteRow={perms.delete ? handleDeleteClick : undefined}
      />

      <Dialog open={showForm} onClose={() => { setShowForm(false); setForm(INITIAL); setSelectedId(null); }} fullWidth maxWidth="sm">
        <DialogTitle>{selectedId ? 'Edit Freight' : 'New Freight'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <BOSTextField name="freightType" label="Freight Type" value={form.freightType} onChange={h} required placeholder="e.g. Paid, To Pay, Free, Pre-Paid" />
              </Grid>
              <Grid item xs={12}>
                <BOSTextField name="description" label="Description" value={form.description} onChange={h} multiline rows={3} placeholder="Enter details..." />
              </Grid>
              <Grid item xs={12}>
                <BOSAutocomplete
                  label="Status"
                  name="status"
                  value={form.status}
                  options={['Active', 'Inactive']}
                  onChange={(val) => setForm(p => ({ ...p, status: val || 'Active' }))}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowForm(false); setForm(INITIAL); setSelectedId(null); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      
      <ConfirmDeleteDialog 
        open={deleteOpen} 
        onClose={() => setDeleteOpen(false)} 
        onConfirm={handleDeleteConfirm} 
        title="Delete Freight" 
        message="Are you sure you want to delete this freight?" 
        itemName={deleteName} 
      />
    </MainCard>
  );
}
