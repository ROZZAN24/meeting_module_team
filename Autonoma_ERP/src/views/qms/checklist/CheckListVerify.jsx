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
import Collapse from '@mui/material/Collapse';
import TablePagination from '@mui/material/TablePagination';
import axios from 'utils/axios';

import MainCard from 'ui-component/cards/MainCard';

import { IconSearch, IconX, IconAdjustmentsHorizontal, IconChevronDown, IconChevronUp, IconCheck, IconBan, IconFileDownload } from '@tabler/icons-react';
import { exportToExcel } from 'utils/excelExport';

const columns = [
  '#', 'Seq No', 'Checking Point', 'Category', 'Frequency', 'Department',
  'Effective From', 'Days', 'Expire Date', 'Stock Link',
  'Created Date', 'Created By', 'Verify Status', 'Verified By', 'Verified Date'
];

const DEPARTMENTS = [
  'ACCOUNTS','ADMIN','ASSEMBLY','BUSINESS DEVELOPMENT','DESIGN & DEVELOPMENT',
  'HRA','LOGISTICS','MAINTENANCE','MANAGEMENT','MANAGEMENT REPRESENTATIVE',
  'OPERATIONS','PLANNING','PRODUCT DEVELOPMENT','PRODUCTION','PURCHASE',
  'QMS','QUALITY','SALES & MARKETING','STORES','STRATEGIC PROCUREMENT','TOP MANAGEMENT'
];

const DEFAULT_FILTERS = { status:'All', category:'All', departments:[], searchBy:'', searchByValue:'' };

const SEARCH_BY_OPTIONS = [
  { key:'checkingPoint', label:'Checking Point' },
  { key:'description', label:'Descriptions' },
  { key:'seqNo', label:'Seq.No' }
];

function FilterSection({ title, open, onToggle, children }) {
  return (
    <Box sx={{ mb:0.5 }}>
      <Box onClick={onToggle} sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer', py:1, px:2, '&:hover':{ bgcolor:'action.hover' }, borderRadius:1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight:700 }}>{title}</Typography>
        {open ? <IconChevronUp size={16}/> : <IconChevronDown size={16}/>}
      </Box>
      <Collapse in={open}><Box sx={{ px:2, pb:1 }}>{children}</Box></Collapse>
    </Box>
  );
}

function StatusChip({ status }) {
  const map = {
    'Verified': { color:'success', icon:<IconCheck size={14}/> },
    'Rejected': { color:'error', icon:<IconBan size={14}/> },
    'Pending for Verify': { color:'warning', icon:null }
  };
  const cfg = map[status] || { color:'default', icon:null };
  return <Chip label={status} size="small" color={cfg.color} icon={cfg.icon} variant="outlined" />;
}

