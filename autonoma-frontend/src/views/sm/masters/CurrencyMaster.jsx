import { useState, useEffect, useCallback } from 'react';
<<<<<<< HEAD
import { Typography, Stack, MenuItem, useTheme, Button, Tooltip, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { IconCoins, IconDeviceFloppy, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { setFilterConfig } from 'store/slices/search';
import { BOSDataTable, BOSExportButton, BOSTextField, BOSAutocomplete, btnSave, btnDelete, btnCancel } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import axios from 'axios';
import { openSnackbar } from 'store/slices/snackbar';
import { useSelector, useDispatch } from 'react-redux';
=======
import { Typography, Stack, MenuItem, useTheme, Button, Tooltip, Grid } from '@mui/material';
import { IconCoins, IconDeviceFloppy, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { BOSDataTable, BOSTextField, btnSave, btnDelete, btnCancel } from 'ui-component/bos';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';
>>>>>>> origin/chore/repo-cleanup

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'currencyCode', label: 'Currency Code', minWidth: 120, bold: true },
  { id: 'currencyName', label: 'Currency Name', minWidth: 150 },
  { id: 'symbol', label: 'Symbol', minWidth: 80 },
<<<<<<< HEAD
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
=======
  { id: 'status', label: 'Status', minWidth: 100 }
>>>>>>> origin/chore/repo-cleanup
];

const INITIAL = { currencyCode: '', currencyName: '', symbol: '', status: 'Active' };

export default function CurrencyMaster() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL);
  const [selectedId, setSelectedId] = useState(null);
<<<<<<< HEAD
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/currency');
=======

  const fetchData = useCallback(async () => {
    try {
      const { data } = await axios.get('http://localhost:8081/api/currency');
>>>>>>> origin/chore/repo-cleanup
      setRows(data.map((r, i) => ({ ...r, index: i + 1 })));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const h = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.currencyCode || !form.currencyName) {
      dispatch(openSnackbar({ open: true, message: 'Please fill required fields.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
      return;
    }
    try {
<<<<<<< HEAD
      if (selectedId) await axios.put(`/api/currency/${selectedId}`, form);
      else await axios.post('/api/currency', form);
=======
      if (selectedId) await axios.put(`http://localhost:8081/api/currency/${selectedId}`, form);
      else await axios.post('http://localhost:8081/api/currency', form);
>>>>>>> origin/chore/repo-cleanup
      
      dispatch(openSnackbar({ open: true, message: `Currency ${selectedId ? 'updated' : 'created'}!`, variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      setShowForm(false);
      setForm(INITIAL);
      setSelectedId(null);
      fetchData();
    } catch (e) { console.error(e); }
  };

<<<<<<< HEAD
  const handleDeleteClick = (row) => {
    setDeleteId(row.id);
    setDeleteName(row.currencyName);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/currency/${deleteId}`);
      dispatch(openSnackbar({ open: true, message: 'Currency deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      setDeleteOpen(false);
      setDeleteId(null);
      setDeleteName('');
=======
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this currency?')) return;
    try {
      await axios.delete(`http://localhost:8081/api/currency/${id}`);
      dispatch(openSnackbar({ open: true, message: 'Currency deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
>>>>>>> origin/chore/repo-cleanup
      fetchData();
    } catch (e) { console.error(e); }
  };

<<<<<<< HEAD
  
  useEffect(() => {
    const config = [
      { id: 'currencyCode', label: 'Currency Code', type: 'text' },
      { id: 'currencyName', label: 'Currency Name', type: 'text' },
      { id: 'symbol', label: 'Symbol', type: 'text' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const filteredRows = useMemo(() => {
    const q = (globalQuery || '').toLowerCase();
    const sourceRows = typeof resolvedRows !== 'undefined' ? resolvedRows : rows; // handle if resolvedRows exists (like SupplierList)
    if (!q) return sourceRows.map((r, i) => ({ ...r, index: i + 1 }));
    return sourceRows.filter(row =>
      (row.currencyCode && row.currencyCode.toString().toLowerCase().includes(q)) ||
      (row.currencyName && row.currencyName.toString().toLowerCase().includes(q)) ||
      (row.symbol && row.symbol.toString().toLowerCase().includes(q))
    ).map((r, i) => ({ ...r, index: i + 1 }));
  }, [rows, globalQuery]);
return (
=======
  return (
>>>>>>> origin/chore/repo-cleanup
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconCoins size={24} />
          <Typography variant="h3">Currency Master</Typography>
        </Stack>
      }
      secondary={
<<<<<<< HEAD
        <Stack direction="row" spacing={1.5} alignItems="center">
          <BOSExportButton
            data={rows}
            filename="Currency_Master"
            columns={[
              { header: 'Currency Code', key: 'currencyCode' },
              { header: 'Currency Name', key: 'currencyName' },
              { header: 'Symbol', key: 'symbol' },
              { header: 'Status', key: 'status' }
            ]}
          />
          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => setShowForm(true)}>
            Add New
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
        onEditRow={(row) => { setForm(row); setSelectedId(row.id); setShowForm(true); }}
        onDeleteRow={handleDeleteClick}
      />

      <Dialog open={showForm} onClose={() => { setShowForm(false); setForm(INITIAL); setSelectedId(null); }} fullWidth maxWidth="sm">
        <DialogTitle>{selectedId ? 'Edit Currency' : 'New Currency'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <BOSTextField name="currencyCode" label="Currency Code" value={form.currencyCode} onChange={h} required placeholder="e.g. USD" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <BOSTextField name="currencyName" label="Currency Name" value={form.currencyName} onChange={h} required placeholder="e.g. US Dollar" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <BOSTextField name="symbol" label="Symbol" value={form.symbol} onChange={h} placeholder="e.g. $" />
              </Grid>
              <Grid item xs={12} sm={6}>
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
        title="Delete Currency" 
        message="Are you sure you want to delete this currency?" 
        itemName={deleteName} 
      />
=======
        !showForm && (
          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => setShowForm(true)} sx={btnSave}>
            Add New
          </Button>
        )
      }
    >
      {showForm ? (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <BOSTextField name="currencyCode" label="Currency Code" value={form.currencyCode} onChange={h} required placeholder="e.g. USD" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <BOSTextField name="currencyName" label="Currency Name" value={form.currencyName} onChange={h} required placeholder="e.g. US Dollar" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <BOSTextField name="symbol" label="Symbol" value={form.symbol} onChange={h} placeholder="e.g. $" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <BOSTextField name="status" label="Status" value={form.status} onChange={h} select>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </BOSTextField>
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="contained" startIcon={<IconX size={18} />} onClick={() => { setShowForm(false); setForm(INITIAL); setSelectedId(null); }} sx={btnCancel}>Cancel</Button>
            <Button variant="contained" startIcon={<IconDeviceFloppy size={18} />} onClick={handleSave} sx={btnSave}>Save</Button>
          </Stack>
        </Stack>
      ) : (
        <BOSDataTable
          columns={columns}
          rows={rows}
          onEdit={(row) => { setForm(row); setSelectedId(row.id); setShowForm(true); }}
          onDelete={(row) => handleDelete(row.id)}
        />
      )}
>>>>>>> origin/chore/repo-cleanup
    </MainCard>
  );
}
