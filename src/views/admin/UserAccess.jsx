import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  MenuItem,
  Button,
  Checkbox,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Fade,
  InputAdornment,
  TextField,
  TablePagination,
  alpha
} from '@mui/material';
import {
  IconDeviceFloppy,
  IconUser,
  IconCheck,
  IconX,
  IconCopy,
  IconLayoutGrid
} from '@tabler/icons-react';
import { useSelector, useDispatch } from 'react-redux';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import axios from 'utils/axios';
import { openSnackbar } from 'store/slices/snackbar';
import { setFilterConfig, resetFilters } from 'store/slices/search';
import useKeyboardShortcuts from 'hooks/useKeyboardShortcuts';

import { getUserImageUrl } from 'utils/upload-helper';

const userAccessSearchConfig = [
  { id: 'module', label: 'Module', type: 'text', placeholder: 'Search Module...' },
  { id: 'subModule', label: 'Submodule', type: 'text', placeholder: 'Search Submodule...' },
  { id: 'pageName', label: 'Page Name', type: 'text', placeholder: 'Search Page Name...' },
  { id: 'pageCode', label: 'Page Code', type: 'text', placeholder: 'Search Page Code...' }
];

const UserAccess = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isDark = theme.palette.mode === 'dark';

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [sourceUser, setSourceUser] = useState('');
  const [authData, setAuthData] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchQuery = useSelector((state) => state.search.query);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  useEffect(() => {
    fetchUsers();
    dispatch(setFilterConfig(userAccessSearchConfig));
    dispatch(resetFilters());
    return () => {
      dispatch(setFilterConfig(null));
      dispatch(resetFilters());
    };
  }, [dispatch]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users/all');
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const fetchAuthData = async (userId) => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/user-page-auth/${userId}`);
      setAuthData(res.data);
    } catch (error) {
      console.error('Failed to fetch auth data', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to fetch authorization data', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    fetchAuthData(userId);
  };

  const handleCheckboxChange = (idx, field) => {
    const newData = [...authData];
    newData[idx][field] = newData[idx][field] === 1 ? 0 : 1;
    setAuthData(newData);
  };

  const handleSelectAll = (field, checked) => {
    const newData = authData.map(item => ({ ...item, [field]: checked ? 1 : 0 }));
    setAuthData(newData);
  };

  const isAllChecked = (field) => authData.length > 0 && authData.every(item => item[field] === 1);
  const isSomeChecked = (field) => authData.some(item => item[field] === 1) && !isAllChecked(field);

  const handleSaveAll = async () => {
    if (!selectedUser) return;
    try {
      await axios.post('/api/user-page-auth/save-all', authData);
      dispatch(openSnackbar({ open: true, message: 'Saved successfully', variant: 'alert', severity: 'success' }));
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  const handleSaveRow = async (row) => {
    try {
      await axios.post('/api/user-page-auth/save-all', [row]);
      dispatch(openSnackbar({ open: true, message: `Saved ${row.page?.pageName}`, variant: 'alert', severity: 'success' }));
    } catch (error) {
      console.error('Row save failed', error);
    }
  };

  useKeyboardShortcuts({
    'ctrl+s': (e) => {
      e.preventDefault();
      if (selectedUser) handleSaveAll();
    }
  });

  const filteredData = useMemo(() => {
    return authData.filter(item => {
      const query = (searchQuery || '').toLowerCase();
      return item.page?.pageName?.toLowerCase().includes(query) || item.page?.module?.modName?.toLowerCase().includes(query);
    });
  }, [authData, searchQuery]);

  const paginatedData = useMemo(() => filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filteredData, page, rowsPerPage]);

  const permissionHeaders = [
    { id: 'enable', label: 'ENABLE', color: '#2196f3' },
    { id: 'readAcs', label: 'READ', color: '#4caf50' },
    { id: 'write', label: 'WRITE', color: '#ffc107' },
    { id: 'deleteAcs', label: 'DELETE', color: '#f44336' },
    { id: 'export', label: 'EXPORT', color: '#673ab7' },
    { id: 'approval', label: 'APPROVAL', color: '#00bcd4' },
    { id: 'manager', label: 'MANAGER', color: '#78909c' },
    { id: 'additional1', label: 'ADD 1', color: '#b0bec5' },
    { id: 'additional2', label: 'ADD 2', color: '#b0bec5' }
  ];

  const PermissionHeaderCell = ({ header }) => (
    <TableCell align="center" sx={{
      p: 0,
      minWidth: 85,
      bgcolor: alpha(header.color, 0.02),
      borderTop: `3px solid ${header.color}`,
      borderBottom: `1px solid ${alpha(header.color, 0.2)}`,
      height: 60
    }}>
      <Stack direction="column" alignItems="center" sx={{ py: 1 }}>
        <Checkbox
          size="small"
          checked={isAllChecked(header.id)}
          indeterminate={isSomeChecked(header.id)}
          onChange={(e) => handleSelectAll(header.id, e.target.checked)}
          sx={{ color: header.color, '&.Mui-checked': { color: header.color }, '&.MuiCheckbox-indeterminate': { color: header.color }, p: 0.2 }}
        />
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#333', fontSize: '0.6rem', textTransform: 'uppercase' }}>{header.label}</Typography>
      </Stack>
    </TableCell>
  );

  const selectedUserInfo = useMemo(() => users.find(u => u.userId === selectedUser), [users, selectedUser]);
  const sourceUserInfo = useMemo(() => users.find(u => u.userId === sourceUser), [users, sourceUser]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 145px)', gap: 1, overflow: 'hidden' }}>
      {/* ── HEADER SECTION ── */}
      <Box sx={{
        bgcolor: 'white',
        p: '10px 20px',
        borderRadius: '12px',
        border: '1px solid #eef2f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={selectedUserInfo?.imgName ? getUserImageUrl(selectedUserInfo.imgName) : ''}
            sx={{ width: 50, height: 50, border: '1px solid #eee' }}
          >
            {!selectedUserInfo?.imgName && <IconUser size={26} color="#ccc" />}
          </Avatar>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#1a223f', lineHeight: 1.2 }}>User Access</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#9e9e9e', textTransform: 'uppercase', fontSize: '0.65rem' }}>GRANULAR CONTROL</Typography>
          </Box>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            select
            size="small"
            label="Target User"
            value={selectedUser}
            onChange={handleUserChange}
            sx={{
              width: 260,
              '& .MuiOutlinedInput-root': { borderRadius: '10px', '& fieldset': { borderColor: '#2196f3 !important' } },
              '& .MuiInputLabel-root': { color: '#2196f3', fontWeight: 800, fontSize: '0.75rem' }
            }}
            SelectProps={{
              renderValue: (selected) => {
                const u = users.find(u => u.userId === selected);
                return (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar src={u?.imgName ? getUserImageUrl(u.imgName) : ''} sx={{ width: 22, height: 22, fontSize: '0.7rem' }}>
                      {selected.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>{selected} ({u?.empId || 'N/A'})</Typography>
                  </Stack>
                );
              }
            }}
          >
            {users.map((u) => (
              <MenuItem key={u.userId} value={u.userId}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar src={u.imgName ? getUserImageUrl(u.imgName) : ''} sx={{ width: 24, height: 24 }} />
                  <Typography variant="body2">{u.userId}</Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Copy From User"
            value={sourceUser}
            onChange={(e) => setSourceUser(e.target.value)}
            sx={{
              width: 220,
              '& .MuiOutlinedInput-root': { borderRadius: '10px', '& fieldset': { borderColor: '#2196f3 !important' } },
              '& .MuiInputLabel-root': { color: '#2196f3', fontWeight: 800, fontSize: '0.75rem' }
            }}
            SelectProps={{
              renderValue: (selected) => {
                const u = users.find(u => u.userId === selected);
                return (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar src={u?.imgName ? getUserImageUrl(u.imgName) : ''} sx={{ width: 22, height: 22, fontSize: '0.7rem' }}>
                      {selected.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>{selected}</Typography>
                  </Stack>
                );
              }
            }}
          >
            {users.filter(u => u.userId !== selectedUser).map((u) => (
              <MenuItem key={u.userId} value={u.userId}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar src={u.imgName ? getUserImageUrl(u.imgName) : ''} sx={{ width: 24, height: 24 }} />
                  <Typography variant="body2">{u.userId}</Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="outlined"
            startIcon={<IconCopy size={18} />}
            sx={{ height: 40, borderRadius: '8px', color: '#2196f3', borderColor: '#2196f3', textTransform: 'none', fontWeight: 700 }}
          >
            Copy
          </Button>

          <Button
            variant="contained"
            startIcon={<IconDeviceFloppy size={20} />}
            onClick={handleSaveAll}
            sx={{ height: 40, borderRadius: '8px', bgcolor: '#673ab7', '&:hover': { bgcolor: '#5e35b1' }, px: 3, fontWeight: 700, boxShadow: 'none' }}
          >
            Save
          </Button>
        </Stack>
      </Box>

      {/* ── PERMISSION MATRIX LABEL ──
      <Fade in={Boolean(selectedUser)}>
        <Box sx={{ px: 1, py: 0.5, flexShrink: 0 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconLayoutGrid size={20} color="#673ab7" />
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a223f', display: 'flex', alignItems: 'center', gap: 1 }}>
              Permission Matrix - 
              <Stack direction="row" spacing={1} alignItems="center">
                <Avatar 
                  sx={{ width: 28, height: 28, bgcolor: alpha('#673ab7', 0.1), color: '#673ab7', border: '1px solid', borderColor: alpha('#673ab7', 0.2), fontSize: '0.85rem', fontWeight: 900 }}
                >
                  {selectedUser?.charAt(0).toUpperCase()}
                </Avatar>
                <Box component="span" sx={{ color: '#673ab7', textTransform: 'uppercase' }}>{selectedUser}</Box>
              </Stack>
            </Typography>
          </Stack>
        </Box>
      </Fade> */}

      {/* ── TABLE SECTION ── */}
      <Fade in={Boolean(selectedUser)}>
        <Box sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid #eef2f6',
          bgcolor: 'white',
          minHeight: 0
        }}>
          <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc', color: '#999', fontSize: '0.65rem', py: 2, width: 40 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc', color: '#1a223f', fontSize: '0.65rem', py: 2 }}>MODULE / SUBMODULE</TableCell>
                  <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc', color: '#1a223f', fontSize: '0.65rem', py: 2 }}>PAGE NAME</TableCell>
                  {permissionHeaders.map(h => <PermissionHeaderCell key={h.id} header={h} />)}
                  <TableCell align="center" sx={{ fontWeight: 800, bgcolor: '#f8fafc', color: '#1a223f', fontSize: '0.65rem', py: 2 }}>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((row, idx) => {
                  const globalIdx = authData.findIndex(item => item.pageId === row.pageId);
                  return (
                    <TableRow 
                      key={row.pageId} 
                      sx={{ 
                        '& td': { py: 1.2, borderBottom: '1px solid #f8fafc' }, 
                        '&:hover': { bgcolor: '#f1f5f9 !important' },
                        bgcolor: idx % 2 === 0 ? 'white' : '#f9fbff'
                      }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: '#d1d5db', fontSize: '0.7rem' }}>{page * rowsPerPage + idx + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#1a223f', fontSize: '0.75rem', lineHeight: 1.2 }}>{row.page?.module?.modName}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.6rem' }}>{row.page?.subModule?.subModName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#2196f3', textTransform: 'uppercase', fontSize: '0.75rem', lineHeight: 1.2 }}>{row.page?.pageName}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#d1d5db', fontSize: '0.6rem' }}>ID: {row.pageId} | {row.page?.pageCode}</Typography>
                      </TableCell>
                      {permissionHeaders.map(h => (
                        <TableCell key={h.id} align="center" sx={{ borderLeft: '1px solid #f1f5f9' }}>
                          <Checkbox
                            checked={row[h.id] === 1}
                            onChange={() => handleCheckboxChange(globalIdx, h.id)}
                            icon={<IconX size={16} color="#e5e7eb" />}
                            checkedIcon={<IconCheck size={16} color="#4caf50" stroke={3} />}
                            sx={{ p: 0.2 }}
                          />
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ borderLeft: '1px solid #f1f5f9' }}>
                        <Tooltip title="Save Permissions" arrow>
                          <IconButton onClick={() => handleSaveRow(row)} sx={{ bgcolor: alpha('#2196f3', 0.1), color: '#2196f3', borderRadius: '4px', p: 0.4, '&:hover': { bgcolor: '#2196f3', color: 'white' } }}>
                            <IconDeviceFloppy size={18} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[50, 100]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            sx={{
              borderTop: '1px solid #f1f5f9',
              bgcolor: '#fff',
              flexShrink: 0,
              '& .MuiTablePagination-toolbar': { p: 0, minHeight: '40px !important' },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { m: 0, fontSize: '0.75rem' }
            }}
          />
        </Box>
      </Fade>
    </Box>
  );
};

export default UserAccess;
