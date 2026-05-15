/**
 * ============================================================
 * BOS (Business Operating System) - Centralized Style Tokens
 * ============================================================
 * SOP Reference: #1, #2, #3, #11, #12, #18
 *
 * Single source of truth for all BOS UI styling across every
 * module. Every dialog, datatable, button, and form must pull
 * styles from here — NO ad-hoc inline style objects allowed.
 *
 * Usage:
 *   import { getBOSStyles } from 'ui-component/bos/BOSStyles';
 *   const styles = getBOSStyles(theme, isDark);
 */

// ─── BUTTON STYLE TOKENS (SOP #1) ──────────────────────────

/** Save – Green */
export const btnSave = {
  bgcolor: 'success.main',
  color: '#fff',
  '&:hover': { bgcolor: 'success.dark', transform: 'translateY(-2px)', boxShadow: 6 },
  borderRadius: '24px',
  textTransform: 'none',
  px: 4,
  py: 1,
  fontWeight: 700,
  transition: 'all 0.2s',
  boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'
};

/** Edit / New – Blue */
export const btnEdit = (theme) => ({
  bgcolor: theme?.palette?.primary?.main || 'primary.main',
  color: '#fff',
  '&:hover': { bgcolor: theme?.palette?.primary?.dark || 'primary.dark', transform: 'translateY(-2px)', boxShadow: 6 },
  borderRadius: '24px',
  textTransform: 'none',
  px: 4,
  py: 1,
  fontWeight: 700,
  transition: 'all 0.2s',
  boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'
});

/** Delete – Red */
export const btnDelete = {
  bgcolor: 'error.main',
  color: '#fff',
  '&:hover': { bgcolor: 'error.dark', transform: 'translateY(-2px)', boxShadow: 6 },
  borderRadius: '24px',
  textTransform: 'none',
  px: 4,
  py: 1,
  fontWeight: 700,
  transition: 'all 0.2s',
  boxShadow: '0 4px 14px 0 rgba(0,0,0,0.1)'
};

/** Cancel / Close – Gray */
export const btnCancel = {
  bgcolor: 'grey.500',
  color: '#fff',
  '&:hover': { bgcolor: 'grey.700', transform: 'translateY(-2px)', boxShadow: 6 },
  borderRadius: '24px',
  textTransform: 'none',
  px: 4,
  py: 1,
  fontWeight: 700,
  transition: 'all 0.2s'
};

/** Clear – Secondary */
export const btnClear = {
  bgcolor: 'secondary.main',
  color: '#fff',
  '&:hover': { bgcolor: 'secondary.dark', transform: 'translateY(-2px)', boxShadow: 6 },
  borderRadius: '24px',
  textTransform: 'none',
  px: 4,
  py: 1,
  fontWeight: 700,
  transition: 'all 0.2s'
};

/** Export – Outlined Primary */
export const btnExport = {
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  borderWidth: '2px',
  '&:hover': { borderWidth: '2px', bgcolor: 'primary.50' }
};

/** + New – Contained Primary */
export const btnNew = {
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 2,
  transition: 'all 0.2s',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 }
};

// ─── DIALOG STYLE TOKENS (SOP #11) ─────────────────────────

