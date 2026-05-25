import { useState, useEffect, useMemo } from 'react';
import { 
  Typography, Stack, Button, Dialog, DialogTitle, DialogContent, 
  DialogActions, MenuItem
} from '@mui/material';
import { IconMapPin, IconPlus } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { setFilterConfig } from 'store/slices/search';
import { BOSDataTable, BOSExportButton, BOSTextField } from 'ui-component/bos';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import usePagePermissions, { PAGE_CODES } from 'hooks/usePagePermissions';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'countryName', label: 'Country Name', minWidth: 200, bold: true },
  { id: 'stateName', label: 'State Name', minWidth: 200 },
  { id: 'stateCode', label: 'State Code', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 100 },
  { id: 'createdBy', label: 'Created By', minWidth: 120 },
  { id: 'createdDate', label: 'Created Date', minWidth: 150 },
  { id: 'updatedBy', label: 'Updated By', minWidth: 120 },
  { id: 'updatedDate', label: 'Updated Date', minWidth: 150 }
];

export default function StateMaster() {
  const [rows, setRows] = useState([]);
  const perms = usePagePermissions(PAGE_CODES.LOG_STATE);
  const dispatch = useDispatch();
  const globalQuery = useSelector((state) => state.search.query);
  const [countries, setCountries] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  const [formData, setFormData] = useState({
    countryName: '',
    stateName: '',
    stateCode: '',
    status: 'Active'
  });

  const fetchRows = async () => {
    try {
      const res = await axios.get('/api/master/states');
      setRows(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCountries = async () => {
    try {
      const res = await axios.get('/api/master/countries');
      setCountries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRows();
    fetchCountries();
  }, []);

  const handleOpen = (row = null) => {
    if (row) {
      setEditId(row.id);
      setFormData({
        countryName: row.countryName || '',
        stateName: row.stateName || '',
        stateCode: row.stateCode || '',
        status: row.status
      });
    } else {
      setEditId(null);
      setFormData({
        countryName: '',
        stateName: '',
        stateCode: '',
        status: 'Active'
      });
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`/api/master/states/${editId}`, formData);
      } else {
        await axios.post('/api/master/states', formData);
      }
      handleClose();
      fetchRows();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClick = (row) => {
    setDeleteId(row.id);
    setDeleteName(row.stateName);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/master/states/${deleteId}`);
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
      { id: 'stateName', label: 'State Name', type: 'text' },
      { id: 'stateCode', label: 'State Code', type: 'text' },
      { id: 'countryName', label: 'Country Name', type: 'text' }
    ];
    dispatch(setFilterConfig(config));
    return () => dispatch(setFilterConfig(null));
  }, [dispatch]);

  const filteredRows = useMemo(() => {
    const q = (globalQuery || '').toLowerCase();
    const sourceRows = rows || [];
    if (!q) return sourceRows.map((r, i) => ({ ...r, index: i + 1 }));
    return sourceRows.filter(row =>
      (row.stateName && row.stateName.toString().toLowerCase().includes(q)) ||
      (row.stateCode && row.stateCode.toString().toLowerCase().includes(q)) ||
      (row.countryName && row.countryName.toString().toLowerCase().includes(q))
    ).map((r, i) => ({ ...r, index: i + 1 }));
  }, [rows, globalQuery]);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconMapPin size={24} />
          <Typography variant="h3">State Master</Typography>
        </Stack>
      }
      secondary={
        <Stack direction="row" spacing={1.5} alignItems="center">
          {perms.export && <BOSExportButton
            data={rows}
            filename="State_Master"
            columns={[
              { header: 'Country Name', key: 'countryName' },
              { header: 'State Name', key: 'stateName' },
              { header: 'State Code', key: 'stateCode' },
              { header: 'Status', key: 'status' }
            ]}
          />}
          {perms.write && (
            <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => handleOpen()}>
              New State
            </Button>
          )}
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
        onEditRow={(row) => handleOpen(row)}
        onDeleteRow={perms.delete ? handleDeleteClick : undefined}
      />

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit State' : 'New State'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <BOSTextField
              select
              disabled={!perms.write}
              label="Country Name"
              fullWidth
              value={formData.countryName}
              onChange={(e) => setFormData({ ...formData, countryName: e.target.value })}
            >
              <MenuItem value="">-Select-</MenuItem>
              {countries
                .filter(c => c.status === 'Active')
                .map(c => (
                  <MenuItem key={c.id} value={c.country}>{c.country}</MenuItem>
                ))
              }
            </BOSTextField>
            <BOSTextField
              disabled={!perms.write}
              label="State Name"
              fullWidth
              value={formData.stateName}
              onChange={(e) => setFormData({ ...formData, stateName: e.target.value })}
            />
            <BOSTextField
              disabled={!perms.write}
              label="State Code"
              fullWidth
              value={formData.stateCode}
              onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
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
        title="Delete State" 
        message="Are you sure you want to delete this state?" 
        itemName={deleteName} 
      />
    </MainCard>
  );
}
