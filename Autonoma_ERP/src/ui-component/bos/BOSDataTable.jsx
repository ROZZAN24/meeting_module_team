import PropTypes from 'prop-types';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Tooltip, TablePagination, Stack,
  Chip, Typography, useTheme
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { format } from 'date-fns';
import {
  tableContainerSx, tableHeadCellSx, getTableRowSx,
  tableActionEditSx, tableActionDeleteSx, getStatusChipSx
} from './BOSStyles';

/**
 * BOS DataTable — SOP #2, #7, #8, #12, #15, #16
 * Universal scrollable datatable for all BOS master pages.
 */
export default function BOSDataTable({
  columns,
  rows,
  page,
  size,
  totalCount,
  loading,
  onPageChange,
  onSizeChange,
  onDoubleClickRow,
  onClickRow,
  selectedRowId,
  onEditRow,
  onDeleteRow,
  showActions = true,
  renderCell,
  id
}) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const baseRowSx = getTableRowSx(isDark);

  const formatDate = (d) => {
    if (!d) return '-';
    try { return format(new Date(d), 'dd-MM-yyyy HH:mm'); } catch { return '-'; }
  };

  const defaultRenderCell = (col, row, idx) => {
    const val = row[col.id];
    if (col.id === 'index') return page * size + idx + 1;
    if (col.id === 'status') {
      return <Chip label={val} size="small" sx={getStatusChipSx(val)} />;
    }
    if (col.id.toLowerCase().includes('date')) return formatDate(val);
    return val ?? '-';
  };

  return (
    <>
      <TableContainer component={Paper} sx={tableContainerSx} id={id}>
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
                  {col.label}
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
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showActions ? 1 : 0)} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>No records found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => {
                const isSelected = selectedRowId === row.id;
                const rowSx = {
                  ...baseRowSx,
                  ...(isSelected ? { 
                    bgcolor: isDark ? 'primary.darker' : 'primary.light',
                    '& td': { borderBottom: '1px solid', borderColor: 'primary.main' }
                  } : {})
                };

                return (
                  <TableRow key={row.id ?? idx} hover sx={rowSx} onClick={() => onClickRow?.(row)}>
                    {columns.map((col) => (
                      <TableCell
                        key={col.id}
                        onDoubleClick={(e) => { e.stopPropagation(); onDoubleClickRow?.(row); }}
                        sx={{
                          cursor: (onDoubleClickRow || onClickRow) ? 'pointer' : 'default',
                          ...(col.id === 'index' ? { color: isSelected ? 'primary.dark' : 'primary.main', fontWeight: 600 } : {}),
                          ...(col.bold ? { fontWeight: 600, color: '#37474f' } : {}),
                          ...(col.maxWidth ? { maxWidth: col.maxWidth, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } : {})
                        }}
                      >
                        {renderCell ? renderCell(col, row, idx) : defaultRenderCell(col, row, idx)}
                      </TableCell>
                    ))}
                    {showActions && (
                      <TableCell align="center">
                        <Stack direction="row" justifyContent="center" spacing={1}>
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
      <Box sx={{ p: 0.5, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider' }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount ?? rows.length}
          rowsPerPage={size}
          page={page}
          onPageChange={(e, p) => onPageChange(p)}
          onRowsPerPageChange={(e) => onSizeChange(parseInt(e.target.value, 10))}
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
  id: PropTypes.string
};
