import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Stack, useTheme,
  Skeleton, Avatar, IconButton, Chip, Tabs, Tab,
  TextField, InputAdornment, Tooltip, Fade, LinearProgress, Divider,
  Badge, CircularProgress, useMediaQuery, Paper, MenuItem, Select, FormControl, Autocomplete, Collapse,
} from '@mui/material';
import { styled, alpha, keyframes, useColorScheme, ThemeProvider, createTheme } from '@mui/material/styles';
import axios from 'utils/axios';
import useAuth from 'hooks/useAuth';
import useConfig from 'hooks/useConfig';
import { getUserImageUrl } from 'utils/api-base';
import { useLookups } from 'hooks/useLookups';

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
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';

// ─── Keyframes ────────────────────────────────────────────────────────────────
const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const floatInWater = keyframes`
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-6px); }
  100% { transform: translateY(0px); }
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

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-15px); }
  60% { transform: translateY(-7px); }
`;

// ─── Design System ────────────────────────────────────────────────────────────
const PALETTE = {
  indigo: { solid: '#6366F1', light: '#EEF2FF', dark: '#4338CA', glow: 'rgba(99,102,241,0.3)' },
  rose: { solid: '#F43F5E', light: '#FFF1F2', dark: '#BE123C', glow: 'rgba(244,63,94,0.3)' },
  emerald: { solid: '#10B981', light: '#ECFDF5', dark: '#047857', glow: 'rgba(16,185,129,0.3)' },
  amber: { solid: '#F59E0B', light: '#FFFBEB', dark: '#B45309', glow: 'rgba(245,158,11,0.3)' },
  violet: { solid: '#8B5CF6', light: '#F5F3FF', dark: '#6D28D9', glow: 'rgba(139,92,246,0.3)' },
  sky: { solid: '#0EA5E9', light: '#F0F9FF', dark: '#0369A1', glow: 'rgba(14,165,233,0.3)' },
  slate: { solid: '#64748B', light: '#F8FAFC', dark: '#334155', glow: 'rgba(100,116,139,0.3)' },
};

const RADIUS = { xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 28 };

// ─── Styled Components ────────────────────────────────────────────────────────

const PageRoot = styled(Box, { shouldForwardProp: (p) => p !== 'isDark' })(({ theme, isDark }) => ({
  minHeight: '100vh',
  background: isDark
    ? 'linear-gradient(160deg, #0B0F1A 0%, #111827 40%, #0F172A 100%)'
    : 'linear-gradient(160deg, #F8FAFF 0%, #EFF4FF 40%, #F1F5F9 100%)',
  padding: theme.spacing(2.5),
  [theme.breakpoints.up('md')]: { padding: theme.spacing(3.5) },
}));

/* ── Hero Banner ── */
const HeroBanner = styled(Box, { shouldForwardProp: (p) => p !== 'isDark' })(({ theme, isDark }) => ({
  borderRadius: RADIUS.md,
  padding: theme.spacing(2, 3),
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(2.5),
  animation: `${slideUp} 0.6s cubic-bezier(0.22,1,0.36,1)`,
  background: isDark
    ? 'linear-gradient(168deg, #0F172A 40%, #991B1B 100%)'
    : 'linear-gradient(168deg, #def7e1ff 40%, #0d7ba7ff 100%)',
  border: isDark
    ? '1px solid rgba(255,255,255,0.08)'
    : '1px solid rgba(226,232,240, 1)',
  color: isDark ? '#F8FAFC' : '#0F172A',
  boxShadow: isDark
    ? '0 10px 30px -10px rgba(0,0,0,0.5)'
    : '0 10px 30px -10px rgba(0,0,0,0.05)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    background: isDark
      ? 'radial-gradient(circle at 100% 50%, rgba(56,189,248,0.1) 0%, transparent 60%)'
      : 'radial-gradient(circle at 100% 50%, rgba(56,189,248,0.08) 0%, transparent 60%)',
    pointerEvents: 'none',
  }
}));

/* ── Stat Summary Card (inside banner) ── */
const StatBubble = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === 'dark';
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
    borderRadius: RADIUS.sm,
    padding: '6px 14px',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
    transition: 'all 0.2s ease',
    cursor: 'default',
    color: isDark ? '#E2E8F0' : '#475569',
    '&:hover': {
      background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
    },
  };
});

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
  background: isDark
    ? 'rgba(17,24,39,0.5)'
    : 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(16px)',
  border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
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



