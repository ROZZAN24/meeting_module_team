import PropTypes from 'prop-types';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Tooltip, TablePagination, Stack,
  Chip, Typography, useTheme
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useSelector, useDispatch } from 'react-redux';
import { useMemo, useEffect } from 'react';
import { setTableConfig } from 'store/slices/search';
import {
  tableContainerSx, tableHeadCellSx, getTableRowSx,
  tableActionEditSx, tableActionDeleteSx, getStatusChipSx
} from './BOSStyles';
import { getPhotoUrl } from './BOSUtils';
import { IconUser } from '@tabler/icons-react';
import { Avatar } from '@mui/material';

/**
 * BOS DataTable — SOP #2, #7, #8, #12, #15, #16
 * Universal scrollable datatable for all BOS master pages.
 */
export default function BOSDataTable({
  columns,
  data,
  rows: rowsProp,
  loading,
  onEditRow,
  onDeleteRow,
  onDoubleClickRow,
  showActions = true,
  selectable = false,
  onSelectionChange,
  totalCount,
  page = 0,
  size = 10,
  onPageChange,
  onSizeChange,
  footerActions,
  onClickRow,
  selectedRowId,
  renderCell,
  sx = {},
  id
}) {
  const rows = data || rowsProp || [];
  console.log('[BOSDataTable] Rendering with rows:', rows.length);
  const dispatch = useDispatch();

  useEffect(() => {
    if (columns && rows) {
      // Rule 1 extension: Extract unique values from rows for each column to provide dropdown options
      const columnsWithData = columns.map(col => {
        if (col.id === 'index' || col.id === 'photo' || col.id === 'actions') return col;
        
        const uniqueValues = [...new Set(rows.map(r => r[col.id]))]
          .filter(v => v !== undefined && v !== null && v !== '')
          .map(v => ({ value: v, label: String(v) }));

        return { ...col, options: uniqueValues };
      });
      dispatch(setTableConfig(columnsWithData));
    }
    return () => {
      dispatch(setTableConfig(null));
    };
  }, [columns, rows, dispatch]);
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const baseRowSx = getTableRowSx(isDark);

  const searchQuery = useSelector((state) => state.search?.query || '');
  const globalFilters = useSelector((state) => state.search?.filters || {});

  const filteredRows = useMemo(() => {
    if (!rows || rows.length === 0) return [];

    return rows.filter((row) => {
      // 1. Dynamic Filters from Search Popover (Only apply filters relevant to this table's columns)
      if (globalFilters) {
        for (const [key, fVal] of Object.entries(globalFilters)) {
          if (fVal === undefined || fVal === null || fVal === '' || fVal === 'All') continue;
          
          // Check if this filter key exists in our columns
          const isRelevant = columns.some(col => col.id === key);
          if (!isRelevant && key !== 'status') continue; 

          const filterVal = String(fVal).toLowerCase().trim();
          const rowVal = String(row[key] || '').toLowerCase().trim();
          
          if (filterVal && !rowVal.includes(filterVal)) {
            return false;
          }
        }
      }

      // 2. Global Query (Main text box)
      if (searchQuery) {
        const queryLower = searchQuery.toLowerCase();
        return columns.some((col) => {
          if (col.id === 'index' || col.id === 'photo' || col.id === 'actions') return false;
          const val = row[col.id];
          if (val == null) return false;
          if (typeof val === 'object') {
            return String(val.name || val.label || val.id || '').toLowerCase().includes(queryLower);
          }
          return String(val).toLowerCase().includes(queryLower);
        });
      }

      return true;
    });
  }, [rows, searchQuery, globalFilters, columns]);

  const formatDate = (d) => {
    if (!d) return '-';
    try { 
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return String(d);
      return format(dateObj, 'dd/MM/yyyy HH:mm'); 
    } catch { 
      return '-'; 
    }
  };

  const defaultRenderCell = (col, row, idx) => {
    if (col.render) return col.render(row, idx);
    
    // ── DATA RESOLUTION (Supports camelCase, snake_case, and common audit fallbacks) ──
    let val = row[col.id];
    
    if (val === undefined || val === null) {
      // 1. Standard camelCase to snake_case (e.g. updatedBy -> updated_by)
      const snakeCaseId = col.id.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      val = row[snakeCaseId];
      
      // 2. Audit-Specific Fallbacks (The "Big 4")
      if (val === undefined || val === null || val === '') {
        if (col.id === 'createdDate') val = row['createdAt'] || row['created_at'];
        if (col.id === 'updatedDate') val = row['updatedAt'] || row['updated_at'] || row['createdDate'] || row['createdAt'] || row['created_at'];
        if (col.id === 'createdBy') val = row['created_by'];
        if (col.id === 'updatedBy') val = row['updated_by'] || row['createdBy'] || row['created_by'];
      }
    }

    if (col.renderCell) return col.renderCell(val, row);

    if (col.id === 'index') return (page * size) + (filteredRows.indexOf(row) + 1);

    // Standard Photo Rendering (SOP Compliance)
    if (col.id === 'photo' || col.id === 'employeePhotoUpload' || col.id === 'avatar') {
      return (
        <Avatar
          src={getPhotoUrl(val)}
          variant="rounded"
          sx={{ width: 32, height: 40, bgcolor: 'grey.100', border: '1px solid', borderColor: 'divider' }}
        >
          <IconUser size={18} color="#ccc" />
        </Avatar>
      );
    }

    if (col.id === 'status' || col.id === 'accountStatus') {
      let statusText = 'Inactive';
      if (val === 1 || val === 'Active' || val === 'ACTIVE') statusText = 'Active';
      else if (val === 0 || val === 'Inactive' || val === 'INACTIVE' || val === 'InActive') statusText = 'Inactive';
      return <Chip label={statusText} size="small" sx={getStatusChipSx(statusText)} />;
    }

    // Date Formatting (SOP Compliance - Removes +00:00 via formatDate)
    const isDateField = col.id.toLowerCase().includes('date') || 
                       col.id.endsWith('At') || 
                       col.id.endsWith('_at') || 
                       col.id === 'entryDate' ||
                       col.id === 'invoiceDate';
    
    // Explicitly exclude false positives like 'state' or 'category'
    const isFalsePositive = col.id.toLowerCase().includes('state') || col.id.toLowerCase().includes('category');

    if (isDateField && !isFalsePositive) {
      return formatDate(val);
    }
    
    // Handle Boolean values (Yes/No)
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    
    if (typeof val === 'object' && val !== null) {
      return val.name || val.label || val.id || '-';
    }
    return (val !== null && val !== undefined && val !== '') ? String(val) : '-';
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ ...tableContainerSx, ...sx }} id={id}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col, ci) => (
                <TableCell
                  key={col.id}
                  sx={{
                    ...tableHeadCellSx,
                    ...(ci === 0 ? { borderTopLeftRadius: '16px' } : {}),
                    ...(!showActions && ci === columns.length - 1 ? { borderTopRightRadius: '16px' } : {})
                  }}
                >
                  {col.id === 'index' ? 'No' : col.label}
                </TableCell>
              ))}
              {showActions && (
                <TableCell sx={{ ...tableHeadCellSx, textAlign: 'center', borderTopRightRadius: '16px' }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showActions ? 1 : 0)} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>Loading data...</Typography>
                </TableCell>
              </TableRow>
            ) : (filteredRows?.length || 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showActions ? 1 : 0)} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>No records found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRows?.slice(page * size, page * size + size).map((row, idx) => {
                const isSelected = selectedRowId === row.id;
                const rowSx = {
                  ...baseRowSx,
                  ...(isSelected ? { 
                    bgcolor: isDark ? 'primary.darker' : 'primary.light',
                    '& td': { borderBottom: '1px solid', borderColor: 'primary.main' }
                  } : {})
                };

                return (
                  <TableRow 
                    key={row.id ?? idx}
                    hover 
                    sx={rowSx} 
                    onClick={() => onClickRow?.(row)}
                    onDoubleClick={() => onDoubleClickRow ? onDoubleClickRow(row) : (onEditRow ? onEditRow(row) : null)}
                  >
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      sx={{
                        cursor: (onDoubleClickRow || onClickRow || onEditRow) ? 'pointer' : 'default',
                        ...(col.id === 'index' ? { color: isSelected ? 'primary.dark' : 'primary.main', fontWeight: 600 } : {}),
                        ...(col.bold ? { fontWeight: 600, color: '#37474f' } : {}),
                        // SOP: Prevent column split issue by keeping text on one line unless explicitly long
                        whiteSpace: (String(row[col.id] || '').length > 50 || col.wrap) ? 'normal' : 'nowrap',
                        ...(col.maxWidth ? { maxWidth: col.maxWidth, overflow: 'hidden', textOverflow: 'ellipsis' } : {}),
                        minWidth: col.id === 'index' ? 60 : (col.minWidth || 100),
                        paddingX: 1.5
                      }}
                    >
                      {(() => {
                        if (renderCell) {
                          const customVal = renderCell(col, row, idx);
                          if (customVal !== null && customVal !== undefined) return customVal;
                        }
                        return defaultRenderCell(col, row, idx);
                      })()}
                    </TableCell>
                  ))}
                  {showActions && (
                    <TableCell align="center" sx={{ minWidth: 100 }}>
                      <Stack direction="row" justifyContent="center" spacing={1} sx={{ flexWrap: 'nowrap' }}>
                        {onEditRow && (
                          <Tooltip title="Edit">
                            <IconButton onClick={(e) => { e.stopPropagation(); onEditRow(row); }} size="small" sx={tableActionEditSx}>
                              <IconEdit size={16} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {onDeleteRow && (
                          <Tooltip title="Delete">
                            <IconButton onClick={(e) => { e.stopPropagation(); onDeleteRow(row); }} size="small" sx={tableActionDeleteSx}>
                              <IconTrash size={16} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ 
        p: 1.5, 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between', 
        borderTop: '1px solid', 
        borderColor: 'divider',
        bgcolor: isDark ? 'background.default' : 'grey.50',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px'
      }}>
        <Box sx={{ flexGrow: 1 }}>
          {footerActions}
        </Box>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount ?? (rows?.length || 0)}
          rowsPerPage={size}
          page={page}
          onPageChange={(e, p) => onPageChange(p)}
          onRowsPerPageChange={(e) => onSizeChange(parseInt(e.target.value, 10))}
          sx={{ border: 'none' }}
        />
      </Box>
    </>
  );
}

BOSDataTable.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  size: PropTypes.number.isRequired,
  totalCount: PropTypes.number,
  loading: PropTypes.bool,
  onPageChange: PropTypes.func.isRequired,
  onSizeChange: PropTypes.func.isRequired,
  onDoubleClickRow: PropTypes.func,
  onClickRow: PropTypes.func,
  selectedRowId: PropTypes.any,
  onEditRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  showActions: PropTypes.bool,
  renderCell: PropTypes.func,
  footerActions: PropTypes.node,
  id: PropTypes.string
};
