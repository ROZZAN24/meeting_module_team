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
  TextField,
  TablePagination,
  alpha,
  CircularProgress
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

  // Row-wise Selection Helpers
  const isRowAllChecked = (row) => {
    return permissionHeaders.every(h => row[h.id] === 1);
  };

  const isRowSomeChecked = (row) => {
    return permissionHeaders.some(h => row[h.id] === 1) && !isRowAllChecked(row);
  };

  const handleRowSelectAll = (globalIdx, checked) => {
    const newData = [...authData];
    permissionHeaders.forEach(h => {
      newData[globalIdx][h.id] = checked ? 1 : 0;
    });
    setAuthData(newData);
  };

  const handleSaveAll = async () => {
    if (!selectedUser) return;
    try {
      await axios.post('/api/user-page-auth/save-all', authData);
      dispatch(openSnackbar({ open: true, message: 'All authorization matrix modifications saved successfully', variant: 'alert', severity: 'success' }));
    } catch (error) {
      console.error('Save failed', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to save authorization matrix', variant: 'alert', severity: 'error' }));
    }
  };

  const handleSaveRow = async (row) => {
    try {
      await axios.post('/api/user-page-auth/save-all', [row]);
      dispatch(openSnackbar({ open: true, message: `Successfully saved access for ${row.page?.pageName}`, variant: 'alert', severity: 'success' }));
    } catch (error) {
      console.error('Row save failed', error);
      dispatch(openSnackbar({ open: true, message: `Failed to save access for ${row.page?.pageName}`, variant: 'alert', severity: 'error' }));
    }
  };

  // Copy Permissions Logic
  const handleCopyPermissions = async () => {
    if (!selectedUser || !sourceUser) {
      dispatch(openSnackbar({ open: true, message: 'Please select both Target User and Source User first', variant: 'alert', severity: 'warning' }));
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`/api/user-page-auth/${sourceUser}`);
      const sourceData = res.data;

      if (!Array.isArray(sourceData) || sourceData.length === 0) {
        dispatch(openSnackbar({ open: true, message: 'Source user has no active permission records', variant: 'alert', severity: 'warning' }));
        return;
      }

      const updatedData = authData.map(targetItem => {
        const sourceItem = sourceData.find(s => s.pageId === targetItem.pageId);
        if (sourceItem) {
          return {
            ...targetItem,
            enable: sourceItem.enable,
            readAcs: sourceItem.readAcs,
            write: sourceItem.write,
            deleteAcs: sourceItem.deleteAcs,
            export: sourceItem.export,
            approval: sourceItem.approval,
            manager: sourceItem.manager,
            additional1: sourceItem.additional1,
            additional2: sourceItem.additional2
          };
        }
        return targetItem;
      });

      setAuthData(updatedData);
      dispatch(openSnackbar({ open: true, message: `Copied permissions from ${sourceUser}. Make sure to click Save!`, variant: 'alert', severity: 'success' }));
    } catch (error) {
      console.error('Failed to copy permissions', error);
      dispatch(openSnackbar({ open: true, message: 'Failed to copy authorization matrix from source user', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  useKeyboardShortcuts({
    'ctrl+s': (e) => {
      e.preventDefault();
      if (selectedUser) handleSaveAll();
    }
  });

  const filteredData = useMemo(() => {
    if (!Array.isArray(authData)) return [];

    return authData.filter(item => {
      const query = (searchQuery || '').toLowerCase();
      const pageNameMatch = item.page?.pageName?.toLowerCase()?.includes(query) || false;
      const moduleNameMatch = item.page?.module?.modName?.toLowerCase()?.includes(query) || false;
      const subModuleNameMatch = item.page?.subModule?.subModName?.toLowerCase()?.includes(query) || false;
      const pageCodeMatch = item.page?.pageCode?.toLowerCase()?.includes(query) || false;
      return pageNameMatch || moduleNameMatch || subModuleNameMatch || pageCodeMatch;
    });
  }, [authData, searchQuery]);

  const paginatedData = useMemo(() => filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filteredData, page, rowsPerPage]);

  const permissionHeaders = [
    { id: 'enable', label: 'Enable', color: '#2196f3' },
    { id: 'readAcs', label: 'Read', color: '#4caf50' },
    { id: 'write', label: 'Write', color: '#ffc107' },
    { id: 'deleteAcs', label: 'Delete', color: '#f44336' },
    { id: 'export', label: 'Export', color: '#673ab7' },
    { id: 'approval', label: 'Approval', color: '#00bcd4' },
    { id: 'manager', label: 'Manager', color: '#78909c' },
    { id: 'additional1', label: 'Add 1', color: '#b0bec5' },
    { id: 'additional2', label: 'Add 2', color: '#b0bec5' }
  ];

  const PermissionHeaderCell = ({ header }) => (
    <TableCell align="center" sx={{
      p: 0,
      minWidth: 85,
      bgcolor: isDark ? '#1e293b' : alpha(header.color, 0.02),
      borderTop: `3px solid ${header.color}`,
      borderBottom: `1px solid ${isDark ? theme.palette.divider : alpha(header.color, 0.2)}`,
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
        <Typography variant="caption" sx={{ fontWeight: 800, color: isDark ? theme.palette.text.secondary : '#333', fontSize: '0.6rem', textTransform: 'uppercase' }}>{header.label}</Typography>
      </Stack>
    </TableCell>
  );

  const selectedUserInfo = useMemo(() => users.find(u => u.userId === selectedUser), [users, selectedUser]);
  const sourceUserInfo = useMemo(() => users.find(u => u.userId === sourceUser), [users, sourceUser]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 145px)', gap: 1.5, overflow: 'hidden' }}>
      {/* ── HEADER SECTION ── */}
      <Box sx={{
        bgcolor: isDark ? theme.palette.background.paper : 'white',
        p: '12px 20px',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: theme.palette.divider,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={selectedUserInfo?.imgName ? getUserImageUrl(selectedUserInfo.imgName) : ''}
            sx={{ width: 50, height: 50, border: '1px solid', borderColor: theme.palette.divider }}
          >
            {!selectedUserInfo?.imgName && <IconUser size={26} color="#ccc" />}
          </Avatar>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: theme.palette.text.primary, lineHeight: 1.2 }}>User Access</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary, textTransform: 'uppercase', fontSize: '0.65rem' }}>GRANULAR CONTROL</Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            select
            size="small"
            label="Target User"
            value={selectedUser}
            onChange={handleUserChange}
            sx={{
              width: 200,
              '& .MuiOutlinedInput-root': { borderRadius: '8px', '& fieldset': { borderColor: '#2196f3 !important' } },
              '& .MuiInputLabel-root': { color: '#2196f3', fontWeight: 800, fontSize: '0.75rem' }
            }}
            SelectProps={{
              renderValue: (selected) => {
                const u = users.find(u => u.userId === selected);
                return (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar src={u?.imgName ? getUserImageUrl(u.imgName) : ''} sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>
                      {selected.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600} color={theme.palette.text.primary}>{selected}</Typography>
                  </Stack>
                );
              }
            }}
          >
            {users.map((u) => (
              <MenuItem key={u.userId} value={u.userId}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar src={u.imgName ? getUserImageUrl(u.imgName) : ''} sx={{ width: 24, height: 24 }} />
                  <Typography variant="body2">{u.userId} ({u.empId || 'N/A'})</Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Copy From"
            value={sourceUser}
            onChange={(e) => setSourceUser(e.target.value)}
            disabled={!selectedUser}
            sx={{
              width: 180,
              '& .MuiOutlinedInput-root': { borderRadius: '8px', '& fieldset': { borderColor: '#2196f3 !important' } },
              '& .MuiInputLabel-root': { color: '#2196f3', fontWeight: 800, fontSize: '0.75rem' }
            }}
            SelectProps={{
              renderValue: (selected) => {
                const u = users.find(u => u.userId === selected);
                return (
                  <Typography variant="body2" fontWeight={600} color={theme.palette.text.primary}>{selected}</Typography>
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
            onClick={handleCopyPermissions}
            disabled={!selectedUser || !sourceUser}
            sx={{ height: 38, borderRadius: '8px', color: '#2196f3', borderColor: '#2196f3', textTransform: 'none', fontWeight: 700 }}
          >
            Copy
          </Button>

          <Button
            variant="contained"
            startIcon={<IconDeviceFloppy size={20} />}
            onClick={handleSaveAll}
            disabled={!selectedUser}
            sx={{ height: 38, borderRadius: '8px', bgcolor: '#673ab7', '&:hover': { bgcolor: '#5e35b1' }, px: 3, fontWeight: 700, boxShadow: 'none' }}
          >
            Save All
          </Button>
        </Stack>
      </Box>

      {/* ── TABLE SECTION ── */}
      <Fade in={Boolean(selectedUser)}>
        <Box sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: theme.palette.divider,
          bgcolor: isDark ? theme.palette.background.paper : 'white',
          minHeight: 0
        }}>
          {/* Sub-toolbar inside Table Card for local search bar */}
          <Box sx={{
            p: '12px 16px',
            borderBottom: '1px solid',
            borderColor: theme.palette.divider,
            display: 'flex',
            alignItems: 'center',
            bgcolor: isDark ? '#1e293b' : '#f8fafc',
            flexShrink: 0
          }}>
            <Typography variant="subtitle1" fontWeight={700} color={theme.palette.text.primary}>
              Authorization Matrix ({filteredData.length} Rows)
            </Typography>
          </Box>

          <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, bgcolor: isDark ? '#1e293b' : '#f8fafc', color: theme.palette.text.secondary, fontSize: '0.65rem', py: 2, width: 40 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 800, bgcolor: isDark ? '#1e293b' : '#f8fafc', color: theme.palette.text.primary, fontSize: '0.65rem', py: 2 }}>Module / Submodule</TableCell>
                  <TableCell sx={{ fontWeight: 800, bgcolor: isDark ? '#1e293b' : '#f8fafc', color: theme.palette.text.primary, fontSize: '0.65rem', py: 2 }}>Page Name</TableCell>
                  {/* Select All (Row toggle) column header */}
                  <TableCell align="center" sx={{ fontWeight: 800, bgcolor: isDark ? '#1e293b' : '#f8fafc', color: theme.palette.text.primary, fontSize: '0.65rem', py: 2, width: 50 }}>All</TableCell>
                  {permissionHeaders.map(h => <PermissionHeaderCell key={h.id} header={h} />)}
                  <TableCell sx={{ fontWeight: 800, bgcolor: isDark ? '#1e293b' : '#f8fafc', color: theme.palette.text.primary, fontSize: '0.65rem', py: 2 }}>Updated By</TableCell>
                  <TableCell sx={{ fontWeight: 800, bgcolor: isDark ? '#1e293b' : '#f8fafc', color: theme.palette.text.primary, fontSize: '0.65rem', py: 2 }}>Updated Date</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, bgcolor: isDark ? '#1e293b' : '#f8fafc', color: theme.palette.text.primary, fontSize: '0.65rem', py: 2 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={14} align="center" sx={{ py: 10 }}>
                      <CircularProgress size={30} sx={{ color: '#2196f3' }} />
                      <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontWeight: 600 }}>Retrieving Authorization Matrix...</Typography>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} align="center" sx={{ py: 10 }}>
                      <Typography variant="h5" color="textSecondary">No access rules found matching search criteria</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row, idx) => {
                    const globalIdx = authData.findIndex(item => item.pageId === row.pageId);
                    return (
                      <TableRow
                        key={row.pageId}
                        sx={{
                          '& td': { py: 1.2, borderBottom: '1px solid', borderBottomColor: theme.palette.divider },
                          '&:hover': { bgcolor: isDark ? '#334155 !important' : '#f1f5f9 !important' },
                          bgcolor: idx % 2 === 0 ? (isDark ? '#0f172a' : 'white') : (isDark ? '#1e293b' : '#f9fbff')
                        }}
                      >
                        <TableCell sx={{ fontWeight: 700, color: isDark ? theme.palette.text.secondary : '#d1d5db', fontSize: '0.7rem' }}>{page * rowsPerPage + idx + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: theme.palette.text.primary, fontSize: '0.75rem', lineHeight: 1.2 }}>{row.page?.module?.modName}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.6rem' }}>{row.page?.subModule?.subModName}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#2196f3', textTransform: 'uppercase', fontSize: '0.75rem', lineHeight: 1.2 }}>{row.page?.pageName}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: isDark ? theme.palette.text.secondary : '#a6b0cf', fontSize: '0.6rem' }}>ID: {row.pageId} | {row.page?.pageCode}</Typography>
                        </TableCell>
                        
                        {/* Row-wise Select All Cell */}
                        <TableCell align="center" sx={{ borderLeft: '1px solid', borderLeftColor: theme.palette.divider }}>
                          <Checkbox
                            size="small"
                            checked={isRowAllChecked(row)}
                            indeterminate={isRowSomeChecked(row)}
                            onChange={(e) => handleRowSelectAll(globalIdx, e.target.checked)}
                            sx={{ color: '#78909c', '&.Mui-checked': { color: '#4caf50' } }}
                          />
                        </TableCell>

                        {permissionHeaders.map(h => (
                          <TableCell key={h.id} align="center" sx={{ borderLeft: '1px solid', borderLeftColor: theme.palette.divider }}>
                            <Checkbox
                              checked={row[h.id] === 1}
                              onChange={() => handleCheckboxChange(globalIdx, h.id)}
                              icon={<IconX size={16} color={isDark ? '#475569' : '#e5e7eb'} />}
                              checkedIcon={<IconCheck size={16} color="#4caf50" stroke={3} />}
                              sx={{ p: 0.2 }}
                            />
                          </TableCell>
                        ))}
                        <TableCell sx={{ borderLeft: '1px solid', borderLeftColor: theme.palette.divider, fontWeight: 700, color: theme.palette.text.secondary, fontSize: '0.7rem' }}>
                          {row.updatedBy || '-'}
                        </TableCell>
                        <TableCell sx={{ borderLeft: '1px solid', borderLeftColor: theme.palette.divider, color: theme.palette.text.secondary, fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                          {row.updatedDate ? new Date(row.updatedDate).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                        </TableCell>
                        <TableCell align="center" sx={{ borderLeft: '1px solid', borderLeftColor: theme.palette.divider }}>
                          <Tooltip title="Save Permissions" arrow>
                            <IconButton onClick={() => handleSaveRow(row)} sx={{ bgcolor: alpha('#2196f3', 0.1), color: '#2196f3', borderRadius: '4px', p: 0.4, '&:hover': { bgcolor: '#2196f3', color: 'white' } }}>
                              <IconDeviceFloppy size={18} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  }))}
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
              borderTop: '1px solid',
              borderTopColor: theme.palette.divider,
              bgcolor: isDark ? theme.palette.background.default : '#fff',
              flexShrink: 0,
              '& .MuiTablePagination-toolbar': { p: 0, minHeight: '40px !important' },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { m: 0, fontSize: '0.75rem', color: theme.palette.text.secondary }
            }}
          />
        </Box>
      </Fade>
    </Box>
  );
};

export default UserAccess;
