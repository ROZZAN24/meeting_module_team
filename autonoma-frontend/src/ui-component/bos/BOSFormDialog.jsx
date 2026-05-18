import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Slide,
  Tooltip,
  useTheme
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import {
  IconX,
  IconEdit,
  IconTrash,
  IconEraser,
  IconCheck
} from '@tabler/icons-react';
import { getDialogStyles, btnSave, btnDelete, btnClear, btnEdit } from './BOSStyles';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';

// ==============================|| BOS FORM DIALOG - SOP #1,4,5,11,12 ||============================== //

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Reusable BOS Form Dialog that enforces every SOP rule.
 * All master Add/Edit dialogs must use this wrapper.
 *
 * @param {boolean}  open          - Controls dialog visibility
 * @param {function} onClose       - Called when dialog closes
 * @param {function} onSave        - Called when Save is clicked
 * @param {function} onDelete      - Called when Delete is clicked (only shown in edit mode with existing record)
 * @param {function} onClear       - Called when Clear is clicked
 * @param {string}   title         - Dialog title text
 * @param {boolean}  isViewOnly    - If true, shows Edit/Close buttons instead of Save/Delete/Clear
 * @param {function} onEditClick   - Called when Edit button clicked in view mode
 * @param {boolean}  hasId         - Whether record has an existing ID (controls Delete button visibility)
 * @param {string}   maxWidth      - MUI Dialog maxWidth (default "md")
 * @param {boolean}  hideFooter    - If true, hides the action footer
 * @param {node}     secondaryActions - Additional buttons to show in the footer
 * @param {node}     sidebar       - Optional sidebar content (shown in 300px right column on large screens)
 * @param {node}     children      - Form content
 */
export default function BOSFormDialog({
  open,
  onClose,
  onSave,
  onDelete,
  onClear,
  title = 'Form',
  isViewOnly = false,
  onEditClick,
  hasId = false,
  maxWidth = 'md',
  hideFooter = false,
  secondaryActions,
  sidebar,
  children
}) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const ds = getDialogStyles(theme, isDark);

  // BOS SOP #4: Keyboard Shortcuts
  useKeyboardShortcuts(
    {
      'ctrl+s': () => { if (!isViewOnly && onSave) onSave(); },
      'ctrl+e': () => { if (isViewOnly && onEditClick) onEditClick(); },
      'ctrl+d': () => { if (!isViewOnly && hasId && onDelete) onDelete(); },
      escape: () => { if (onClose) onClose(); }
    },
    open
  );

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={() => onClose()}
      maxWidth={sidebar ? 'lg' : maxWidth}
      fullWidth
      slotProps={{ backdrop: { sx: ds.backdrop } }}
      PaperProps={{ sx: ds.paper }}
    >
      {/* ── TITLE BAR ── */}
      <DialogTitle sx={ds.titleBar} component="div">
        <Typography variant="h5" component="span" sx={ds.titleText}>
          {title}
        </Typography>
        <Tooltip title={shortcutTooltip('Close', 'Esc')}>
          <IconButton onClick={() => onClose()} size="small" sx={ds.closeBtn}>
            <IconX size={24} />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      {/* ── CONTENT ── */}
      <DialogContent sx={ds.content}>
        {sidebar ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' }, gap: 4, width: '100%', alignItems: 'start' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3, width: '100%' }}>
              {children}
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3, width: '100%', position: 'sticky', top: 0 }}>
              {sidebar}
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3, width: '100%', alignItems: 'start' }}>
            {children}
          </Box>
        )}
      </DialogContent>

      {/* ── FOOTER ACTION BUTTONS (SOP #1, #12) ── */}
      {!hideFooter && (
        <Box sx={ds.footer}>
          {isViewOnly ? (
            <Box sx={{ display: 'flex', gap: 2, ml: 'auto', alignItems: 'center' }}>
              {secondaryActions}
              <Tooltip title={shortcutTooltip('Edit Details', 'Ctrl + E')}>
                <Button
                  onClick={onEditClick}
                  variant="contained"
                  sx={btnEdit(theme)}
                  startIcon={<IconEdit size={20} />}
                >
                  Edit
                </Button>
              </Tooltip>
              <Tooltip title={shortcutTooltip('Close Dialog', 'Esc')}>
                <Button
                  onClick={() => onClose()}
                  variant="contained"
                  sx={{ ...btnDelete, bgcolor: 'grey.500', '&:hover': { bgcolor: 'grey.700' } }}
                  startIcon={<IconX size={20} />}
                >
                  Close
                </Button>
              </Tooltip>
            </Box>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {onClear && (
                  <Tooltip title="Clear all fields">
                    <Button onClick={onClear} variant="contained" sx={btnClear} startIcon={<IconEraser size={20} />}>
                      Clear
                    </Button>
                  </Tooltip>
                )}
                {hasId && onDelete && (
                  <Tooltip title={shortcutTooltip('Delete Record', 'Ctrl + D')}>
                    <Button onClick={onDelete} variant="contained" sx={btnDelete} startIcon={<IconTrash size={20} />}>
                      Delete
                    </Button>
                  </Tooltip>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 2, ml: 'auto', alignItems: 'center' }}>
                {secondaryActions}
                {onSave && (
                  <Tooltip title={shortcutTooltip('Save Changes', 'Ctrl + S')}>
                    <Button onClick={onSave} variant="contained" sx={btnSave} startIcon={<IconCheck size={20} />}>
                      Save
                    </Button>
                  </Tooltip>
                )}
              </Box>
            </>
          )}
        </Box>
      )}
    </Dialog>
  );
}

BOSFormDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  onDelete: PropTypes.func,
  onClear: PropTypes.func,
  title: PropTypes.string,
  isViewOnly: PropTypes.bool,
  onEditClick: PropTypes.func,
  hasId: PropTypes.bool,
  maxWidth: PropTypes.string,
  hideFooter: PropTypes.bool,
  secondaryActions: PropTypes.node,
  children: PropTypes.node
};
