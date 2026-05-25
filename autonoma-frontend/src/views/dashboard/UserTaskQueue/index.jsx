import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Stack, useTheme,
  Skeleton, Avatar, IconButton, Chip, Tabs, Tab,
  TextField, InputAdornment, Tooltip, Fade, LinearProgress, Divider,
  Badge, CircularProgress, useMediaQuery, Paper, MenuItem, Select, FormControl,
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/material/styles';
import axios from 'utils/axios';
import useAuth from 'hooks/useAuth';
import useConfig from 'hooks/useConfig';

// ─── Icons ────────────────────────────────────────────────────────────────────
import WavingHandIcon from '@mui/icons-material/WavingHand';
import TodayIcon from '@mui/icons-material/Today';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import GroupsIcon from '@mui/icons-material/Groups';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PolicyIcon from '@mui/icons-material/Policy';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';

// ─── Keyframes ────────────────────────────────────────────────────────────────
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const waveHand = keyframes`
  0%   { transform: rotate(0deg); }
  15%  { transform: rotate(14deg); }
  30%  { transform: rotate(-8deg); }
  45%  { transform: rotate(14deg); }
  60%  { transform: rotate(-4deg); }
  75%  { transform: rotate(10deg); }
  100% { transform: rotate(0deg); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  50%      { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%      { transform: translateY(-6px); }
`;

// ─── Design System ────────────────────────────────────────────────────────────
const PALETTE = {
  indigo:  { solid: '#6366F1', light: '#EEF2FF', dark: '#4338CA', glow: 'rgba(99,102,241,0.3)'  },
  rose:    { solid: '#F43F5E', light: '#FFF1F2', dark: '#BE123C', glow: 'rgba(244,63,94,0.3)'   },
  emerald: { solid: '#10B981', light: '#ECFDF5', dark: '#047857', glow: 'rgba(16,185,129,0.3)'  },
  amber:   { solid: '#F59E0B', light: '#FFFBEB', dark: '#B45309', glow: 'rgba(245,158,11,0.3)'  },
  violet:  { solid: '#8B5CF6', light: '#F5F3FF', dark: '#6D28D9', glow: 'rgba(139,92,246,0.3)'  },
  sky:     { solid: '#0EA5E9', light: '#F0F9FF', dark: '#0369A1', glow: 'rgba(14,165,233,0.3)'  },
  slate:   { solid: '#64748B', light: '#F8FAFC', dark: '#334155', glow: 'rgba(100,116,139,0.3)' },
};

const RADIUS = { xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 28 };

// ─── Styled Components ────────────────────────────────────────────────────────

const PageRoot = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(160deg, #0B0F1A 0%, #111827 40%, #0F172A 100%)'
    : 'linear-gradient(160deg, #F8FAFF 0%, #EFF4FF 40%, #F1F5F9 100%)',
  padding: theme.spacing(2.5),
  [theme.breakpoints.up('md')]: { padding: theme.spacing(3.5) },
}));

/* ── Hero Banner ── */
const HeroBanner = styled(Box)(({ theme }) => ({
  borderRadius: RADIUS.xxl,
  padding: theme.spacing(4, 4.5),
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(3),
  animation: `${slideUp} 0.6s cubic-bezier(0.22,1,0.36,1)`,

  // Glass-morphism base
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.12) 50%, rgba(14,165,233,0.08) 100%)'
    : 'linear-gradient(135deg, #6366F1 0%, #7C3AED 45%, #8B5CF6 70%, #6366F1 100%)',
  backdropFilter: theme.palette.mode === 'dark' ? 'blur(40px)' : 'none',
  border: theme.palette.mode === 'dark'
    ? '1px solid rgba(99,102,241,0.2)'
    : 'none',
  color: '#fff',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
    : '0 20px 60px rgba(99,102,241,0.25), 0 8px 24px rgba(99,102,241,0.15)',

  // Decorative mesh gradient orbs
  '&::before': {
    content: '""', position: 'absolute',
    width: 400, height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
    right: -100, top: -140,
    pointerEvents: 'none',
  },
  '&::after': {
    content: '""', position: 'absolute',
    width: 300, height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
    left: '30%', bottom: -160,
    pointerEvents: 'none',
  },
}));

/* ── Stat Summary Card (inside banner) ── */
const StatBubble = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  background: 'rgba(255,255,255,0.12)',
  backdropFilter: 'blur(12px)',
  borderRadius: RADIUS.md,
  padding: '8px 16px',
  border: '1px solid rgba(255,255,255,0.15)',
  transition: 'all 0.25s ease',
  cursor: 'default',
  '&:hover': {
    background: 'rgba(255,255,255,0.18)',
    transform: 'translateY(-1px)',
  },
}));

