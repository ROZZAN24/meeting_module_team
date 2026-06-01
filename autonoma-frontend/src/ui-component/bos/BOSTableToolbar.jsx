import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Stack, Tooltip, IconButton, Popover, Typography, Button, Checkbox, Box } from '@mui/material';
import {
  IconRefresh,
  IconAdjustmentsHorizontal,
  IconFileDots,
  IconUserPlus,
  IconUsers,
  IconCircleCheck,
  IconCheck,
  IconArrowsExchange,
  IconGitBranch
} from '@tabler/icons-react';
import BOSExportButton from './BOSExportButton';
import { btnNew } from './BOSStyles';

/**
 * BOSTableToolbar - A unified, reusable toolbar component for BOS data tables.
 * Centralizes actions such as Refresh, Column Visibility, Exports, and action buttons
 * (e.g. + New, Amendment, Assign To) to ensure consistent design and UX.
 */
export default function BOSTableToolbar({
  // Refresh Action
  onRefresh,

  // New Item Action (+ New)
  onNew,
  newLabel = '+ New',
  newTooltip = 'Add New',
  newDisabled = false,
  hasWritePermission = true,

  // Column Visibility Panel
  columns = [],
  visibleColumnIds = [],
  onColumnVisibilityChange,
  requiredColumnIds = ['index'],

  // Export Action
  exportData = null,
  exportColumns = [],
  exportFilename = 'Export',
  hasExportPermission = true,

  // Amendment Action (Customizable)
  onAmendment,
  amendmentDisabled = false,
  amendmentTooltip,
  amendmentLabel = 'Amendment',
  amendmentIcon = <IconFileDots size={18} />,
  amendmentColor = 'primary',
  amendmentVariant = 'contained',
  amendmentSx = {},

  // Assign Action (Customizable)
  onAssign,
  assignDisabled = false,
  assignTooltip,
  assignLabel = 'Assign',
  assignIcon = <IconUserPlus size={18} />,
  assignColor = 'primary',
  assignVariant = 'contained',
  assignSx = {},

  // Predefined Page-Specific Action: Map Manager
  onMapManager,
  mapManagerDisabled = false,
  mapManagerTooltip,
  mapManagerLabel = 'Map Manager',
  mapManagerIcon = <IconUsers size={18} />,
  mapManagerColor = 'secondary',
  mapManagerVariant = 'contained',
  mapManagerSx = {},

  // Predefined Page-Specific Action: Close NCR / OFI
  onCloseNcr,
  closeNcrDisabled = false,
  closeNcrTooltip,
  closeNcrLabel = 'Close NCR / OFI',
  closeNcrIcon = <IconCircleCheck size={18} />,
  closeNcrColor = 'primary',
  closeNcrVariant = 'contained',
  closeNcrSx = {},

  // Predefined Page-Specific Action: Complete Task
  onCompleteTask,
  completeTaskDisabled = false,
  completeTaskTooltip,
  completeTaskLabel = 'Complete Task',
  completeTaskIcon = <IconCheck size={18} />,
  completeTaskColor = 'primary',
  completeTaskVariant = 'contained',
  completeTaskSx = {},

  // Predefined Page-Specific Action: Reassign
  onReassign,
  reassignDisabled = false,
  reassignTooltip,
  reassignLabel = 'Reassign',
  reassignIcon = <IconArrowsExchange size={18} />,
  reassignColor = 'warning',
  reassignVariant = 'outlined',
  reassignSx = {},

  // Custom actions array: [{ label, onClick, disabled, tooltip, color, variant, icon, sx }]
  extraActions = [],

  // Slot for page-specific extra buttons
  children,
  sx = {}
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const tableConfig = useSelector((state) => state.search?.tableConfig);

  const derivedExportColumns = useMemo(() => {
    // If the page explicitly passes exportColumns, always use them — highest priority.
    // This prevents the inner BOSDataTable inside the export preview dialog from
    // overwriting tableConfig with letter-labelled preview columns (A, B, C...).
    if (exportColumns && exportColumns.length > 0) {
      return exportColumns;
    }

    let sourceColumns = [];
    if (columns && columns.length > 0) {
      if (visibleColumnIds && visibleColumnIds.length > 0) {
        sourceColumns = columns.filter(col => visibleColumnIds.includes(col.id));
      } else {
        sourceColumns = columns;
      }
    } else if (tableConfig && tableConfig.length > 0) {
      sourceColumns = tableConfig;
    }

    return sourceColumns
      .filter(col => {
        const id = String(col.id || col.key || '').toLowerCase();
        return id !== 'actions' && id !== 'photo' && id !== 'avatar' && id !== 'employeephotoupload' && id !== 'index';
      })
      .map(col => ({
        header: col.label || col.header || col.id || col.key,
        key: col.id || col.key
      }));
  }, [columns, visibleColumnIds, tableConfig, exportColumns]);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleToggleColumn = (colId) => {
    if (!onColumnVisibilityChange) return;
    if (requiredColumnIds.includes(colId)) return;

    if (visibleColumnIds.includes(colId)) {
      onColumnVisibilityChange(visibleColumnIds.filter((id) => id !== colId));
    } else {
      onColumnVisibilityChange([...visibleColumnIds, colId]);
    }
  };

  const handleSelectAllColumns = () => {
    if (!onColumnVisibilityChange) return;
    onColumnVisibilityChange(columns.map((c) => c.id));
  };

  const iconBtnSx = {
    ...btnNew,
    bgcolor: 'primary.main',
    color: '#fff',
    p: 1,
    width: '38px',
    height: '38px',
    '&:hover': { bgcolor: 'primary.dark', transform: 'translateY(-2px)', boxShadow: 4 }
  };

  const showColumnVisibility = columns.length > 0 && visibleColumnIds.length > 0 && onColumnVisibilityChange;
  const showExport = exportData !== null && derivedExportColumns.length > 0 && hasExportPermission;

  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={sx}>
      {/* 1. Refresh Button */}
      {onRefresh && (
        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} size="small" sx={iconBtnSx}>
            <IconRefresh size={20} />
          </IconButton>
        </Tooltip>
      )}

      {/* 2. Column Visibility Controller */}
      {showColumnVisibility && (
        <>
          <Tooltip title="Column Visibility">
            <IconButton onClick={handlePopoverOpen} size="small" sx={iconBtnSx}>
              <IconAdjustmentsHorizontal size={20} />
            </IconButton>
          </Tooltip>

          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handlePopoverClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                p: 2,
                width: 280,
                maxHeight: 450,
                boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
              }
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Toggle Columns</Typography>
              <Button size="small" onClick={handleSelectAllColumns} sx={{ textTransform: 'none', fontWeight: 600 }}>
                Show All
              </Button>
            </Stack>

            <Box sx={{ overflowY: 'auto', flex: 1, py: 1, my: 1, pr: 0.5, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '4px' } }}>
              <Stack spacing={0.5}>
                {columns.map((col) => {
                  const isRequired = requiredColumnIds.includes(col.id);
                  return (
                    <Box
                      key={col.id}
                      onClick={() => !isRequired && handleToggleColumn(col.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 0.5,
                        px: 1,
                        borderRadius: '6px',
                        cursor: isRequired ? 'default' : 'pointer',
                        bgcolor: isRequired ? 'grey.50' : 'transparent',
                        opacity: isRequired ? 0.7 : 1,
                        '&:hover': {
                          bgcolor: isRequired ? 'grey.50' : 'grey.100',
                        }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: isRequired ? 600 : 400 }}>
                        {col.label}
                      </Typography>
                      <Checkbox
                        size="small"
                        checked={visibleColumnIds.includes(col.id)}
                        disabled={isRequired}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => handleToggleColumn(col.id)}
                        sx={{ p: 0.5 }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Popover>
        </>
      )}

      {/* 3. Export Excel/PDF Preview and Button */}
      {showExport && (
        <BOSExportButton
          data={exportData}
          filename={exportFilename}
          columns={exportColumns}
          screenColumns={derivedExportColumns}
          variant="contained"
          color="primary"
          sx={btnNew}
        />
      )}

      {/* 4. Map Manager Predefined Button */}
      {onMapManager && (
        <Tooltip title={mapManagerTooltip || 'Map Manager'}>
          <span>
            <Button
              variant={mapManagerVariant}
              color={mapManagerColor}
              size="medium"
              disabled={mapManagerDisabled}
              startIcon={mapManagerIcon}
              onClick={onMapManager}
              sx={{ ...btnNew, ...mapManagerSx }}
            >
              {mapManagerLabel}
            </Button>
          </span>
        </Tooltip>
      )}

      {/* 5. Close NCR / OFI Predefined Button */}
      {onCloseNcr && (
        <Tooltip title={closeNcrTooltip || 'Close NCR / OFI'}>
          <span>
            <Button
              variant={closeNcrVariant}
              color={closeNcrColor}
              size="medium"
              disabled={closeNcrDisabled}
              startIcon={closeNcrIcon}
              onClick={onCloseNcr}
              sx={{ ...btnNew, ...closeNcrSx }}
            >
              {closeNcrLabel}
            </Button>
          </span>
        </Tooltip>
      )}

      {/* 6. Complete Task Predefined Button */}
      {onCompleteTask && (
        <Tooltip title={completeTaskTooltip || 'Complete Task'}>
          <span>
            <Button
              variant={completeTaskVariant}
              color={completeTaskColor}
              size="medium"
              disabled={completeTaskDisabled}
              startIcon={completeTaskIcon}
              onClick={onCompleteTask}
              sx={{ ...btnNew, ...completeTaskSx }}
            >
              {completeTaskLabel}
            </Button>
          </span>
        </Tooltip>
      )}

      {/* 7. Reassign Predefined Button */}
      {onReassign && (
        <Tooltip title={reassignTooltip || 'Reassign'}>
          <span>
            <Button
              variant={reassignVariant}
              color={reassignColor}
              size="medium"
              disabled={reassignDisabled}
              startIcon={reassignIcon}
              onClick={onReassign}
              sx={{ ...btnNew, ...reassignSx }}
            >
              {reassignLabel}
            </Button>
          </span>
        </Tooltip>
      )}

      {/* 8. Amendment Action Button */}
      {onAmendment && (
        <Tooltip title={amendmentTooltip || 'Amendment'}>
          <span>
            <Button
              variant={amendmentVariant}
              color={amendmentColor}
              size="medium"
              disabled={amendmentDisabled}
              startIcon={amendmentIcon}
              onClick={onAmendment}
              sx={{ ...btnNew, ...amendmentSx }}
            >
              {amendmentLabel}
            </Button>
          </span>
        </Tooltip>
      )}

      {/* 9. Assign Action Button */}
      {onAssign && (
        <Tooltip title={assignTooltip || 'Assign'}>
          <span>
            <Button
              variant={assignVariant}
              color={assignColor}
              size="medium"
              disabled={assignDisabled}
              startIcon={assignIcon}
              onClick={onAssign}
              sx={{ ...btnNew, ...assignSx }}
            >
              {assignLabel}
            </Button>
          </span>
        </Tooltip>
      )}

      {/* 10. Extra actions list (Fallback/Legacy) */}
      {extraActions.map((action, idx) => {
        const btn = (
          <Button
            key={idx}
            variant={action.variant || 'contained'}
            color={action.color || 'primary'}
            size="medium"
            disabled={action.disabled}
            startIcon={action.icon}
            onClick={action.onClick}
            sx={{ ...btnNew, ...action.sx }}
          >
            {action.label}
          </Button>
        );
        if (action.tooltip) {
          return (
            <Tooltip key={idx} title={action.tooltip}>
              <span>{btn}</span>
            </Tooltip>
          );
        }
        return btn;
      })}

      {/* 11. Create New Action Button */}
      {onNew && hasWritePermission && (
        <Tooltip title={newTooltip}>
          <span>
            <Button
              variant="contained"
              color="primary"
              size="medium"
              disabled={newDisabled}
              onClick={onNew}
              sx={btnNew}
            >
              {newLabel}
            </Button>
          </span>
        </Tooltip>
      )}

      {/* 12. Extra actions slot */}
      {children}
    </Stack>
  );
}

BOSTableToolbar.propTypes = {
  onRefresh: PropTypes.func,
  onNew: PropTypes.func,
  newLabel: PropTypes.string,
  newTooltip: PropTypes.string,
  newDisabled: PropTypes.bool,
  hasWritePermission: PropTypes.bool,
  columns: PropTypes.array,
  visibleColumnIds: PropTypes.array,
  onColumnVisibilityChange: PropTypes.func,
  requiredColumnIds: PropTypes.array,
  exportData: PropTypes.array,
  exportColumns: PropTypes.array,
  exportFilename: PropTypes.string,
  hasExportPermission: PropTypes.bool,

  onAmendment: PropTypes.func,
  amendmentDisabled: PropTypes.bool,
  amendmentTooltip: PropTypes.string,
  amendmentLabel: PropTypes.string,
  amendmentIcon: PropTypes.node,
  amendmentColor: PropTypes.string,
  amendmentVariant: PropTypes.string,
  amendmentSx: PropTypes.object,

  onAssign: PropTypes.func,
  assignDisabled: PropTypes.bool,
  assignTooltip: PropTypes.string,
  assignLabel: PropTypes.string,
  assignIcon: PropTypes.node,
  assignColor: PropTypes.string,
  assignVariant: PropTypes.string,
  assignSx: PropTypes.object,

  onMapManager: PropTypes.func,
  mapManagerDisabled: PropTypes.bool,
  mapManagerTooltip: PropTypes.string,
  mapManagerLabel: PropTypes.string,
  mapManagerIcon: PropTypes.node,
  mapManagerColor: PropTypes.string,
  mapManagerVariant: PropTypes.string,
  mapManagerSx: PropTypes.object,

  onCloseNcr: PropTypes.func,
  closeNcrDisabled: PropTypes.bool,
  closeNcrTooltip: PropTypes.string,
  closeNcrLabel: PropTypes.string,
  closeNcrIcon: PropTypes.node,
  closeNcrColor: PropTypes.string,
  closeNcrVariant: PropTypes.string,
  closeNcrSx: PropTypes.object,

  onCompleteTask: PropTypes.func,
  completeTaskDisabled: PropTypes.bool,
  completeTaskTooltip: PropTypes.string,
  completeTaskLabel: PropTypes.string,
  completeTaskIcon: PropTypes.node,
  completeTaskColor: PropTypes.string,
  completeTaskVariant: PropTypes.string,
  completeTaskSx: PropTypes.object,

  onReassign: PropTypes.func,
  reassignDisabled: PropTypes.bool,
  reassignTooltip: PropTypes.string,
  reassignLabel: PropTypes.string,
  reassignIcon: PropTypes.node,
  reassignColor: PropTypes.string,
  reassignVariant: PropTypes.string,
  reassignSx: PropTypes.object,

  extraActions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      disabled: PropTypes.bool,
      tooltip: PropTypes.string,
      color: PropTypes.string,
      variant: PropTypes.string,
      icon: PropTypes.node,
      sx: PropTypes.object
    })
  ),
  children: PropTypes.node,
  sx: PropTypes.object
};
