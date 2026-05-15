import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// material-ui
import { Typography, Stack, Avatar, Chip, Button, Tooltip, IconButton, Box } from '@mui/material';
import { 
  IconShieldLock, 
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconPlus,
  IconRefresh
} from '@tabler/icons-react';
import defaultLogo from 'assets/images/logo.png';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { BOSDataTable, BOSExportButton } from 'ui-component/bos';
import axios from 'utils/axios';
import { openSnackbar } from 'store/slices/snackbar';
import { setFilterConfig, resetFilters } from 'store/slices/search';
import useKeyboardShortcuts from 'hooks/useKeyboardShortcuts';
import ConfirmDeleteDialog from 'ui-component/ConfirmDeleteDialog';
import { API_BASE } from 'utils/api-base';
import { getUserImageUrl } from 'utils/upload-helper';

import AddUserDialog from './AddUserDialog';

const searchConfig = [
  { id: 'userId', label: 'User ID', type: 'text', placeholder: 'Search by User ID...' },
  { id: 'employeeName', label: 'Employee Name', type: 'text', placeholder: 'Search by Employee Name...' }
];

export default function UserOverview() {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Delete States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const searchQuery = useSelector((state) => state.search.query);

  useEffect(() => {
    console.log('[UserOverview] Mounting. Resetting filters.');
    dispatch(setFilterConfig(searchConfig));
    dispatch(resetFilters());
    fetchUsers();
    fetchEmployees();
    return () => {
      dispatch(setFilterConfig(null));
      dispatch(resetFilters());
    };
  }, [dispatch]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, empsRes] = await Promise.all([
        axios.get('/api/users/all'),
        axios.get('/api/master/employee')
      ]);
      
      console.log('[UserOverview] Data Fetched:', { users: usersRes.data.length, employees: empsRes.data.length });
      setUsers(usersRes.data);
      setEmployees(empsRes.data);
      
      const map = {};
      empsRes.data.forEach(emp => { map[emp.id] = emp; });
      setEmployeeMap(map);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      dispatch(openSnackbar({ open: true, message: 'Failed to fetch users', variant: 'alert', severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    if (employees.length > 0) return;
    try {
      const response = await axios.get('/api/master/employee');
      const data = response.data;
      setEmployees(data);
      const map = {};
      data.forEach(emp => { map[emp.id] = emp; });
      setEmployeeMap(map);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenDialog = () => {
    setEditingUser(null);
    setDialogOpen(true);
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleDeleteClick = (user) => {
    setDeleteTargetId(user.userId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    try {
      await axios.delete(`/api/users/${deleteTargetId}`);
      dispatch(openSnackbar({ open: true, message: 'User deleted successfully', variant: 'alert', severity: 'success' }));
      fetchUsers();
    } catch (err) {
      console.error('Delete failed:', err);
      dispatch(openSnackbar({ open: true, message: 'Delete failed', variant: 'alert', severity: 'error' }));
    }
  };

  // Keyboard shortcut: Ctrl+N
  useKeyboardShortcuts({
    'ctrl+n': (e) => {
      e.preventDefault();
      handleOpenDialog();
    }
  });

  const filteredUsers = useMemo(() => {
    console.log('[UserOverview] Filtering Users. Total:', users.length, 'Query:', searchQuery);
    return users.filter((user) => {
      const query = searchQuery?.toLowerCase() || '';
      if (!query) return true;
      
      const userIdMatch = user.userId?.toLowerCase().includes(query);
      const employeeNameMatch = employeeMap[user.empId]?.employeeName?.toLowerCase().includes(query);
      
      return userIdMatch || employeeNameMatch;
    });
  }, [users, searchQuery, employeeMap]);

  const columns = [
    {
      id: 'userId',
      label: 'User Identity',
      bold: true,
      render: (row) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar 
            src={row.imgName ? getUserImageUrl(row.imgName) : defaultLogo}
            sx={{ width: 42, height: 42, border: '1px solid #eee', bgcolor: 'primary.light', color: 'primary.dark' }}
          >
            {row.userId?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>{row.userId}</Typography>
            <Typography variant="caption" color="textSecondary">System ID: {row.userId}</Typography>
          </Box>
        </Stack>
      )
    },
    {
      id: 'empId',
      label: 'Linked Employee',
      render: (row) => {
        const emp = employeeMap[row.empId];
        if (!emp) return (
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'grey.500' }}>
            ID: {row.empId} (Not Found)
          </Typography>
        );
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{emp.employeeName}</Typography>
            <Typography variant="caption" color="textSecondary">{emp.empCode}</Typography>
          </Box>
        );
      }
    },
    {
      id: 'accountStatus',
      label: 'Account Status',
      render: (row) => {
        const isActive = row.status === 1 || row.status === 'Active';
        return (
          <Chip
            label={isActive ? 'Active' : 'Suspended'}
            size="small"
            icon={isActive ? <IconCircleCheckFilled size={14} /> : <IconCircleXFilled size={14} />}
            sx={{
              bgcolor: isActive ? 'success.lighter' : 'error.lighter',
              color: isActive ? 'success.dark' : 'error.dark',
              fontWeight: 700,
              px: 1
            }}
          />
        );
      }
    },
    { id: 'createdBy', label: 'Created By' },
    { id: 'createdDate', label: 'Created Date', type: 'datetime' },
    { id: 'updatedBy', label: 'Updated By' },
    { id: 'updatedDate', label: 'Updated Date', type: 'datetime' }
  ];

  return (
    <>
      <MainCard 
        title="User Credentials" 
        icon={<IconShieldLock size={24} />}
        secondary={
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} size="small" color="primary">
                <IconRefresh size={20} />
              </IconButton>
            </Tooltip>
            <Button 
              variant="contained" 
              color="primary" 
              size="small" 
              startIcon={<IconPlus size={18} />}
              onClick={handleOpenDialog}
              sx={{ borderRadius: '10px', fontWeight: 700 }}
            >
              Add User
            </Button>
            <BOSExportButton
              data={filteredUsers}
              filename="User_Credentials"
              columns={[
                { header: 'User ID', key: 'userId' },
                { header: 'Status', key: 'status' }
              ]}
            />
          </Stack>
        }
      >
        <BOSDataTable
          columns={columns}
          data={filteredUsers}
          loading={loading}
          onEditRow={handleEdit}
          onDeleteRow={handleDeleteClick}
          onDoubleClickRow={handleEdit}
        />
      </MainCard>

      <AddUserDialog 
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editingUser={editingUser}
        employees={employees}
        fetchUsers={fetchUsers}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        itemName={deleteTargetId}
      />
    </>
  );
}