export const getDialogStyles = (theme, isDark) => ({
  dialog: {
    bgcolor: isDark ? '#161b22' : theme.palette.background.paper,
    color: isDark ? '#c9d1d9' : theme.palette.text.primary
  },
  paper: {
    height: 'auto',
    maxHeight: '95vh',
    bgcolor: isDark ? '#161b22' : theme.palette.background.paper,
    backgroundImage: 'none',
    borderRadius: '24px',
    border: isDark ? '1px solid #30363d' : 'none',
    boxShadow: isDark ? '0 24px 48px rgba(0,0,0,0.5)' : '0 24px 48px rgba(0,0,0,0.1)'
  },
  backdrop: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(8px)'
  },
  titleBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    bgcolor: isDark ? 'background.default' : 'primary.light',
    borderBottom: '1px solid',
    borderColor: 'divider',
    py: 3.5,
    px: 4
  },
  titleText: {
    fontWeight: 600,
    color: isDark ? '#58a6ff' : theme.palette.primary.main,
    fontSize: '1.25rem'
  },
  closeBtn: {
    color: isDark ? '#8b949e' : theme.palette.text.secondary
  },
  content: {
    p: 4,
    pt: 5,
    bgcolor: isDark ? '#161b22' : theme.palette.background.paper,
    width: '100%',
    overflowX: 'hidden'
  },
  footer: {
    p: 3,
    borderTop: isDark ? '1px solid #30363d' : `1px solid ${theme.palette.divider}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    bgcolor: isDark ? '#161b22' : theme.palette.background.paper
  },
  sectionCard: {
    bgcolor: isDark ? 'background.default' : '#ffffff',
    borderRadius: '16px',
    border: '1px solid',
    borderColor: 'divider',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
  },
  sectionHeader: {
    px: 3,
    py: 3,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: isDark ? '#1c2128' : 'grey.50',
    display: 'flex',
    alignItems: 'center',
    gap: 1.5
  }
});

// ─── INPUT STYLE TOKENS (SOP #9, #10) ──────────────────────

export const getInputStyles = (theme, isDark) => ({
  width: '100% !important',
  '& .MuiOutlinedInput-root': {
    width: '100%',
    bgcolor: isDark ? 'background.default' : 'grey.50',
    color: 'text.primary',
    '& fieldset': { borderColor: 'divider' },
    '&:hover fieldset': { borderColor: isDark ? '#8b949e' : theme.palette.primary.main },
    '&.Mui-focused fieldset': { borderColor: isDark ? '#58a6ff' : theme.palette.primary.main },
    '& input': { py: 1.2, fontSize: '0.9rem' },
    '& .MuiSelect-select': { py: 1.1, fontSize: '0.9rem', width: '100%', minWidth: '150px', display: 'flex', alignItems: 'center' },
    '& .MuiPickersInputBase-root': { height: '38px' },
    '& .MuiPickersInputBase-sectionsContainer': { py: 0, px: 1, fontSize: '0.9rem', height: '100%', display: 'flex', alignItems: 'center' }
  },
  '& .MuiInputLabel-root': { color: isDark ? '#8b949e' : theme.palette.text.secondary },
  '& .MuiSvgIcon-root': { color: isDark ? '#8b949e' : theme.palette.text.secondary },
  '& .MuiFormLabel-asterisk': { color: '#ef4444' }
});

// ─── DATATABLE STYLE TOKENS (SOP #2, #15, #16) ─────────────

export const tableContainerSx = {
  height: 'calc(100vh - 300px)',
  border: '1px solid',
  borderColor: 'divider',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  borderRadius: '12px',
  overflow: 'auto',
  position: 'relative',
  '&::-webkit-scrollbar': { width: 6, height: 6 },
  '&::-webkit-scrollbar-track': { backgroundColor: 'transparent' },
  '&::-webkit-scrollbar-thumb': { backgroundColor: 'grey.300', borderRadius: 10, '&:hover': { backgroundColor: 'grey.400' } }
};

export const tableHeadCellSx = {
  bgcolor: 'primary.dark',
  color: 'primary.light',
  fontWeight: 600,
  fontSize: '0.8rem',
  py: 2,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: 'none',
  whiteSpace: 'nowrap'
};

export const getTableRowSx = (isDark) => ({
  cursor: 'pointer',
  transition: 'all 0.2s',
  '& td': { borderBottom: '1px solid', borderColor: 'divider', py: 1.5 },
  '&:nth-of-type(even)': { bgcolor: isDark ? '#161b22' : '#fafafa' },
  '&:hover': {
    bgcolor: isDark ? '#30363d !important' : 'grey.50 !important'
  }
});

/** Action button pills in data table rows */
export const tableActionEditSx = {
  color: 'primary.main',
  bgcolor: '#e3f2fd',
  '&:hover': { bgcolor: 'primary.main', color: '#fff' }
};

export const tableActionDeleteSx = {
  color: 'error.main',
  bgcolor: '#ffebee',
  '&:hover': { bgcolor: 'error.main', color: '#fff' }
};

// ─── STATUS CHIP HELPER ─────────────────────────────────────

export const getStatusChipSx = (status) => {
  const isActive = ['ACTIVE', 'Active', 'active'].includes(status);
  return {
    bgcolor: isActive ? '#e8f5e9' : '#ffebee',
    color: isActive ? '#2e7d32' : '#c62828',
    fontWeight: 700
  };
};

// ─── ANIMATION TOKENS (SOP #18) ─────────────────────────────

export const shakeAnimation = {
  '@keyframes bosShake': {
    '0%, 100%': { transform: 'translateX(0)' },
    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
    '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
  },
  '@keyframes bosPulse': {
    '0%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)' },
    '70%': { boxShadow: '0 0 0 6px rgba(239, 68, 68, 0)' },
    '100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0)' }
  },
  animation: 'bosShake 0.5s cubic-bezier(.36,.07,.19,.97) both'
};

export const errorStyle = (isError) => isError ? {
  ...shakeAnimation,
  '& .MuiOutlinedInput-root': {
    '& fieldset': { 
      borderColor: '#ef4444 !important', 
      borderWidth: '2px',
      boxShadow: '0 0 8px rgba(239, 68, 68, 0.2)'
    },
    bgcolor: '#fff5f5',
    animation: 'bosPulse 1.5s infinite'
  }
} : {};

// ─── COMBINED GETTER (convenience) ──────────────────────────

export const getBOSStyles = (theme, isDark) => ({
  dialog: getDialogStyles(theme, isDark),
  input: getInputStyles(theme, isDark),
  btnSave,
  btnEdit: btnEdit(theme),
  btnDelete,
  btnCancel,
  btnClear,
  btnExport,
  btnNew,
  tableContainer: tableContainerSx,
  tableHeadCell: tableHeadCellSx,
  tableRow: getTableRowSx(isDark),
  tableActionEdit: tableActionEditSx,
  tableActionDelete: tableActionDeleteSx,
  getStatusChip: getStatusChipSx,
  shake: shakeAnimation,
  error: errorStyle
});
