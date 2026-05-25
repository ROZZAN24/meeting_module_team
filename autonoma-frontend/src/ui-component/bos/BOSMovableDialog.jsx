import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Box, Typography, Paper } from '@mui/material';
import {
  IconX,
  IconArrowsMove,
  IconChevronUp,
  IconChevronDown,
  IconArrowsMaximize,
  IconArrowsMinimize
} from '@tabler/icons-react';
import { useColorScheme } from '@mui/material/styles';

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

/**
 * BOS Movable & Resizable Dialog.
 * - Title bar: drag to move
 * - Bottom-right grip: drag to resize
 */
export default function BOSMovableDialog({
  open,
  onClose,
  title,
  children,
  actions,
  defaultWidth = 780,
  defaultHeight = 580,
  ...props
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [preMaximizedSize, setPreMaximizedSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [preMaximizedPosition, setPreMaximizedPosition] = useState({ x: 0, y: 0 });

  const dragState = useRef(null);   // { type: 'drag'|'resize-w'|'resize-h'|'resize-both', startX, startY, startPosX, startPosY, startW, startH }

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

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
    dragState.current = {
      type: 'resize-w',
      startX: e.clientX,
      startW: size.width,
    };
    e.preventDefault();
    e.stopPropagation();
  }, [size]);

  const startResizeH = useCallback((e) => {
    if (e.button !== 0) return;
    dragState.current = {
      type: 'resize-h',
      startY: e.clientY,
      startH: size.height,
    };
    e.preventDefault();
    e.stopPropagation();
  }, [size]);

  const startResizeBoth = useCallback((e) => {
    if (e.button !== 0) return;
    dragState.current = {
      type: 'resize-both',
      startX: e.clientX,
      startY: e.clientY,
      startW: size.width,
      startH: size.height,
    };
    e.preventDefault();
    e.stopPropagation();
  }, [size]);

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
      const ds = dragState.current;
      if (!ds) return;

      if (ds.type === 'drag') {
        const dx = e.clientX - ds.startX;
        const dy = e.clientY - ds.startY;
        setPosition({ x: ds.startPosX + dx, y: ds.startPosY + dy });
      } else if (ds.type === 'resize-w') {
        const dx = e.clientX - ds.startX;
        setSize((prev) => ({
          ...prev,
          width: Math.max(420, ds.startW + dx),
        }));
      } else if (ds.type === 'resize-h') {
        const dy = e.clientY - ds.startY;
        setSize((prev) => ({
          ...prev,
          height: Math.max(300, ds.startH + dy),
        }));
      } else if (ds.type === 'resize-both') {
        const dx = e.clientX - ds.startX;
        const dy = e.clientY - ds.startY;
        setSize({
          width: Math.max(420, ds.startW + dx),
          height: Math.max(300, ds.startH + dy),
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
      setSize({ width: defaultWidth, height: defaultHeight });
      setIsMaximized(false);
      setIsCollapsed(false);
    }
  }, [open, defaultWidth, defaultHeight]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperComponent={CustomPaper}
      PaperProps={{
        position: position,
        isMaximized: isMaximized,
        isCollapsed: isCollapsed,
        sx: {
          width: size.width ? `${size.width}px` : undefined,
          height: isCollapsed ? 'auto' : (size.height ? `${size.height}px` : undefined),
          maxHeight: isCollapsed ? 'auto' : 'none',
          maxWidth: 'none',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          borderRadius: '16px',
          boxShadow: isDark
            ? '0 24px 60px rgba(0,0,0,0.7)'
            : '0 16px 48px rgba(0,0,0,0.18)',
          border: isDark
            ? '1px solid rgba(255,255,255,0.09)'
            : '1px solid rgba(0,0,0,0.06)',
          overflow: 'visible',   // ← CRITICAL: allows resize handle to sit outside clip region
          backgroundImage: 'none',
        }
      }}
      {...props}
    >
      {/* ── Draggable Title Bar ─────────────────────────────────────── */}
      <DialogTitle
        onMouseDown={startDrag}
        sx={{
          cursor: isMaximized ? 'default' : 'grab',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'primary.light',
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px 16px 0 0',
          py: 1.5,
          px: 2.5,
          flexShrink: 0,
          '&:active': { cursor: isMaximized ? 'default' : 'grabbing' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconArrowsMove size={18} style={{ opacity: 0.5 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, color: isDark ? 'primary.light' : 'primary.dark' }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} className="no-drag">
          {/* Minimize / Collapse Button */}
          <Tooltip title={isCollapsed ? "Expand Height" : "Collapse Dialog"}>
            <IconButton
              onClick={() => setIsCollapsed(!isCollapsed)}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
              }}
            >
              {isCollapsed ? <IconChevronDown size={18} /> : <IconChevronUp size={18} />}
            </IconButton>
          </Tooltip>

          {/* Maximize / Restore Button */}
          <Tooltip title={isMaximized ? "Restore Size" : "Maximize Screen"}>
            <IconButton
              onClick={toggleMaximize}
              disabled={isCollapsed}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }
              }}
            >
              {isMaximized ? <IconArrowsMinimize size={18} /> : <IconArrowsMaximize size={18} />}
            </IconButton>
          </Tooltip>

          {/* Close Button */}
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { bgcolor: 'error.lighter', color: 'error.main' },
              transition: 'all 0.15s',
            }}
          >
            <IconX size={18} />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* ── Scrollable Content ──────────────────────────────────────── */}
      {!isCollapsed && (
        <DialogContent
          sx={{
            p: 2.5,
            flexGrow: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
          }}
        >
          {children}
        </DialogContent>
      )}

      {/* ── Action Footer ───────────────────────────────────────────── */}
      {actions && !isCollapsed && (
        <DialogActions
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'grey.50',
            borderRadius: '0 0 16px 16px',
            flexShrink: 0,
          }}
        >
          {actions}
        </DialogActions>
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
              height: 'calc(100% - 16px)',
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
              width: 'calc(100% - 16px)',
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
              borderRadius: '0 0 16px 0',
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

BOSMovableDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node,
  actions: PropTypes.node,
  defaultWidth: PropTypes.number,
  defaultHeight: PropTypes.number,
};