export default function CheckListVerify() {
  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [selectedRowId, setSelectedRowId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [openSections, setOpenSections] = useState({ status:true, category:true, department:false, searchBy:false });
  const toggleSection = (key) => setOpenSections((p) => ({ ...p, [key]:!p[key] }));

  const fetchChecklists = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        status: filters.status !== 'All' ? filters.status : undefined,
        category: filters.category !== 'All' ? filters.category : undefined,
        department: filters.departments.length > 0 ? filters.departments[0] : undefined,
        searchValue: filters.searchByValue || searchQuery || undefined,
        searchBy: filters.searchBy || (searchQuery ? 'checkingPoint' : undefined)
      };
      const response = await axios.get('/api/qms/checklist', { params });
      setRows(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch checklists for verification:', error);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters, searchQuery]);

  useEffect(() => {
    fetchChecklists();
  }, [fetchChecklists]);

  const setFilter = (key, val) => {
    setFilters((p) => ({ ...p, [key]:val }));
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

  const handleVerify = async (status) => {
    if (!selectedRowId) return;
    try {
      // In a real scenario, we might need a specific verification ID if it was an assignment,
      // but here we are verifying the master record's creation/amendment.
      // We'll use a generic verification endpoint or update the master.
      await axios.post('/api/qms/checklist/verify', {
        assignmentId: selectedRowId, // Assuming assignmentId for now
        status: status,
        verifiedBy: 'Current User',
        remarks: status === 'Rejected' ? 'Rejected by verifier' : 'Verified'
      });
      fetchChecklists();
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  const handleExport = () => {
    const exportData = rows.map((r, i) => ({
      '#': i + 1,
      'Seq No': r.seqNo,
      'Checking Point': r.checkingPoint,
      'Category': r.category,
      'Frequency': r.frequency,
      'Department': (r.departments || []).map(d => d.departmentName).join(', '),
      'Effective From': r.effectiveFrom,
      'Days': r.reminderDays,
      'Expire Date': r.expiryDate,
      'Stock Link': r.stockLink,
      'Created Date': r.createdDate,
      'Created By': r.createdBy,
      'Verify Status': r.status,
      'Verified By': r.verifiedBy,
      'Verified Date': r.verifiedDate
    }));
    exportToExcel(exportData, 'Checklist_Verify');
  };

  const activeCount = (filters.status !== 'All' ? 1 : 0) + (filters.category !== 'All' ? 1 : 0) + filters.departments.length + (filters.searchBy && filters.searchByValue ? 1 : 0);

  return (
    <MainCard
      title="Check List Verify - 5118"
      secondary={
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Button variant="outlined" color="primary" startIcon={<IconFileDownload size={18}/>} onClick={handleExport} sx={{ borderRadius: 1.5 }}>Export Excel</Button>
          <TextField size="small" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment:<InputAdornment position="start"><IconSearch size={18}/></InputAdornment>, endAdornment: searchQuery ? <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchQuery('')}><IconX size={16}/></IconButton></InputAdornment> : null }}
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
          {filters.category !== 'All' && <Chip label={`Category: ${filters.category}`} size="small" color="secondary" onDelete={() => setFilter('category','All')}/>}
          {filters.departments.map((d) => <Chip key={d} label={d} size="small" color="info" onDelete={() => toggleDept(d)}/>)}
          {filters.searchBy && filters.searchByValue && <Chip label={`${SEARCH_BY_OPTIONS.find((o) => o.key === filters.searchBy)?.label}: ${filters.searchByValue}`} size="small" color="warning" onDelete={() => { setFilter('searchBy',''); setFilter('searchByValue',''); }}/>}
          <Button size="small" color="error" onClick={resetFilters} sx={{ ml:1 }}>Clear All</Button>
        </Box>
      )}

      <TableContainer component={Paper} sx={{ maxHeight:'calc(100vh - 380px)', border:'1px solid', borderColor:'divider', '&::-webkit-scrollbar':{width:10,height:10}, '&::-webkit-scrollbar-track':{backgroundColor:'background.paper'}, '&::-webkit-scrollbar-thumb':{backgroundColor:'grey.400',borderRadius:2} }}>
        <Table stickyHeader sx={{ minWidth:1800 }} aria-label="checklist verify table">
          <TableHead><TableRow>{columns.map((col,i) => <TableCell key={i} sx={{ bgcolor:'primary.dark', color:'white', fontWeight:'bold', whiteSpace:'nowrap', borderRight:'1px solid rgba(255,255,255,0.2)' }}>{col}</TableCell>)}</TableRow></TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py:6 }}><Typography variant="body1" color="textSecondary">Loading...</Typography></TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py:6 }}><Typography variant="body1" color="textSecondary">{searchQuery || activeCount > 0 ? 'No matching records found' : 'No data available in table'}</Typography></TableCell></TableRow>
            ) : rows.map((row, idx) => (
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
                <TableCell>{row.stockLink}</TableCell>
                <TableCell>{row.createdDate ? new Date(row.createdDate).toLocaleDateString() : ''}</TableCell>
                <TableCell>{row.createdBy}</TableCell>
                <TableCell><StatusChip status={row.status}/></TableCell>
                <TableCell>{row.verifiedBy}</TableCell>
                <TableCell>{row.verifiedDate}</TableCell>
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

      <Box sx={{ display:'flex', justifyContent:'flex-end', mt:2, gap:1.5 }}>
        <Button variant="contained" color="error" startIcon={<IconBan size={18}/>} onClick={() => handleVerify('Rejected')} disabled={!selectedRowId}>Reject</Button>
        <Button variant="contained" color="primary" startIcon={<IconCheck size={18}/>} onClick={() => handleVerify('Verified')} disabled={!selectedRowId}>Verify</Button>
      </Box>

      {/* FILTER DRAWER */}
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
          <FilterSection title="Search By" open={openSections.searchBy} onToggle={() => toggleSection('searchBy')}>
            <FormControl fullWidth>
              <RadioGroup value={filters.searchBy} onChange={(e) => setFilter('searchBy', e.target.value)}>
                {SEARCH_BY_OPTIONS.map((opt) => <FormControlLabel key={opt.key} value={opt.key} control={<Radio size="small"/>} label={<Typography variant="body2">{opt.label}</Typography>}/>)}
              </RadioGroup>
            </FormControl>
            {filters.searchBy && (
              <TextField size="small" fullWidth placeholder={`Search by ${SEARCH_BY_OPTIONS.find((o) => o.key === filters.searchBy)?.label}...`} value={filters.searchByValue} onChange={(e) => setFilter('searchByValue', e.target.value)} sx={{ mt:1 }}/>
            )}
          </FilterSection>
        </Box>
        <Box sx={{ p:2, borderTop:'1px solid', borderColor:'divider', display:'flex', gap:1 }}>
          <Button fullWidth variant="outlined" color="error" onClick={() => { resetFilters(); setDrawerOpen(false); }}>Reset All</Button>
          <Button fullWidth variant="contained" onClick={() => setDrawerOpen(false)}>Apply</Button>
        </Box>
      </Drawer>
    </MainCard>
  );
}
