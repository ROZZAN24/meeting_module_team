import { useState, useEffect, useCallback } from 'react';
import { Typography, Stack, MenuItem, useTheme, Button, Tooltip, Grid } from '@mui/material';
import { IconCoins, IconDeviceFloppy, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { BOSDataTable, BOSTextField, btnSave, btnDelete, btnCancel } from 'ui-component/bos';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { openSnackbar } from 'store/slices/snackbar';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'currencyCode', label: 'Currency Code', minWidth: 120, bold: true },
  { id: 'currencyName', label: 'Currency Name', minWidth: 150 },
  { id: 'symbol', label: 'Symbol', minWidth: 80 },
  { id: 'status', label: 'Status', minWidth: 100 }
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

  const fetchData = useCallback(async () => {
    try {
      const { data } = await axios.get('http://localhost:8081/api/currency');
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
      if (selectedId) await axios.put(`http://localhost:8081/api/currency/${selectedId}`, form);
      else await axios.post('http://localhost:8081/api/currency', form);
      
      dispatch(openSnackbar({ open: true, message: `Currency ${selectedId ? 'updated' : 'created'}!`, variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      setShowForm(false);
      setForm(INITIAL);
      setSelectedId(null);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this currency?')) return;
    try {
      await axios.delete(`http://localhost:8081/api/currency/${id}`);
      dispatch(openSnackbar({ open: true, message: 'Currency deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchData();
    } catch (e) { console.error(e); }
  };

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconCoins size={24} />
          <Typography variant="h3">Currency Master</Typography>
        </Stack>
      }
      secondary={
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
    </MainCard>
  );
}
