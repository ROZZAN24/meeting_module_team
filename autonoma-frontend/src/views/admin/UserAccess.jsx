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
  TablePagination
} from '@mui/material';
import {
  IconDeviceFloppy,
  IconShieldLock,
  IconUser,
  IconCheck,
  IconX,
  IconLayout2
} from '@tabler/icons-react';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import axios from 'utils/axios';
import { openSnackbar } from 'store/slices/snackbar';
import { useDispatch, useSelector } from 'react-redux';
import { setFilterConfig, setFilters, resetFilters } from 'store/slices/search';
import { BOSTextField } from 'ui-component/bos';

// Search Configuration for this page
const API_BASE = (import.meta.env.VITE_APP_API_URL || 'http://localhost:8081').replace(/\/+$/, '');

const userAccessSearchConfig = [
  { id: 'module', label: 'Module', type: 'text', placeholder: 'Search Module...' },
  { id: 'subModule', label: 'Submodule', type: 'text', placeholder: 'Search Submodule...' },
  { id: 'pageName', label: 'Page Name', type: 'text', placeholder: 'Search Page Name...' },
  { id: 'pageCode', label: 'Page Code', type: 'text', placeholder: 'Search Page Code...' }
];

const UserAccess = () => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [sourceUser, setSourceUser] = useState('');
  const [authData, setAuthData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get global search query and filters from Redux
  const searchQuery = useSelector((state) => state.search.query);
  const searchFilters = useSelector((state) => state.search.filters);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
    // Set page-specific search filters
    dispatch(setFilterConfig(userAccessSearchConfig));
    dispatch(resetFilters());

    return () => {
      // Clear filters on unmount
      dispatch(setFilterConfig(null));
      dispatch(resetFilters());
    };
  }, [dispatch]);

  // Reset page when search query or filters change
  useEffect(() => {
    setPage(0);
  }, [searchQuery, searchFilters]);

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
    setPage(0);
    try {
      const res = await axios.get(`/api/user-page-auth/${userId}`);
      setAuthData(res.data);
    } catch (error) {
      console.error('Failed to fetch auth data', error);
      dispatch(openSnackbar({
        open: true,
        message: 'Failed to fetch authorization data',
        variant: 'alert',
        severity: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleUserChange = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    fetchAuthData(userId);
  };

  const handleCopyPermissions = async () => {
    if (!sourceUser || !selectedUser) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/user-page-auth/${sourceUser}`);
      const sourceAuth = res.data;

      // Map source permissions to current authData by pageId
      const newData = authData.map(item => {
        const sourceItem = sourceAuth.find(s => s.pageId === item.pageId);
        if (sourceItem) {
          return {
            ...item,
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
        return item;
      });

      setAuthData(newData);
      dispatch(openSnackbar({
        open: true,
        message: `Permissions copied from ${sourceUser}. Review and save changes.`,
        variant: 'alert',
        severity: 'info'
      }));
    } catch (error) {
      console.error('Copy failed', error);
      dispatch(openSnackbar({
        open: true,
        message: 'Failed to copy permissions',
        variant: 'alert',
        severity: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (idx, field) => {
    const newData = [...authData];
    newData[idx][field] = newData[idx][field] === 1 ? 0 : 1;
    setAuthData(newData);
  };

  const handleSelectAll = (field, checked) => {
    const newData = authData.map(item => ({
      ...item,
      [field]: checked ? 1 : 0
    }));
    setAuthData(newData);
  };

  const isAllChecked = (field) => authData.length > 0 && authData.every(item => item[field] === 1);
  const isSomeChecked = (field) => authData.some(item => item[field] === 1) && !isAllChecked(field);

  const handleSaveAll = async () => {
    if (!selectedUser) return;
    try {
      await axios.post('/api/user-page-auth/save-all', authData);
      dispatch(openSnackbar({
        open: true,
        message: 'All authorizations saved successfully',
        variant: 'alert',
        severity: 'success'
      }));
    } catch (error) {
      console.error('Save failed', error);
      dispatch(openSnackbar({
        open: true,
        message: 'Failed to save authorizations',
        variant: 'alert',
        severity: 'error'
      }));
    }
  };

  const handleSaveRow = async (row) => {
    try {
      await axios.post('/api/user-page-auth/save-all', [row]);
      dispatch(openSnackbar({
        open: true,
        message: `Saved access for ${row.page?.pageName}`,
        variant: 'alert',
        severity: 'success'
      }));
    } catch (error) {
      console.error('Row save failed', error);
    }
  };

  const filteredData = useMemo(() => {
    return authData.filter(item => {
      const query = searchQuery.toLowerCase();

      // Global keyword search
      const matchesKeyword = (
        item.page?.pageName?.toLowerCase().includes(query) ||
        item.page?.module?.modName?.toLowerCase().includes(query) ||
        item.page?.subModule?.subModName?.toLowerCase().includes(query) ||
        item.page?.pageCode?.toLowerCase().includes(query) ||
        item.pageId?.toString().includes(query)
      );

      // Advanced field filters
      const moduleFilter = searchFilters.module?.toLowerCase() || '';
      const subModuleFilter = searchFilters.subModule?.toLowerCase() || '';
      const pageNameFilter = searchFilters.pageName?.toLowerCase() || '';
      const pageCodeFilter = searchFilters.pageCode?.toLowerCase() || '';

      const matchesModule = !moduleFilter || item.page?.module?.modName?.toLowerCase().includes(moduleFilter);
      const matchesSubModule = !subModuleFilter || item.page?.subModule?.subModName?.toLowerCase().includes(subModuleFilter);
      const matchesPageName = !pageNameFilter || item.page?.pageName?.toLowerCase().includes(pageNameFilter);
      const matchesPageCode = !pageCodeFilter || item.page?.pageCode?.toLowerCase().includes(pageCodeFilter);

      return matchesKeyword && matchesModule && matchesSubModule && matchesPageName && matchesPageCode;
    });
  }, [authData, searchQuery, searchFilters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedData = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const PermissionHeader = ({ label, field, color }) => (
    <TableCell align="center" sx={{
      fontWeight: 700,
      color: color || theme.palette.text.primary,
      bgcolor: color ? (color + '10') : 'inherit',
      borderBottom: '2px solid',
      borderColor: color || 'divider',
      minWidth: 100
    }}>
      <Stack direction="column" alignItems="center" spacing={0.5}>
        <Checkbox
          size="small"
          indeterminate={isSomeChecked(field)}
          checked={isAllChecked(field)}
          onChange={(e) => handleSelectAll(field, e.target.checked)}
          sx={{
            p: 0,
            color: color || 'inherit',
            '&.Mui-checked': { color: color || 'inherit' },
            '&.MuiCheckbox-indeterminate': { color: color || 'inherit' }
          }}
        />
        <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
          {label}
        </Typography>
      </Stack>
    </TableCell>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {/* Header Selection Card */}
      <MainCard sx={{
        backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.background.paper} 100%)`,
        border: 'none',
        boxShadow: theme.shadows[2]
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Tooltip
                title={
                  selectedUser && users.find(u => u.userId === selectedUser)?.imgName ? (
                    <Paper elevation={12} sx={{ p: 0.5, bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
                      <img 
                        src={`${API_BASE}/api/files/download/${users.find(u => u.userId === selectedUser).imgName}`} 
                        alt="Profile" 
                        style={{ maxWidth: 350, maxHeight: 350, borderRadius: 6, display: 'block' }} 
                      />
                    </Paper>
                  ) : null
                }
                placement="right"
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: 'transparent',
                      p: 0,
                      '& .MuiTooltip-arrow': { color: 'background.paper' }
                    }
                  }
                }}
              >
                <Avatar 
                  src={selectedUser && users.find(u => u.userId === selectedUser)?.imgName ? `${API_BASE}/api/files/download/${users.find(u => u.userId === selectedUser).imgName}` : ''}
                  sx={{ bgcolor: theme.palette.secondary.main, width: 48, height: 48, cursor: 'pointer', border: '2px solid white', boxShadow: theme.shadows[2] }}
                >
                  {!selectedUser || !users.find(u => u.userId === selectedUser)?.imgName ? <IconShieldLock size={28} color="white" /> : null}
                </Avatar>
              </Tooltip>
              <Box>
                <Typography variant="h4" fontWeight={700}>User Access</Typography>
                <Typography variant="caption" color="textSecondary">Granular Control</Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={9}>
            <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="flex-end">
              <BOSTextField
                select
                size="small"
                label="Target User"
                value={selectedUser}
                onChange={handleUserChange}
                sx={{ width: 220 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconUser size={18} color={theme.palette.primary.main} />
                    </InputAdornment>
                  )
                }}
              >
                <MenuItem value="">- Select User -</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.userId} value={u.userId}>
                    <Stack direction="row" spacing={1.2} alignItems="center">
                      <Avatar 
                        src={u.imgName ? `${API_BASE}/api/files/download/${u.imgName}` : ''} 
                        sx={{ width: 28, height: 28, fontSize: '0.85rem', bgcolor: theme.palette.primary.light }}
                      >
                        {u.userId.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="body2" fontWeight={500}>
                        {u.userId} {u.empId ? <Box component="span" sx={{ opacity: 0.6, ml: 0.5 }}>({u.empId})</Box> : ''}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </BOSTextField>

              <BOSTextField
                select
                size="small"
                label="Copy From User"
                value={sourceUser}
                onChange={(e) => setSourceUser(e.target.value)}
                disabled={!selectedUser}
                sx={{ width: 200 }}
              >
                <MenuItem value="">- Select Source -</MenuItem>
                {users.filter(u => u.userId !== selectedUser).map((u) => (
                  <MenuItem key={u.userId} value={u.userId}>
                    {u.userId}
                  </MenuItem>
                ))}
              </BOSTextField>

              <Button
                variant="outlined"
                color="primary"
                onClick={handleCopyPermissions}
                disabled={!sourceUser || !selectedUser || loading}
                sx={{ whiteSpace: 'nowrap', height: 40 }}
              >
                Copy
              </Button>

              <AnimateButton>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<IconDeviceFloppy size={20} />}
                  onClick={handleSaveAll}
                  disabled={!selectedUser || authData.length === 0 || loading}
                  sx={{ height: 40, borderRadius: '8px', fontWeight: 600, px: 3 }}
                >
                  Save
                </Button>
              </AnimateButton>
            </Stack>
          </Grid>
        </Grid>
      </MainCard>

      {/* Main Table Card */}
      <Fade in={Boolean(selectedUser)}>
        <MainCard
          content={false}
          sx={{ '& .MuiCardHeader-root': { p: '10px' } }}
          title={
            <Stack direction="row" spacing={2} alignItems="center">
              <IconLayout2 size={22} color={theme.palette.primary.main} />
              <Typography variant="h4">
                Permission Matrix - 
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip
                  title={
                    selectedUser && users.find(u => u.userId === selectedUser)?.imgName ? (
                      <Paper elevation={12} sx={{ p: 0.5, bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
                        <img 
                          src={`${API_BASE}/api/files/download/${users.find(u => u.userId === selectedUser).imgName}`} 
                          alt="Profile Preview" 
                          style={{ maxWidth: 250, maxHeight: 250, borderRadius: 6, display: 'block' }} 
                        />
                      </Paper>
                    ) : null
                  }
                  arrow
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'transparent',
                        p: 0,
                        '& .MuiTooltip-arrow': { color: 'background.paper' }
                      }
                    }
                  }}
                >
                  <Avatar 
                    src={selectedUser && users.find(u => u.userId === selectedUser)?.imgName ? `${API_BASE}/api/files/download/${users.find(u => u.userId === selectedUser).imgName}` : ''}
                    sx={{ width: 32, height: 32, bgcolor: 'secondary.light', cursor: 'pointer', border: '1px solid white' }}
                  >
                    {selectedUser?.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
                <Box component="span" sx={{ color: 'secondary.main', fontWeight: 800, textTransform: 'uppercase' }}>
                  {selectedUser}
                </Box>
              </Stack>
            </Stack>
          }
        >
          <TableContainer sx={{ maxHeight: 'calc(100vh - 310px)', borderRadius: '0 0 12px 12px' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', color: theme.palette.text.secondary, py: 1.5 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 1.5 }}>MODULE / SUBMODULE</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 1.5 }}>PAGE NAME</TableCell>
                  <PermissionHeader label="Enable" field="enable" color={theme.palette.info.main} />
                  <PermissionHeader label="Read" field="readAcs" color={theme.palette.success.main} />
                  <PermissionHeader label="Write" field="write" color={theme.palette.warning.main} />
                  <PermissionHeader label="Delete" field="deleteAcs" color={theme.palette.error.main} />
                  <PermissionHeader label="Export" field="export" color={theme.palette.secondary.main} />
                  <PermissionHeader label="Approval" field="approval" color={theme.palette.primary.main} />
                  <PermissionHeader label="Manager" field="manager" color={theme.palette.grey[700]} />
                  <PermissionHeader label="Add 1" field="additional1" color={theme.palette.grey[600]} />
                  <PermissionHeader label="Add 2" field="additional2" color={theme.palette.grey[600]} />
                  <TableCell align="center" sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 1.5 }}>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={13} align="center" sx={{ py: 5 }}><Typography variant="h4">Loading Permissions...</Typography></TableCell></TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow><TableCell colSpan={13} align="center" sx={{ py: 5 }}><Typography variant="h4">No Pages Found</Typography></TableCell></TableRow>
                ) : (
                  paginatedData.map((row, idx) => {
                    const globalIdx = authData.findIndex(item => item.pageId === row.pageId);
                    const displayIdx = page * rowsPerPage + idx + 1;
                    return (
                      <TableRow key={row.pageId} hover sx={{
                        bgcolor: idx % 2 === 0 ? 'inherit' : '#f9fbff',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        '&:hover': { bgcolor: '#f0f7ff !important' },
                        '& .MuiTableCell-root': { py: 1, borderBottom: 'none' }
                      }}>
                        <TableCell sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>{displayIdx}</TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'text.primary', lineHeight: 1.2 }}>
                            {row.page?.module?.modName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 500 }}>
                            {row.page?.subModule?.subModName || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#2196f3', textTransform: 'uppercase', lineHeight: 1.2 }}>
                            {row.page?.pageName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                            ID: {row.pageId} | {row.page?.pageCode || 'N/A'}
                          </Typography>
                        </TableCell>

                        {['enable', 'readAcs', 'write', 'deleteAcs', 'export', 'approval', 'manager', 'additional1', 'additional2'].map(field => (
                          <TableCell key={field} align="center">
                            <Checkbox
                              checked={row[field] === 1}
                              onChange={() => handleCheckboxChange(globalIdx, field)}
                              icon={<IconX size={20} stroke={1.5} color="#e2e8f0" />}
                              checkedIcon={<IconCheck size={20} stroke={3} color="#4caf50" />}
                              sx={{
                                p: 0.5,
                                '&:hover': { bgcolor: 'transparent', transform: 'scale(1.1)' },
                                transition: 'transform 0.2s'
                              }}
                            />
                          </TableCell>
                        ))}

                        <TableCell align="center">
                          <Tooltip title="Save Row">
                            <IconButton
                              onClick={() => handleSaveRow(row)}
                              sx={{
                                color: '#2196f3',
                                p: 0.5,
                                borderRadius: '4px',
                                '&:hover': { 
                                  bgcolor: 'rgba(33, 150, 243, 0.1)',
                                  color: '#1976d2'
                                }
                              }}
                            >
                              <IconDeviceFloppy size={20} stroke={1.5} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              '& .MuiTablePagination-toolbar': { p: 0, minHeight: 48 },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { m: 0 }
            }}
          />
        </MainCard>
      </Fade>
    </Box>
  );
};

// Helper for animations
const AnimateButton = ({ children }) => (
  <Box sx={{ transition: 'transform 0.1s', '&:hover': { transform: 'scale(1.02)' }, '&:active': { transform: 'scale(0.98)' } }}>
    {children}
  </Box>
);

export default UserAccess;
