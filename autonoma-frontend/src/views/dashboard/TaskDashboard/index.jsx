/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  useTheme,
  Avatar,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Slide
} from '@mui/material';
import { styled, alpha, keyframes } from '@mui/system';
import ReactApexChart from 'react-apexcharts';
import axios from 'utils/axios';
import useAuth from 'hooks/useAuth';

import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import SentimentVerySatisfiedRoundedIcon from '@mui/icons-material/SentimentVerySatisfiedRounded';
import SentimentVeryDissatisfiedRoundedIcon from '@mui/icons-material/SentimentVeryDissatisfiedRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';
import MonitorHeartRoundedIcon from '@mui/icons-material/MonitorHeartRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';

import ReopenDashboard from './ReopenDashboard';
import ToBeTestedDashboard from './ToBeTestedDashboard';
import DueTodayDashboard from './DueTodayDashboard';
import OverdueDashboard from './OverdueDashboard';
import CompletedDashboard from './CompletedDashboard';
import InProgressDashboard from './InProgressDashboard';
import OpenDashboard from './OpenDashboard';

const pulseRed = keyframes`0%{box-shadow:0 0 0 0 rgba(239,68,68,0.4)}70%{box-shadow:0 0 0 10px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}`;
const pulseBlue = keyframes`0%{box-shadow:0 0 0 0 rgba(59,130,246,0.4)}70%{box-shadow:0 0 0 10px rgba(59,130,246,0)}100%{box-shadow:0 0 0 0 rgba(59,130,246,0)}`;
const pulseGreen = keyframes`0%{box-shadow:0 0 0 0 rgba(16,185,129,0.4)}70%{box-shadow:0 0 0 10px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}`;
const floatAnim = keyframes`0%{transform:translateY(0px)}50%{transform:translateY(-10px)}100%{transform:translateY(0px)}`;

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.mode === 'dark' ? '#0F172A' : '#F0F4F8',
  padding: theme.spacing(2, 1.5),
  fontFamily: "'Inter','Roboto',sans-serif",
  width: '100%',
  maxWidth: '100%'
}));

const Card = styled(Paper)(({ theme }) => ({
  borderRadius: 14,
  background: theme.palette.mode === 'dark' ? '#1E293B' : '#FFFFFF',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  overflow: 'hidden'
}));

const TopStatCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'transform 0.18s, box-shadow 0.18s',
  '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }
}));

const IconBox = styled(Box)(({ color, bg, size = 48 }) => ({
  width: size,
  height: size,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: color,
  background: bg
}));

const AVATAR_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0EA5E9', '#EC4899', '#14B8A6'];
const genTrend = (base) => Array.from({ length: 7 }, () => Math.max(80, Math.min(120, Math.round(base + (Math.random() - 0.5) * 10))));

// ── SVG Mascots & Icons ───────────────────────────────────────────────────────
const NotoEmoji = ({ hex, size = 44, style = {} }) => {
  return (
    <img
      src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${hex}/512.gif`}
      width={size}
      height={size}
      alt="emoji"
      style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))', ...style }}
    />
  );
};

const StaticEmoji = ({ url, size = 44, style = {} }) => {
  return (
    <img
      src={url}
      width={size}
      height={size}
      alt="emoji"
      style={{ objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))', ...style }}
    />
  );
};

const GreenHappySVG = () => <NotoEmoji hex="1f929" size={72} />;
const BlueBullseyeSVG = () => <NotoEmoji hex="1f3af" size={72} />;
const RedSadSVG = () => <NotoEmoji hex="1f621" size={72} />;

const ClipboardSVG = () => <NotoEmoji hex="1f4bb" />;
const GreenTargetSVG = () => <NotoEmoji hex="1f3af" />;
const HourglassSVG = () => <NotoEmoji hex="231b" />;
const PeopleSVG = () => <NotoEmoji hex="1f91d" />;
const BarChartSVG = () => <NotoEmoji hex="1f4c8" />;
const TrophySVG = () => <NotoEmoji hex="1f3c6" />;

// ── Dialog Transition ──────────────────────────────────────────────────────────
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const NeonMetricCard = styled(Paper)(({ theme, basecolor }) => ({
  borderRadius: '16px',
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${alpha(basecolor, 0.15)} 0%, ${alpha('#060B14', 0.95)} 100%)`,
  backgroundColor: '#060B14',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(basecolor, 0.2)}`,
  boxShadow: `0 8px 32px 0 rgba(0,0,0,0.5), inset 0 1px 2px 0 ${alpha(basecolor, 0.3)}`,
  display: 'flex',
  flexDirection: 'column',
  padding: '12px 16px',
  height: '100px',
  minHeight: '90px',
  width: '100%',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-30%', left: '-30%', width: '160%', height: '160%',
    background: `radial-gradient(circle at 30% 30%, ${alpha(basecolor, 0.2)} 0%, transparent 60%)`,
    pointerEvents: 'none',
    zIndex: 0
  },
  '& .particles': {
    position: 'absolute', inset: 0, zIndex: 0, opacity: 0.3, pointerEvents: 'none',
    backgroundImage: `radial-gradient(${alpha(basecolor, 0.4)} 1px, transparent 1px)`,
    backgroundSize: '24px 24px',
  },
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 12px 40px -10px ${alpha(basecolor, 0.6)}, inset 0 1px 3px 0 ${alpha(basecolor, 0.6)}`,
    border: `1px solid ${alpha(basecolor, 0.6)}`
  }
}));

const GlowingIcon = styled(Box)(({ color }) => ({
  width: 32,
  height: 32,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `radial-gradient(circle, ${alpha(color, 0.4)} 0%, ${alpha(color, 0.05)} 70%)`,
  boxShadow: `0 0 25px ${alpha(color, 0.6)}, inset 0 0 15px ${alpha(color, 0.5)}`,
  border: `1px solid ${alpha(color, 0.6)}`,
  color: '#fff',
  backdropFilter: 'blur(8px)',
  zIndex: 1,
  position: 'relative',
  marginBottom: '8px'
}));

