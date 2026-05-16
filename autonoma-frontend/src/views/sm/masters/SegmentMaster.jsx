import { useState, useEffect, useCallback } from 'react';
import { Typography, Stack, MenuItem, useTheme, Button, Grid } from '@mui/material';
import { IconChartBar, IconDeviceFloppy, IconPlus, IconX } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { setFilterConfig } from 'store/slices/search';
import { BOSDataTable, BOSExportButton, BOSTextField, BOSAutocomplete, btnSave, btnDelete, btnCancel } from 'ui-component/bos';
import axios from 'axios';
import { openSnackbar } from 'store/slices/snackbar';
import { useSelector, useDispatch } from 'react-redux';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'segmentCode', label: 'Segment Code', minWidth: 120, bold: true },
  { id: 'segmentName', label: 'Segment Name', minWidth: 200 },
  { id: 'segmentDescription', label: 'Segment Description', minWidth: 300 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
];

const INITIAL = { segmentCode: '', segmentName: '', segmentDescription: '', status: 'Active' };

export default function SegmentMaster() {
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL);
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/sm/segments');
      setRows(data.map((r, i) => ({ ...r, index: i + 1 })));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const h = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.segmentCode || !form.segmentName) {
      dispatch(openSnackbar({ open: true, message: 'Please fill required fields.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
      return;
    }
    try {
      if (selectedId) await axios.put(`/api/sm/segments/${selectedId}`, form);
      else await axios.post('/api/sm/segments', form);
      
      dispatch(openSnackbar({ open: true, message: `Segment ${selectedId ? 'updated' : 'created'}!`, variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      setShowForm(false);
      setForm(INITIAL);
      setSelectedId(null);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this segment?')) return;
    try {
      await axios.delete(`/api/sm/segments/${id}`);
      dispatch(openSnackbar({ open: true, message: 'Segment deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchData();
    } catch (e) { console.error(e); }
  };

  
  useEffect(() => {
    const config = [
      { id: 'segmentCode', label: 'Segment Code', type: 'text' },
      { id: 'segmentName', label: 'Segment Name', type: 'text' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const filteredRows = useMemo(() => {
    const q = (globalQuery || '').toLowerCase();
    const sourceRows = typeof resolvedRows !== 'undefined' ? resolvedRows : rows; // handle if resolvedRows exists (like SupplierList)
    if (!q) return sourceRows.map((r, i) => ({ ...r, index: i + 1 }));
    return sourceRows.filter(row =>
      (row.segmentCode && row.segmentCode.toString().toLowerCase().includes(q)) ||
      (row.segmentName && row.segmentName.toString().toLowerCase().includes(q))
    ).map((r, i) => ({ ...r, index: i + 1 }));
  }, [rows, globalQuery]);
return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconChartBar size={24} />
          <Typography variant="h3">Segment Master</Typography>
        </Stack>
      }
      secondary={
        !showForm && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <BOSExportButton
              data={rows}
              filename="Segment_Master"
              columns={[
                { header: 'Segment Code', key: 'segmentCode' },
                { header: 'Segment Name', key: 'segmentName' },
                { header: 'Segment Description', key: 'segmentDescription' },
                { header: 'Status', key: 'status' }
              ]}
            />
            <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => setShowForm(true)} sx={btnSave}>
              Add New
            </Button>
          </Stack>
        )
      }
    >
      {showForm ? (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <BOSTextField name="segmentCode" label="Segment Code" value={form.segmentCode} onChange={h} required />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <BOSTextField name="segmentName" label="Segment Name" value={form.segmentName} onChange={h} required />
            </Grid>
            <Grid item xs={12} sm={12} md={8}>
              <BOSTextField 
                name="segmentDescription" 
                label="Segment Description" 
                value={form.segmentDescription} 
                onChange={h} 
                multiline 
                rows={3}
                placeholder="Brief description of this market segment"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <BOSAutocomplete
  label="Status"
  name="status"
  value={form.status}
  options={['Active', 'Inactive']}
  onChange={(val) => setForm(p => ({ ...p, status: val || 'Active' }))}
/>
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="contained" startIcon={<IconX size={18} />} onClick={() => { setShowForm(false); setForm(INITIAL); setSelectedId(null); }} sx={btnCancel}>Cancel</Button>
            <Button variant="contained" startIcon={<IconDeviceFloppy size={18} />} onClick={handleSave} sx={btnSave}>Save</Button>
          </Stack>
        </Stack>
      ) : (
        <BOSDataTable columns={columns}
          rows={filteredRows}
          onEdit={(row) => { setForm(row); setSelectedId(row.id); setShowForm(true); }}
          onDelete={(row) => handleDelete(row.id)}
        />
      )}
    </MainCard>
  );
}
