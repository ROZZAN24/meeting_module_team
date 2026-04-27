import { useState, useEffect, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Collapse from '@mui/material/Collapse';
import TablePagination from '@mui/material/TablePagination';
import axios from 'utils/axios';

import MainCard from 'ui-component/cards/MainCard';
import AddCheckListDialog from './AddCheckListDialog';

import { IconUserPlus, IconEdit, IconPlus, IconFileDots, IconSearch, IconX, IconAdjustmentsHorizontal, IconChevronDown, IconChevronUp } from '@tabler/icons-react';

const columns = [
  '#','Seq No','Checking Point','Category','Frequency','Department',
  'Effective from','Days','Expire Date','Reminder Date','Stock Link',
  'Assign To','Assign Date','Item Code','Qty','Photo Required',
  'Created Date','Created By','Modified By','Status','Task Status',
  'Verify Status','Verified By','Verified Date','Rej Reason'
];

const DEPARTMENTS = [
  'ACCOUNTS','ADMIN','ASSEMBLY','BUSINESS DEVELOPMENT','DESIGN & DEVELOPMENT',
  'HRA','LOGISTICS','MAINTENANCE','MANAGEMENT','MANAGEMENT REPRESENTATIVE',
  'OPERATIONS','PLANNING','PRODUCT DEVELOPMENT','PRODUCTION','PURCHASE',
  'QMS','QUALITY','SALES & MARKETING','STORES','STRATEGIC PROCUREMENT','TOP MANAGEMENT'
];

const DEFAULT_FILTERS = {
  status: 'All',
  taskStatus: 'All',
  recordStatus: 'All',
  category: 'All',
  departments: [],
  employeeName: '',
  leftCompany: 'All'
};

// Collapsible filter section
function FilterSection({ title, open, onToggle, children }) {
  return (
    <Box sx={{ mb: 0.5 }}>
      <Box onClick={onToggle} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', py:1, px:2, '&:hover':{ bgcolor:'action.hover' }, borderRadius:1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight:700 }}>{title}</Typography>
        {open ? <IconChevronUp size={16}/> : <IconChevronDown size={16}/>}
      </Box>
      <Collapse in={open}><Box sx={{ px:2, pb:1 }}>{children}</Box></Collapse>
    </Box>
  );
}

export default function MasterCheckList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });

  // Section toggles
  const [openSections, setOpenSections] = useState({ status:true, taskStatus:true, recordStatus:true, category:true, department:false, employee:false, leftCompany:false });
  const toggleSection = (key) => setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  const fetchChecklists = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        category: filters.category !== 'All' ? filters.category : undefined,
        department: filters.departments.length > 0 ? filters.departments[0] : undefined, // Simplification for now
        searchValue: searchQuery || undefined,
        searchBy: searchQuery ? 'checkingPoint' : undefined
      };
      const response = await axios.get('/api/qms/checklist', { params });
      setRows(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch checklists:', error);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters, searchQuery]);

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  const setFilter = (key, val) => {
    setFilters((p) => ({ ...p, [key]: val }));
    setPage(0);
  };
  
  const toggleDept = (dept) => {
    setFilters((p) => {
      const arr = p.departments;
      return { ...p, departments: arr.includes(dept) ? arr.filter((d) => d !== dept) : [...arr, dept] };
    });
    setPage(0);
  };

  const resetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setPage(0);
  };

  const activeCount = (filters.status !== 'All' ? 1 : 0) + (filters.taskStatus !== 'All' ? 1 : 0) + (filters.recordStatus !== 'All' ? 1 : 0) + (filters.category !== 'All' ? 1 : 0) + filters.departments.length + (filters.employeeName ? 1 : 0) + (filters.leftCompany !== 'All' ? 1 : 0);

  const handleSaveData = async (data) => {
    try {
      await axios.post('/api/qms/checklist', data, {
        params: { departments: (data.department || []).join(',') }
      });
      fetchChecklists();
      setDialogOpen(false);
    } catch (error) {
      console.error('Failed to save checklist:', error);
    }
  };
  const handleEditClick = () => { if (!selectedRowId) { alert('Please select a row first!'); return; } setDialogOpen(true); };

  const activeRow = rows.find((r) => r.id === selectedRowId) || null;

  return (
    <MainCard
      title="Master Check List - 282"
      secondary={
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <TextField size="small" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><IconSearch size={18}/></InputAdornment>, endAdornment: searchQuery ? <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchQuery('')}><IconX size={16}/></IconButton></InputAdornment> : null }}
            sx={{ width:220 }}
          />
          <IconButton size="small" onClick={() => setDrawerOpen(true)}
            sx={{ border:'1px solid', borderColor: activeCount > 0 ? 'primary.main' : 'divider', bgcolor: activeCount > 0 ? 'primary.light' : 'transparent', borderRadius:1.5, p:0.8, position:'relative' }}>
            <IconAdjustmentsHorizontal size={20}/>
            {activeCount > 0 && <Box sx={{ position:'absolute', top:-4, right:-4, width:18, height:18, borderRadius:'50%', bgcolor:'error.main', color:'#fff', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{activeCount}</Box>}
          </IconButton>
        </Box>
      }
    >
      {activeCount > 0 && (
        <Box sx={{ display:'flex', gap:0.5, mb:2, flexWrap:'wrap', alignItems:'center' }}>
          <Typography variant="body2" sx={{ fontWeight:600, mr:0.5 }}>Filters:</Typography>
          {filters.status !== 'All' && <Chip label={`Status: ${filters.status}`} size="small" color="primary" onDelete={() => setFilter('status','All')}/>}
          {filters.taskStatus !== 'All' && <Chip label={`Task: ${filters.taskStatus}`} size="small" color="primary" onDelete={() => setFilter('taskStatus','All')}/>}
          {filters.recordStatus !== 'All' && <Chip label={`Record: ${filters.recordStatus}`} size="small" color="primary" onDelete={() => setFilter('recordStatus','All')}/>}
          {filters.category !== 'All' && <Chip label={`Category: ${filters.category}`} size="small" color="secondary" onDelete={() => setFilter('category','All')}/>}
          {filters.departments.map((d) => <Chip key={d} label={d} size="small" color="info" onDelete={() => toggleDept(d)}/>)}
          {filters.employeeName && <Chip label={`Employee: ${filters.employeeName}`} size="small" color="warning" onDelete={() => setFilter('employeeName','')}/>}
          {filters.leftCompany !== 'All' && <Chip label={`Left: ${filters.leftCompany}`} size="small" color="error" onDelete={() => setFilter('leftCompany','All')}/>}
          <Button size="small" color="error" onClick={resetFilters} sx={{ ml:1 }}>Clear All</Button>
        </Box>
      )}

      <TableContainer component={Paper} sx={{ maxHeight:'calc(100vh - 380px)', border:'1px solid', borderColor:'divider', '&::-webkit-scrollbar':{width:10,height:10}, '&::-webkit-scrollbar-track':{backgroundColor:'background.paper'}, '&::-webkit-scrollbar-thumb':{backgroundColor:'grey.400',borderRadius:2} }}>
        <Table stickyHeader sx={{ minWidth:2500 }} aria-label="checklist table">
          <TableHead><TableRow>{columns.map((col,i) => <TableCell key={i} sx={{ bgcolor:'primary.dark', color:'white', fontWeight:'bold', whiteSpace:'nowrap', borderRight:'1px solid rgba(255,255,255,0.2)' }}>{col}</TableCell>)}</TableRow></TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py:6 }}><Typography variant="body1" color="textSecondary">Loading...</Typography></TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py:6 }}><Typography variant="body1" color="textSecondary">{searchQuery || activeCount > 0 ? 'No matching records found' : 'No data available in table'}</Typography></TableCell></TableRow>
            ) : rows.map((row,idx) => (
              <TableRow key={row.id} hover onClick={() => setSelectedRowId(row.id)} sx={{ cursor:'pointer', bgcolor: selectedRowId === row.id ? 'primary.light' : 'inherit' }}>
                <TableCell>{page * size + idx + 1}</TableCell>
                <TableCell>{row.seqNo}</TableCell>
                <TableCell>{row.checkingPoint}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.frequency}</TableCell>
                <TableCell>{(row.departments || []).map(d => d.departmentName).join(', ')}</TableCell>
                <TableCell>{row.effectiveFrom}</TableCell>
                <TableCell>{row.reminderDays}</TableCell>
                <TableCell>{row.expiryDate}</TableCell>
                <TableCell>{row.reminderDate}</TableCell>
                <TableCell>{row.stockLink}</TableCell>
                <TableCell>{row.assignTo}</TableCell>
                <TableCell>{row.assignDate}</TableCell>
                <TableCell>{row.itemCode}</TableCell>
                <TableCell>{row.qty}</TableCell>
                <TableCell>{row.photoRequired}</TableCell>
                <TableCell>{row.createdDate ? new Date(row.createdDate).toLocaleDateString() : ''}</TableCell>
                <TableCell>{row.createdBy}</TableCell>
                <TableCell>{row.updatedBy}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.taskStatus}</TableCell>
                <TableCell>{row.verifyStatus}</TableCell>
                <TableCell>{row.verifiedBy}</TableCell>
                <TableCell>{row.verifiedDate}</TableCell>
                <TableCell>{row.rejReason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={(e, p) => setPage(p)}
        rowsPerPage={size}
        onRowsPerPageChange={(e) => { setSize(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      <Box sx={{ display:'flex', justifyContent:'flex-end', mt:2 }}>
        <Stack direction="row" spacing={1.5}>
          <Button variant="contained" color="secondary" startIcon={<IconUserPlus size={18}/>}>Assign To</Button>
          <Button variant="contained" color="secondary" startIcon={<IconFileDots size={18}/>}>Amendment</Button>
          <Button variant="contained" color="secondary" startIcon={<IconEdit size={18}/>} onClick={handleEditClick}>Edit</Button>
          <Button variant="contained" color="primary" startIcon={<IconPlus size={18}/>} onClick={() => { setSelectedRowId(null); setDialogOpen(true); }}>Add</Button>
        </Stack>
      </Box>

      {/* ===== FILTER DRAWER ===== */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx:{ width:320 } }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', p:2, borderBottom:'1px solid', borderColor:'divider' }}>
          <Typography variant="h5" sx={{ fontWeight:700 }}>Filters</Typography>
          <IconButton size="small" onClick={() => setDrawerOpen(false)}><IconX size={20}/></IconButton>
        </Box>

        <Box sx={{ overflowY:'auto', flex:1 }}>
          <FilterSection title="Status" open={openSections.status} onToggle={() => toggleSection('status')}>
            <FormControl><RadioGroup value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
              {['All','Pending for Verify','Verified','Rejected'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={<Typography variant="body2">{v}</Typography>}/>)}
            </RadioGroup></FormControl>
          </FilterSection>
          <Divider/>

          <FilterSection title="Task Status" open={openSections.taskStatus} onToggle={() => toggleSection('taskStatus')}>
            <FormControl><RadioGroup value={filters.taskStatus} onChange={(e) => setFilter('taskStatus', e.target.value)}>
              {['All','Not Assigned','Assigned'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={<Typography variant="body2">{v}</Typography>}/>)}
            </RadioGroup></FormControl>
          </FilterSection>
          <Divider/>

          <FilterSection title="Record Status" open={openSections.recordStatus} onToggle={() => toggleSection('recordStatus')}>
            <FormControl><RadioGroup value={filters.recordStatus} onChange={(e) => setFilter('recordStatus', e.target.value)}>
              {['All','Active','In Active'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={<Typography variant="body2">{v}</Typography>}/>)}
            </RadioGroup></FormControl>
          </FilterSection>
          <Divider/>

          <FilterSection title="Category" open={openSections.category} onToggle={() => toggleSection('category')}>
            <FormControl><RadioGroup value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
              {['All','RENEWAL','CHECK LIST'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={<Typography variant="body2">{v === 'All' ? 'All' : v === 'RENEWAL' ? 'Renewal' : 'Check List'}</Typography>}/>)}
            </RadioGroup></FormControl>
          </FilterSection>
          <Divider/>

          <FilterSection title="Department" open={openSections.department} onToggle={() => toggleSection('department')}>
            <Box sx={{ maxHeight:250, overflowY:'auto' }}>
              {DEPARTMENTS.map((d) => <FormControlLabel key={d} sx={{ display:'flex', ml:0, mr:0, py:0.2 }} control={<Checkbox size="small" checked={filters.departments.includes(d)} onChange={() => toggleDept(d)} sx={{ p:0.5 }}/>} label={<Typography variant="body2">{d}</Typography>}/>)}
            </Box>
          </FilterSection>
          <Divider/>

          <FilterSection title="Employee Name" open={openSections.employee} onToggle={() => toggleSection('employee')}>
            <TextField size="small" fullWidth placeholder="Search employee..." value={filters.employeeName} onChange={(e) => setFilter('employeeName', e.target.value)}/>
          </FilterSection>
          <Divider/>

          <FilterSection title="Left Company" open={openSections.leftCompany} onToggle={() => toggleSection('leftCompany')}>
            <FormControl><RadioGroup value={filters.leftCompany} onChange={(e) => setFilter('leftCompany', e.target.value)}>
              {['All','No','Yes'].map((v) => <FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={<Typography variant="body2">{v}</Typography>}/>)}
            </RadioGroup></FormControl>
          </FilterSection>
        </Box>

        <Box sx={{ p:2, borderTop:'1px solid', borderColor:'divider', display:'flex', gap:1 }}>
          <Button fullWidth variant="outlined" color="error" onClick={() => { resetFilters(); setDrawerOpen(false); }}>Reset All</Button>
          <Button fullWidth variant="contained" onClick={() => setDrawerOpen(false)}>Apply</Button>
        </Box>
      </Drawer>

      <AddCheckListDialog open={dialogOpen} handleClose={() => setDialogOpen(false)} onSave={handleSaveData} initialData={activeRow}/>
    </MainCard>
  );
}
