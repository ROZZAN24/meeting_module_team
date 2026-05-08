import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Stack,
  useTheme,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import { IconSearch, IconPlus, IconFileExport, IconFileTypePdf, IconPrinter, IconEdit, IconTrash } from '@tabler/icons-react';
import axios from 'utils/axios';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'empCode', label: 'Emp Code', minWidth: 100 },
  { id: 'employeeName', label: 'Employee Name', minWidth: 180 },
  { id: 'title', label: 'Title', minWidth: 80 },
  { id: 'departmentId', label: 'Dept', minWidth: 100 },
  { id: 'designationId', label: 'Designation', minWidth: 100 },
  { id: 'dateOfJoining', label: 'DOJ', minWidth: 120 },
  { id: 'status', label: 'Status', minWidth: 100 }
];

export default function EmployeeList() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/master/employee');
      setRows(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setSize(+event.target.value);
    setPage(0);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`/api/master/employee/${id}`);
        fetchEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  // Filter rows
  const filteredRows = rows.filter((row) =>
    Object.values(row).some((val) => String(val).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <MainCard
      title="Employee Overview"
      secondary={
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Common Buttons standard positioning */}
          <Button variant="outlined" color="success" startIcon={<IconFileExport size={16} />} size="small">
            Excel
          </Button>
          <Button variant="outlined" color="error" startIcon={<IconFileTypePdf size={16} />} size="small">
            PDF
          </Button>
          <Button variant="outlined" color="info" startIcon={<IconPrinter size={16} />} size="small">
            Print
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<IconPlus size={16} />}
            onClick={() => navigate('/master/hr/employee/create')}
            size="small"
          >
            New
          </Button>
        </Stack>
      }
    >
      <SubCard sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="flex-end">
          <TextField
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={16} />
                </InputAdornment>
              )
            }}
          />
        </Stack>
      </SubCard>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="employee table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id} style={{ minWidth: column.minWidth, backgroundColor: theme.palette.primary.light }}>
                    {column.label}
                  </TableCell>
                ))}
                <TableCell style={{ minWidth: 100, backgroundColor: theme.palette.primary.light }} align="center">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center">
                    No Data Found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.slice(page * size, page * size + size).map((row, index) => {
                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      tabIndex={-1}
                      key={row.id}
                      onDoubleClick={() => navigate(`/master/hr/employee/create?id=${row.id}`)}
                    >
                      <TableCell>{page * size + index + 1}</TableCell>
                      <TableCell>{row.empCode}</TableCell>
                      <TableCell>{row.employeeName}</TableCell>
                      <TableCell>{row.title}</TableCell>
                      <TableCell>{row.departmentId}</TableCell>
                      <TableCell>{row.designationId}</TableCell>
                      <TableCell>{row.dateOfJoining}</TableCell>
                      <TableCell>{row.status || 'Active'}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton color="primary" onClick={() => navigate(`/master/hr/employee/create?id=${row.id}`)} size="small">
                            <IconEdit size={16} />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(row.id)} size="small">
                            <IconTrash size={16} />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={filteredRows.length}
          rowsPerPage={size}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </MainCard>
  );
}