/* ── Glass Card ── */
const GlassCard = styled(Box)(({ theme, palettekey = 'indigo', selected }) => {
  const pal = PALETTE[palettekey] || PALETTE.indigo;
  const isDark = theme.palette.mode === 'dark';
  return {
    borderRadius: RADIUS.xl,
    padding: theme.spacing(3),
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',

    background: isDark
      ? 'rgba(17,24,39,0.6)'
      : 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(20px)',
    border: `1.5px solid ${selected
      ? pal.solid
      : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
    boxShadow: selected
      ? `0 0 0 1px ${pal.solid}30, 0 8px 24px ${pal.glow}`
      : isDark
        ? '0 2px 12px rgba(0,0,0,0.3)'
        : '0 2px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)',

    '&:hover': {
      transform: 'translateY(-6px) scale(1.01)',
      boxShadow: isDark
        ? `0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px ${pal.solid}40`
        : `0 20px 48px ${pal.glow}, 0 0 0 1px ${pal.solid}25`,
      borderColor: `${pal.solid}60`,
    },

    // Bottom accent line
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0, left: '10%', right: '10%',
      height: 3,
      borderRadius: '3px 3px 0 0',
      background: `linear-gradient(90deg, transparent, ${pal.solid}, transparent)`,
      opacity: selected ? 1 : 0,
      transition: 'opacity 0.3s ease',
    },
    '&:hover::after': { opacity: 1 },
  };
});

/* ── Metric Icon Container ── */
const MetricIconWrap = styled(Box)(({ theme, palettekey = 'indigo' }) => {
  const pal = PALETTE[palettekey] || PALETTE.indigo;
  const isDark = theme.palette.mode === 'dark';
  return {
    width: 52,
    height: 52,
    borderRadius: RADIUS.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isDark
      ? `linear-gradient(135deg, ${alpha(pal.solid, 0.2)}, ${alpha(pal.dark, 0.15)})`
      : `linear-gradient(135deg, ${pal.light}, ${alpha(pal.solid, 0.08)})`,
    color: pal.solid,
    flexShrink: 0,
    transition: 'transform 0.3s ease',
    '.MuiBox-root:hover &': { transform: 'scale(1.08) rotate(-3deg)' },
  };
});

/* ── Filter Bar ── */
const FilterBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: 4,
  borderRadius: RADIUS.md,
  background: theme.palette.mode === 'dark'
    ? 'rgba(17,24,39,0.5)'
    : 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(16px)',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
  marginBottom: theme.spacing(2.5),
  flexWrap: 'wrap',
}));

const FilterChip = styled(Box)(({ theme, active }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: RADIUS.sm,
    fontWeight: 600,
    fontSize: '0.82rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    whiteSpace: 'nowrap',

    background: active
      ? isDark ? 'rgba(99,102,241,0.2)' : PALETTE.indigo.light
      : 'transparent',
    color: active
      ? isDark ? '#A5B4FC' : PALETTE.indigo.solid
      : theme.palette.text.secondary,
    border: `1px solid ${active
      ? isDark ? 'rgba(99,102,241,0.35)' : '#C7D2FE'
      : 'transparent'}`,

    '&:hover': {
      background: active
        ? isDark ? 'rgba(99,102,241,0.25)' : '#E0E7FF'
        : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      color: isDark ? '#C7D2FE' : PALETTE.indigo.solid,
    },
  };
});

/* ── Task Card ── */
const TaskCard = styled(Box)(({ theme, isoverdue, taskpalette = 'indigo' }) => {
  const isDark = theme.palette.mode === 'dark';
  const pal = PALETTE[taskpalette] || PALETTE.indigo;
  return {
    borderRadius: RADIUS.lg,
    padding: theme.spacing(2.5, 3),
    marginBottom: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
    animation: `${slideUp} 0.4s cubic-bezier(0.22,1,0.36,1) both`,

    background: isDark ? 'rgba(17,24,39,0.5)' : 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(16px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
    borderLeft: isoverdue === 'true'
      ? `4px solid ${PALETTE.rose.solid}`
      : `4px solid transparent`,
    boxShadow: isDark
      ? '0 1px 6px rgba(0,0,0,0.2)'
      : '0 1px 6px rgba(0,0,0,0.03)',

    '&:hover': {
      transform: 'translateX(6px)',
      borderLeftColor: isoverdue === 'true' ? PALETTE.rose.solid : pal.solid,
      boxShadow: isDark
        ? `0 8px 28px rgba(0,0,0,0.4), 0 0 0 1px ${pal.solid}20`
        : `0 8px 28px rgba(0,0,0,0.06), 0 0 0 1px ${pal.solid}15`,
      background: isDark ? 'rgba(17,24,39,0.7)' : 'rgba(255,255,255,0.95)',
      '& .task-arrow': { opacity: 1, transform: 'translateX(0)' },
      '& .task-icon-wrap': { transform: 'scale(1.08)' },
    },
  };
});

/* ── Task Icon Avatar ── */
const TaskIconAvatar = styled(Avatar)(({ palettekey = 'indigo', theme }) => {
  const pal = PALETTE[palettekey] || PALETTE.indigo;
  const isDark = theme.palette.mode === 'dark';
  return {
    width: 46,
    height: 46,
    borderRadius: RADIUS.sm,
    background: isDark
      ? `linear-gradient(135deg, ${alpha(pal.solid, 0.2)}, ${alpha(pal.dark, 0.12)})`
      : `linear-gradient(135deg, ${pal.light}, ${alpha(pal.solid, 0.1)})`,
    color: pal.solid,
    flexShrink: 0,
    transition: 'transform 0.25s ease',
  };
});

/* ── Pill Badges ── */
const TypeBadge = styled(Box)(({ palettekey = 'indigo', theme }) => {
  const pal = PALETTE[palettekey] || PALETTE.indigo;
  const isDark = theme.palette.mode === 'dark';
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 6,
    fontWeight: 700,
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
    background: isDark ? alpha(pal.solid, 0.15) : pal.light,
    color: isDark ? alpha(pal.solid, 1) : pal.solid,
    border: `1px solid ${isDark ? alpha(pal.solid, 0.2) : alpha(pal.solid, 0.12)}`,
  };
});

const StatusBadge = styled(Box)(({ statuscolor, statusbg, theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '3px 10px',
  borderRadius: 6,
  fontWeight: 700,
  fontSize: '0.68rem',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  whiteSpace: 'nowrap',
  background: statusbg,
  color: statuscolor,
  border: `1px solid ${alpha(statuscolor, 0.15)}`,
}));

const DueDateBadge = styled(Box)(({ theme, isoverdue }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 6,
    fontWeight: 600,
    fontSize: '0.72rem',
    whiteSpace: 'nowrap',
    background: isoverdue === 'true'
      ? isDark ? alpha(PALETTE.rose.solid, 0.15) : PALETTE.rose.light
      : isDark ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
    color: isoverdue === 'true'
      ? PALETTE.rose.solid
      : theme.palette.text.secondary,
    border: `1px solid ${isoverdue === 'true'
      ? alpha(PALETTE.rose.solid, 0.2)
      : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
  };
});

/* ── Super User Search ── */
const SuperUserSearch = styled(TextField)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: RADIUS.sm,
      background: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(8px)',
      color: '#fff',
      fontSize: '0.85rem',
      height: 40,
      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
      '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.5)', borderWidth: 1 },
    },
    '& input': { color: '#fff', fontWeight: 500 },
    '& input::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 },
    width: 220,
  };
});

