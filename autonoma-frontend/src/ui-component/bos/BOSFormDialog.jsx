import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
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
  useTheme,
  Paper
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import {
  IconX,
  IconEdit,
  IconTrash,
  IconEraser,
  IconCheck,
  IconChevronUp,
  IconChevronDown,
  IconArrowsMaximize,
  IconArrowsMinimize
} from '@tabler/icons-react';
import { getDialogStyles, btnSave, btnDelete, btnClear, btnEdit } from './BOSStyles';
import useKeyboardShortcuts, { shortcutTooltip } from 'hooks/useKeyboardShortcuts';

// ==============================|| BOS FORM DIALOG - SOP #1,4,5,11,12 ||============================== //

const CustomPaper = forwardRef(({ position, isMaximized, isCollapsed, style, ...other }, ref) => {
  return (
    <Paper
      ref={ref}
      style={{
        ...style,
        ...(isMaximized ? {
          transform: 'none',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          margin: 0,
          position: 'fixed',
          borderRadius: 0,
        } : {
          transform: `${style?.transform || ''} translate(${position?.x || 0}px, ${position?.y || 0}px)`,
        }),
        ...(isCollapsed ? {
          height: 'auto',
          minHeight: 0,
          maxHeight: 'none',
        } : {})
      }}
      {...other}
    />
  );
});
CustomPaper.displayName = 'CustomPaper';
CustomPaper.propTypes = {
  position: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  }),
  isMaximized: PropTypes.bool,
  isCollapsed: PropTypes.bool,
  style: PropTypes.object
};

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

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: null, height: null });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [preMaximizedSize, setPreMaximizedSize] = useState({ width: null, height: null });
  const [preMaximizedPosition, setPreMaximizedPosition] = useState({ x: 0, y: 0 });

  const dragState = useRef(null);   // { type: 'drag'|'resize-w'|'resize-h'|'resize-both', startX, startY, startPosX, startPosY, startW, startH }

  // ─── Mouse event handlers ──────────────────────────────────────────────────
  const startDrag = useCallback((e) => {
    if (isMaximized) return;
    if (e.button !== 0) return;
    if (e.target.closest('button') || e.target.closest('.no-drag') || e.target.closest('.MuiIconButton-root')) return;
    dragState.current = {
      type: 'drag',
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
    e.preventDefault();
  }, [position, isMaximized]);

  const startResizeW = useCallback((e) => {
    if (e.button !== 0) return;
    const paper = e.currentTarget.closest('.MuiPaper-root');
    const rect = paper.getBoundingClientRect();
    dragState.current = {
      type: 'resize-w',
      startX: e.clientX,
      startW: rect.width,
    };
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const startResizeH = useCallback((e) => {
    if (e.button !== 0) return;
    const paper = e.currentTarget.closest('.MuiPaper-root');
    const rect = paper.getBoundingClientRect();
    dragState.current = {
      type: 'resize-h',
      startY: e.clientY,
      startH: rect.height,
    };
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const startResizeBoth = useCallback((e) => {
    if (e.button !== 0) return;
    const paper = e.currentTarget.closest('.MuiPaper-root');
    const rect = paper.getBoundingClientRect();
    dragState.current = {
      type: 'resize-both',
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height,
    };
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const toggleMaximize = useCallback(() => {
    if (isMaximized) {
      setSize(preMaximizedSize);
      setPosition(preMaximizedPosition);
      setIsMaximized(false);
    } else {
      setPreMaximizedSize(size);
      setPreMaximizedPosition(position);
      setIsMaximized(true);
      setIsCollapsed(false);
    }
  }, [isMaximized, size, position, preMaximizedSize, preMaximizedPosition]);

  useEffect(() => {
    const onMouseMove = (e) => {
      const dsState = dragState.current;
      if (!dsState) return;

      if (dsState.type === 'drag') {
        const dx = e.clientX - dsState.startX;
        const dy = e.clientY - dsState.startY;
        setPosition({ x: dsState.startPosX + dx, y: dsState.startPosY + dy });
      } else if (dsState.type === 'resize-w') {
        const dx = e.clientX - dsState.startX;
        setSize((prev) => ({
          ...prev,
          width: Math.max(420, dsState.startW + dx),
        }));
      } else if (dsState.type === 'resize-h') {
        const dy = e.clientY - dsState.startY;
        setSize((prev) => ({
          ...prev,
          height: Math.max(300, dsState.startH + dy),
        }));
      } else if (dsState.type === 'resize-both') {
        const dx = e.clientX - dsState.startX;
        const dy = e.clientY - dsState.startY;
        setSize({
          width: Math.max(420, dsState.startW + dx),
          height: Math.max(300, dsState.startH + dy),
        });
      }
    };

    const onMouseUp = () => {
      dragState.current = null;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setPosition({ x: 0, y: 0 });
      setSize({ width: null, height: null });
      setIsMaximized(false);
      setIsCollapsed(false);
    }
  }, [open]);

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
      PaperComponent={CustomPaper}
      PaperProps={{
        position: position,
        isMaximized: isMaximized,
        isCollapsed: isCollapsed,
        sx: {
          ...ds.paper,
          width: size.width ? `${size.width}px` : undefined,
          height: isCollapsed ? 'auto' : (size.height ? `${size.height}px` : undefined),
          maxWidth: size.width ? 'none' : undefined,
          maxHeight: isCollapsed ? 'auto' : (size.height ? 'none' : undefined),
          overflow: 'visible',
        }
      }}
    >
      {/* ── TITLE BAR ── */}
      <DialogTitle
        onMouseDown={startDrag}
        sx={{
          ...ds.titleBar,
          cursor: isMaximized ? 'default' : 'grab',
          userSelect: 'none',
          '&:active': { cursor: isMaximized ? 'default' : 'grabbing' },
        }}
        component="div"
      >
        <Typography variant="h5" component="span" sx={ds.titleText}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} className="no-drag">
          {/* Minimize / Collapse Button */}
          <Tooltip title={isCollapsed ? "Expand Height" : "Collapse Dialog"}>
            <IconButton
              onClick={() => setIsCollapsed(!isCollapsed)}
              size="small"
              sx={{
                color: isDark ? '#8b949e' : 'text.secondary',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
              }}
            >
              {isCollapsed ? <IconChevronDown size={20} /> : <IconChevronUp size={20} />}
            </IconButton>
          </Tooltip>

          {/* Maximize / Restore Button */}
          <Tooltip title={isMaximized ? "Restore Size" : "Maximize Screen"}>
            <IconButton
              onClick={toggleMaximize}
              disabled={isCollapsed}
              size="small"
              sx={{
                color: isDark ? '#8b949e' : 'text.secondary',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
              }}
            >
              {isMaximized ? <IconArrowsMinimize size={20} /> : <IconArrowsMaximize size={20} />}
            </IconButton>
          </Tooltip>

          {/* Close Button */}
          <Tooltip title={shortcutTooltip('Close', 'Esc')}>
            <IconButton onClick={() => onClose()} size="small" sx={ds.closeBtn}>
              <IconX size={24} />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      {/* ── CONTENT ── */}
      {!isCollapsed && (
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
      )}

      {/* ── FOOTER ACTION BUTTONS (SOP #1, #12) ── */}
      {!hideFooter && !isCollapsed && (
        <Box sx={ds.footer}>
          {isViewOnly ? (
            <Box sx={{ display: 'flex', gap: 2, ml: 'auto', alignItems: 'center' }}>
              {secondaryActions}
              {onEditClick && (
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
              )}
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

      {/* ── Resizers ── */}
      {!isMaximized && !isCollapsed && (
        <>
          {/* Right edge resize handle */}
          <Box
            onMouseDown={startResizeW}
            sx={{
              position: 'absolute',
              top: 0,
              right: -4,
              width: 8,
              height: 'calc(100% - 24px)',
              cursor: 'ew-resize',
              zIndex: 9,
            }}
          />
          {/* Bottom edge resize handle */}
          <Box
            onMouseDown={startResizeH}
            sx={{
              position: 'absolute',
              bottom: -4,
              left: 0,
              width: 'calc(100% - 24px)',
              height: 8,
              cursor: 'ns-resize',
              zIndex: 9,
            }}
          />
          {/* Bottom-right corner resize handle (grip) */}
          <Box
            onMouseDown={startResizeBoth}
            title="Drag to resize"
            sx={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 28,
              height: 28,
              cursor: 'se-resize',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0 0 24px 0',
              color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)',
              transition: 'color 0.15s, background 0.15s',
              '&:hover': {
                color: 'primary.main',
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'primary.lighter',
              },
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="currentColor"
              style={{ pointerEvents: 'none' }}
            >
              <circle cx="12" cy="12" r="1.4" />
              <circle cx="7"  cy="12" r="1.4" />
              <circle cx="12" cy="7"  r="1.4" />
              <circle cx="2"  cy="12" r="1.4" />
              <circle cx="7"  cy="7"  r="1.4" />
              <circle cx="12" cy="2"  r="1.4" />
            </svg>
          </Box>
        </>
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
