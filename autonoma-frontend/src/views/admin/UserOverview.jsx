import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// material-ui
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputLabel,
  OutlinedInput,
  FormHelperText,
  Select,
  MenuItem,
  InputAdornment,
  TablePagination,
  Box,
  Avatar,
  Tooltip,
  Autocomplete,
  TextField,
  CircularProgress,
  Fade,
  alpha,
  Slider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';
import Cropper from 'react-easy-crop';

// project imports
import axios from 'utils/axios';
import { openSnackbar } from 'store/slices/snackbar';
import useAuth from 'hooks/useAuth';
import getCroppedImg from 'utils/cropImage';
import { getFaceDescriptor } from 'utils/faceApi';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  IconPhoto,
  IconShieldLock,
  IconTrash,
  IconPencil,
  IconX,
  IconUserPlus,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconCrop,
  IconCamera,
  IconCameraOff
} from '@tabler/icons-react';

const API_BASE = (import.meta.env.VITE_APP_API_URL || 'http://localhost:8081').replace(/\/+$/, '');

// ==============================|| ADMIN - USER CREDENTIALS ||============================== //

const UserOverview = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const { user: currentUser, updateProfile } = useAuth();
  const searchQuery = useSelector((state) => state.search.query);

  // Crop States
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Camera States
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 320 } });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera for registration:", err);
      dispatch(openSnackbar({ open: true, message: 'Could not access webcam for face registration', variant: 'alert', severity: 'error' }));
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureFace = async (setFieldValue) => {
    if (videoRef.current) {
      try {
        const descriptorArray = await getFaceDescriptor(videoRef.current);
        const faceDescriptor = descriptorArray ? JSON.stringify(descriptorArray) : null;
        
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, 160, 160);
        const dataUrl = canvas.toDataURL('image/jpeg');

        setFieldValue('faceImage', dataUrl);
        setFieldValue('faceDescriptor', faceDescriptor || '');

        stopCamera();
        if (faceDescriptor) {
          dispatch(openSnackbar({ open: true, message: 'Face snapshot & biometrics captured successfully', variant: 'alert', severity: 'success' }));
        } else {
          dispatch(openSnackbar({ open: true, message: 'Snapshot captured, but no face detected clearly.', variant: 'alert', severity: 'warning' }));
        }
      } catch (err) {
        console.error("Error capturing face descriptor:", err);
        dispatch(openSnackbar({ open: true, message: 'Failed to process face biometrics.', variant: 'alert', severity: 'error' }));
      }
    }
  };

  useEffect(() => {
    if (!open) {
      stopCamera();
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getErrorMessage = (err) => {
    if (typeof err === 'string') return err;
    return err?.message || err?.error || err?.detail || JSON.stringify(err) || 'An unexpected error occurred';
  };

  const [divisionMap, setDivisionMap] = useState({});
  const [userMappingsMap, setUserMappingsMap] = useState({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, divisionsRes] = await Promise.all([
        axios.get('/api/users/all'),
        axios.get('/api/admin/divisions')
      ]);
      const divMap = {};
      divisionsRes.data.forEach(d => { divMap[d.id] = d; });
      setDivisionMap(divMap);

      const usersData = usersRes.data;
      // Load mappings for all users in parallel
      const mappingsResults = await Promise.allSettled(
        usersData.map(u => axios.get(`/api/users/${u.userId}/mappings`))
      );
      const mappings = {};
      usersData.forEach((u, i) => {
        const result = mappingsResults[i];
        if (result.status === 'fulfilled') {
          mappings[u.userId] = result.value.data;
        } else {
          mappings[u.userId] = { mappedDivisionIds: [], isBosAdmin: 0 };
        }
      });
      setUserMappingsMap(mappings);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      dispatch(openSnackbar({ open: true, message: getErrorMessage(err) || 'Failed to fetch users', variant: 'alert', severity: 'error' }));
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

  const [divisions, setDivisions] = useState([]);
  const fetchDivisions = async () => {
    if (divisions.length > 0) return;
    try {
      const response = await axios.get('/api/admin/divisions');
      setDivisions(response.data);
    } catch (err) {
      console.error('Failed to fetch divisions:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleClickOpen = () => {
    setEditingUser(null);
    setOpen(true);
    fetchEmployees();
    fetchDivisions();
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setShowPassword(false);
    stopCamera();
  };

  const handleEdit = async (user) => {
    try {
      const res = await axios.get(`/api/users/${user.userId}/mappings`);
      setEditingUser({
        ...user,
        isBosAdmin: res.data.isBosAdmin || 0,
        mappedDivisionIds: res.data.mappedDivisionIds || []
      });
    } catch (err) {
      setEditingUser({ ...user, isBosAdmin: user.isBosAdmin || 0, mappedDivisionIds: [] });
    }
    setOpen(true);
    fetchEmployees();
    fetchDivisions();
  };

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/users/${id}`);
        dispatch(openSnackbar({ open: true, message: 'User deleted successfully', variant: 'alert', severity: 'success' }));
        fetchUsers();
      } catch (err) {
        console.error('Delete failed:', err);
        dispatch(openSnackbar({ open: true, message: getErrorMessage(err) || 'Delete failed', variant: 'alert', severity: 'error' }));
      }
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result);
        setIsCropOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = searchQuery?.toLowerCase() || '';
      return (
        user.userId?.toLowerCase().includes(query) ||
        user.empId?.toString().includes(query) ||
        employeeMap[user.empId]?.employeeName?.toLowerCase().includes(query)
      );
    });
  }, [users, searchQuery, employeeMap]);

  const paginatedUsers = useMemo(() => filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filteredUsers, page, rowsPerPage]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 145px)', gap: 1, overflow: 'hidden' }}>
      {/* ── HEADER SECTION ── */}
      <Box sx={{
        bgcolor: 'white',
        p: '10px 24px',
        borderRadius: '12px',
        border: '1px solid #eef2f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <Stack direction="row" spacing={2.5} alignItems="center">
          <Avatar
            sx={{
              width: 50,
              height: 50,
              bgcolor: '#f8fafc',
              color: '#673ab7',
              border: '1px solid #eee'
            }}
          >
            <IconShieldLock size={28} />
          </Avatar>
          <Box>
            <Typography variant="h3" sx={{ fontWeight: 800, color: '#1a223f', lineHeight: 1.2 }}>User Credentials</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#9e9e9e', textTransform: 'uppercase', fontSize: '0.65rem' }}>SYSTEM ACCESS MANAGEMENT</Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            startIcon={<IconUserPlus size={18} />}
            onClick={handleClickOpen}
            sx={{
              height: 40,
              borderRadius: '8px',
              bgcolor: '#673ab7',
              '&:hover': { bgcolor: '#5e35b1' },
              px: 3,
              fontWeight: 700,
              boxShadow: 'none'
            }}
          >
            New User
          </Button>
        </Stack>
      </Box>

      {/* ── TABLE SECTION ── */}
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
                <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc', color: '#ccc', fontSize: '0.7rem', py: 2.5, width: 50 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc', color: '#1a223f', fontSize: '0.7rem', py: 2.5 }}>User Identity</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc', color: '#1a223f', fontSize: '0.7rem', py: 2.5 }}>Linked Employee</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc', color: '#1a223f', fontSize: '0.7rem', py: 2.5 }}>Divisions</TableCell>
                <TableCell sx={{ fontWeight: 800, bgcolor: '#f8fafc', color: '#1a223f', fontSize: '0.7rem', py: 2.5 }}>Account Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 800, bgcolor: '#f8fafc', color: '#1a223f', fontSize: '0.7rem', py: 2.5, width: 120 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <CircularProgress size={32} thickness={5} />
                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontWeight: 600 }}>Synchronizing...</Typography>
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((row, idx) => (
                  <TableRow
                    key={row.userId}
                    onDoubleClick={() => handleEdit(row)}
                    sx={{
                      '& td': { py: 1.5, borderBottom: '1px solid #f8fafc' },
                      '&:hover': { bgcolor: '#f1f5f9 !important' },
                      bgcolor: idx % 2 === 0 ? 'white' : '#f9fbff',
                      cursor: 'pointer'
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: '#d1d5db', fontSize: '0.75rem' }}>{page * rowsPerPage + idx + 1}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Tooltip
                          title={row.imgName ? (
                            <Paper elevation={12} sx={{ p: 0.5, bgcolor: 'white', borderRadius: 2 }}>
                              <img src={`${API_BASE}/api/users/image/${row.imgName}`} alt="Profile" style={{ maxWidth: 200, maxHeight: 200, borderRadius: 4, display: 'block' }} />
                            </Paper>
                          ) : null}
                          arrow
                        >
                          <Avatar
                            src={row.imgName ? `${API_BASE}/api/users/image/${row.imgName}` : ''}
                            sx={{ width: 42, height: 42, border: '1px solid #eee', bgcolor: 'primary.light', color: 'primary.dark', cursor: row.imgName ? 'pointer' : 'default' }}
                          >
                            {row.userId.charAt(0).toUpperCase()}
                          </Avatar>
                        </Tooltip>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#2196f3', textTransform: 'uppercase', fontSize: '0.75rem', lineHeight: 1.2 }}>{row.userId}</Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#d1d5db', fontSize: '0.6rem' }}>LOGIN ENABLED</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#1a223f', fontSize: '0.75rem', lineHeight: 1.2 }}>
                          {employeeMap[row.empId]?.employeeName || `Employee: ${row.empId}`}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.6rem' }}>
                          CODE: {employeeMap[row.empId]?.empCode || 'N/A'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      {(() => {
                        const mapping = userMappingsMap[row.userId];
                        if (!mapping) return <Typography variant="caption" color="text.disabled">—</Typography>;
                        if (mapping.isBosAdmin === 1) return (
                          <Chip label="BOS Admin" size="small" sx={{ bgcolor: '#ede7f6', color: '#673ab7', fontWeight: 800, fontSize: '0.65rem', borderRadius: '6px' }} />
                        );
                        const divIds = mapping.mappedDivisionIds || [];
                        if (divIds.length === 0) return <Typography variant="caption" color="text.disabled">No divisions</Typography>;
                        return (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            {divIds.slice(0, 3).map(id => (
                              <Chip
                                key={id}
                                label={divisionMap[id]?.divisionName || `Div ${id}`}
                                size="small"
                                sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 700, fontSize: '0.62rem', borderRadius: '6px', mb: 0.5 }}
                              />
                            ))}
                            {divIds.length > 3 && (
                              <Tooltip title={divIds.slice(3).map(id => divisionMap[id]?.divisionName || `Div ${id}`).join(', ')} arrow>
                                <Chip label={`+${divIds.length - 3}`} size="small" sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 700, fontSize: '0.62rem', borderRadius: '6px', mb: 0.5 }} />
                              </Tooltip>
                            )}
                          </Stack>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {row.status === 1 ? (
                          <IconCircleCheckFilled size={18} color="#4caf50" />
                        ) : (
                          <IconCircleXFilled size={18} color="#f44336" />
                        )}
                        <Typography variant="caption" sx={{ fontWeight: 800, color: row.status === 1 ? '#4caf50' : '#f44336', fontSize: '0.7rem' }}>
                          {row.status === 1 ? 'ACTIVE' : 'SUSPENDED'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Modify Account" arrow>
                          <IconButton
                            onClick={() => handleEdit(row)}
                            sx={{
                              bgcolor: alpha('#2196f3', 0.1),
                              color: '#2196f3',
                              borderRadius: '6px',
                              p: 0.5,
                              '&:hover': { bgcolor: '#2196f3', color: 'white' }
                            }}
                          >
                            <IconPencil size={18} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Revoke Access" arrow>
                          <IconButton
                            onClick={() => handleDelete(row.userId)}
                            sx={{
                              bgcolor: alpha('#f44336', 0.1),
                              color: '#f44336',
                              borderRadius: '6px',
                              p: 0.5,
                              '&:hover': { bgcolor: '#f44336', color: 'white' }
                            }}
                          >
                            <IconTrash size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                    <Typography variant="h5" color="textSecondary">No credentials found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[50, 100]}
          component="div"
          count={filteredUsers.length}
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

      {/* ── MODAL DIALOG ── */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper" PaperProps={{ sx: { borderRadius: '24px', overflow: 'hidden' } }}>
        <Formik
          enableReinitialize={true}
          initialValues={{
            userId: editingUser?.userId || '',
            empId: editingUser?.empId || '',
            password: '', // Leave blank to avoid showing hash
            status: editingUser?.status ?? 1,
            imgName: editingUser?.imgName || '',
            isBosAdmin: editingUser?.isBosAdmin ?? 0,
            mappedDivisionIds: editingUser?.mappedDivisionIds || [],
            faceImage: editingUser?.faceImage || '',
            faceDescriptor: editingUser?.faceDescriptor || '',
            authMethod: editingUser?.authMethod || 'PASSWORD',
            autoLogoutOnFaceAbsence: editingUser?.autoLogoutOnFaceAbsence ?? 0,
            submit: null
          }}
          validationSchema={Yup.object().shape({
            userId: Yup.string().max(50).required('User ID is required'),
            empId: Yup.number().typeError('Employee ID must be a number').required('Employee ID is required'),
            password: editingUser ? Yup.string().max(255) : Yup.string().max(255).required('Password is required'),
            status: Yup.number().required('Status is required')
          })}
          onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
            try {
              let savedUserId = values.userId;
              if (editingUser) {
                await axios.put(`/api/users/update/${editingUser.userId}`, {
                  empId: Number(values.empId),
                  password: values.password,
                  status: Number(values.status),
                  imgName: values.imgName,
                  faceImage: values.faceImage,
                  faceDescriptor: values.faceDescriptor,
                  authMethod: values.authMethod,
                  autoLogoutOnFaceAbsence: Number(values.autoLogoutOnFaceAbsence)
                });
              } else {
                await axios.post('/api/users/create', {
                  userId: values.userId,
                  empId: Number(values.empId),
                  password: values.password,
                  status: Number(values.status),
                  imgName: values.imgName,
                  faceImage: values.faceImage,
                  faceDescriptor: values.faceDescriptor,
                  authMethod: values.authMethod,
                  autoLogoutOnFaceAbsence: Number(values.autoLogoutOnFaceAbsence)
                });
              }

              await axios.post(`/api/users/${savedUserId}/mappings`, {
                mappedDivisionIds: values.mappedDivisionIds,
                isBosAdmin: values.isBosAdmin
              });

              if (editingUser?.userId === currentUser?.id || values.userId === currentUser?.id) updateProfile({ imgName: values.imgName });
              dispatch(openSnackbar({ open: true, message: `User ${editingUser ? 'updated' : 'created'} successfully`, variant: 'alert', severity: 'success' }));
              setOpen(false);
              await fetchUsers();
            } catch (err) {
              console.error('Save failed:', err);
              setErrors({ submit: getErrorMessage(err) });
              setSubmitting(false);
            }
          }}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => (
            <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              <DialogTitle sx={{ p: 0, background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)` }}>
                <Box sx={{ p: 2, pb: 3, color: 'white', position: 'relative' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h3" fontWeight={800} color="inherit" sx={{ mb: 0.5, textTransform: 'uppercase' }}>
                        {editingUser ? 'Edit User Credential' : 'New User Account'}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.8 }}>
                        <IconShieldLock size={16} />
                        <Typography variant="body2" fontWeight={500}>{editingUser ? `Updating access for ${editingUser.userId}` : 'Configure credentials for a new system user'}</Typography>
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{
                          bgcolor: 'white',
                          color: 'secondary.main',
                          fontWeight: 800,
                          px: 3,
                          borderRadius: '8px',
                          '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.9)',
                          }
                        }}
                      >
                        {isSubmitting ? 'Saving...' : editingUser ? 'Save' : 'Create'}
                      </Button>
                      <IconButton onClick={handleClose} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }}>
                        <IconX size={20} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ p: 0, bgcolor: '#f8fafc', position: 'relative' }}>
                <Box sx={{ bgcolor: 'background.paper', mt: -2.5, borderTopLeftRadius: '32px', borderTopRightRadius: '32px', position: 'relative', zIndex: 2, overflowY: 'auto', overflowX: 'hidden', maxHeight: 'calc(100vh - 200px)' }}>
                <Grid container>
                  <Grid item xs={12} md={4} sx={{ p: 4, borderRight: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ p: 4, height: '100%', borderRadius: 6, bgcolor: 'white', border: '2px dashed', borderColor: 'secondary.light', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="secondary.main" sx={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>PROFILE IDENTITY</Typography>
                      <Box sx={{ position: 'relative' }}>
                        <Tooltip
                          title={values.imgName ? (
                            <Paper elevation={12} sx={{ p: 0.5, bgcolor: 'white', borderRadius: 2 }}>
                              <img src={`${API_BASE}/api/users/image/${values.imgName}`} alt="Preview" style={{ maxWidth: 300, maxHeight: 300, borderRadius: 4, display: 'block' }} />
                            </Paper>
                          ) : null}
                          arrow
                          placement="right"
                        >
                          <Avatar
                            src={values.imgName ? `${API_BASE}/api/users/image/${values.imgName}` : ''}
                            sx={{ width: 130, height: 130, border: '4px solid white', bgcolor: 'secondary.light', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', cursor: values.imgName ? 'pointer' : 'default' }}
                          >
                            <IconPhoto size={50} />
                          </Avatar>
                        </Tooltip>
                        <IconButton component="label" sx={{ position: 'absolute', bottom: 5, right: 5, bgcolor: 'secondary.main', color: 'white', '&:hover': { bgcolor: 'secondary.dark' }, width: 36, height: 36, border: '3px solid white' }}>
                          <IconPencil size={16} />
                          <input type="file" hidden accept="image/*" onChange={(e) => { handleFileSelect(e); e.target.value = ''; }} />
                        </IconButton>
                      </Box>
                      <Typography variant="h3" fontWeight={800} color="secondary.main">{values.userId || 'User Name'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={8} sx={{ p: 4 }}>
                    <Stack spacing={4}>
                      <Box>
                        <Typography variant="h4" fontWeight={900} sx={{ mb: 1 }}>Account Credentials</Typography>
                        <Typography variant="body2" color="textSecondary">Provide details to manage user access</Typography>
                      </Box>
                      <Stack spacing={3}>
                        <Autocomplete
                          options={employees}
                          getOptionLabel={(option) => `${option.employeeName} (${option.empCode})`}
                          value={employees.find((e) => e.id === values.empId) || null}
                          onChange={(e, v) => {
                            setFieldValue('empId', v ? v.id : '');
                            if (v && v.profileUpload) {
                              setFieldValue('imgName', v.profileUpload);
                            }
                          }}
                          renderInput={(params) => <TextField {...params} label="Employee Selection" error={Boolean(touched.empId && errors.empId)} helperText={touched.empId && errors.empId} />}
                        />
                        <TextField fullWidth label="User ID" name="userId" value={values.userId} onChange={handleChange} onBlur={handleBlur} disabled={Boolean(editingUser)} error={Boolean(touched.userId && errors.userId)} helperText={touched.userId && errors.userId} />
                        <TextField fullWidth label={editingUser ? 'Update Password' : 'Password'} name="password" placeholder={editingUser ? 'Leave blank to keep current password' : ''} type={showPassword ? 'text' : 'password'} value={values.password} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.password && errors.password)} helperText={(touched.password && errors.password) || (editingUser ? 'Leave blank to keep existing credentials' : '')} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={handleClickShowPassword}>{showPassword ? <Visibility /> : <VisibilityOff />}</IconButton></InputAdornment> }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <TextField select fullWidth label="Account Status" name="status" value={values.status} onChange={handleChange} onBlur={handleBlur}>
                              <MenuItem value={1}>Active</MenuItem>
                              <MenuItem value={0}>Suspended</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField select fullWidth label="BOS Admin Privilege" name="isBosAdmin" value={values.isBosAdmin} onChange={handleChange} onBlur={handleBlur}>
                              <MenuItem value={1}>YES</MenuItem>
                              <MenuItem value={0}>NO</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField select fullWidth label="Preferred Login Method" name="authMethod" value={values.authMethod || 'PASSWORD'} onChange={handleChange} onBlur={handleBlur}>
                              <MenuItem value="PASSWORD">Password Only</MenuItem>
                              <MenuItem value="FACE">Face ID Only</MenuItem>
                              <MenuItem value="BOTH">Password or Face ID</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField select fullWidth label="Auto-Logout on Face Absence" name="autoLogoutOnFaceAbsence" value={values.autoLogoutOnFaceAbsence ?? 0} onChange={handleChange} onBlur={handleBlur}>
                              <MenuItem value={1}>ENABLED</MenuItem>
                              <MenuItem value={0}>DISABLED</MenuItem>
                            </TextField>
                          </Grid>
                        </Grid>

                        <Box sx={{ pt: 2, borderTop: '1px solid #eef2f6' }}>
                          <Typography variant="subtitle1" fontWeight={800} color="secondary.main" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                            Face ID Biometric Registration
                          </Typography>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3} display="flex" justifyContent="center">
                              {cameraActive ? (
                                <Box sx={{ position: 'relative', width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', border: '3px solid', borderColor: 'secondary.main' }}>
                                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>
                              ) : (
                                <Avatar 
                                  src={values.faceImage || null} 
                                  sx={{ width: 100, height: 100, border: '3px solid', borderColor: values.faceImage ? 'success.main' : 'grey.300', bgcolor: 'grey.100' }}
                                >
                                  <IconPhoto size={36} />
                                </Avatar>
                              )}
                            </Grid>
                            <Grid item xs={12} sm={9}>
                              <Stack spacing={1.5}>
                                <Typography variant="body2" color="textSecondary">
                                  {values.faceImage 
                                    ? 'Face biometric registered. You can use Face ID to sign in.' 
                                    : 'No face registered yet. Turn on the camera to scan and register.'}
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                  {cameraActive ? (
                                    <>
                                      <Button size="small" variant="contained" color="success" type="button" onClick={() => captureFace(setFieldValue)}>
                                        Capture Face
                                      </Button>
                                      <Button size="small" variant="outlined" color="error" type="button" onClick={stopCamera}>
                                        Cancel
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      <Button size="small" variant="contained" color="primary" type="button" onClick={startCamera}>
                                        {values.faceImage ? 'Re-Register Face' : 'Register Face'}
                                      </Button>
                                      {values.faceImage && (
                                        <Button size="small" variant="text" color="error" type="button" onClick={() => setFieldValue('faceImage', '')}>
                                          Clear
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </Stack>
                              </Stack>
                            </Grid>
                          </Grid>
                        </Box>

                        <Box sx={{ pt: 2, borderTop: '1px solid #eef2f6' }}>
                          <Typography variant="subtitle1" fontWeight={800} color="secondary.main" sx={{ mb: 2, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                            Organization & Division Authorization
                          </Typography>
                          <Stack spacing={3}>
                            <Autocomplete
                              multiple
                              options={divisions}
                              getOptionLabel={(option) => `${option.divisionName} (ID: ${option.id})`}
                              value={divisions.filter(d => values.mappedDivisionIds.includes(d.id))}
                              onChange={(e, newValue) => {
                                setFieldValue('mappedDivisionIds', newValue.map(item => item.id));
                              }}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Authorized Divisions"
                                  placeholder="Select divisions"
                                  helperText="User will automatically be granted access to the parent companies of the selected divisions."
                                />
                              )}
                              renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                  <Chip
                                    variant="outlined"
                                    label={`${option.divisionName}`}
                                    {...getTagProps({ index })}
                                    color="secondary"
                                    sx={{ borderRadius: '8px', fontWeight: 700 }}
                                  />
                                ))
                              }
                            />
                          </Stack>
                        </Box>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
                </Box>

                {/* ── CROP DIALOG (Nested inside Content but managed via separate Dialog is better) ── */}
                <Dialog
                  open={isCropOpen}
                  onClose={() => setIsCropOpen(false)}
                  maxWidth="sm"
                  fullWidth
                  PaperProps={{ sx: { borderRadius: '20px', p: 0, overflow: 'hidden' } }}
                >
                  <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderBottom: '1px solid #eee' }}>
                    <Typography variant="h4" fontWeight={800}>Crop Profile Picture</Typography>
                    <IconButton onClick={() => setIsCropOpen(false)}><IconX size={20} /></IconButton>
                  </DialogTitle>
                  <DialogContent sx={{ p: 0, height: 400, position: 'relative', bgcolor: '#000' }}>
                    {imageToCrop && (
                      <Cropper
                        image={imageToCrop}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                      />
                    )}
                  </DialogContent>
                  <DialogActions sx={{ p: 3, flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ width: '100%', px: 2 }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="caption" fontWeight={700}>ZOOM</Typography>
                        <Slider
                          value={zoom}
                          min={1}
                          max={3}
                          step={0.1}
                          onChange={(e, v) => setZoom(v)}
                          sx={{ color: 'secondary.main' }}
                        />
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                      <Button fullWidth variant="outlined" color="inherit" onClick={() => setIsCropOpen(false)} sx={{ borderRadius: '10px', fontWeight: 700 }}>Cancel</Button>
                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        disabled={isUploading}
                        startIcon={isUploading ? <CircularProgress size={18} color="inherit" /> : <IconCrop size={18} />}
                        sx={{ borderRadius: '10px', fontWeight: 700 }}
                        onClick={async () => {
                          setIsUploading(true);
                          try {
                            const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
                            const formData = new FormData();
                            formData.append('file', croppedBlob, 'profile.jpg');
                            if (values.imgName) {
                              formData.append('previousFile', values.imgName);
                            }
                            const res = await axios.post('/api/users/upload-profile-pic', formData);
                            setFieldValue('imgName', res.data.fileName);
                            setIsCropOpen(false);
                            dispatch(openSnackbar({ open: true, message: 'Image cropped & uploaded', variant: 'alert', severity: 'success' }));
                          } catch (err) {
                            console.error('Crop failed', err);
                            dispatch(openSnackbar({ open: true, message: 'Crop failed', variant: 'alert', severity: 'error' }));
                          } finally {
                            setIsUploading(false);
                          }
                        }}
                      >
                        {isUploading ? 'Uploading...' : 'Apply Crop'}
                      </Button>
                    </Stack>
                  </DialogActions>
                </Dialog>
                          </DialogContent>
            </form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};

export default UserOverview;