// ─── Circular Progress Ring Component ──────────────────────────────────────────
function ProgressRing({ value, max, size = 44, stroke = 4, color = PALETTE.indigo.solid }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? (value / max) : 0;
  const dashOffset = circumference * (1 - pct);

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius}
          fill="none" stroke="rgba(128,128,128,0.12)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)' }} />
      </svg>
      <Typography sx={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: size * 0.28, color, lineHeight: 1,
      }}>
        {value}
      </Typography>
    </Box>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(v) {
  if (!v) return '—';
  try {
    const d = new Date(v);
    return isNaN(d) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch { return '—'; }
}

function timeAgo(v) {
  if (!v) return '';
  try {
    const diff = new Date() - new Date(v);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return `${Math.abs(days)}d left`;
    if (days === 0) return 'Today';
    if (days === 1) return '1d ago';
    return `${days}d overdue`;
  } catch { return ''; }
}

function isOverdue(v) {
  if (!v) return false;
  try { return new Date(v) < new Date(); } catch { return false; }
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const REFRESH_S = 60;
const TAB_TYPES = [null, 'CHECKLIST', 'MEETING', 'TICKET', 'AUDIT'];

// ─── Type Config ──────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  CHECKLIST: { label: 'Checklist', palette: 'rose',    icon: <ChecklistRtlIcon sx={{ fontSize: 22 }} /> },
  MEETING:   { label: 'Meeting',   palette: 'emerald', icon: <GroupsIcon sx={{ fontSize: 22 }} /> },
  TICKET:    { label: 'Ticket',    palette: 'indigo',  icon: <ConfirmationNumberIcon sx={{ fontSize: 22 }} /> },
  AUDIT:     { label: 'Audit',     palette: 'amber',   icon: <PolicyIcon sx={{ fontSize: 22 }} /> },
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserTaskQueue() {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState(0);
  const [countdown, setCountdown]   = useState(REFRESH_S);

  const [targetUserId, setTargetUserId] = useState('');
  const [activeUserId, setActiveUserId] = useState('');
  const [isSuperUser,  setIsSuperUser]  = useState(false);
  const [initialized,  setInitialized]  = useState(false);

  const timerRef = useRef(null);

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user && !initialized) {
      const uid = user.id || user.userId || user.email || user.empCode || '';
      if (uid) {
        setTargetUserId(uid);
        setActiveUserId(uid);
        setInitialized(true);
        const roles = String(user.roles || user.role || '').toLowerCase();
        if (roles.includes('admin') || roles.includes('super') || user.isSuperUser || user.bosSuperUser) {
          setIsSuperUser(true);
        }
      }
    }
  }, [user, initialized]);

  const userName = (user?.name || user?.firstName || 'User').split(' ')[0];

  // ── Normalise ─────────────────────────────────────────────────────────────
  const normalise = useCallback((cl, mom, tk, audit) => {
    const out = [];
    const sid = String(activeUserId || '').toLowerCase();

    (cl || []).forEach(a => {
      const st = a.status?.name || a.status?.statusName || 'Pending';
      if (['Completed','Verified','Approved','Closed'].includes(st)) return;
      out.push({ id:`cl-${a.id}`, type:'CHECKLIST',
        title: a.checklist?.checkingPoint || a.checklist?.description || `Checklist #${a.id}`,
        desc: a.checklist?.category || 'General',
        status: st, dueDate: a.checklistDate || a.assignedDate,
        assignedBy: a.assignedBy || 'System', link:'/qms/checklist/assignment' });
    });

    (mom || []).forEach(action => {
      const raw = typeof action.assignedTo === 'object'
        ? (action.assignedTo?.empCode || action.assignedTo?.userId || action.assignedTo?.empId || '')
        : (action.assignedTo || '');
      if (!String(raw).toLowerCase().includes(sid)) return;
      const st = action.status || 'Open';
      if (['Approved','Cancelled','Closed'].includes(st)) return;
      out.push({ id:`mom-${action.id}`, type:'MEETING',
        title: action.discussedPoint || `MOM Action #${action.id}`,
        desc: action.momNo ? `MOM: ${action.momNo}` : 'Meeting Action',
        status: st, dueDate: action.targetDate,
        assignedBy: action.assignedBy || 'Organizer', link:'/qms/mom/action-review' });
    });

    (tk || []).forEach(t => {
      if (!String(t.assignedTo || '').toLowerCase().includes(sid)) return;
      const st = t.ticketStatus || 'Open';
      if (['Closed','Resolved'].includes(st)) return;
      out.push({ id:`tk-${t.rowId}`, type:'TICKET',
        title: t.title || t.ticketId || `Ticket ${t.rowId}`,
        desc: t.description ? String(t.description).replace(/<[^>]+>/g,'').substring(0,60)+'…' : 'Support Ticket',
        status: st, dueDate: t.dueDate || t.targetDate,
        assignedBy: t.assignedBy || 'User', link:'/admin/ticket-management' });
    });

    (audit || []).forEach(a => {
      const auditee = String(a.auditee || '').toLowerCase();
      const auditor = String(a.auditor || '').toLowerCase();
      if (!auditee.includes(sid) && !auditor.includes(sid)) return;
      const st = a.status || 'Pending';
      if (['Closed','Completed','Approved'].includes(st)) return;
      out.push({ id:`audit-${a.id}`, type:'AUDIT',
        title: `Audit Schedule ${a.scheduleNo || ''}`,
        desc: a.auditArea || a.auditType || 'Scheduled Audit',
        status: st, dueDate: a.auditDate || a.scheduleDate,
        assignedBy: a.createdBy || 'System', link:'/qms/AuditSchedule' });
    });

    return out.sort((a,b) => {
      const ao = isOverdue(a.dueDate) ? -1 : 0, bo = isOverdue(b.dueDate) ? -1 : 0;
      if (ao !== bo) return ao - bo;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [activeUserId]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async (silent = false) => {
    if (!activeUserId) return;
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const [r1,r2,r3,r4] = await Promise.allSettled([
        axios.get('/api/qms/checklist/assignments', { params:{ assignedTo:activeUserId, excludeCompleted:true, size:200, page:0 } }),
        axios.get('/api/qms/moms/actions'),
        axios.get('/api/tickets'),
        axios.get('/api/qms/audit-schedules'),
      ]);
      setTasks(normalise(
        r1.status==='fulfilled' ? (r1.value.data?.content || r1.value.data || []) : [],
        r2.status==='fulfilled' ? (r2.value.data || []) : [],
        r3.status==='fulfilled' ? (r3.value.data || []) : [],
        r4.status==='fulfilled' ? (r4.value.data || []) : [],
      ));
      setCountdown(REFRESH_S);
    } catch(e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [activeUserId, normalise]);

  useEffect(() => { if (initialized && activeUserId) fetchData(); }, [activeUserId, initialized, fetchData]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(p => { if (p <= 1) { fetchData(true); return REFRESH_S; } return p - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [fetchData]);

  // ── Counts ────────────────────────────────────────────────────────────────
  const counts = {
    CHECKLIST: tasks.filter(t=>t.type==='CHECKLIST').length,
    MEETING:   tasks.filter(t=>t.type==='MEETING').length,
    TICKET:    tasks.filter(t=>t.type==='TICKET').length,
    AUDIT:     tasks.filter(t=>t.type==='AUDIT').length,
  };
  const visibleTasks = activeTab === 0 ? tasks : tasks.filter(t => t.type === TAB_TYPES[activeTab]);

  const overdueCount = tasks.filter(t =>
    isOverdue(t.dueDate) && !['Closed','Resolved','Approved','Completed'].includes(t.status)
  ).length;

  const pctCountdown = (countdown / REFRESH_S) * 100;

  const isViewingOther = activeUserId !== (user?.id || user?.userId || user?.email || user?.empCode);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <PageRoot>

      {/* ── Refreshing overlay ── */}
      {refreshing && (
        <LinearProgress
          sx={{ position:'fixed', top:0, left:0, right:0, zIndex:9999,
            '& .MuiLinearProgress-bar': { background:'linear-gradient(90deg,#6366F1,#8B5CF6,#6366F1)', backgroundSize:'200% 100%', animation:`${shimmer} 1.5s linear infinite` },
            background:'transparent', height:2.5, borderRadius:0 }}
        />
      )}

      {/* ═══════════════════════════════════════ HERO BANNER ═══════════════════ */}
      <HeroBanner>
        <Stack direction={{ xs:'column', md:'row' }} justifyContent="space-between" alignItems={{ xs:'flex-start', md:'center' }} gap={3}>

          {/* Left: Greeting area */}
          <Box sx={{ position:'relative', zIndex:1 }}>
            <Typography sx={{ fontSize:'0.82rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.12em', opacity:0.7, mb:0.75 }}>
              {getGreeting()}
            </Typography>
            <Typography sx={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight:800, lineHeight:1.15, mb:1.5, display:'flex', alignItems:'center', gap:1.5 }}>
              {userName}'s Dashboard
              <WavingHandIcon sx={{ fontSize: isMobile ? 26 : 32, animation:`${waveHand} 2.5s ease-in-out 0.5s both`, display:'inline-block', transformOrigin:'70% 70%' }} />
            </Typography>
            <Stack direction="row" alignItems="center" gap={1} sx={{ opacity:0.75, mb:2 }}>
              <CalendarTodayIcon sx={{ fontSize:14 }} />
              <Typography variant="body2" sx={{ fontWeight:500, fontSize:'0.82rem' }}>
                {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
              </Typography>
            </Stack>

            {/* Stat bubbles */}
            <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
              <StatBubble>
                <DashboardRoundedIcon sx={{ fontSize:16 }} />
                <Typography variant="body2" sx={{ fontWeight:700, fontSize:'0.82rem' }}>
                  {tasks.length} Pending
                </Typography>
              </StatBubble>
              {overdueCount > 0 && (
                <StatBubble sx={{
                  background:'rgba(244,63,94,0.2)',
                  border:'1px solid rgba(244,63,94,0.35)',
                  animation:`${pulseGlow} 2s ease-in-out infinite`,
                  animationName: pulseGlow,
                  '@keyframes pulseGlow': {
                    '0%, 100%': { boxShadow: '0 0 0 0 rgba(244,63,94,0.4)' },
                    '50%': { boxShadow: '0 0 0 6px rgba(244,63,94,0)' },
                  },
                }}>
                  <WarningAmberRoundedIcon sx={{ fontSize:16, color:'#FCA5A5' }} />
                  <Typography variant="body2" sx={{ fontWeight:700, fontSize:'0.82rem' }}>
                    {overdueCount} Overdue
                  </Typography>
                </StatBubble>
              )}
              {isViewingOther && (
                <StatBubble sx={{ background:'rgba(14,165,233,0.2)', border:'1px solid rgba(14,165,233,0.35)' }}>
                  <PersonSearchRoundedIcon sx={{ fontSize:16 }} />
                  <Typography variant="body2" sx={{ fontWeight:600, fontSize:'0.8rem' }}>
                    Viewing: {activeUserId}
                  </Typography>
                </StatBubble>
              )}
            </Stack>
          </Box>

          {/* Right: Controls */}
          <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap" sx={{ position:'relative', zIndex:1 }}>
            {isSuperUser && (
              <Tooltip title="Enter Employee ID and press Enter" placement="top" arrow>
                <SuperUserSearch
                  size="small"
                  placeholder="Search user ID…"
                  value={targetUserId}
                  onChange={e => setTargetUserId(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && targetUserId.trim()) setActiveUserId(targetUserId.trim()); }}
                  InputProps={{ startAdornment:(
                    <InputAdornment position="start">
                      <PersonSearchRoundedIcon sx={{ fontSize:18, color:'rgba(255,255,255,0.5)' }} />
                    </InputAdornment>
                  ) }}
                />
              </Tooltip>
            )}

            {/* Countdown ring */}
            <Tooltip title={`Auto-refresh in ${countdown}s`} placement="top" arrow>
              <Box sx={{ display:'flex', alignItems:'center', gap:1,
                background:'rgba(255,255,255,0.1)', borderRadius: RADIUS.sm,
                px:1.5, py:0.5, border:'1px solid rgba(255,255,255,0.12)' }}>
                <Box sx={{ position:'relative', width:28, height:28 }}>
                  <svg width={28} height={28} style={{ transform:'rotate(-90deg)' }}>
                    <circle cx={14} cy={14} r={11} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={2.5} />
                    <circle cx={14} cy={14} r={11} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={2.5}
                      strokeDasharray={2 * Math.PI * 11}
                      strokeDashoffset={2 * Math.PI * 11 * (1 - countdown / REFRESH_S)}
                      strokeLinecap="round"
                      style={{ transition:'stroke-dashoffset 1s linear' }} />
                  </svg>
                  <Typography sx={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'0.6rem', fontWeight:800, color:'rgba(255,255,255,0.9)' }}>
                    {countdown}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>

            <IconButton
              onClick={() => fetchData(false)}
              disabled={loading}
              sx={{
                background:'rgba(255,255,255,0.12)',
                border:'1px solid rgba(255,255,255,0.15)',
                color:'#fff', width:40, height:40, borderRadius: RADIUS.sm,
                '&:hover': { background:'rgba(255,255,255,0.22)', transform:'scale(1.05)' },
                transition:'all 0.2s ease',
              }}
            >
              <RefreshRoundedIcon sx={{ fontSize:20, animation: refreshing ? `${spin} 1s linear infinite` : 'none' }} />
            </IconButton>
          </Stack>
        </Stack>
      </HeroBanner>

      {/* ═══════════════════════════════════ METRIC CARDS ═══════════════════════ */}
      <Grid container spacing={2} sx={{ mb:3 }}>
        {[
          { key:'total',     label:'All Tasks',  value:tasks.length,     palette:'indigo',  icon:<NotificationsActiveIcon sx={{ fontSize:24 }} />, tab:0 },
          { key:'checklist', label:'Checklists',  value:counts.CHECKLIST, palette:'rose',    icon:<ChecklistRtlIcon sx={{ fontSize:24 }} />, tab:1 },
          { key:'meeting',   label:'Meetings',    value:counts.MEETING,   palette:'emerald', icon:<GroupsIcon sx={{ fontSize:24 }} />, tab:2 },
          { key:'ticket',    label:'Tickets',     value:counts.TICKET,    palette:'sky',     icon:<ConfirmationNumberIcon sx={{ fontSize:24 }} />, tab:3 },
          { key:'audit',     label:'Audits',      value:counts.AUDIT,     palette:'amber',   icon:<PolicyIcon sx={{ fontSize:24 }} />, tab:4 },
        ].map((m, i) => (
          <Grid item xs={6} sm={4} md={2.4} key={m.key}>
            <Fade in timeout={500} style={{ transitionDelay:`${i*80}ms` }}>
              <GlassCard
                palettekey={m.palette}
                selected={activeTab === m.tab}
                onClick={() => setActiveTab(m.tab)}
                sx={{ animation:`${slideUp} 0.5s cubic-bezier(0.22,1,0.36,1) both`, animationDelay:`${i*80}ms` }}
              >
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb:2 }}>
                  <MetricIconWrap palettekey={m.palette}>
                    {m.icon}
                  </MetricIconWrap>
                  {!loading && (
                    <ProgressRing
                      value={m.value}
                      max={Math.max(tasks.length, 1)}
                      size={42}
                      stroke={3.5}
                      color={PALETTE[m.palette].solid}
                    />
                  )}
                </Stack>
                {loading
                  ? <Skeleton width={56} height={38} sx={{ borderRadius:2 }} />
                  : <Typography sx={{ fontSize:'2rem', fontWeight:800, lineHeight:1, letterSpacing:'-0.03em', color:'text.primary', mb:0.5 }}>
                      {m.value}
                    </Typography>
                }
                <Typography variant="body2" sx={{
                  fontWeight:600, color:'text.secondary', textTransform:'uppercase',
                  letterSpacing:'0.08em', fontSize:'0.68rem',
                }}>
                  {m.label}
                </Typography>
              </GlassCard>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* ═══════════════════════════════════════ FILTER BAR ═══════════════════ */}
      <FilterBar>
        <FilterListRoundedIcon sx={{ fontSize:18, color:'text.disabled', ml:1, mr:0.5 }} />
        {[
          { label:'All', icon:<DashboardRoundedIcon sx={{ fontSize:16 }} />, count:tasks.length, tab:0 },
          { label:'Checklists', icon:<ChecklistRtlIcon sx={{ fontSize:16 }} />, count:counts.CHECKLIST, tab:1 },
          { label:'Meetings', icon:<GroupsIcon sx={{ fontSize:16 }} />, count:counts.MEETING, tab:2 },
          { label:'Tickets', icon:<ConfirmationNumberIcon sx={{ fontSize:16 }} />, count:counts.TICKET, tab:3 },
          { label:'Audits', icon:<PolicyIcon sx={{ fontSize:16 }} />, count:counts.AUDIT, tab:4 },
        ].map(f => (
          <FilterChip
            key={f.tab}
            active={activeTab === f.tab ? 1 : 0}
            onClick={() => setActiveTab(f.tab)}
          >
            {f.icon}
            {f.label}
            <Box component="span" sx={{
              display:'inline-flex', alignItems:'center', justifyContent:'center',
              minWidth:20, height:18, borderRadius:9, px:0.6,
              fontSize:'0.65rem', fontWeight:800,
              background: activeTab === f.tab
                ? alpha(PALETTE.indigo.solid, 0.15)
                : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              color: activeTab === f.tab ? PALETTE.indigo.solid : 'inherit',
            }}>
              {f.count}
            </Box>
          </FilterChip>
        ))}
      </FilterBar>

      {/* ═══════════════════════════════════ TASK LIST ════════════════════════ */}
      {/* Column header */}
      {!loading && visibleTasks.length > 0 && (
        <Stack direction="row" alignItems="center" sx={{
          px:3, pb:1, pt:0.5, opacity:0.5,
          animation:`${fadeIn} 0.5s ease-out`,
        }}>
          <Typography sx={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', flex:1, ml:7.5 }}>
            Task
          </Typography>
          <Stack direction="row" gap={1} sx={{ flexShrink:0 }}>
            <Typography sx={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', width:100, textAlign:'center' }}>
              Due Date
            </Typography>
            <Typography sx={{ fontSize:'0.68rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', width:90, textAlign:'center' }}>
              Status
            </Typography>
            <Box sx={{ width:24 }} />
          </Stack>
        </Stack>
      )}

      <Box>
        {loading ? (
          Array.from({ length:6 }).map((_,i) => (
            <TaskCard key={i} isoverdue="false" taskpalette="slate" sx={{ animationDelay:`${i*70}ms` }}>
              <Skeleton variant="rounded" width={46} height={46} sx={{ borderRadius:`${RADIUS.sm}px`, flexShrink:0 }} />
              <Box flex={1}>
                <Skeleton width="50%" height={20} sx={{ mb:0.75, borderRadius:1 }} />
                <Stack direction="row" gap={1}>
                  <Skeleton width={70} height={18} sx={{ borderRadius:1 }} />
                  <Skeleton width={90} height={18} sx={{ borderRadius:1 }} />
                </Stack>
              </Box>
              <Stack direction="row" gap={1}>
                <Skeleton width={90} height={26} sx={{ borderRadius:1.5 }} />
                <Skeleton width={80} height={26} sx={{ borderRadius:1.5 }} />
              </Stack>
            </TaskCard>
          ))
        ) : visibleTasks.length === 0 ? (
          <Box sx={{
            textAlign:'center', py:10,
            animation:`${slideUp} 0.5s cubic-bezier(0.22,1,0.36,1)`,
          }}>
            <Box sx={{
              width:88, height:88, borderRadius:'50%', mx:'auto', mb:3,
              display:'flex', alignItems:'center', justifyContent:'center',
              background: theme.palette.mode === 'dark'
                ? 'rgba(16,185,129,0.1)' : alpha(PALETTE.emerald.solid, 0.08),
              animation:`${float} 3s ease-in-out infinite`,
            }}>
              <CheckCircleRoundedIcon sx={{
                fontSize:48, color:PALETTE.emerald.solid,
                filter:`drop-shadow(0 4px 16px ${PALETTE.emerald.glow})`,
              }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight:800, mb:1, color:'text.primary' }}>All Clear!</Typography>
            <Typography color="text.secondary" sx={{ fontSize:'0.92rem' }}>
              No pending tasks in this category. You're all caught up!
            </Typography>
          </Box>
        ) : (
          visibleTasks.map((task, i) => {
            const overdue = isOverdue(task.dueDate) && !['Closed','Resolved','Approved','Completed'].includes(task.status);
            const cfg   = TYPE_CONFIG[task.type] || TYPE_CONFIG.TICKET;
            const pal   = PALETTE[cfg.palette];

            const statusColor = overdue ? PALETTE.rose.solid
              : task.status === 'In Progress' ? PALETTE.emerald.solid
              : task.status === 'Assigned'    ? PALETTE.indigo.solid
              : PALETTE.amber.solid;
            const statusBg = overdue
              ? (theme.palette.mode === 'dark' ? alpha(PALETTE.rose.solid, 0.15) : PALETTE.rose.light)
              : task.status === 'In Progress'
                ? (theme.palette.mode === 'dark' ? alpha(PALETTE.emerald.solid, 0.15) : PALETTE.emerald.light)
              : task.status === 'Assigned'
                ? (theme.palette.mode === 'dark' ? alpha(PALETTE.indigo.solid, 0.15) : PALETTE.indigo.light)
              : (theme.palette.mode === 'dark' ? alpha(PALETTE.amber.solid, 0.15) : PALETTE.amber.light);
            const statusIcon = overdue
              ? <ErrorRoundedIcon sx={{ fontSize:11 }} />
              : task.status === 'In Progress' ? <PlayArrowRoundedIcon sx={{ fontSize:11 }} />
              : task.status === 'Assigned'    ? <AssignmentIndIcon sx={{ fontSize:11 }} />
              : <AccessTimeFilledIcon sx={{ fontSize:11 }} />;

            return (
              <TaskCard
                key={task.id}
                isoverdue={String(overdue)}
                taskpalette={cfg.palette}
                onClick={() => navigate(task.link)}
                sx={{ animationDelay:`${i * 50}ms` }}
              >

                {/* Icon */}
                <TaskIconAvatar className="task-icon-wrap" palettekey={cfg.palette}>
                  {cfg.icon}
                </TaskIconAvatar>

                {/* Title + meta */}
                <Box flex={1} minWidth={0}>
                  <Typography sx={{ fontWeight:700, fontSize:'0.92rem', color:'text.primary',
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', mb:0.5,
                    lineHeight:1.3 }}>
                    {task.title}
                  </Typography>
                  <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                    <TypeBadge palettekey={cfg.palette}>
                      {cfg.label}
                    </TypeBadge>
                    <Typography variant="caption" sx={{ color:'text.secondary', display:'flex', alignItems:'center', gap:0.5, fontSize:'0.72rem' }}>
                      <AssignmentIndIcon sx={{ fontSize:12, opacity:0.7 }} />{task.assignedBy}
                    </Typography>
                    <Typography variant="caption" sx={{ color:'text.disabled', fontSize:'0.72rem' }}>
                      {task.desc}
                    </Typography>
                  </Stack>
                </Box>

                {/* Badges */}
                <Stack direction="row" alignItems="center" gap={1} flexShrink={0}>
                  <DueDateBadge isoverdue={String(overdue)}>
                    <TodayIcon sx={{ fontSize:12 }} />
                    {fmtDate(task.dueDate)}
                  </DueDateBadge>
                  <StatusBadge statuscolor={statusColor} statusbg={statusBg}>
                    {statusIcon}
                    {overdue ? 'Overdue' : task.status}
                  </StatusBadge>
                  <ArrowForwardRoundedIcon className="task-arrow"
                    sx={{ fontSize:18, color:'text.disabled', opacity:0,
                      transform:'translateX(-8px)', transition:'all 0.25s ease' }} />
                </Stack>
              </TaskCard>
            );
          })
        )}
      </Box>

      {/* ── Footer summary ── */}
      {!loading && visibleTasks.length > 0 && (
        <Stack direction="row" justifyContent="center" alignItems="center" gap={1.5} sx={{
          mt:2, py:2, opacity:0.5,
          animation:`${fadeIn} 0.6s ease-out 0.3s both`,
        }}>
          <ScheduleRoundedIcon sx={{ fontSize:14 }} />
          <Typography sx={{ fontSize:'0.75rem', fontWeight:600, letterSpacing:'0.04em' }}>
            Showing {visibleTasks.length} of {tasks.length} tasks • Auto-refresh in {countdown}s
          </Typography>
        </Stack>
      )}

    </PageRoot>
  );
}
