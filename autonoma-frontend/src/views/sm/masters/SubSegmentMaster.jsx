import { useState, useEffect, useCallback } from 'react';
import { Typography, Stack, MenuItem, useTheme, Button, Grid, Autocomplete, TextField as MuiTextField } from '@mui/material';
import { IconChartPie, IconDeviceFloppy, IconPlus, IconX } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { setFilterConfig } from 'store/slices/search';
import { BOSDataTable, BOSExportButton, BOSTextField, BOSFormDialog, btnSave, btnDelete, btnCancel } from 'ui-component/bos';
import axios from 'utils/axios';
import { openSnackbar } from 'store/slices/snackbar';
import { useSelector, useDispatch } from 'react-redux';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'segmentName', label: 'Segment Name', minWidth: 150 },
  { id: 'subSegmentCode', label: 'Sub Segment Code', minWidth: 120, bold: true },
  { id: 'subSegmentName', label: 'Sub Segment Name', minWidth: 200 },
  { id: 'subSegmentDescription', label: 'Sub Segment Description', minWidth: 250 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
];

const INITIAL = { segmentName: '', subSegmentCode: '', subSegmentName: '', subSegmentDescription: '', status: 'Active' };

export default function SubSegmentMaster() {
  const dispatch = useDispatch();
  const perms = usePagePermissions(PAGE_CODES.LOG_SUB_SEGMENT);
  const [rows, setRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL);
  const [selectedId, setSelectedId] = useState(null);
  const [segments, setSegments] = useState([]);

  const fetchSegments = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/sm/segments');
      setSegments(data.filter(s => s.status === 'Active'));
    } catch (e) { console.error(e); }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/sm/sub-segments');
      setRows(data.map((r, i) => ({ ...r, index: i + 1 })));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); fetchSegments(); }, [fetchData, fetchSegments]);

  const h = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.subSegmentCode || !form.subSegmentName) {
      dispatch(openSnackbar({ open: true, message: 'Please fill required fields.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
      return;
    }
    try {
      if (selectedId) await axios.put(`/api/sm/sub-segments/${selectedId}`, form);
      else await axios.post('/api/sm/sub-segments', form);
      
      dispatch(openSnackbar({ open: true, message: `Sub Segment ${selectedId ? 'updated' : 'created'}!`, variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      setShowForm(false);
      setForm(INITIAL);
      setSelectedId(null);
      fetchData();
    } catch (e) { 
      console.error(e); 
      const errorMsg = e.response?.data?.message || e.response?.data || 'An error occurred while saving.';
      dispatch(openSnackbar({ open: true, message: typeof errorMsg === 'string' ? errorMsg : 'Duplicate value or error occurred.', variant: 'alert', alert: { variant: 'filled' }, severity: 'error', close: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sub-segment?')) return;
    try {
      await axios.delete(`/api/sm/sub-segments/${id}`);
      dispatch(openSnackbar({ open: true, message: 'Sub Segment deleted!', variant: 'alert', alert: { variant: 'filled' }, severity: 'success', close: false }));
      fetchData();
    } catch (e) { console.error(e); }
  };

  
  useEffect(() => {
    const config = [
      { id: 'subSegmentCode', label: 'Sub Segment Code', type: 'text' },
      { id: 'subSegmentName', label: 'Sub Segment Name', type: 'text' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconChartPie size={24} />
          <Typography variant="h3">Sub Segment Master</Typography>
        </Stack>
      }
      secondary={
        !showForm && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            {perms.export && <BOSExportButton
              data={rows}
              filename="Sub_Segment_Master"
              columns={[
                { header: 'Segment Name', key: 'segmentName' },
                { header: 'Sub Segment Code', key: 'subSegmentCode' },
                { header: 'Sub Segment Name', key: 'subSegmentName' },
                { header: 'Sub Segment Description', key: 'subSegmentDescription' },
                { header: 'Status', key: 'status' }
              ]}
            />}
            <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => { setForm(INITIAL); setSelectedId(null); setShowForm(true); }} sx={btnSave}>
              Add New
            </Button>
          </Stack>
        )
      }
    >
      <BOSDataTable
        columns={columns}
        rows={rows}
        onEditRow={(row) => { setForm(row); setSelectedId(row.id); setShowForm(true); }}
        onDeleteRow={(row) => handleDelete(row.id)}
      />

      <BOSFormDialog
        open={showForm}
        onClose={() => { setShowForm(false); setForm(INITIAL); setSelectedId(null); }}
        title={selectedId ? 'Edit Sub Segment' : 'Add New Sub Segment'}
        onSave={handleSave}
        saveLabel={selectedId ? 'Update' : 'Save'}
      >
        <Grid container spacing={2.5} sx={{ width: '100%', m: 0, mt: 1.5 }}>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              fullWidth
              options={segments.map(s => s.segmentName)}
              value={form.segmentName || null}
              onChange={(e, v) => setForm(p => ({ ...p, segmentName: v || '' }))}
              renderInput={(params) => <BOSTextField {...params} label="Segment Name" required fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField name="subSegmentCode" label="Sub Segment Code" value={form.subSegmentCode} onChange={h} required fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField name="subSegmentName" label="Sub Segment Name" value={form.subSegmentName} onChange={h} required fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <BOSTextField name="status" label="Status" value={form.status} onChange={h} select fullWidth>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </BOSTextField>
          </Grid>
          <Grid item xs={12}>
            <BOSTextField name="subSegmentDescription" label="Sub Segment Description" value={form.subSegmentDescription} onChange={h} multiline rows={3} fullWidth />
          </Grid>
        </Grid>
      </BOSFormDialog>
    </MainCard>
  );
}
