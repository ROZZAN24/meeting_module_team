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
  padding: theme.spacing(2.5),
  fontFamily: "'Inter','Roboto',sans-serif"
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
    chart: { type: 'line', sparkline: { enabled: true }, animations: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    colors: [color],
    tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: () => '' } }, marker: { show: false } }
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
      <Grid container spacing={2.5} mb={2.5}>
        <Grid item xs={12} lg={8}>
          <Grid container spacing={2.5} sx={{ height: '100%' }}>
            {[
              {
                c: '#EF4444',
                bg: isDark ? '#2A161A' : '#FFF0F2',
                label: 'Critical',
                n: criticalCount,
                emoji: '1f6a8',
                data: [10, 25, 15, 40, 20, 50]
              },
              {
                c: '#3B82F6',
                bg: isDark ? '#17223B' : '#F0F5FF',
                label: 'Normal',
                n: normalCount,
                emoji: '1f44d',
                data: [20, 10, 30, 15, 40, 25]
              },
              {
                c: '#10B981',
                bg: isDark ? '#14251E' : '#F0FAF5',
                label: 'Healthy',
                n: healthyCount,
                emoji: '1f60e',
                data: [30, 40, 20, 50, 30, 60]
              }
            ].map((s, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <Card
                  sx={{
                    p: 2,
                    pb: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: s.bg,
                    border: `1px solid ${borderColor}`,
                    boxShadow: 'none',
                    height: '100%',
                    borderRadius: 3
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        width: 40,
                        height: 40
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -2,
                          width: 24,
                          height: 6,
                          bgcolor: s.c,
                          filter: 'blur(8px)',
                          opacity: 0.5,
                          borderRadius: '50%'
                        }}
                      />
                      <NotoEmoji hex={s.emoji} size={40} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color={s.c} fontWeight={800} sx={{ lineHeight: 1 }}>
                        {s.label}
                      </Typography>
                      <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1.1, mt: 0.3 }} color="text.primary">
                        {s.n}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ fontSize: '0.6rem', display: 'block', mt: 0.1 }}
                      >
                        Employees
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 'auto', pt: 1 }}>
                    <ReactApexChart options={sparklineOptions(s.c)} series={[{ data: s.data }]} type="line" height={25} width="100%" />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              height: '100%',
              background: isDark ? '#1E293B' : '#F8FAFC',
              border: `1px solid ${borderColor}`,
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <Box sx={{ zIndex: 2, flex: 1 }}>
              <Typography variant="h6" fontWeight={900} mb={0.5} color="text.primary">
                Team Performance <NotoEmoji hex="1f680" size={20} style={{ display: 'inline-block', verticalAlign: 'text-bottom' }} />
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
                sx={{ maxWidth: 200, display: 'block', lineHeight: 1.4, mb: 1.5 }}
              >
                Track workload, active tasks and productivity in real-time.
              </Typography>
              <Button
                variant="contained"
                endIcon={<TrendingUpRoundedIcon />}
                onClick={() => setViewAllOpen(true)}
                sx={{
                  bgcolor: '#6366F1',
                  '&:hover': { bgcolor: '#4F46E5' },
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 2,
                  py: 0.6,
                  fontSize: '0.75rem'
                }}
              >
                View All
              </Button>
            </Box>
            <Box sx={{ zIndex: 2, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, mb: 1 }}>
                <Box sx={{ width: 12, height: 24, bgcolor: '#A855F7', borderRadius: '3px 3px 0 0' }} />
                <Box sx={{ width: 12, height: 40, bgcolor: '#8B5CF6', borderRadius: '3px 3px 0 0' }} />
                <Box sx={{ width: 12, height: 56, bgcolor: '#06B6D4', borderRadius: '3px 3px 0 0' }} />
              </Box>
              <Box sx={{ position: 'relative', bottom: -5 }}>
                <NotoEmoji hex="1f3c6" size={80} />
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

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
          <Typography variant="h5" fontWeight={900}>
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
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              p: 3,
              bgcolor: isDark ? '#2A161A' : '#F5F3FF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              height: '100%',
              borderRadius: 3,
              boxShadow: 'none',
              position: 'relative'
            }}
          >
            <Box sx={{ width: 64, height: 64, flexShrink: 0 }}>
              <NotoEmoji hex="1f3c6" size={64} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={900} color="text.primary" mb={0.5}>
                Great job team! 🎊
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600} lineHeight={1.5}>
                {healthyEmployees} employees are performing great.
                <br />
                Let's keep the momentum going!
              </Typography>
              <Box sx={{ width: 40, height: 4, bgcolor: '#8B5CF6', borderRadius: 2, mt: 1.5 }} />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Grid container spacing={2.5} sx={{ height: '100%' }}>
            <Grid item xs={4}>
              <Card
                sx={{
                  p: 2.5,
                  pb: 1.5,
                  bgcolor: isDark ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${borderColor}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: 'none'
                }}
              >
                <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '30%',
                      bgcolor: alpha('#8B5CF6', 0.15),
                      color: '#8B5CF6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <TrendingUpRoundedIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.65rem' }}>
                      Average Workload
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={900} color="#8B5CF6" sx={{ lineHeight: 1.2 }}>
                      {avgWorkload}%
                    </Typography>
                  </Box>
                </Stack>
                <Box sx={{ mt: 'auto', mx: -2 }}>
                  <ReactApexChart
                    options={sparklineOptions('#8B5CF6')}
                    series={[{ data: [20, 40, 30, 50, 40, 60] }]}
                    type="line"
                    height={30}
                    width="100%"
                  />
                </Box>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card
                sx={{
                  p: 2.5,
                  pb: 1.5,
                  bgcolor: isDark ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${borderColor}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: 'none'
                }}
              >
                <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '30%',
                      bgcolor: alpha('#3B82F6', 0.15),
                      color: '#3B82F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <AccessTimeRoundedIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.65rem' }}>
                      Average Active Tasks
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={900} color="#3B82F6" sx={{ lineHeight: 1.2 }}>
                      {avgActiveTasks}
                    </Typography>
                  </Box>
                </Stack>
                <Box sx={{ mt: 'auto', mx: -2 }}>
                  <ReactApexChart
                    options={sparklineOptions('#3B82F6')}
                    series={[{ data: [10, 25, 20, 40, 30, 50] }]}
                    type="line"
                    height={30}
                    width="100%"
                  />
                </Box>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card
                sx={{
                  p: 2.5,
                  pb: 1.5,
                  bgcolor: isDark ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${borderColor}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  boxShadow: 'none'
                }}
              >
                <Stack direction="row" alignItems="center" gap={1.5} mb={1}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '30%',
                      bgcolor: alpha('#10B981', 0.15),
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <TrackChangesRoundedIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.65rem' }}>
                      Overall Productivity
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={900} color="#10B981" sx={{ lineHeight: 1.2 }}>
                      {overallProductivity}
                    </Typography>
                  </Box>
                </Stack>
                <Box sx={{ mt: 'auto', mx: -2 }}>
                  <ReactApexChart
                    options={sparklineOptions('#10B981')}
                    series={[{ data: [30, 50, 40, 60, 50, 70] }]}
                    type="line"
                    height={30}
                    width="100%"
                  />
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
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

  // Summary cards config
  const summaryCards = [
    { label: 'Total Assigned Hours', value: `${totalAssigned} Hrs`, sub: 'All Developers', svgIcon: <ClipboardSVG />, color: '#3B82F6' },
    {
      label: 'Total Completed Hours',
      value: `${totalCompleted} Hrs`,
      sub: 'All Developers',
      svgIcon: <GreenTargetSVG />,
      color: '#10B981'
    },
    { label: 'Pending Hours', value: `${pendingHrs} Hrs`, sub: 'Remaining Work', svgIcon: <HourglassSVG />, color: '#F59E0B' },
    { label: 'Total Developers', value: `${activeDev}`, sub: 'Active Developers', svgIcon: <PeopleSVG />, color: '#8B5CF6' },
    { label: 'Avg Performance', value: `${avgPerf}%`, sub: 'Across all developers', svgIcon: <BarChartSVG />, color: '#0EA5E9' },
    {
      label: 'Outstanding Performers',
      value: `${outstandingDevs.length}`,
      sub: 'Completed less than assigned',
      svgIcon: <TrophySVG />,
      color: '#EAB308'
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
      {/* ── TOP 6 SUMMARY CARDS ── */}
      <Box
        sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)', lg: 'repeat(6,1fr)' }, gap: 2, mb: 2.5 }}
      >
        {summaryCards.map((c, i) => (
          <Card
            key={i}
            sx={{ p: 2, bgcolor: alpha(c.color, 0.02), border: `1px solid ${alpha(c.color, 0.15)}`, display: 'flex', alignItems: 'center' }}
          >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
              <Box
                sx={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  bgcolor: alpha(c.color, 0.1)
                }}
              >
                {c.svgIcon}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.2}>
                  {c.label}
                </Typography>
                <Typography variant="h5" fontWeight={900} color={c.color} lineHeight={1.2}>
                  {c.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {c.sub}
                </Typography>
              </Box>
            </Stack>
          </Card>
        ))}
      </Box>

      {/* ── MIDDLE ROW: TABLE + STATUS CARDS ── */}
      <Grid container spacing={2} mb={2.5}>
        {/* Performance by Developer Table */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ height: '100%' }}>
            <Box px={2.5} pt={2} pb={1.5} borderBottom={`1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`}>
              <Typography variant="subtitle1" fontWeight={700}>
                Performance by Developer
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }}>
                    {['Developer', 'Assigned Hours', 'Completed Hours', 'Variance', 'Performance', 'Status', 'Trend (Last 7 Days)'].map(
                      (h) => (
                        <TableCell
                          key={h}
                          sx={{ fontWeight: 700, py: 1.2, fontSize: '12px', textAlign: h === 'Developer' ? 'left' : 'center' }}
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
                        <TableCell sx={{ py: 1 }}>
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
                        <TableCell sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {dev.assignedHrs} Hrs
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {dev.completedHrs} Hrs
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="body2" fontWeight={700} color={varColor}>
                            {varStr}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="body2" fontWeight={700} color={getPerfColor(dev.perfStatus)}>
                            {dev.performance}%
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', py: 1 }}>
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
                        <TableCell sx={{ textAlign: 'center', py: 1, width: 120 }}>
                          <ReactApexChart options={sparkOpts} series={[{ data: dev.trend }]} type="line" height={36} width={100} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Total Row */}
                  {devStats.length > 0 && (
                    <TableRow sx={{ bgcolor: isDark ? 'rgba(59,130,246,0.08)' : '#EFF6FF' }}>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" fontWeight={800} color="#3B82F6">
                          Total
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', py: 1.5 }}>
                        <Typography variant="body2" fontWeight={800} color="#3B82F6">
                          {totalAssigned} Hrs
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', py: 1.5 }}>
                        <Typography variant="body2" fontWeight={800} color="#3B82F6">
                          {totalCompleted} Hrs
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', py: 1.5 }}>
                        <Typography variant="body2" fontWeight={800} color={totalCompleted - totalAssigned >= 0 ? '#F59E0B' : '#10B981'}>
                          {totalCompleted - totalAssigned >= 0 ? '+' : ''}
                          {totalCompleted - totalAssigned} Hrs
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', py: 1.5 }}>
                        <Typography variant="body2" fontWeight={800} color="#3B82F6">
                          {avgPerf}%
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
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
        </Grid>

        {/* Status Summary Cards with 3D mascots */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={2} height="100%">
            {[
              { status: 'Outstanding', devs: outstandingDevs, desc: 'Completed less than assigned hours', SVG: GreenHappySVG },
              { status: 'Perfect', devs: perfectDevs, desc: 'Completed equal to assigned hours', SVG: BlueBullseyeSVG },
              { status: 'Low', devs: lowDevs, desc: 'Completed more than assigned hours', SVG: RedSadSVG }
            ].map((grp, i) => (
              <Card
                key={i}
                sx={{
                  p: 2.5,
                  bgcolor: getPerfBg(grp.status),
                  border: `1.5px solid ${getPerfBorder(grp.status)}`,
                  flex: 1,
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <Stack direction="row" alignItems="center" spacing={3}>
                  <Box sx={{ flexShrink: 0 }}>
                    <grp.SVG />
                  </Box>
                  <Box flex={1}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1.5,
                        py: 0.4,
                        borderRadius: 20,
                        bgcolor: getPerfColor(grp.status),
                        mb: 0.5
                      }}
                    >
                      <Typography variant="caption" fontWeight={800} color="white">
                        {grp.status}
                      </Typography>
                      {grp.status === 'Outstanding' && <Typography variant="caption">✨</Typography>}
                    </Box>
                    <Typography variant="caption" display="block" color="text.secondary" fontWeight={600} mb={1.5}>
                      {grp.desc}
                    </Typography>
                    <Stack direction="row" spacing={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          Total Developers
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={900} color={getPerfColor(grp.status)}>
                          {grp.devs.length}{' '}
                          <Typography component="span" variant="caption" color="text.secondary" fontWeight={600}>
                            ({activeDev > 0 ? Math.round((grp.devs.length / activeDev) * 100) : 0}%)
                          </Typography>
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          Total Hours
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={900} color={getPerfColor(grp.status)}>
                          {grp.devs.reduce((s, d) => s + d.completedHrs, 0)} Hrs
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>

      {/* ── BOTTOM ROW: DONUT + TREND + TOP PERFORMERS ── */}
      <Grid container spacing={2} mb={2.5}>
        {/* Donut */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              Performance Distribution
            </Typography>
            <Stack direction="row" alignItems="center" justifyContent="center">
              <Box width={175}>
                <ReactApexChart options={perfDistOptions} series={perfDistSeries} type="donut" height={190} />
              </Box>
              <Stack gap={1.5} ml={2} flex={1}>
                {[
                  {
                    l: 'Outstanding (< 100%)',
                    v: outstandingDevs.length,
                    p: activeDev > 0 ? `${Math.round((outstandingDevs.length / activeDev) * 100)}%` : '0%',
                    c: '#10B981'
                  },
                  {
                    l: 'Perfect (= 100%)',
                    v: perfectDevs.length,
                    p: activeDev > 0 ? `${Math.round((perfectDevs.length / activeDev) * 100)}%` : '0%',
                    c: '#3B82F6'
                  },
                  {
                    l: 'Low (> 100%)',
                    v: lowDevs.length,
                    p: activeDev > 0 ? `${Math.round((lowDevs.length / activeDev) * 100)}%` : '0%',
                    c: '#F59E0B'
                  }
                ].map((item, i) => (
                  <Box key={i} display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.c }} />
                      <Typography variant="caption" color="text.secondary">
                        {item.l}
                      </Typography>
                    </Box>
                    <Box textAlign="right" ml={1}>
                      <Typography variant="body2" fontWeight={800} color={item.c}>
                        {item.v}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {' '}
                        ({item.p})
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* Trend */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Performance Trend (All Developers)
            </Typography>
            <ReactApexChart options={trendOptions} series={trendSeries} type="line" height={200} />
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <Box px={2.5} pt={2} pb={1.5} borderBottom={`1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`}>
              <Typography variant="subtitle1" fontWeight={700}>
                Top Performers (By Efficiency)
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC' }}>
                    {['Developer', 'Efficiency', 'Variance', 'Status'].map((h) => (
                      <TableCell
                        key={h}
                        sx={{ fontWeight: 700, fontSize: '12px', py: 1, textAlign: h === 'Developer' ? 'left' : 'center' }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topPerformers.map((dev, idx) => {
                    const varNum = dev.completedHrs - dev.assignedHrs;
                    const varStr = `${varNum >= 0 ? '+' : ''}${varNum} Hrs`;
                    const varColor = varNum < 0 ? '#10B981' : varNum === 0 ? '#3B82F6' : '#F59E0B';
                    return (
                      <TableRow key={idx} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ py: 1 }}>
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Avatar
                              sx={{
                                width: 26,
                                height: 26,
                                bgcolor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                                fontSize: '11px',
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
                        <TableCell sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="body2" fontWeight={700} color={getPerfColor(dev.perfStatus)}>
                            {dev.performance}%
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="body2" fontWeight={700} color={varColor}>
                            {varStr}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', py: 1 }}>{getPerfIcon(dev.perfStatus)}</TableCell>
                      </TableRow>
                    );
                  })}
                  {topPerformers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3, color: textMuted }}>
                        No data yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* ── INSIGHTS + TIME OF DAY ── */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              Performance Insights
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {insights.map((ins, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: ins.bg,
                    border: `1px solid ${ins.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}
                >
                  <Box sx={{ flexShrink: 0 }}>{ins.emoji}</Box>
                  <Box>
                    <Stack direction="row" alignItems="baseline" gap={0.5}>
                      <Typography variant="subtitle1" fontWeight={900} color={ins.color}>
                        {ins.v}
                      </Typography>
                      <Typography variant="caption" fontWeight={800} color={ins.color}>
                        {ins.label}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      whiteSpace="pre-line"
                      lineHeight={1.3}
                      fontWeight={600}
                      display="block"
                    >
                      {ins.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Performance by Time of Day (Completed Hours)
            </Typography>
            <ReactApexChart options={todOptions} series={todSeries} type="bar" height={230} />
          </Card>
        </Grid>
      </Grid>
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
          const hrs = t._hrs || 8;
          const uName = t._user || 'Unknown';
          if (!devHoursMap[uName]) devHoursMap[uName] = { user: uName, assignedHrs: 0, completedHrs: 0 };
          devHoursMap[uName].assignedHrs += hrs;
          if (isDone) devHoursMap[uName].completedHrs += hrs;
          if (!isDone) {
            if (!workloadMap[uName]) workloadMap[uName] = { user: uName, hours: 0, tasks: 0 };
            workloadMap[uName].tasks += 1;
            workloadMap[uName].hours += hrs;
          }
          if (isDone) stats.completed++;
          if (['open', 'new', 'pending'].includes(st)) stats.open++;
          else if (['in progress', 'wip', 'assigned', 'rework'].includes(st)) stats.inProgress++;
          else if (['to be tested', 'testing', 'ready for testing'].includes(st)) stats.toBeTested++;
          else if (['reopened', 're-opened'].includes(st)) stats.reopened++;
          else if (!isDone) stats.open++;
          if (t._dueDate) {
            const d = new Date(t._dueDate);
            d.setHours(0, 0, 0, 0);
            if (d < today && !isDone) {
              stats.overdue++;
              const diff = Math.ceil(Math.abs(today - d) / 864e5);
              overdueList.push({ id: t._id, title: t._title, user: t._user, days: `${diff} Days` });
            } else if (d.getTime() === today.getTime() && !isDone) stats.dueToday++;
          }
        });

        const workloadArr = Object.values(workloadMap)
          .map((w) => {
            const days = Math.round((w.hours / 8) * 10) / 10;
            let percent = Math.min(100, Math.round((w.tasks / 8) * 100));
            if (w.tasks === 0) percent = 0;
            else if (percent === 0) percent = 10;
            let color = '#10B981',
              status = 'Healthy';
            if (w.tasks === 0) {
              color = '#EF4444';
              status = 'Critical';
            } else if (w.tasks >= 3 && w.tasks <= 5) {
              color = '#3B82F6';
              status = 'Normal';
            }
            return { ...w, days, percent, color, status };
          })
          .sort((a, b) => ({ Critical: 0, Normal: 1, Healthy: 2 })[a.status] - { Critical: 0, Normal: 1, Healthy: 2 }[b.status]);

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