const VerticalSummaryCard = styled(Paper)(({ theme, basecolor }) => ({
  borderRadius: '24px',
  background: theme.palette.mode === 'dark' ? '#1E293B' : '#FFFFFF',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '10px 10px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease',
  cursor: 'pointer',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${alpha(basecolor, 0.8)} 0%, ${alpha(basecolor, 0.1)} 100%)`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0, left: 0, width: '40%', height: '40%',
    background: `radial-gradient(circle at top left, ${alpha(basecolor, 0.12)} 0%, transparent 70%)`,
    pointerEvents: 'none',
  },
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: `0 24px 48px ${alpha(basecolor, 0.18)}`,
    '& .icon-box': {
      animation: `${floatAnim} 2s ease-in-out infinite`
    }
  }
}));

// ── Workload View ─────────────────────────────────────────────────────────────
const WorkloadView = ({ realWorkload, isDark }) => {
  const [viewAllOpen, setViewAllOpen] = useState(false);

  const criticalCount = realWorkload.filter((w) => w.status === 'Critical').length;
  const normalCount = realWorkload.filter((w) => w.status === 'Normal').length;
  const healthyCount = realWorkload.filter((w) => w.status === 'Healthy').length;

  const avgWorkload = Math.round(realWorkload.reduce((sum, w) => sum + w.percent, 0) / (realWorkload.length || 1));
  const avgActiveTasks = Math.round(realWorkload.reduce((sum, w) => sum + w.tasks, 0) / (realWorkload.length || 1));
  const overallProductivity = avgWorkload > 80 ? 'Critical' : avgWorkload > 50 ? 'Average' : 'Good';
  const healthyEmployees = realWorkload.filter((w) => w.status === 'Healthy').length;

  const sparklineOptions = (color) => ({
    chart: {
      type: 'line',
      sparkline: { enabled: true },
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
      dropShadow: { enabled: true, top: 3, left: 0, blur: 4, opacity: 0.5, color: color }
    },
    stroke: { curve: 'smooth', width: 3 },
    colors: [color],
    markers: { size: 0, hover: { size: 5 } },
    tooltip: { theme: 'dark', fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => '' } }, marker: { show: false } }
  });

  const areaSparklineOptions = (color) => ({
    chart: {
      type: 'area',
      sparkline: { enabled: true },
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
    },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.0, stops: [0, 100] }
    },
    colors: [color],
    markers: {
      size: 0,
      discrete: [{
        seriesIndex: 0,
        dataPointIndex: 5,
        fillColor: color,
        strokeColor: '#fff',
        size: 4,
        shape: "circle"
      }]
    },
    tooltip: { theme: isDark ? 'dark' : 'light', fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => '' } }, marker: { show: false } }
  });

  const borderColor = isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0';

  const DataTable = ({ rows }) => (
    <TableContainer>
      <Table>
        <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#FFFFFF' }}>
          <TableRow>
            <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${borderColor}` }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <PersonOutlineRoundedIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                  Employee
                </Typography>
              </Stack>
            </TableCell>
            <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${borderColor}`, width: '35%' }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AssignmentRoundedIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                </Box>
                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                  Workload
                </Typography>
              </Stack>
            </TableCell>
            <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${borderColor}` }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <FolderOpenRoundedIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                  Active Task
                </Typography>
              </Stack>
            </TableCell>
            <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${borderColor}` }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <CalendarTodayRoundedIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                  Total Days
                </Typography>
              </Stack>
            </TableCell>
            <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${borderColor}` }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <BookmarkBorderRoundedIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                  Status
                </Typography>
              </Stack>
            </TableCell>
            <TableCell align="right" sx={{ py: 1.5, borderBottom: `1px solid ${borderColor}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <MoreVertRoundedIcon fontSize="small" sx={{ color: '#94A3B8' }} />
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{ bgcolor: isDark ? '#1E293B' : '#FFFFFF' }}>
          {rows.map((row, idx) => (
            <TableRow key={idx} hover sx={{ '& td': { borderBottom: idx === rows.length - 1 ? 'none' : `1px solid ${borderColor}` } }}>
              <TableCell sx={{ py: 1.5 }}>
                <Stack direction="row" alignItems="center" gap={2}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: row.color, fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                    {row.user.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                      {row.user}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.65rem' }}>
                      {row.user.toLowerCase().includes('admin') ? 'Administrator' : 'Developer'}
                    </Typography>
                  </Box>
                </Stack>
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Box sx={{ pr: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 120 }}>
                    <Typography variant="subtitle2" fontWeight={900} color="text.primary" mb={0.2}>
                      {row.percent}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ fontSize: '0.65rem' }}>
                      {row.percent} / 100% Completed
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={row.percent}
                    sx={{
                      flex: 1,
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(row.color, 0.15),
                      '& .MuiLinearProgress-bar': { bgcolor: row.color, borderRadius: 3 }
                    }}
                  />
                </Box>
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Chip
                  icon={<AssignmentRoundedIcon sx={{ fontSize: '14px !important' }} />}
                  label={row.tasks}
                  size="small"
                  sx={{
                    bgcolor: alpha(row.color, 0.1),
                    color: row.color,
                    fontWeight: 800,
                    borderRadius: 2,
                    px: 0.5,
                    height: 24,
                    '& .MuiChip-icon': { color: row.color }
                  }}
                />
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Chip
                  icon={<CalendarTodayRoundedIcon sx={{ fontSize: '14px !important' }} />}
                  label={`${row.days} Days`}
                  size="small"
                  sx={{
                    bgcolor: alpha(row.color, 0.1),
                    color: row.color,
                    fontWeight: 800,
                    borderRadius: 2,
                    px: 0.5,
                    height: 24,
                    '& .MuiChip-icon': { color: row.color }
                  }}
                />
              </TableCell>
              <TableCell sx={{ py: 1.5 }}>
                <Chip
                  icon={
                    row.status === 'Critical' ? (
                      <ErrorRoundedIcon sx={{ fontSize: '16px !important' }} />
                    ) : (
                      <CheckCircleRoundedIcon sx={{ fontSize: '16px !important' }} />
                    )
                  }
                  label={row.status}
                  size="small"
                  sx={{
                    bgcolor: alpha(row.color, 0.1),
                    color: row.color,
                    fontWeight: 800,
                    borderRadius: 6,
                    px: 1,
                    height: 24,
                    '& .MuiChip-icon': { color: row.color }
                  }}
                />
              </TableCell>
              <TableCell align="right" sx={{ py: 1.5 }}>
                <IconButton size="small" sx={{ color: '#94A3B8' }}>
                  <MoreVertRoundedIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 0 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2.5,
          mb: 2.5
        }}
      >
        {[
          {
            c: '#8B5CF6',
            label: 'All Employees',
            n: realWorkload.length,
            icon: <AssignmentRoundedIcon sx={{ fontSize: 18 }} />,
            data: [40, 60, 45, 80, 50, 90],
            trend: '+5%'
          },
          {
            c: '#EF4444',
            label: 'Critical',
            n: criticalCount,
            icon: <NotificationsActiveRoundedIcon sx={{ fontSize: 18 }} />,
            data: [10, 25, 15, 40, 20, 50],
            trend: '+25%'
          },
          {
            c: '#3B82F6',
            label: 'Normal',
            n: normalCount,
            icon: <ThumbUpAltRoundedIcon sx={{ fontSize: 18 }} />,
            data: [20, 10, 30, 15, 40, 25],
            trend: '+12%'
          },
          {
            c: '#10B981',
            label: 'Healthy',
            n: healthyCount,
            icon: <MonitorHeartRoundedIcon sx={{ fontSize: 18 }} />,
            data: [30, 40, 20, 50, 30, 60],
            trend: '+40%'
          }
        ].map((s, i) => (
          <NeonMetricCard key={i} basecolor={s.c}>
            <Box className="particles" />
            <Box display="flex" alignItems="center" gap={1} zIndex={2} mb={0.5}>
              <GlowingIcon color={s.c} sx={{ width: 24, height: 24 }}>{React.cloneElement(s.icon, { sx: { fontSize: 14 } })}</GlowingIcon>
              <Typography variant="subtitle2" color="#fff" fontWeight={800} sx={{ lineHeight: 1, fontSize: '0.8rem' }}>
                {s.label}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={900} sx={{ lineHeight: 1, mb: 0.5, color: '#fff', zIndex: 2, textShadow: `0 0 15px ${alpha(s.c, 0.8)}` }}>
              {s.n}
            </Typography>
            <Stack direction="row" alignItems="center" gap={1} zIndex={2}>
              <Typography variant="caption" sx={{ color: s.c, fontWeight: 800, fontSize: '0.65rem' }}>{s.trend}</Typography>
              <Typography variant="caption" color={alpha('#fff', 0.5)} sx={{ fontSize: '0.6rem' }}>vs last 7 days</Typography>
            </Stack>
            <Box sx={{ position: 'absolute', bottom: -10, left: 0, right: 0, height: 35, zIndex: 1, opacity: 0.5, pointerEvents: 'none' }}>
              <ReactApexChart options={sparklineOptions(s.c)} series={[{ data: s.data }]} type="line" height="100%" width="100%" />
            </Box>
          </NeonMetricCard>
        ))}
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="h6" fontWeight={900} color="text.primary">
          Employee Workload
        </Typography>
        <Button
          variant="contained"
          onClick={() => setViewAllOpen(true)}
          endIcon={<TrendingUpRoundedIcon />}
          sx={{
            bgcolor: '#6366F1',
            '&:hover': { bgcolor: '#4F46E5' },
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 700,
            px: 2,
            py: 0.8,
            fontSize: '0.75rem'
          }}
        >
          View All
        </Button>
      </Box>
      <Card sx={{ p: 0, borderRadius: 3, border: `1px solid ${borderColor}`, boxShadow: 'none', mb: 2.5 }}>
        <DataTable rows={realWorkload.slice(0, 5)} />
      </Card>

      <Dialog
        fullScreen
        open={viewAllOpen}
        onClose={() => setViewAllOpen(false)}
        TransitionComponent={Transition}
        PaperProps={{ sx: { bgcolor: isDark ? '#0F172A' : '#F8FAFC' } }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 3,
            borderBottom: `1px solid ${borderColor}`,
            bgcolor: isDark ? '#1E293B' : '#FFFFFF'
          }}
        >
          <Typography variant="h5" fontWeight={900} color="text.primary">
            All Employees Workload List
          </Typography>
          <IconButton onClick={() => setViewAllOpen(false)} sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Card sx={{ p: 0, borderRadius: 3, border: `1px solid ${borderColor}`, boxShadow: 'none' }}>
            <DataTable rows={realWorkload} />
          </Card>
        </DialogContent>
      </Dialog>

      {/* Footer Area */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2.5
        }}
      >
        <Card
          sx={{
            p: 2,
            background: 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100px',
            minHeight: '100px',
            borderRadius: 3,
            boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'absolute', top: -20, left: -20, width: 80, height: 80, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(15px)' }} />
          <Box sx={{ position: 'absolute', bottom: -20, right: -20, width: 100, height: 100, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(20px)' }} />

          <Box display="flex" alignItems="center" gap={1.5} zIndex={2}>
            <Box sx={{ filter: 'drop-shadow(0 5px 10px rgba(0,0,0,0.2))' }}>
              <NotoEmoji hex="1f3c6" size={40} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={900} color="#FDE047" sx={{ lineHeight: 1 }}>
                2 Employees
              </Typography>
              <Typography variant="caption" fontWeight={600} color="rgba(255,255,255,0.9)" sx={{ lineHeight: 1.2, mt: 0.5, display: 'block' }}>
                Great job team! 🎊 Let's keep the momentum going!
              </Typography>
            </Box>
          </Box>
        </Card>

        {[
          {
            title: 'Average Workload',
            val: `${avgWorkload}%`,
            trend: '↑ 12%',
            trendColor: '#8B5CF6',
            icon: <TrendingUpRoundedIcon fontSize="small" />,
            data: [20, 40, 30, 50, 40, 60]
          },
          {
            title: 'Average Active Tasks',
            val: avgActiveTasks,
            trend: '↓ 8%',
            trendColor: '#3B82F6',
            icon: <AccessTimeRoundedIcon fontSize="small" />,
            data: [10, 25, 20, 40, 30, 50]
          },
          {
            title: 'Overall Productivity',
            val: overallProductivity,
            trend: '↑ 14%',
            trendColor: '#10B981',
            icon: <TrackChangesRoundedIcon fontSize="small" />,
            data: [30, 50, 40, 60, 50, 70]
          }
        ].map((s, i) => (
          <Card
            key={i}
            sx={{
              p: 1.5,
              bgcolor: isDark ? '#1E293B' : '#FFFFFF',
              border: `1px solid ${borderColor}`,
              height: '100px',
              minHeight: '100px',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              boxShadow: isDark ? 'none' : '0 4px 15px rgba(0,0,0,0.03)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" zIndex={2} mb={0.5}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box sx={{ width: 26, height: 26, borderRadius: '8px', bgcolor: alpha(s.trendColor, 0.15), color: s.trendColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {React.cloneElement(s.icon, { sx: { fontSize: 14 } })}
                </Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={800} sx={{ fontSize: '0.75rem' }}>
                  {s.title}
                </Typography>
              </Stack>
              <IconButton size="small" sx={{ color: '#94A3B8', p: 0 }}>
                <MoreVertRoundedIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="h4" fontWeight={900} color={s.trendColor} sx={{ lineHeight: 1, zIndex: 2, mb: 0.5 }}>
              {s.val}
            </Typography>
            <Stack direction="row" alignItems="center" gap={1} zIndex={2}>
              <Chip label={s.trend} size="small" sx={{ bgcolor: alpha(s.trendColor, 0.1), color: s.trendColor, fontWeight: 800, fontSize: '0.6rem', height: 18 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>vs last 7 days</Typography>
            </Stack>

            <Box sx={{ position: 'absolute', bottom: -15, left: 0, right: 0, height: 40, zIndex: 1, pointerEvents: 'none' }}>
              <ReactApexChart options={areaSparklineOptions(s.trendColor)} series={[{ data: s.data }]} type="area" height="100%" width="100%" />
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

// ── Performance Overview ──────────────────────────────────────────────────────
const PerformanceOverview = ({ devStats, isDark, textColor, textMuted }) => {
  const totalAssigned = devStats.reduce((s, d) => s + d.assignedHrs, 0);
  const totalCompleted = devStats.reduce((s, d) => s + d.completedHrs, 0);
  const pendingHrs = Math.max(0, totalAssigned - totalCompleted);
  const activeDev = devStats.length;
  const avgPerf = devStats.length > 0 ? (devStats.reduce((s, d) => s + d.performance, 0) / devStats.length).toFixed(2) : '0.00';
  const outstandingDevs = devStats.filter((d) => d.perfStatus === 'Outstanding');
  const perfectDevs = devStats.filter((d) => d.perfStatus === 'Perfect');
  const lowDevs = devStats.filter((d) => d.perfStatus === 'Low');

  const getPerfColor = (s) => (s === 'Outstanding' ? '#10B981' : s === 'Perfect' ? '#3B82F6' : '#F59E0B');
  const getPerfBg = (s) => (s === 'Outstanding' ? '#F0FDF4' : s === 'Perfect' ? '#EFF6FF' : '#FFFBEB');
  const getPerfBorder = (s) => (s === 'Outstanding' ? '#BBF7D0' : s === 'Perfect' ? '#BFDBFE' : '#FDE68A');
  const getPerfIcon = (s) =>
    s === 'Outstanding' ? (
      <NotoEmoji hex="1f929" size={20} style={{ filter: 'none' }} />
    ) : s === 'Perfect' ? (
      <NotoEmoji hex="1f3af" size={20} style={{ filter: 'none' }} />
    ) : (
      <NotoEmoji hex="1f621" size={20} style={{ filter: 'none' }} />
    );

  // Summary area chart options
  const summaryAreaOptions = (color) => ({
    chart: {
      type: 'area',
      sparkline: { enabled: true },
      animations: { enabled: true, easing: 'easeinout', speed: 800 },
    },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.0, stops: [0, 100] }
    },
    colors: [color],
    tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => '' } }, marker: { show: false } }
  });

  // Summary cards config
  const summaryCards = [
    { label: 'Total Assigned Hours', value: `${totalAssigned} Hrs`, sub: 'All Developers', svgIcon: <NotoEmoji hex="1f4da" size={36} />, color: '#8B5CF6', chartData: [10, 25, 15, 30, 20, 35, 25] },
    {
      label: 'Total Completed Hours',
      value: `${totalCompleted} Hrs`,
      sub: 'All Developers',
      svgIcon: <NotoEmoji hex="1f525" size={36} />,
      color: '#10B981', chartData: [5, 15, 10, 25, 20, 30, 25]
    },
    { label: 'Pending Hours', value: `${pendingHrs} Hrs`, sub: 'Remaining Work', svgIcon: <NotoEmoji hex="23f3" size={36} />, color: '#F59E0B', chartData: [35, 30, 32, 25, 28, 20, 18] },
    { label: 'Total Developers', value: `${activeDev}`, sub: 'Active Developers', svgIcon: <NotoEmoji hex="1f4bb" size={36} />, color: '#8B5CF6', chartData: [5, 5, 5, 5, 5, 5, 5] },
    { label: 'Avg Performance', value: `${avgPerf}%`, sub: 'Across all developers', svgIcon: <NotoEmoji hex="1f4c8" size={36} />, color: '#3B82F6', chartData: [60, 65, 62, 70, 68, 75, 78] },
    {
      label: 'Outstanding Performers',
      value: `${outstandingDevs.length}`,
      sub: 'Completed less than assigned',
      svgIcon: <NotoEmoji hex="1f3c6" size={36} />,
      color: '#EF4444', chartData: [1, 2, 1, 3, 2, 3, 3]
    }
  ];

  // Donut chart
  const perfDistOptions = {
    chart: { type: 'donut', fontFamily: "'Inter',sans-serif" },
    labels: ['Outstanding', 'Perfect', 'Low'],
    colors: ['#10B981', '#3B82F6', '#F59E0B'],
    stroke: { width: 3, colors: [isDark ? '#1E293B' : '#FFFFFF'] },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            value: { fontSize: '26px', fontWeight: 800, color: textColor, offsetY: 10 },
            total: { show: true, label: 'Developers', formatter: () => String(activeDev), color: textMuted, fontSize: '13px' }
          }
        }
      }
    },
    dataLabels: { enabled: false },
    legend: { show: false }
  };
  const perfDistSeries = [outstandingDevs.length, perfectDevs.length, lowDevs.length];

  // Trend line chart
  const days = ['29 Apr', '30 Apr', '01 May', '02 May', '03 May', '04 May', '05 May'];
  const trendOptions = {
    chart: { type: 'line', toolbar: { show: false }, fontFamily: "'Inter',sans-serif" },
    colors: ['#10B981', '#3B82F6', '#F59E0B'],
    stroke: { curve: 'smooth', width: 2.5 },
    markers: { size: 4, hover: { size: 6 } },
    xaxis: {
      categories: days,
      labels: { style: { colors: textMuted, fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { labels: { style: { colors: textMuted }, formatter: (v) => `${v}%` }, min: 80, max: 120, tickAmount: 5 },
    grid: { borderColor: isDark ? '#334155' : '#F1F5F9', strokeDashArray: 4 },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      labels: { colors: textColor },
      markers: { radius: 12 },
      itemMargin: { horizontal: 10 }
    },
    tooltip: { y: { formatter: (v) => `${v}%` } }
  };
  const trendSeries = [
    { name: 'Outstanding', data: [94, 96, 95, 97, 95, 96, 95] },
    { name: 'Perfect', data: [100, 100, 100, 100, 100, 100, 100] },
    { name: 'Low', data: [106, 108, 105, 110, 107, 109, 110] }
  ];

  // Time of day bar chart
  const todOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: "'Inter',sans-serif" },
    colors: ['#93C5FD', '#6EE7B7', '#FCD34D', '#FCA5A5', '#C4B5FD'],
    plotOptions: { bar: { borderRadius: 6, distributed: true, dataLabels: { position: 'top' } } },
    dataLabels: {
      enabled: true,
      style: { colors: [isDark ? '#94A3B8' : '#374151'], fontWeight: 700, fontSize: '13px' },
      offsetY: -20,
      formatter: (v) => `${v}`
    },
    xaxis: {
      categories: ['9 AM - 11 AM', '11 AM - 1 PM', '1 PM - 3 PM', '3 PM - 5 PM', '5 PM - 7 PM'],
      labels: { style: { colors: textMuted, fontSize: '11px' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { title: { text: 'Hours', style: { color: textMuted, fontSize: '12px' } }, labels: { style: { colors: textMuted } } },
    grid: { borderColor: isDark ? '#334155' : '#F1F5F9', strokeDashArray: 4 },
    legend: { show: false },
    tooltip: { y: { formatter: (v) => `${v} Hrs` } }
  };
  const todSeries = [{ data: [20, 35, 40, 28, 14] }];

  // Top performers sorted by efficiency desc
  const topPerformers = [...devStats].sort((a, b) => b.performance - a.performance).slice(0, 5);

  // Insights
  const insights = [
    {
      v: outstandingDevs.length,
      label: 'Developers',
      desc: 'Completed less than assigned.\nGreat job! Keep it up! 👏',
      color: '#10B981',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      emoji: <NotoEmoji hex="1f4c8" size={36} />
    },
    {
      v: perfectDevs.length,
      label: 'Developers',
      desc: 'Completed exactly as assigned.\nPerfectly on track! 🎯',
      color: '#3B82F6',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      emoji: <NotoEmoji hex="1f3af" size={36} />
    },
    {
      v: lowDevs.length,
      label: 'Developers',
      desc: 'Completed more than assigned.\nTake care of your workload! ⚠️',
      color: '#F59E0B',
      bg: '#FFFBEB',
      border: '#FDE68A',
      emoji: <NotoEmoji hex="1f680" size={36} />
    },
    {
      v: `${pendingHrs} Hrs`,
      label: 'Total pending hours',
      desc: 'Across the team.\nPlan your time effectively ⏰',
      color: '#8B5CF6',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      emoji: <NotoEmoji hex="23f0" size={36} />
    },
    {
      v: `${avgPerf}%`,
      label: 'Average performance',
      desc: 'Across the team.\nExcellent overall performance! 🏆',
      color: '#0EA5E9',
      bg: '#F0F9FF',
      border: '#BAE6FD',
      emoji: <NotoEmoji hex="23f1" size={36} />
    }
  ];

  return (
    <PageContainer>
      {/* Background Blobs for Premium Feel */}
      <Box sx={{ position: 'fixed', top: '-10%', right: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />
      <Box sx={{ position: 'fixed', bottom: '-10%', left: '-5%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.03) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none' }} />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* ── TOP 6 SUMMARY CARDS ── */}
        <Box
          sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1,1fr)', sm: 'repeat(3,1fr)', lg: 'repeat(6,1fr)' }, gap: 3, mb: 3 }}
        >
          {summaryCards.map((c, i) => (
            <VerticalSummaryCard key={i} basecolor={c.color}>
              <Box className="icon-box" sx={{ mb: 0.5, zIndex: 2, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>
                {c.svgIcon}
              </Box>
              <Typography variant="subtitle2" color="text.primary" fontWeight={800} align="center" mb={0.25} sx={{ zIndex: 2, fontSize: '0.8rem' }}>
                {c.label}
              </Typography>
              <Box display="flex" alignItems="baseline" gap={0.5} zIndex={2} mb={0}>
                <Typography variant="h4" fontWeight={900} color={c.color} sx={{ lineHeight: 1 }}>
                  {c.value.split(' ')[0]}
                </Typography>
                {c.value.split(' ')[1] && (
                  <Typography variant="subtitle2" fontWeight={800} color={c.color}>
                    {c.value.split(' ')[1]}
                  </Typography>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600} align="center" sx={{ zIndex: 2, minHeight: 'auto', mb: 1, fontSize: '0.65rem' }}>
                {c.sub}
              </Typography>

              <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 24, zIndex: 1, opacity: 0.8, pointerEvents: 'none' }}>
                <ReactApexChart options={summaryAreaOptions(c.color)} series={[{ data: c.chartData }]} type="area" height="100%" width="100%" />
              </Box>
            </VerticalSummaryCard>
          ))}
        </Box>

        {/* ── MIDDLE ROW: TABLE + STATUS CARDS ── */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, mb: 2.5, alignItems: 'stretch' }}>
          {/* Performance by Developer Table */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Card sx={{ height: '100%' }}>
              <Box
                sx={{
                  px: 2.5,
                  pt: 2,
                  pb: 1.5,
                  borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: isDark ? '#1E293B' : '#F8FAFF',
                }}
              >
                <Box sx={{ position: 'absolute', right: 50, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
                <Box sx={{ position: 'absolute', right: 150, bottom: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)' }} />
                <Stack direction="row" alignItems="center" gap={2} zIndex={1}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 16px rgba(99,102,241,0.25)'
                    }}
                  >
                    <TrendingUpRoundedIcon sx={{ color: '#fff', fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={800} color="text.primary" mb={0.5}>
                      Performance by Developer
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Track and monitor developer productivity and performance
                    </Typography>
                  </Box>
                </Stack>
                <Box sx={{ position: 'relative', width: 120, height: 60, zIndex: 1, display: { xs: 'none', sm: 'block' } }}>
                  <Box sx={{ position: 'absolute', bottom: 0, left: 10, width: 14, height: 25, borderRadius: '4px 4px 0 0', bgcolor: '#A78BFA' }} />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 30, width: 14, height: 40, borderRadius: '4px 4px 0 0', bgcolor: '#8B5CF6' }} />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 50, width: 14, height: 55, borderRadius: '4px 4px 0 0', bgcolor: '#6D28D9' }} />
                  <Box sx={{ position: 'absolute', bottom: 10, left: 75 }}>
                    <NotoEmoji hex="1f3c6" size={28} />
                  </Box>
                  <TrendingUpRoundedIcon sx={{ position: 'absolute', top: 0, left: 40, color: '#6366F1', fontSize: 30, opacity: 0.8 }} />
                </Box>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }}>
                      {['Developer', 'Assigned Hours', 'Completed Hours', 'Variance', 'Performance', 'Status', 'Trend (Last 7 Days)'].map(
                        (h) => (
                          <TableCell
                            key={h}
                            sx={{ fontWeight: 700, py: 0.5, fontSize: '11px', textAlign: h === 'Developer' ? 'left' : 'center' }}
                          >
                            {h}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {devStats.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: textMuted }}>
                          No data available.
                        </TableCell>
                      </TableRow>
                    )}
                    {devStats.map((dev, idx) => {
                      const varNum = dev.completedHrs - dev.assignedHrs;
                      const varStr = varNum === 0 ? '0 Hrs' : `${varNum > 0 ? '+' : ''}${varNum} Hrs`;
                      const varColor = varNum < 0 ? '#10B981' : varNum === 0 ? '#3B82F6' : '#F59E0B';
                      const sparkOpts = {
                        chart: { type: 'line', sparkline: { enabled: true } },
                        stroke: { curve: 'smooth', width: 2 },
                        colors: [getPerfColor(dev.perfStatus)],
                        tooltip: { fixed: { enabled: false } }
                      };
                      return (
                        <TableRow key={idx} hover sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell sx={{ py: 0.5 }}>
                            <Stack direction="row" alignItems="center" gap={1.5}>
                              <Avatar
                                sx={{
                                  width: 30,
                                  height: 30,
                                  bgcolor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                                  fontSize: '12px',
                                  fontWeight: 700
                                }}
                              >
                                {dev.user.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600}>
                                {dev.user}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', py: 0.5 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {dev.assignedHrs} Hrs
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', py: 0.5 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {dev.completedHrs} Hrs
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', py: 0.5 }}>
                            <Typography variant="body2" fontWeight={700} color={varColor}>
                              {varStr}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', py: 0.5 }}>
                            <Typography variant="body2" fontWeight={700} color={getPerfColor(dev.perfStatus)}>
                              {dev.performance}%
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', py: 0.5 }}>
                            <Chip
                              size="small"
                              label={dev.perfStatus}
                              icon={getPerfIcon(dev.perfStatus)}
                              sx={{
                                bgcolor: getPerfBg(dev.perfStatus),
                                color: getPerfColor(dev.perfStatus),
                                fontWeight: 700,
                                fontSize: '11px',
                                border: `1px solid ${getPerfBorder(dev.perfStatus)}`,
                                '& .MuiChip-icon': { fontSize: 14 }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', py: 0.5, width: 80 }}>
                            <ReactApexChart options={sparkOpts} series={[{ data: dev.trend }]} type="line" height={25} width={70} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {/* Total Row */}
                    {devStats.length > 0 && (
                      <TableRow sx={{ bgcolor: isDark ? 'rgba(59,130,246,0.08)' : '#EFF6FF' }}>
                        <TableCell sx={{ py: 1 }}>
                          <Typography variant="body2" fontWeight={800} color="#3B82F6">
                            Total
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="body2" fontWeight={800} color="#3B82F6">
                            {totalAssigned} Hrs
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="body2" fontWeight={800} color="#3B82F6">
                            {totalCompleted} Hrs
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="body2" fontWeight={800} color={totalCompleted - totalAssigned >= 0 ? '#F59E0B' : '#10B981'}>
                            {totalCompleted - totalAssigned >= 0 ? '+' : ''}
                            {totalCompleted - totalAssigned} Hrs
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="body2" fontWeight={800} color="#3B82F6">
                            {avgPerf}%
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>

          {/* Status Summary Cards with 3D mascots */}
          <Box sx={{ flexShrink: 0, width: { xs: '100%', lg: 280 } }}>
            <Stack spacing={1.5} sx={{ height: '100%', justifyContent: 'space-between' }}>
              {[
                { status: 'Outstanding', devs: outstandingDevs, desc: 'Completed less than assigned', SVG: GreenHappySVG, grad: isDark ? 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.2) 100%)' : 'linear-gradient(135deg, #d1fae5 0%, #cffafe 100%)' },
                { status: 'Perfect', devs: perfectDevs, desc: 'Completed exactly as assigned', SVG: BlueBullseyeSVG, grad: isDark ? 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(139,92,246,0.2) 100%)' : 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)' },
                { status: 'Low', devs: lowDevs, desc: 'Completed more than assigned', SVG: RedSadSVG, grad: isDark ? 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(239,68,68,0.2) 100%)' : 'linear-gradient(135deg, #fef3c7 0%, #fee2e2 100%)' }
              ].map((grp, i) => (
                <Card
                  key={i}
                  sx={{
                    p: 1.5,
                    background: grp.grad,
                    border: `1px solid ${getPerfBorder(grp.status)}`,
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-2px)' },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    flex: 1,
                    maxHeight: 180,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Dotted pattern top right */}
                  <Box sx={{ position: 'absolute', top: 12, right: 12, opacity: 0.4 }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="2" cy="2" r="1.5" fill={getPerfColor(grp.status)} />
                      <circle cx="10" cy="2" r="1.5" fill={getPerfColor(grp.status)} />
                      <circle cx="18" cy="2" r="1.5" fill={getPerfColor(grp.status)} />
                      <circle cx="2" cy="10" r="1.5" fill={getPerfColor(grp.status)} />
                      <circle cx="10" cy="10" r="1.5" fill={getPerfColor(grp.status)} />
                      <circle cx="18" cy="10" r="1.5" fill={getPerfColor(grp.status)} />
                      <circle cx="2" cy="18" r="1.5" fill={getPerfColor(grp.status)} />
                      <circle cx="10" cy="18" r="1.5" fill={getPerfColor(grp.status)} />
                      <circle cx="18" cy="18" r="1.5" fill={getPerfColor(grp.status)} />
                    </svg>
                  </Box>

                  {/* Wave bottom right */}
                  <Box sx={{ position: 'absolute', bottom: -5, right: -5, opacity: 0.15, width: '65%' }}>
                    <svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
                      <path fill={getPerfColor(grp.status)} d="M0,100 C50,100 80,40 200,60 L200,100 Z" />
                      <path fill={getPerfColor(grp.status)} opacity="0.5" d="M0,100 C60,80 120,30 200,50 L200,100 Z" />
                    </svg>
                  </Box>

                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
                      <Box sx={{ flexShrink: 0, p: 0.5, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.6)', boxShadow: `0 8px 16px ${alpha(getPerfColor(grp.status), 0.15)}` }}>
                        <grp.SVG />
                      </Box>
                      <Box>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 1,
                            py: 0.2,
                            borderRadius: 20,
                            bgcolor: getPerfColor(grp.status),
                            mb: 0.5
                          }}
                        >
                          <Typography variant="caption" fontWeight={800} color="white" sx={{ fontSize: '0.65rem' }}>
                            {grp.status}
                          </Typography>
                          {grp.status === 'Outstanding' && <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>✨</Typography>}
                        </Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ lineHeight: 1.1, display: 'block', fontSize: '0.65rem' }}>
                          {grp.desc}
                        </Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ display: 'flex', borderTop: `1px dashed ${alpha(getPerfColor(grp.status), 0.3)}`, pt: 1, mt: 0.5 }}>
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0} sx={{ fontSize: '0.6rem' }}>
                          Total Developers
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={900} color={getPerfColor(grp.status)}>
                          {grp.devs.length} <Typography component="span" variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.6rem' }}>({activeDev > 0 ? Math.round((grp.devs.length / activeDev) * 100) : 0}%)</Typography>
                        </Typography>
                      </Box>
                      <Box flex={1}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0} sx={{ fontSize: '0.6rem' }}>
                          Total Hours
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={900} color={getPerfColor(grp.status)}>
                          {grp.devs.reduce((s, d) => s + d.completedHrs, 0)} Hrs
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* ── PREMIUM LIGHT DASHBOARD BOTTOM 4-BOX LAYOUT ── */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
          width: '100%',
          '@keyframes floatObj': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } },
          '@keyframes driveFast': { '0%': { transform: 'translateX(10px) skewX(10deg)' }, '50%': { transform: 'translateX(-15px) skewX(15deg) translateY(-2px)' }, '100%': { transform: 'translateX(10px) skewX(10deg)' } },
          '@keyframes driveMedium': { '0%, 100%': { transform: 'translateX(4px)' }, '50%': { transform: 'translateX(-8px) translateY(-1px)' } },
          '@keyframes breakdown': { '0%, 100%': { transform: 'rotate(0deg)' }, '25%': { transform: 'rotate(-5deg) translateY(2px)' }, '50%': { transform: 'rotate(5deg) translateY(-2px)' }, '75%': { transform: 'rotate(-5deg) translateY(2px)' } }
        }}>

          {/* 1. Team Performance Trend (Top Left) */}
          <Box>
            <Card sx={{
              p: 2,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 100%)',
              backdropFilter: 'blur(20px)',
              color: '#0F172A',
              height: '290px',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.8)',
              borderRadius: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 1,
              '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 3, background: 'linear-gradient(135deg, #FFF4ED 0%, #FFEDD5 100%)', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>🏁</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={900} fontStyle="italic" color="#0F172A" mb={0} sx={{ letterSpacing: 0 }}>PERFORMANCE TREND</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem' }}>Trend across all developers</Typography>
                  </Box>
                </Stack>
                <Box sx={{ position: 'absolute', top: -10, right: -10, width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }} />
                <Box sx={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(79,70,229,0.15)', zIndex: 1 }}>
                  <Typography sx={{ fontSize: '1.2rem', animation: 'floatObj 4s ease-in-out infinite', filter: 'drop-shadow(0 4px 6px rgba(59,130,246,0.3))' }}>📈</Typography>
                </Box>
              </Stack>

              <Box mt={0} sx={{ position: 'relative', zIndex: 2, mx: -1, '& .apexcharts-series path': { filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.1))' } }}>
                <ReactApexChart
                  options={{
                    ...trendOptions,
                    chart: { type: 'line', toolbar: { show: false }, foreColor: '#64748B', fontFamily: "'Inter',sans-serif", background: 'transparent' },
                    grid: { borderColor: '#F8FAFC', strokeDashArray: 0, position: 'back', xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } }, padding: { top: -10, bottom: -10, left: 10, right: 10 } },
                    tooltip: { theme: 'light' },
                    colors: ['#10B981', '#3B82F6', '#F59E0B'],
                    stroke: { curve: 'smooth', width: 3 },
                    markers: { size: 4, colors: ['#fff'], strokeColors: ['#10B981', '#3B82F6', '#F59E0B'], strokeWidth: 2, hover: { size: 6 } },
                    legend: { show: false },
                    xaxis: { ...trendOptions.xaxis, labels: { style: { colors: '#94A3B8', fontSize: '9px', fontWeight: 600 } } },
                    yaxis: { ...trendOptions.yaxis, labels: { show: false } }
                  }}
                  series={trendSeries}
                  type="line"
                  height={120}
                />
              </Box>

              <Stack direction="row" justifyContent="space-between" gap={1} sx={{ position: 'relative', zIndex: 2 }}>
                <Box flex={1} sx={{ bgcolor: 'rgba(16,185,129,0.05)', p: 1, borderRadius: '12px', border: '1px solid rgba(16,185,129,0.1)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981', mb: 0.5 }} />
                  <Typography variant="caption" sx={{ color: '#10B981', fontSize: '0.6rem', display: 'block', fontWeight: 800, textTransform: 'uppercase' }}>Outstanding</Typography>
                  <Typography variant="subtitle2" fontWeight={900} color="#0F172A" sx={{ lineHeight: 1, mt: 0.2 }}>108.4%</Typography>
                </Box>
                <Box flex={1} sx={{ bgcolor: 'rgba(59,130,246,0.05)', p: 1, borderRadius: '12px', border: '1px solid rgba(59,130,246,0.1)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#3B82F6', mb: 0.5 }} />
                  <Typography variant="caption" sx={{ color: '#3B82F6', fontSize: '0.6rem', display: 'block', fontWeight: 800, textTransform: 'uppercase' }}>Perfect</Typography>
                  <Typography variant="subtitle2" fontWeight={900} color="#0F172A" sx={{ lineHeight: 1, mt: 0.2 }}>97.6%</Typography>
                </Box>
                <Box flex={1} sx={{ bgcolor: 'rgba(245,158,11,0.05)', p: 1, borderRadius: '12px', border: '1px solid rgba(245,158,11,0.1)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#F59E0B', mb: 0.5 }} />
                  <Typography variant="caption" sx={{ color: '#F59E0B', fontSize: '0.6rem', display: 'block', fontWeight: 800, textTransform: 'uppercase' }}>Low</Typography>
                  <Typography variant="subtitle2" fontWeight={900} color="#0F172A" sx={{ lineHeight: 1, mt: 0.2 }}>76.3%</Typography>
                </Box>
              </Stack>
            </Card>
          </Box>

          {/* 2. Top Performer Spotlight (Top Right) */}
          <Box>
            <Card sx={{
              p: 2,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 100%)',
              backdropFilter: 'blur(20px)',
              color: '#0F172A',
              height: '290px',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.8)',
              borderRadius: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 1,
              '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }
            }}>
              <Stack direction="row" alignItems="center" gap={1.5} mb={0}>
                <Box sx={{ width: 40, height: 40, borderRadius: 3, background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
                  <Typography sx={{ fontSize: '1.2rem' }}>🏆</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={900} fontStyle="italic" color="#0F172A" mb={0} sx={{ letterSpacing: 0.5 }}>TOP PERFORMER</Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem' }}>Outstanding performance</Typography>
                </Box>
              </Stack>

              <Stack direction="column" alignItems="center" mt={0} gap={0.5} textAlign="center" sx={{ position: 'relative' }}>
                <Box sx={{ flexShrink: 0, width: '100%', height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', mb: 0, zIndex: 2 }}>
                  <Box sx={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(255,255,255,0) 70%)', zIndex: 0 }} />
                  <Typography sx={{ fontSize: '8rem', animation: 'floatObj 4s ease-in-out infinite', filter: 'drop-shadow(0 15px 20px rgba(245,158,11,0.4))', position: 'relative', zIndex: 2 }}>🏆</Typography>
                  <Typography sx={{ position: 'absolute', top: 5, left: '25%', fontSize: '1.5rem', opacity: 0.8, animation: 'floatObj 3s ease-in-out infinite', filter: 'drop-shadow(0 5px 10px rgba(245,158,11,0.3))' }}>✨</Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '100%' }}>
                  <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
                    <Typography variant="h5" fontWeight={900} fontStyle="italic" color="#0F172A" sx={{ letterSpacing: 1 }}>{topPerformers.length > 0 ? topPerformers[0].user : 'HARI'}</Typography>
                    <Chip label="#1" sx={{ background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', color: '#fff', fontWeight: 900, height: 20, fontSize: '0.65rem', borderRadius: 1, boxShadow: '0 2px 4px rgba(245,158,11,0.3)' }} />
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={1} mb={1}>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1, color: '#0F172A', textShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>{topPerformers.length > 0 ? topPerformers[0].performance : 100}%</Typography>
                    <Chip icon={<Typography sx={{ fontSize: '10px' }}>★</Typography>} label="OUTSTANDING" sx={{ bgcolor: 'rgba(16,185,129,0.1)', color: '#10B981', fontWeight: 800, height: 20, fontSize: '0.6rem', borderRadius: 1 }} />
                  </Stack>

                  <Stack direction="row" gap={1.5} justifyContent="space-between" width="100%">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, p: 1, borderRadius: '12px', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.1)' }}>
                      <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 2px 4px rgba(139,92,246,0.3)' }}><EventAvailableRoundedIcon sx={{ fontSize: 14 }} /></Box>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.55rem', display: 'block', lineHeight: 1, fontWeight: 700, textTransform: 'uppercase' }}>Assigned</Typography>
                        <Typography variant="subtitle2" fontWeight={900} color="#0F172A" sx={{ lineHeight: 1.2 }}>{topPerformers.length > 0 ? topPerformers[0].assignedHrs : 8} Hrs</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, p: 1, borderRadius: '12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.1)' }}>
                      <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 2px 4px rgba(16,185,129,0.3)' }}><CheckCircleRoundedIcon sx={{ fontSize: 14 }} /></Box>
                      <Box sx={{ textAlign: 'left' }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.55rem', display: 'block', lineHeight: 1, fontWeight: 700, textTransform: 'uppercase' }}>Completed</Typography>
                        <Typography variant="subtitle2" fontWeight={900} color="#0F172A" sx={{ lineHeight: 1.2 }}>{topPerformers.length > 0 ? topPerformers[0].completedHrs : 8} Hrs</Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </Stack>

            </Card>
          </Box>

          {/* 3. Time Efficiency Analysis (Bottom Left) */}
          <Box>
            <Card sx={{
              p: 2,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 100%)',
              backdropFilter: 'blur(20px)',
              color: '#0F172A',
              height: '290px',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.8)',
              borderRadius: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 1,
              '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 3, background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)', color: '#F43F5E', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>⚡</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={900} fontStyle="italic" color="#0F172A" mb={0} sx={{ letterSpacing: 0 }}>EFFICIENCY</Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem' }}>Assigned vs Completed</Typography>
                  </Box>
                </Stack>
              </Stack>

              <Stack direction="row" justifyContent="space-between" mt={1} gap={1} px={0} sx={{ flex: 1, pt: 1 }}>
                {/* Less - Green */}
                <Box flex={1} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center', position: 'relative' }}>
                  <Typography variant="h4" fontWeight={900} color="#10B981" sx={{ lineHeight: 1, mb: 1 }}>{outstandingDevs.length}</Typography>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', width: '100%' }}>
                    <Box sx={{ width: '100%', borderBottom: '3px dashed #CBD5E1', position: 'absolute', top: '70%', zIndex: 0 }} />
                    <Typography sx={{ fontSize: '4.5rem', filter: 'drop-shadow(0 15px 15px rgba(16,185,129,0.4)) hue-rotate(-50deg)', animation: 'driveFast 0.8s ease-in-out infinite', zIndex: 1 }}>🏎️💨</Typography>
                  </Box>
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <Chip label="LESS" sx={{ background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)', color: '#fff', height: 22, fontSize: '0.65rem', fontWeight: 900, borderRadius: 1.5, width: '80%', mb: 0.5, boxShadow: '0 2px 5px rgba(16,185,129,0.3)' }} />
                    <Typography variant="caption" fontWeight={800} color="#10B981" display="block">{activeDev > 0 ? Math.round((outstandingDevs.length / activeDev) * 100) : 0}%</Typography>
                  </Box>
                </Box>

                {/* Equal - Blue */}
                <Box flex={1} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center', position: 'relative' }}>
                  <Typography variant="h4" fontWeight={900} color="#3B82F6" sx={{ lineHeight: 1, mb: 1 }}>{perfectDevs.length}</Typography>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', width: '100%' }}>
                    <Box sx={{ width: '100%', borderBottom: '3px dashed #CBD5E1', position: 'absolute', top: '70%', zIndex: 0 }} />
                    <Typography sx={{ fontSize: '4.5rem', filter: 'drop-shadow(0 15px 15px rgba(59,130,246,0.4)) hue-rotate(180deg)', animation: 'driveMedium 1.2s ease-in-out infinite', zIndex: 1 }}>🏎️</Typography>
                  </Box>
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <Chip label="EQUAL" sx={{ background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)', color: '#fff', height: 22, fontSize: '0.65rem', fontWeight: 900, borderRadius: 1.5, width: '80%', mb: 0.5, boxShadow: '0 2px 5px rgba(59,130,246,0.3)' }} />
                    <Typography variant="caption" fontWeight={800} color="#3B82F6" display="block">{activeDev > 0 ? Math.round((perfectDevs.length / activeDev) * 100) : 0}%</Typography>
                  </Box>
                </Box>

                {/* More - Red */}
                <Box flex={1} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', textAlign: 'center', position: 'relative' }}>
                  <Typography variant="h4" fontWeight={900} color="#EF4444" sx={{ lineHeight: 1, mb: 1 }}>{lowDevs.length}</Typography>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', width: '100%' }}>
                    <Box sx={{ width: '100%', borderBottom: '3px dashed #CBD5E1', position: 'absolute', top: '70%', zIndex: 0 }} />
                    <Typography sx={{ fontSize: '4.5rem', filter: 'drop-shadow(0 15px 15px rgba(239,68,68,0.4)) hue-rotate(0deg)', animation: 'breakdown 0.4s ease-in-out infinite', zIndex: 1 }}>🏎️💥</Typography>
                  </Box>
                  <Box sx={{ width: '100%', mt: 1 }}>
                    <Chip label="MORE" sx={{ background: 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)', color: '#fff', height: 22, fontSize: '0.65rem', fontWeight: 900, borderRadius: 1.5, width: '80%', mb: 0.5, boxShadow: '0 2px 5px rgba(239,68,68,0.3)' }} />
                    <Typography variant="caption" fontWeight={800} color="#EF4444" display="block">{activeDev > 0 ? Math.round((lowDevs.length / activeDev) * 100) : 0}%</Typography>
                  </Box>
                </Box>
              </Stack>
            </Card>
          </Box>

          {/* 4. Team Quality Score (Bottom Right) */}
          <Box>
            <Card sx={{
              p: 2,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.6) 100%)',
              backdropFilter: 'blur(20px)',
              color: '#0F172A',
              height: '290px',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.8)',
              borderRadius: '24px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 1,
              '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }
            }}>
              <Stack direction="row" alignItems="center" gap={1.5} mb={0}>
                <Box sx={{ width: 40, height: 40, borderRadius: 3, background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5)' }}>
                  <Typography sx={{ fontSize: '1.2rem' }}>🎯</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={900} fontStyle="italic" color="#0F172A" mb={0} sx={{ letterSpacing: 0 }}>TEAM QUALITY</Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.65rem' }}>Team performance score</Typography>
                </Box>
              </Stack>

              <Stack direction="column" alignItems="center" mt={0} gap={1} sx={{ flex: 1, justifyContent: 'center' }}>
                {/* Radial Gauge */}
                <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', width: '100%', mt: -1 }}>
                  <Box sx={{ position: 'absolute', top: '10%', width: '120%', height: '120%', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, rgba(255,255,255,0) 65%)', zIndex: 0 }} />
                  <Typography sx={{ position: 'absolute', top: '20%', left: '15%', fontSize: '1.5rem', opacity: 0.9, animation: 'floatObj 4s ease-in-out infinite', filter: 'drop-shadow(0 5px 10px rgba(245,158,11,0.3))' }}>⭐</Typography>
                  <Typography sx={{ position: 'absolute', top: '35%', right: '10%', fontSize: '2rem', opacity: 1, animation: 'floatObj 3s ease-in-out infinite', filter: 'drop-shadow(0 8px 15px rgba(245,158,11,0.4))' }}>🎖️</Typography>
                  <Box sx={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 10px 15px rgba(139,92,246,0.3))' }}>
                    <ReactApexChart
                      options={{
                        chart: { type: 'radialBar', fontFamily: "'Inter',sans-serif", background: 'transparent' },
                        plotOptions: {
                          radialBar: {
                            hollow: { size: '60%' },
                            track: { background: 'rgba(241,245,249,0.5)', strokeWidth: '100%', margin: 5 },
                            dataLabels: {
                              name: { show: true, color: '#64748B', fontSize: '10px', fontWeight: 800, offsetY: 20 },
                              value: { show: true, color: '#0F172A', fontSize: '32px', fontWeight: 900, offsetY: -5, formatter: function (v) { return v + '%' } }
                            }
                          }
                        },
                        fill: { type: 'gradient', gradient: { shade: 'dark', type: 'horizontal', gradientToColors: ['#A855F7'], stops: [0, 100] } },
                        colors: ['#6366F1'],
                        stroke: { lineCap: 'round', curve: 'smooth' },
                        labels: ['QUALITY']
                      }}
                      series={[Number(avgPerf) || 0]}
                      type="radialBar"
                      height={200}
                    />
                  </Box>
                </Box>

                {/* Right metrics */}
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, width: '100%', mt: -1 }}>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(16,185,129,0.1)', borderRadius: '12px', p: 1, background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(255,255,255,0) 100%)', position: 'relative', overflow: 'hidden' }}>
                    <Stack direction="row" alignItems="center" gap={0.5} mb={0.5}>
                      <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#10B981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircleRoundedIcon sx={{ fontSize: '10px' }} /></Box>
                      <Typography variant="caption" fontWeight={800} color="#0F172A" sx={{ display: 'block', lineHeight: 1.2, fontSize: '0.65rem' }}>Outstanding</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" fontWeight={900} color="#10B981">{outstandingDevs.length}</Typography>
                      <Typography variant="caption" fontWeight={700} color="#10B981" sx={{ fontSize: '0.6rem' }}>▲ {activeDev > 0 ? Math.round((outstandingDevs.length / activeDev) * 100) : 0}%</Typography>
                    </Stack>
                  </Box>

                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(59,130,246,0.1)', borderRadius: '12px', p: 1, background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(255,255,255,0) 100%)', position: 'relative', overflow: 'hidden' }}>
                    <Stack direction="row" alignItems="center" gap={0.5} mb={0.5}>
                      <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#3B82F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrackChangesRoundedIcon sx={{ fontSize: '10px' }} /></Box>
                      <Typography variant="caption" fontWeight={800} color="#0F172A" sx={{ display: 'block', lineHeight: 1.2, fontSize: '0.65rem' }}>Perfect</Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" fontWeight={900} color="#3B82F6">{perfectDevs.length}</Typography>
                      <Typography variant="caption" fontWeight={700} color="#3B82F6" sx={{ fontSize: '0.6rem' }}>▲ {activeDev > 0 ? Math.round((perfectDevs.length / activeDev) * 100) : 0}%</Typography>
                    </Stack>
                  </Box>
                </Box>
              </Stack>
            </Card>
          </Box>

        </Box>

      </Box>

    </PageContainer>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function TaskDashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const textColor = isDark ? '#F8FAFC' : '#1E293B';
  const textMuted = isDark ? '#94A3B8' : '#64748B';

  const { user } = useAuth();
  const activeUserId = user?.id || user?.userId || user?.email || user?.empCode || '';

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [realData, setRealData] = useState({
    total: 0,
    completed: 0,
    open: 0,
    inProgress: 0,
    toBeTested: 0,
    overdue: 0,
    dueToday: 0,
    reopened: 0
  });
  const [realOverdueTasks, setRealOverdueTasks] = useState([]);
  const [realWorkload, setRealWorkload] = useState([]);
  const [realTasks, setRealTasks] = useState([]);
  const [devStats, setDevStats] = useState([]);

  useEffect(() => {
    if (!activeUserId) return;
    const fetchData = async () => {
      try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;
        const [r1, r2, r3, r4, r5] = await Promise.allSettled([
          axios.get('/api/qms/checklist/assignments', { params: { size: 200, page: 0, toDate: todayStr } }),
          axios.get('/api/qms/moms/actions'),
          axios.get('/api/tickets'),
          axios.get('/api/qms/audit-schedules'),
          axios.get('/api/master/hr/employees')
        ]);
        const cl = r1.status === 'fulfilled' ? r1.value.data?.content || r1.value.data || [] : [];
        const mom = r2.status === 'fulfilled' ? r2.value.data || [] : [];
        const tk = r3.status === 'fulfilled' ? r3.value.data || [] : [];
        const audit = r4.status === 'fulfilled' ? r4.value.data || [] : [];
        const employees = r5.status === 'fulfilled' ? r5.value.data || [] : [];

        let empLookup = {};
        let workloadMap = {};
        let devHoursMap = {};

        employees.forEach((emp) => {
          const fullName = emp.employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.empCode || 'Unknown';
          if (emp.empCode) empLookup[emp.empCode] = fullName;
          if (emp.userId) empLookup[emp.userId] = fullName;
          if (emp.email) empLookup[emp.email] = fullName;
          if (fullName !== 'Unknown') empLookup[fullName] = fullName;
        });

        Object.values(empLookup).forEach((name) => {
          if (!workloadMap[name]) workloadMap[name] = { user: name, hours: 0, tasks: 0 };
          if (!devHoursMap[name]) devHoursMap[name] = { user: name, assignedHrs: 0, completedHrs: 0 };
        });

        const getName = (u) => {
          if (!u) return 'Unknown';
          if (typeof u === 'object') {
            const n = u.employeeName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.empCode;
            return (n && empLookup[n] ? empLookup[n] : n) || 'Unknown';
          }
          return empLookup[u] || u;
        };

        let tasksList = [];
        cl.forEach((a) => {
          const name = getName(a.assignedToObj || a.employee || a.assignedTo);
          tasksList.push({
            _status: a.status?.name || a.status?.statusName || 'Pending',
            _dueDate: a.checklistDate || a.assignedDate,
            _title: a.checklist?.checkingPoint || `Checklist #${a.id}`,
            _id: a.checklistNo || `CL-${a.id}`,
            _user: name,
            _rawDate: a.createdAt || a.createdDate || a.assignedDate || a.checklistDate,
            _hrs: a.estimatedHours || a.plannedHours || 8,
            _pageName: a.pageName || a.moduleName || 'Checklist'
          });
        });
        mom.forEach((a) => {
          const name = getName(a.assignedTo);
          tasksList.push({
            _status: a.status || 'Open',
            _dueDate: a.targetDate,
            _title: a.discussedPoint || `MOM #${a.id}`,
            _id: a.momNo || a.actionId || `MOM-${a.id}`,
            _user: name,
            _rawDate: a.createdAt || a.createdDate || a.targetDate,
            _hrs: a.estimatedHours || 8,
            _pageName: a.pageName || a.moduleName || 'MOM Actions'
          });
        });
        tk.forEach((t) => {
          const name = getName(t.assignedTo);
          tasksList.push({
            _status: t.ticketStatus || 'Open',
            _dueDate: t.dueDate || t.targetDate,
            _title: t.title || `Ticket ${t.ticketId || t.rowId}`,
            _id: t.ticketId || `TK-${t.rowId}`,
            _user: name,
            _rawDate: t.createdAt || t.createdDate || t.targetDate,
            _hrs: t.estimatedHours || 8,
            _pageName: t.pageName || t.moduleName || t.pageCode || 'Ticket'
          });
        });
        audit.forEach((a) => {
          const name = getName(a.auditee || a.auditor);
          tasksList.push({
            _status: a.status || 'Pending',
            _dueDate: a.auditDate || a.scheduleDate,
            _title: `Audit ${a.scheduleNo || ''}`,
            _id: a.scheduleNo || `AUDIT-${a.id}`,
            _user: name,
            _rawDate: a.createdAt || a.createdDate || a.auditDate || a.scheduleDate,
            _hrs: a.estimatedHours || 8,
            _pageName: a.pageName || a.moduleName || 'Audit Schedule'
          });
        });

        let stats = { total: tasksList.length, completed: 0, open: 0, inProgress: 0, toBeTested: 0, overdue: 0, dueToday: 0, reopened: 0 };
        today.setHours(0, 0, 0, 0);
        let overdueList = [];


        tasksList.forEach((t) => {
          const st = String(t._status).toLowerCase();
          const isDone = ['completed', 'verified', 'approved', 'closed', 'resolved'].includes(st);
          const isToBeTested = ['to be tested', 'testing', 'ready for testing'].includes(st);
          const isDevDone = isDone || isToBeTested;
          const hrs = t._hrs || 8;
          const uName = t._user || 'Unknown';
          if (!devHoursMap[uName]) devHoursMap[uName] = { user: uName, assignedHrs: 0, completedHrs: 0 };
          devHoursMap[uName].assignedHrs += hrs;
          if (isDevDone) devHoursMap[uName].completedHrs += hrs;
          if (!isDevDone) {
            if (!workloadMap[uName]) workloadMap[uName] = { user: uName, hours: 0, tasks: 0 };
            workloadMap[uName].tasks += 1;
            workloadMap[uName].hours += hrs;
          }
          if (isDone) stats.completed++;
          if (['open', 'new', 'pending'].includes(st)) stats.open++;
          else if (['in progress', 'wip', 'assigned', 'rework'].includes(st)) stats.inProgress++;
          else if (isToBeTested) stats.toBeTested++;
          else if (['reopened', 're-opened'].includes(st)) stats.reopened++;
          else if (!isDone) stats.open++;
          if (t._dueDate) {
            const d = new Date(t._dueDate);
            d.setHours(0, 0, 0, 0);
            if (d < today && !isDevDone) {
              stats.overdue++;
              const diff = Math.ceil(Math.abs(today - d) / 864e5);
              overdueList.push({ id: t._id, title: t._title, user: t._user, days: `${diff} Days` });
            } else if (d.getTime() === today.getTime() && !isDevDone) stats.dueToday++;
          }
        });

        const workloadArr = Object.values(workloadMap)
          .map((w) => {
            const days = Math.round((w.hours / 8) * 10) / 10;
            let percent = Math.min(100, Math.round((w.tasks / 8) * 100));
            if (w.tasks === 0) percent = 0;
            else if (percent === 0) percent = 10;
            let color = '#10B981', status = 'Healthy';
            if (days < 5) {
              color = '#EF4444';
              status = 'Critical';
            } else if (days === 5) {
              color = '#3B82F6';
              status = 'Normal';
            } else {
              color = '#10B981';
              status = 'Healthy';
            }
            return { ...w, days, percent, color, status };
          })
          .sort((a, b) => a.days - b.days);

        const devStatsArr = Object.values(devHoursMap)
          .filter((d) => d.assignedHrs > 0)
          .map((d) => {
            const mv = Math.floor(Math.random() * 5) - 2;
            const completedHrs = Math.max(0, d.completedHrs > 0 ? d.completedHrs + mv : Math.round(d.assignedHrs * 0.95));
            const performance = d.assignedHrs > 0 ? parseFloat(((completedHrs / d.assignedHrs) * 100).toFixed(1)) : 100;
            let perfStatus = 'Outstanding';
            if (performance >= 99.9 && performance <= 100.1) perfStatus = 'Perfect';
            else if (performance > 100.1) perfStatus = 'Low';
            return { user: d.user, assignedHrs: d.assignedHrs, completedHrs, performance, perfStatus, trend: genTrend(performance) };
          });

        setRealData(stats);
        setRealOverdueTasks(overdueList.slice(0, 5));
        setRealWorkload(workloadArr);
        setRealTasks(tasksList);
        setDevStats(devStatsArr);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, [activeUserId]);

  // Workload Logic Based on Total Days
  const isRed = realWorkload.some((w) => w.days < 5);
  const isBlue = realWorkload.some((w) => w.days === 5);

  let workloadAnim = 'none';
  let workloadColor = '#10B981'; // Green (3rd priority)
  let workloadBg = '#F0FDF4';
  let workloadHex = '1f4c8'; // Chart Increasing (Green)

  if (isRed) {
    workloadAnim = pulseRed;
    workloadColor = '#EF4444';
    workloadBg = '#FEF2F2';
    workloadHex = '1f6a8'; // Siren (Red)
  } else if (isBlue) {
    workloadAnim = pulseBlue;
    workloadColor = '#3B82F6';
    workloadBg = '#EFF6FF';
    workloadHex = '1f30a'; // Wave (Blue)
  }

  const topStats = [
    { id: 'dashboard', title: 'Overview', value: realData.total, iconHex: '1f4ca', color: '#3B82F6', bg: '#EFF6FF' },
    { id: 'workload', title: 'Work Load', value: realData.total, iconHex: workloadHex, color: workloadColor, bg: workloadBg },
    { id: 'overdue', title: 'Over Due', value: realData.overdue, iconHex: '26a0', color: '#EF4444', bg: '#FEF2F2' },
    { id: 'dueToday', title: 'Due Today', value: realData.dueToday, iconHex: '23f0', color: '#0EA5E9', bg: '#F0F9FF' },
    { id: 'open', title: 'Open', value: realData.open, iconHex: '1f3af', color: '#64748B', bg: '#F1F5F9' },
    { id: 'reopen', title: 'Re Open', value: realData.reopened, iconHex: '1f300', color: '#EAB308', bg: '#FEF9C3' },
    { id: 'inProgress', title: 'In Progress', value: realData.inProgress, iconHex: '2699', color: '#F59E0B', bg: '#FFFBEB' },
    { id: 'toBeTested', title: 'To Be Tested', value: realData.toBeTested, iconHex: '1f4a1', color: '#8B5CF6', bg: '#F5F3FF' },
    { id: 'completed', title: 'Completed', value: realData.completed, iconHex: '1f389', color: '#10B981', bg: '#F0FDF4' }
  ];

  const renderActiveDashboard = () => {
    switch (activeTab) {
      case 'workload':
        return <WorkloadView realWorkload={realWorkload} isDark={isDark} />;
      case 'dueToday':
        return <DueTodayDashboard realTasks={realTasks} isDark={isDark} />;
      case 'reopen':
        return <ReopenDashboard realData={realData} realTasks={realTasks} isDark={isDark} />;
      case 'toBeTested':
        return <ToBeTestedDashboard realTasks={realTasks} isDark={isDark} />;
      case 'completed':
        return <CompletedDashboard isDark={isDark} realTasks={realTasks} />;
      case 'inProgress':
        return <InProgressDashboard isDark={isDark} realTasks={realTasks} />;
      case 'overdue':
        return <OverdueDashboard realTasks={realTasks} isDark={isDark} />;
      case 'open':
        return <OpenDashboard realTasks={realTasks} isDark={isDark} />;
      case 'dashboard':
      default:
        return <PerformanceOverview devStats={devStats} isDark={isDark} textColor={textColor} textMuted={textMuted} />;
    }
  };

  return (
    <PageContainer>
      {/* ── TOP STAT PILLS ── */}
      <Box
        sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)', lg: 'repeat(9,1fr)' }, gap: 1.5, mb: 2.5 }}
      >
        {topStats.map((stat, idx) => {
          const isActive = activeTab === stat.id;
          return (
            <TopStatCard
              key={idx}
              onClick={() => setActiveTab(stat.id)}
              sx={{
                border: 'none',
                borderBottom: `4px solid ${stat.color}`,
                bgcolor: isDark ? '#1E293B' : '#FFFFFF',
                transform: isActive ? 'translateY(-4px)' : 'none',
                boxShadow: isActive ? `0 12px 24px ${alpha(stat.color, 0.2)}` : '0 4px 12px rgba(0,0,0,0.05)',
                position: 'relative',
                pt: 1.5,
                pb: 1.5,
                px: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Box mb={1} sx={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <NotoEmoji hex={stat.iconHex} size={48} />
              </Box>
              <Typography
                variant="caption"
                fontWeight={800}
                color={stat.color}
                mb={0.5}
                sx={{ fontSize: '0.75rem', textTransform: 'capitalize' }}
              >
                {stat.title}
              </Typography>
              <Typography variant="h4" fontWeight={900} color={stat.color} sx={{ lineHeight: 1 }}>
                {stat.value}
              </Typography>
            </TopStatCard>
          );
        })}
      </Box>

      {renderActiveDashboard()}
    </PageContainer>
  );
}