// ─── Circular Progress Ring Component ──────────────────────────────────────────
function ProgressRing({ value, max, size = 44, stroke = 4, color = PALETTE.indigo.solid }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? (value / max) : 0;
  const dashOffset = circumference * (1 - pct);

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(128,128,128,0.12)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius}
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
  if (h < 12) return 'Good Morning!';
  if (h < 17) return 'Good Afternoon!';
  return 'Good Evening!';
}

const REFRESH_S = 60;
const TAB_TYPES = [null, 'CHECKLIST', 'MEETING', 'TICKET', 'AUDIT'];

// ─── Type Config ──────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  CHECKLIST: { label: 'Checklist', palette: 'rose', icon: <ChecklistRtlIcon sx={{ fontSize: 22 }} /> },
  MEETING: { label: 'Meeting', palette: 'emerald', icon: <GroupsIcon sx={{ fontSize: 22 }} /> },
TICKET: { label: 'Ticket', palette: 'indigo', icon: <ConfirmationNumberIcon sx={{ fontSize: 22 }} /> },
  AUDIT: { label: 'Audit', palette: 'amber', icon: <PolicyIcon sx={{ fontSize: 22 }} /> },
};

// ─── Metric Card Component ─────────────────────────────────────────────────
const DashboardMetricCard = ({ moduleName, count, icon, paletteKey, theme, isDark, active, index = 0, onClick }) => {
  const pal = PALETTE[paletteKey] || PALETTE.indigo;
  const floatDelay = `${(index * 0.4)}s`;

  return (
    <Paper
      onClick={onClick}
      sx={{
        borderRadius: 4,
        p: 3,
        cursor: 'pointer',
        bgcolor: isDark ? '#1E293B' : '#fff',
        boxShadow: active
          ? `0 12px 30px ${alpha(pal.solid, 0.4)}, 0 4px 10px ${alpha(pal.solid, 0.15)}`
          : isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.03)',
        border: active ? `1px solid ${pal.solid}` : (isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent'),
        position: 'relative',
        animation: `${floatInWater} 4s ease-in-out infinite`,
        animationDelay: floatDelay,
        transition: 'transform 0.2s, box-shadow 0.2s, border 0.2s',
        '&:hover': {
          animationPlayState: 'paused',
          transform: 'scale(1.03) translateY(-4px)',
          borderColor: pal.solid,
          boxShadow: active
            ? `0 15px 40px ${alpha(pal.solid, 0.6)}, 0 8px 20px ${alpha(pal.solid, 0.3)}`
            : (isDark ? `0 8px 25px ${alpha(pal.solid, 0.2)}` : `0 12px 30px ${alpha(pal.solid, 0.2)}`)
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
        <Box sx={{ position: 'relative' }}>
          {/* Icon Box */}
          <Box sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(pal.solid, 0.1),
            color: pal.solid
          }}>
            {icon || <DashboardRoundedIcon sx={{ fontSize: 28 }} />}
          </Box>
          {/* Badge */}
          <Box sx={{
            position: 'absolute',
            top: -6,
            right: -12,
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: isDark ? '#1E293B' : '#fff',
            border: `2px solid ${isDark ? '#334155' : '#f1f5f9'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: pal.solid,
            fontWeight: 700,
            fontSize: '0.75rem'
          }}>
            {count || 0}
          </Box>
        </Box>
      </Box>
      <Typography variant="h3" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5, fontSize: '2rem' }}>
        {count || 0}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {moduleName}
      </Typography>
    </Paper>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserTaskQueue() {
  const baseTheme = useTheme();
  const colorSchemeObj = useColorScheme() || {};
  const mode = colorSchemeObj.mode || colorSchemeObj.colorScheme || 'light';
  const isDark = mode === 'dark' || baseTheme.palette.mode === 'dark';
  const theme = React.useMemo(() => ({
    ...baseTheme,
    palette: { ...baseTheme.palette, mode: mode || 'light' }
  }), [baseTheme, mode]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [countdown, setCountdown] = useState(REFRESH_S);

  const [targetUserId, setTargetUserId] = useState('');
  const [activeUserId, setActiveUserId] = useState('');
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [isBosSuper, setIsBosSuper] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [pageAuths, setPageAuths] = useState([]);

  const { departments = [], designations = [], levels = [] } = useLookups(['DEPARTMENTS', 'DESIGNATIONS', 'LEVELS']);

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
        if (roles.includes('admin') || roles.includes('super') || user.isSuperUser || user.isBosAdmin === 1) {
          setIsSuperUser(true);
        }
        if (user.isBosAdmin === 1) {
          setIsBosSuper(true);
          axios.get('/api/users/all').then(res => setAllUsers(res.data || [])).catch(e => console.error(e));
        }

        axios.get('/api/master/employee').then(res => setAllEmployees(res.data || [])).catch(e => console.error(e));
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
      if (['Completed', 'Verified', 'Approved', 'Closed'].includes(st)) return;
      out.push({
        id: `cl-${a.id}`, type: 'CHECKLIST',
        title: a.checklist?.checkingPoint || a.checklist?.description || `Checklist #${a.id}`,
        desc: a.checklist?.category || 'General',
        status: st, dueDate: a.checklistDate || a.assignedDate,
        assignedBy: a.assignedBy || 'System', link: '/qms/checklist/assignment'
      });
    });

    (mom || []).forEach(action => {
      const raw = typeof action.assignedTo === 'object'
        ? (action.assignedTo?.empCode || action.assignedTo?.userId || action.assignedTo?.empId || '')
        : (action.assignedTo || '');
      if (!String(raw).toLowerCase().includes(sid)) return;
      const st = action.status || 'Open';
      if (['Approved', 'Cancelled', 'Closed'].includes(st)) return;
      out.push({
        id: `mom-${action.id}`, type: 'MEETING',
        title: action.discussedPoint || `MOM Action #${action.id}`,
        desc: action.momNo ? `MOM: ${action.momNo}` : 'Meeting Action',
        status: st, dueDate: action.targetDate,
        assignedBy: action.assignedBy || 'Organizer', link: '/qms/mom/action-review'
      });
    });

    (tk || []).forEach(t => {
      if (!String(t.assignedTo || '').toLowerCase().includes(sid)) return;
      const st = t.ticketStatus || 'Open';
      if (['Closed', 'Resolved'].includes(st)) return;
      out.push({
        id: `tk-${t.rowId}`, type: 'TICKET',
        title: t.title || t.ticketId || `Ticket ${t.rowId}`,
        desc: t.description ? String(t.description).replace(/<[^>]+>/g, '').substring(0, 60) + '…' : 'Support Ticket',
        status: st, dueDate: t.dueDate || t.targetDate,
        assignedBy: t.assignedBy || 'User', link: '/admin/ticket-management'
      });
    });

    (audit || []).forEach(a => {
      const auditee = String(a.auditee || '').toLowerCase();
      const auditor = String(a.auditor || '').toLowerCase();
      if (!auditee.includes(sid) && !auditor.includes(sid)) return;
      const st = a.status || 'Pending';
      if (['Closed', 'Completed', 'Approved'].includes(st)) return;
      out.push({
        id: `audit-${a.id}`, type: 'AUDIT',
        title: `Audit Schedule ${a.scheduleNo || ''}`,
        desc: a.auditArea || a.auditType || 'Scheduled Audit',
        status: st, dueDate: a.auditDate || a.scheduleDate,
        assignedBy: a.createdBy || 'System', link: '/qms/AuditSchedule'
      });
    });

    return out.sort((a, b) => {
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
      const [r1, r2, r3, r4, r5] = await Promise.allSettled([
        axios.get('/api/qms/checklist/assignments', { params: { assignedTo: activeUserId, excludeCompleted: true, size: 200, page: 0 } }),
        axios.get('/api/qms/moms/actions'),
        axios.get('/api/tickets'),
        axios.get('/api/qms/audit-schedules'),
        axios.get('/api/user-page-auth/' + activeUserId)
      ]);
      setTasks(normalise(
        r1.status === 'fulfilled' ? (r1.value.data?.content || r1.value.data || []) : [],
        r2.status === 'fulfilled' ? (r2.value.data || []) : [],
        r3.status === 'fulfilled' ? (r3.value.data || []) : [],
        r4.status === 'fulfilled' ? (r4.value.data || []) : [],
      ));
      if (r5.status === 'fulfilled') setPageAuths(r5.value.data || []);
      setCountdown(REFRESH_S);
    } catch (e) { console.error(e); }
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
    CHECKLIST: tasks.filter(t => t.type === 'CHECKLIST').length,
    MEETING: tasks.filter(t => t.type === 'MEETING').length,
    TICKET: tasks.filter(t => t.type === 'TICKET').length,
    AUDIT: tasks.filter(t => t.type === 'AUDIT').length,
  };
  const visibleTasks = activeTab === 0 ? tasks : tasks.filter(t => t.type === TAB_TYPES[activeTab]);

  const overdueCount = tasks.filter(t =>
    isOverdue(t.dueDate) && !['Closed', 'Resolved', 'Approved', 'Completed'].includes(t.status)
  ).length;

  const pctCountdown = (countdown / REFRESH_S) * 100;

  const isViewingOther = activeUserId !== (user?.id || user?.userId || user?.email || user?.empCode);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ThemeProvider theme={theme}>
      <PageRoot isDark={isDark}>

      {/* ── Refreshing overlay ── */}
      {refreshing && (
        <LinearProgress
          sx={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#6366F1,#8B5CF6,#6366F1)', backgroundSize: '200% 100%', animation: `${shimmer} 1.5s linear infinite` },
            background: 'transparent', height: 2.5, borderRadius: 0
          }}
        />
      )}

      {/* ═══════════════════════════════════════ HERO BANNER ═══════════════════ */}
      <HeroBanner isDark={isDark}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={3}>

          {/* Left: Greeting area */}
          {/* Left: Greeting area */}
          <Stack direction="row" alignItems="center" gap={2} sx={{ position: 'relative', zIndex: 1 }}>
            {(() => {
              const activeObj = allUsers.find(u => (u.userId || u.empCode) === activeUserId);
              const img = activeObj?.userImage || activeObj?.imgName || activeObj?.profilePic || (!isViewingOther ? (user?.userImage || user?.imgName) : null);
              return <Avatar src={img ? getUserImageUrl(img) : undefined} sx={{ width: 56, height: 56, border: isDark ? '2px solid rgba(255,255,255,0.1)' : '2px solid #E2E8F0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }} />;
            })()}

            <Box>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: isDark ? '#EAB308' : '#CA8A04' }}>
                  {getGreeting()}
                </Typography>
                <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: isDark ? '#475569' : '#CBD5E1' }} />
                <TodayIcon sx={{ fontSize: 13, color: isDark ? '#94A3B8' : '#64748B' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.7rem', color: isDark ? '#94A3B8' : '#64748B' }}>
                  {new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                <Typography sx={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: 800, lineHeight: 1.15, display: 'flex', alignItems: 'center', gap: 0.5, letterSpacing: '-0.02em' }}>
                  <Box component="span" sx={{ color: isDark ? '#38BDF8' : '#0EA5E9' }}>
                    {isViewingOther ? activeUserId : userName}'s
                  </Box> Workspace
                </Typography>

                {/* Stat bubbles */}
                <Stack direction="row" alignItems="center" gap={1}>
                  <StatBubble isDark={isDark} sx={{ py: 0.25, px: 1, minHeight: 26, background: '#f7df03ff' }}>
                    <DashboardRoundedIcon sx={{ fontSize: 14 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      {tasks.length} Pending
                    </Typography>
                  </StatBubble>
                  {overdueCount > 0 && (
                    <StatBubble isDark={isDark} sx={{
                      py: 0.25, px: 1, minHeight: 26,
                      background: 'rgba(244,63,94,0.15)',
                      border: '1px solid rgba(244,63,94,0.3)',
                      animation: `${pulseGlow} 2s ease-in-out infinite`,
                      animationName: pulseGlow,
                      '@keyframes pulseGlow': {
                        '0%, 100%': { boxShadow: '0 0 0 0 rgba(244,63,94,0.4)' },
                        '50%': { boxShadow: '0 0 0 6px rgba(244,63,94,0)' },
                      },
                    }}>
                      <WarningAmberRoundedIcon sx={{ fontSize: 14, color: '#F87171' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                        {overdueCount} Overdue
                      </Typography>
                    </StatBubble>
                  )}
                  {isViewingOther && (
                    <StatBubble isDark={isDark} sx={{ py: 0.25, px: 1, minHeight: 26, background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)' }}>
                      <PersonSearchRoundedIcon sx={{ fontSize: 14 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        Viewing: {activeUserId}
                      </Typography>
                    </StatBubble>
                  )}
                </Stack>
              </Stack>

              {(() => {
                const activeObj = allUsers.find(u => String(u.userId || u.empCode) === String(activeUserId)) || user || {};

                // Find matching employee record in master
                const empRecord = allEmployees.find(e =>
                  (e.id && activeObj.empId && String(e.id) === String(activeObj.empId)) ||
                  (e.id && activeObj.id && String(e.id) === String(activeObj.id)) ||
                  (e.empCode && activeObj.empCode && String(e.empCode) === String(activeObj.empCode)) ||
                  (e.id && String(e.id) === String(activeUserId)) ||
                  (e.empCode && String(e.empCode) === String(activeUserId))
                ) || {};

                // Resolve using lookups or fallback to populated names
                const getDesigName = (id, fallback) => String(designations.find(d => String(d.id) === String(id))?.designationName || fallback || '');
                const getDeptName = (id, fallback) => String(departments.find(d => String(d.id) === String(id))?.departmentName || fallback || '');
                const getLevelName = (id, fallback) => String(levels.find(l => String(l.rowId) === String(id))?.level || fallback || '');

                const desig = empRecord.designationId ? getDesigName(empRecord.designationId, empRecord.designationName || empRecord.designation) : (activeObj?.designation?.name || activeObj?.designation || empRecord.designationName || empRecord.designation || 'USER DESIGNATION');
                const dept = empRecord.departmentId ? getDeptName(empRecord.departmentId, empRecord.departmentName || empRecord.department) : (activeObj?.department?.name || activeObj?.department || empRecord.departmentName || empRecord.department || 'DEPARTMENT');
                const level = empRecord.empLevelId ? getLevelName(empRecord.empLevelId, empRecord.levelName || empRecord.level) : '';

                const combinedText = (level ? `${level} -` : '') + [desig, dept].filter(Boolean).join(' / ');

                return (
                  <Typography variant="body2" sx={{ fontSize: '0.65rem', fontWeight: 600, color: isDark ? '#94A3B8' : '#64748B', mt: 0.5, textTransform: 'uppercase' }}>
                    {combinedText}
                  </Typography>
                );
              })()}
            </Box>
          </Stack>

          {/* Right: Controls */}
          <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap" sx={{ position: 'relative', zIndex: 1 }}>
            {isBosSuper && (
              <Autocomplete
                size="small"
                freeSolo
                options={allUsers}
                value={allUsers.find(u => (u.userId || u.empCode) === activeUserId) || activeUserId || null}
                getOptionLabel={(option) => typeof option === 'string' ? option : `${option.firstName || ''} ${option.lastName || ''} (${option.userId || option.empCode || ''})`}
                onChange={(e, val) => {
                  if (!val) {
                    const uid = user?.id || user?.userId || user?.email || user?.empCode || '';
                    if (uid) setActiveUserId(uid);
                  } else {
                    const id = typeof val === 'object' && val !== null ? (val.userId || val.empCode) : val;
                    if (id) setActiveUserId(id);
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Search User ID..." sx={{
                    minWidth: 240,
                    '& .MuiOutlinedInput-root': {
                      background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                      borderRadius: 1.5,
                      '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' },
                      '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#CBD5E1' },
                    }
                  }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start" sx={{ pl: 1 }}>
                            <PersonSearchRoundedIcon sx={{ fontSize: 18, color: isDark ? '#94A3B8' : '#64748B' }} />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
            )}

            {/* Refresh / Countdown Pill */}
            <Tooltip title={`Auto-refresh`} placement="top" arrow>
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                borderRadius: 20, px: 2, py: 0.75,
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                color: isDark ? '#E2E8F0' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { background: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#CBD5E1' }
              }} onClick={() => fetchData(false)}>
                <RefreshRoundedIcon sx={{ fontSize: 16, animation: refreshing ? `${spin} 1s linear infinite` : 'none', color: 'inherit' }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'inherit' }}>
                  {countdown}s
                </Typography>
              </Box>
            </Tooltip>
          </Stack>
        </Stack>
      </HeroBanner>

      {/* ═══════════════════════════════════ METRIC CARDS GRID ════════════════════════════ */}
      <Grid container spacing={3}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={160} sx={{ borderRadius: 4 }} />
            </Grid>
          ))
        ) : (
          (() => {
            const enabledAuths = pageAuths.filter(a => a.addTaskEnable === 1);

            const tasksByType = {
              'CHECKLIST': tasks.filter(t => t.type === 'CHECKLIST'),
              'MEETING': tasks.filter(t => t.type === 'MEETING'),
              'TICKET': tasks.filter(t => t.type === 'TICKET'),
              'AUDIT': tasks.filter(t => t.type === 'AUDIT'),
            };

            let modulesToRender = [];

            // Always add ALL TASKS first
            modulesToRender.push({
              name: 'ALL TASKS',
              count: tasks.length,
              paletteKey: 'indigo',
              icon: <NotificationsActiveIcon sx={{ fontSize: 28 }} />,
              tabIndex: 0
            });

            let dynamicModules = [];

            if (enabledAuths.length > 0) {
              dynamicModules = enabledAuths.map(auth => {
                const name = auth.page?.pageName || auth.page?.pageCode || `Module ${auth.pageId}`;
                const upName = name.toUpperCase();
                let modTasks = [];
                let palette = 'indigo';
                let icon = <DashboardRoundedIcon sx={{ fontSize: 28 }} />;

                if (upName.includes('CHECK')) { modTasks = tasksByType['CHECKLIST']; palette = 'rose'; icon = <ChecklistRtlIcon sx={{ fontSize: 28 }} />; }
                else if (upName.includes('MEET') || upName.includes('MOM')) { modTasks = tasksByType['MEETING']; palette = 'emerald'; icon = <GroupsIcon sx={{ fontSize: 28 }} />; }
                else if (upName.includes('TICKET')) { modTasks = tasksByType['TICKET']; palette = 'sky'; icon = <ConfirmationNumberIcon sx={{ fontSize: 28 }} />; }
                else if (upName.includes('AUDIT')) { modTasks = tasksByType['AUDIT']; palette = 'amber'; icon = <PolicyIcon sx={{ fontSize: 28 }} />; }

                return { name, count: modTasks.length, paletteKey: palette, icon };
              });
            } else {
              // Fallback structure to match the old dashboard exactly
              dynamicModules = [
                { name: 'CHECKLISTS', count: tasksByType['CHECKLIST'].length, paletteKey: 'rose', icon: <ChecklistRtlIcon sx={{ fontSize: 28 }} /> },
                { name: 'MEETINGS', count: tasksByType['MEETING'].length, paletteKey: 'emerald', icon: <GroupsIcon sx={{ fontSize: 28 }} /> },
                { name: 'TICKETS', count: tasksByType['TICKET'].length, paletteKey: 'sky', icon: <ConfirmationNumberIcon sx={{ fontSize: 28 }} /> },
                { name: 'AUDITS', count: tasksByType['AUDIT'].length, paletteKey: 'amber', icon: <PolicyIcon sx={{ fontSize: 28 }} /> },
              ];
            }

            // Order by pending count ascending
            dynamicModules.sort((a, b) => a.count - b.count);

            // Append dynamic modules with incremented tab index
            dynamicModules.forEach((mod, idx) => {
              mod.tabIndex = idx + 1;
              modulesToRender.push(mod);
            });

            return modulesToRender.map((mod, i) => (
              <Grid item xs={12} sm={6} md={3} lg={2.4} key={mod.name + i}>
                <DashboardMetricCard
                  moduleName={mod.name}
                  count={mod.count}
                  icon={mod.icon}
                  paletteKey={mod.paletteKey}
                  theme={theme}
                  isDark={isDark}
                  active={activeTab === mod.tabIndex}
                  index={i}
                  onClick={() => setActiveTab(mod.tabIndex)}
                />
              </Grid>
            ));
          })()
        )}
      </Grid>

        </PageRoot>
    </ThemeProvider>
  );
}
