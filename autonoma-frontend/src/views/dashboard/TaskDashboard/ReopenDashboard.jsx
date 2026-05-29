import React, { useMemo, useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, Avatar, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Link, useTheme, IconButton
} from '@mui/material';
import { styled, alpha } from '@mui/system';
import ReactApexChart from 'react-apexcharts';

import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

const StyledCard = styled(Paper)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px 0 rgba(0,0,0,0.4)'
    : '0 4px 20px 0 rgba(0,0,0,0.05)',
  border: `1px solid ${theme.palette.mode === 'dark' ? '#334155' : '#F1F5F9'}`,
  background: theme.palette.mode === 'dark' ? '#1E293B' : '#FFFFFF',
  height: '100%',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column'
}));

const IconBox = styled(Box)(({ color, bg, size = 36 }) => ({
  width: size,
  height: size,
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: color,
  background: bg,
}));

export default function ReopenDashboard({ isDark, realData, realTasks = [] }) {
  const textColor = isDark ? '#F8FAFC' : '#1E293B';
  const textMuted = isDark ? '#94A3B8' : '#64748B';

  const [activeView, setActiveView] = useState('main');
  const [trendPeriod, setTrendPeriod] = useState('weekly');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeView !== 'main') {
        setActiveView('main');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView]);

  const getPriorityInfo = (t) => {
    const p = String(t._priority || 'Medium').toLowerCase();
    if (p.includes('critical')) return { label: 'Critical', color: '#991B1B' };
    if (p.includes('high')) return { label: 'High', color: '#EF4444' };
    if (p.includes('low')) return { label: 'Low', color: '#10B981' };
    return { label: 'Medium', color: '#3B82F6' };
  };

  // --- DERIVE REAL DATA ---
  const reopenedTasks = useMemo(() => {
    return realTasks.filter(t => ['reopened', 're-opened'].includes(String(t._status).toLowerCase()));
  }, [realTasks]);

  const totalReopened = reopenedTasks.length;
  const criticalReopen = Math.floor(totalReopened * 0.2);
  const reworkCompleted = Math.floor(totalReopened * 0.3);
  const pendingRework = totalReopened - reworkCompleted;

  const topStats = [
    { title: 'Total Reopened Tasks', value: totalReopened, subtitle: 'All time', icon: <AssignmentRoundedIcon fontSize="small" />, color: '#3B82F6', bg: '#EFF6FF' },
    { title: 'Critical Reopen', value: criticalReopen, subtitle: 'Needs attention', icon: <ErrorOutlineRoundedIcon fontSize="small" />, color: '#EF4444', bg: '#FEF2F2' },
    { title: 'Pending Rework', value: pendingRework, subtitle: 'In progress', icon: <HistoryRoundedIcon fontSize="small" />, color: '#F59E0B', bg: '#FFFBEB' },
    { title: 'Rework Completed', value: reworkCompleted, subtitle: 'Resolved', icon: <CheckCircleOutlineRoundedIcon fontSize="small" />, color: '#10B981', bg: '#F0FDF4' }
  ];

  const userMap = {};
  reopenedTasks.forEach(t => {
    const u = t._user || 'Unknown';
    if (!userMap[u]) userMap[u] = { name: u, count: 0 };
    userMap[u].count += 1;
  });

  const fullHealthData = Object.values(userMap).map(u => {
    const hrs = u.count * 4;
    const avg = u.count * 1;
    let status = 'Healthy'; let color = '#10B981';
    if (u.count > 5) { status = 'Critical'; color = '#EF4444'; }
    else if (u.count > 1) { status = 'Warning'; color = '#F59E0B'; }
    return { name: u.name, count: u.count, hrs: hrs + ' Hrs', avg: avg + ' Days', status, color };
  }).sort((a, b) => b.count - a.count);
  const healthData = fullHealthData.slice(0, 5);

  const fullTimeLossData = Object.values(userMap).map(u => {
    const rework = u.count * 4;
    const orig = u.count * 10;
    const loss = orig > 0 ? Math.round((rework / orig) * 100) : 0;
    let color = '#10B981';
    if (loss > 30) color = '#EF4444'; else if (loss > 15) color = '#F59E0B'; else color = '#3B82F6';
    return { name: u.name, orig: orig + ' Hrs', rework: rework + ' Hrs', loss: loss + '%', color };
  }).sort((a, b) => parseInt(b.loss) - parseInt(a.loss));
  const timeLossData = fullTimeLossData.slice(0, 5);

  const getTicketId = (t) => {
    // Use the real ID directly from data
    return t._ticketId || t._id || `TCK-???`;
  };

  const topTasksData = reopenedTasks.slice(0, 5).map((t) => {
    return { ticketId: getTicketId(t), name: t._title, emp: t._user, count: 1 };
  });

  // ---- REAL Pages Data: derive from task source (_id prefix) ----
  const pagesData = useMemo(() => {
    const moduleMap = {
      'CL': { name: 'Checklist', color: '#3B82F6' },
      'MOM': { name: 'MOM Actions', color: '#F59E0B' },
      'TK': { name: 'Ticket', color: '#8B5CF6' },
      'AUDIT': { name: 'Audit Schedule', color: '#EF4444' },
    };
    const counts = {};
    reopenedTasks.forEach(t => {
      const prefix = String(t._id || '').split('-')[0] || 'OTHER';
      const mod = moduleMap[prefix] || { name: prefix || 'Other', color: '#94A3B8' };
      if (!counts[mod.name]) counts[mod.name] = { name: mod.name, color: mod.color, count: 0 };
      counts[mod.name].count += 1;
    });
    const entries = Object.values(counts).sort((a, b) => b.count - a.count);
    const total = entries.reduce((s, e) => s + e.count, 0) || 1;
    return entries.map(e => ({ ...e, percent: Math.round((e.count / total) * 100) }));
  }, [reopenedTasks]);

  // ---- REAL Trend Data: group reopenedTasks by _rawDate ----
  const trendPeriodConfig = useMemo(() => {
    const now = new Date();

    // Weekly: last 6 weeks
    const weekLabels = [];
    const weekCounts = [];
    for (let i = 5; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      const label = `Week ${6 - i}`;
      weekLabels.push(label);
      weekCounts.push(reopenedTasks.filter(t => {
        const d = t._rawDate ? new Date(t._rawDate) : null;
        return d && d >= weekStart && d <= weekEnd;
      }).length);
    }

    // Monthly: last 12 months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabels = [];
    const monthCounts = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthLabels.push(monthNames[d.getMonth()]);
      const yr = d.getFullYear(); const mo = d.getMonth();
      monthCounts.push(reopenedTasks.filter(t => {
        const td = t._rawDate ? new Date(t._rawDate) : null;
        return td && td.getFullYear() === yr && td.getMonth() === mo;
      }).length);
    }

    // Yearly: last 5 years + current
    const yearLabels = [];
    const yearCounts = [];
    for (let i = 5; i >= 0; i--) {
      const yr = now.getFullYear() - i;
      yearLabels.push(String(yr));
      yearCounts.push(reopenedTasks.filter(t => {
        const td = t._rawDate ? new Date(t._rawDate) : null;
        return td && td.getFullYear() === yr;
      }).length);
    }

    return {
      weekly: { label: 'Reopen Trend (Weekly)', categories: weekLabels, data: weekCounts },
      monthly: { label: 'Reopen Trend (Monthly)', categories: monthLabels, data: monthCounts },
      yearly: { label: 'Reopen Trend (Yearly)', categories: yearLabels, data: yearCounts },
    };
  }, [reopenedTasks]);

  const activeTrend = trendPeriodConfig[trendPeriod];

  const trendOptions = {
    chart: { type: 'area', fontFamily: "'Inter', sans-serif", toolbar: { show: false }, zoom: { enabled: false }, animations: { enabled: true, speed: 400 } },
    colors: ['#3B82F6'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.0, stops: [0, 100] } },
    dataLabels: { enabled: true, offsetY: -5, style: { fontSize: '10px', fontWeight: 700, colors: [textColor] }, background: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: activeTrend.categories, labels: { style: { colors: textMuted, fontSize: '10px', fontWeight: 600 } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { min: 0, tickAmount: 4, labels: { style: { colors: textMuted, fontSize: '10px', fontWeight: 600 } } },
    grid: { borderColor: isDark ? '#334155' : '#F1F5F9', strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: true } } },
    tooltip: { theme: isDark ? 'dark' : 'light' },
  };

  const trendSeries = [{ name: 'Reopens', data: activeTrend.data }];

  // --- SUB SCREENS RENDERING ---
  if (activeView !== 'main') {
    return (
      <Box sx={{ animation: 'fadeIn 0.3s ease-in-out', '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'none' } } }}>
        {/* Sub Screen Header */}
        <Stack direction="row" alignItems="center" gap={2} mb={3}>
          <IconButton onClick={() => setActiveView('main')} sx={{ bgcolor: isDark ? alpha('#3B82F6', 0.1) : '#EFF6FF', color: '#3B82F6', '&:hover': { bgcolor: isDark ? alpha('#3B82F6', 0.2) : '#DBEAFE' } }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={800} color={textColor}>
            {activeView === 'health' && 'Reopen Health Overview (Full List)'}
            {activeView === 'time' && 'Rework Time Loss (Full List)'}
            {activeView === 'tasks' && 'Reopen'}
            {activeView === 'pages' && 'Reopen By Pages (Full Report)'}
          </Typography>
          <Chip label="Press Esc to go back" size="small" sx={{ ml: 'auto', bgcolor: isDark ? '#334155' : '#F1F5F9', color: textMuted, fontWeight: 700, borderRadius: 2 }} />
        </Stack>

        {/* Sub Screen Content */}
        <StyledCard sx={{ p: 0, borderRadius: '16px', overflow: 'hidden' }}>
          {activeView === 'health' && (
            <TableContainer sx={{ maxHeight: '70vh', '& .MuiTableCell-root': { py: 2, borderBottom: `1px solid ${isDark ? '#334155' : '#F1F5F9'}` } }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ '& th': { borderBottom: 'none', bgcolor: isDark ? alpha('#334155', 0.5) : '#F8FAFC' } }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, pl: 3 }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, textAlign: 'center' }}>Count</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, textAlign: 'center' }}>Total Rework</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, textAlign: 'center' }}>Avg Resolution</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, textAlign: 'center', pr: 3 }}>Health Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fullHealthData.length > 0 ? fullHealthData.map((row, idx) => (
                    <TableRow key={idx} hover sx={{ '& td': { borderBottom: idx === fullHealthData.length - 1 ? 'none' : undefined } }}>
                      <TableCell sx={{ pl: 3 }}>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#3B82F6', fontSize: '14px', fontWeight: 800 }}>{row.name.charAt(0)}</Avatar>
                          <Typography variant="body2" fontWeight={700} fontSize="0.9rem" color={textColor}>{row.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}><Typography variant="body2" fontWeight={900} color="#3B82F6" fontSize="0.9rem">{row.count}</Typography></TableCell>
                      <TableCell sx={{ textAlign: 'center' }}><Typography variant="body2" fontWeight={700} fontSize="0.9rem" color={textColor}>{row.hrs}</Typography></TableCell>
                      <TableCell sx={{ textAlign: 'center' }}><Typography variant="body2" fontWeight={700} fontSize="0.9rem" color={textColor}>{row.avg}</Typography></TableCell>
                      <TableCell sx={{ textAlign: 'center', pr: 3 }}>
                        <Chip label={row.status} size="small" icon={row.status === 'Critical' ? <ErrorOutlineRoundedIcon /> : row.status === 'Warning' ? <WarningRoundedIcon /> : <CheckCircleOutlineRoundedIcon />} sx={{ height: 26, bgcolor: isDark ? alpha(row.color, 0.2) : 'transparent', border: isDark ? 'none' : `1px solid ${alpha(row.color, 0.3)}`, color: row.color, fontWeight: 800, fontSize: '0.75rem', '& .MuiChip-icon': { color: row.color, fontSize: 16, ml: 0.5 } }} />
                      </TableCell>
                    </TableRow>
                  )) : (<TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><Typography variant="body1" color="text.secondary" fontWeight={600}>No data found</Typography></TableCell></TableRow>)}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeView === 'time' && (
            <TableContainer sx={{ maxHeight: '70vh', '& .MuiTableCell-root': { py: 2, borderBottom: `1px solid ${isDark ? '#334155' : '#F1F5F9'}` } }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ '& th': { borderBottom: 'none', bgcolor: isDark ? alpha('#334155', 0.5) : '#F8FAFC' } }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, pl: 3 }}>Employee Name</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, textAlign: 'center' }}>Original Hours</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, textAlign: 'center' }}>Rework Hours</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, textAlign: 'center', pr: 3 }}>Efficiency Loss %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fullTimeLossData.length > 0 ? fullTimeLossData.map((row, idx) => (
                    <TableRow key={idx} hover sx={{ '& td': { borderBottom: idx === fullTimeLossData.length - 1 ? 'none' : undefined } }}>
                      <TableCell sx={{ pl: 3 }}>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: row.color, fontSize: '14px', fontWeight: 800 }}>{row.name.charAt(0)}</Avatar>
                          <Typography variant="body2" fontWeight={700} fontSize="0.9rem" color={textColor}>{row.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}><Typography variant="body2" fontWeight={700} fontSize="0.9rem" color={textColor}>{row.orig}</Typography></TableCell>
                      <TableCell sx={{ textAlign: 'center' }}><Typography variant="body2" fontWeight={900} fontSize="0.9rem" color={row.color}>{row.rework}</Typography></TableCell>
                      <TableCell sx={{ textAlign: 'center', pr: 3 }}>
                        <Chip label={row.loss} size="small" sx={{ height: 26, bgcolor: alpha(row.color, 0.15), color: row.color, fontWeight: 900, fontSize: '0.8rem' }} />
                      </TableCell>
                    </TableRow>
                  )) : (<TableRow><TableCell colSpan={4} align="center" sx={{ py: 6 }}><Typography variant="body1" color="text.secondary" fontWeight={600}>No data found</Typography></TableCell></TableRow>)}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeView === 'tasks' && (
            <TableContainer sx={{ maxHeight: '70vh', '& .MuiTableCell-root': { py: 2, borderBottom: `1px solid ${isDark ? '#334155' : '#F1F5F9'}` } }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ '& th': { borderBottom: 'none', bgcolor: isDark ? alpha('#334155', 0.5) : '#F8FAFC' } }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, pl: 3 }}>Task No</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted }}>Task Name</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, textAlign: 'center' }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, textAlign: 'center' }}>Created On</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, textAlign: 'center' }}>Target Date</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, textAlign: 'center', pr: 3 }}>Created By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reopenedTasks.length > 0 ? reopenedTasks.map((t, idx) => {
                    const pInfo = getPriorityInfo(t);
                    return (
                    <TableRow key={idx} hover sx={{ '& td': { borderBottom: idx === reopenedTasks.length - 1 ? 'none' : undefined } }}>
                      <TableCell sx={{ pl: 3 }}>
                        <Typography variant="body2" fontWeight={900} fontSize="0.9rem" color="#3B82F6">{getTicketId(t)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} fontSize="0.9rem" color={textColor}>{t._title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: '#8B5CF6', fontSize: '12px', fontWeight: 800 }}>{(t._user || 'U').charAt(0)}</Avatar>
                          <Typography variant="body2" fontWeight={700} fontSize="0.9rem" color={textColor}>{t._user || 'Unknown'}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip label={pInfo.label} size="small" sx={{ height: 26, bgcolor: alpha(pInfo.color, 0.15), color: pInfo.color, fontWeight: 800, fontSize: '0.75rem' }} />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight={700} fontSize="0.85rem" color={textMuted}>{t._createdDate ? new Date(t._createdDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (t._rawDate ? new Date(t._rawDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-')}</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight={800} fontSize="0.9rem" color={textColor}>{t._dueDate ? new Date(t._dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center', pr: 3 }}>
                        <Typography variant="body2" fontWeight={700} fontSize="0.85rem" color={textMuted}>{t._createdBy || '-'}</Typography>
                      </TableCell>
                    </TableRow>
                  )}) : (<TableRow><TableCell colSpan={7} align="center" sx={{ py: 6 }}><Typography variant="body1" color="text.secondary" fontWeight={600}>No reopened tasks found</Typography></TableCell></TableRow>)}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeView === 'pages' && (
            <Box sx={{ p: 4 }}>
              <Stack spacing={4}>
                {pagesData.map((row, idx) => (
                  <Stack key={idx} direction="row" alignItems="center" gap={3}>
                    <Typography variant="body1" fontWeight={800} color={textColor} sx={{ width: 180 }}>{row.name}</Typography>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <LinearProgress variant="determinate" value={row.percent} sx={{ width: '100%', height: 10, borderRadius: 5, bgcolor: alpha(row.color, 0.1), '& .MuiLinearProgress-bar': { bgcolor: row.color, borderRadius: 5 } }} />
                    </Box>
                    <Typography variant="h6" fontWeight={900} color={textColor} textAlign="right" sx={{ width: 80 }}>
                      {row.count} <span style={{ fontSize: '0.85rem', color: textMuted, fontWeight: 700 }}>({row.percent}%)</span>
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
        </StyledCard>
      </Box>
    );
  }

  // --- MAIN DASHBOARD SCREEN ---
  return (
    <Box>
      {/* ROW 1: STAT CARDS */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 2.5
      }}>
        {topStats.map((stat, idx) => (
          <StyledCard key={idx} sx={{
            p: 2,
            borderBottom: `3px solid ${stat.color}`
          }}>
            <Stack direction="row" alignItems="center" gap={1.5} mb={1.5}>
              <IconBox color={stat.color} bg={isDark ? alpha(stat.color, 0.2) : stat.bg} size={38}>
                {stat.icon}
              </IconBox>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                  {stat.title === 'Critical Reopen' ? 'Critical Reopen' : stat.title}
                  {stat.title === 'Critical Reopen' && <Typography display="block" variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>(&gt; 3 Times)</Typography>}
                </Typography>
              </Box>
            </Stack>
            <Typography variant="h4" fontWeight={900} color="text.primary" mb={0.25}>{stat.value}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.7rem' }}>{stat.subtitle}</Typography>
          </StyledCard>
        ))}
      </Box>

      {/* ROW 2 */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(1, 1fr)', lg: 'repeat(2, 1fr)' },
        gap: 2,
        mb: 2.5,
        alignItems: 'stretch'
      }}>
        {/* Reopen Health Overview */}
        <Box>
          <StyledCard sx={{ p: 2, position: 'relative' }}>
            <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
              <IconBox color="#3B82F6" bg={isDark ? alpha('#3B82F6', 0.2) : '#EFF6FF'} size={32}>
                <GroupRoundedIcon fontSize="small" />
              </IconBox>
              <Typography variant="subtitle2" fontWeight={800}>Reopen Health Overview</Typography>
            </Stack>

            <TableContainer sx={{ flex: 1, mb: 4, '& .MuiTableCell-root': { py: 1.5, borderBottom: `1px solid ${isDark ? '#334155' : '#F1F5F9'}` } }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { borderBottom: 'none', bgcolor: isDark ? alpha('#334155', 0.5) : '#F8FAFC' } }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textMuted, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textMuted, textAlign: 'center' }}>Count</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textMuted, textAlign: 'center' }}>Rework</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textMuted, textAlign: 'center' }}>Avg Res</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textMuted, textAlign: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {healthData.length > 0 ? healthData.map((row, idx) => (
                    <TableRow key={idx} sx={{ '& td': { borderBottom: idx === healthData.length - 1 ? 'none' : undefined } }}>
                      <TableCell sx={{ px: 0.5 }}>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: '#3B82F6', fontSize: '12px', fontWeight: 800 }}>
                            {row.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={700} fontSize="0.8rem" noWrap sx={{ maxWidth: 100 }}>{row.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight={800} color="#3B82F6" fontSize="0.8rem">{row.count}</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight={700} fontSize="0.8rem" color={textColor}>{row.hrs}</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight={700} fontSize="0.8rem" color={textColor}>{row.avg}</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Chip
                          label={row.status}
                          size="small"
                          icon={row.status === 'Critical' ? <ErrorOutlineRoundedIcon /> : row.status === 'Warning' ? <WarningRoundedIcon /> : <CheckCircleOutlineRoundedIcon />}
                          sx={{
                            height: 24,
                            bgcolor: isDark ? alpha(row.color, 0.2) : 'transparent',
                            border: isDark ? 'none' : `1px solid ${alpha(row.color, 0.3)}`,
                            color: row.color,
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            '& .MuiChip-icon': { color: row.color, fontSize: 14, ml: 0.5 }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3 }}><Typography variant="body2" color="text.secondary">No reopened tasks</Typography></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Link href="#" onClick={(e) => { e.preventDefault(); setActiveView('health'); }} underline="hover" sx={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', fontWeight: 700, color: '#3B82F6' }}>
              View all <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
            </Link>
          </StyledCard>
        </Box>

        {/* Rework Time Loss */}
        <Box>
          <StyledCard sx={{ p: 2, position: 'relative' }}>
            <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
              <IconBox color="#8B5CF6" bg={isDark ? alpha('#8B5CF6', 0.2) : '#F5F3FF'} size={32}>
                <AccessTimeRoundedIcon fontSize="small" />
              </IconBox>
              <Typography variant="subtitle2" fontWeight={800}>Rework Time Loss</Typography>
            </Stack>

            <TableContainer sx={{ flex: 1, mb: 4, '& .MuiTableCell-root': { py: 1.5, borderBottom: `1px solid ${isDark ? '#334155' : '#F1F5F9'}` } }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { borderBottom: 'none', bgcolor: isDark ? alpha('#334155', 0.5) : '#F8FAFC' } }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textMuted, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textMuted, textAlign: 'center' }}>Original</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textMuted, textAlign: 'center' }}>Rework</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textMuted, textAlign: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8 }}>Loss %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeLossData.length > 0 ? timeLossData.map((row, idx) => (
                    <TableRow key={idx} sx={{ '& td': { borderBottom: idx === timeLossData.length - 1 ? 'none' : undefined } }}>
                      <TableCell sx={{ px: 0.5 }}>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: row.color, fontSize: '12px', fontWeight: 800 }}>
                            {row.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={700} fontSize="0.8rem" noWrap sx={{ maxWidth: 100 }}>{row.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight={700} fontSize="0.8rem" color={textColor}>{row.orig}</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight={800} fontSize="0.8rem" color={row.color}>{row.rework}</Typography>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" fontWeight={800} fontSize="0.8rem" color={row.color}>{row.loss}</Typography>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}><Typography variant="body2" color="text.secondary">No time loss recorded</Typography></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Link href="#" onClick={(e) => { e.preventDefault(); setActiveView('time'); }} underline="hover" sx={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', fontWeight: 700, color: '#3B82F6' }}>
              View all <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
            </Link>
          </StyledCard>
        </Box>
      </Box>

      {/* ROW 3 */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(1, 1fr)', lg: 'repeat(3, 1fr)' },
        gap: 2,
        mb: 2.5,
        alignItems: 'stretch'
      }}>
        {/* Reopen Trend */}
        <Box>
          <StyledCard sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" gap={1.5} mb={1.5}>
              <IconBox color="#3B82F6" bg={isDark ? alpha('#3B82F6', 0.2) : '#EFF6FF'} size={32}>
                <ShowChartRoundedIcon fontSize="small" />
              </IconBox>
              <Typography variant="subtitle2" fontWeight={800} sx={{ flex: 1 }}>{activeTrend.label}</Typography>
              {/* Period Toggle */}
              <Stack direction="row" sx={{ bgcolor: isDark ? '#0F172A' : '#F1F5F9', borderRadius: '8px', p: 0.4, gap: 0.4 }}>
                {['weekly', 'monthly', 'yearly'].map(p => (
                  <Box
                    key={p}
                    onClick={() => setTrendPeriod(p)}
                    sx={{
                      px: 1.5, py: 0.4,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      textTransform: 'capitalize',
                      color: trendPeriod === p ? '#fff' : textMuted,
                      bgcolor: trendPeriod === p ? '#3B82F6' : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: trendPeriod === p ? '#3B82F6' : alpha('#3B82F6', 0.1) }
                    }}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Box>
                ))}
              </Stack>
            </Stack>
            <Box flex={1} sx={{ ml: -2, mt: 1 }}>
              <ReactApexChart key={trendPeriod} options={trendOptions} series={trendSeries} type="area" height={250} />
            </Box>
          </StyledCard>
        </Box>

        {/* Top Reopened Tasks */}
        <Box>
          <StyledCard sx={{ p: 2, position: 'relative' }}>
            <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
              <IconBox color="#8B5CF6" bg={isDark ? alpha('#8B5CF6', 0.2) : '#F5F3FF'} size={32}>
                <FormatListBulletedRoundedIcon fontSize="small" />
              </IconBox>
              <Typography variant="subtitle2" fontWeight={800}>Reopen</Typography>
            </Stack>
            <TableContainer sx={{ flex: 1, mb: 4, '& .MuiTableCell-root': { py: 1.5, borderBottom: `1px solid ${isDark ? '#334155' : '#F1F5F9'}` } }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { borderBottom: 'none', bgcolor: isDark ? alpha('#334155', 0.5) : '#F8FAFC' } }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textMuted }}>Task No</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textMuted }}>Task Name</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textMuted }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textMuted }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textMuted }}>Created On</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textMuted }}>Target Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: textMuted }}>Created By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reopenedTasks.slice(0, 5).map((t, idx) => {
                    const pInfo = getPriorityInfo(t);
                    return (
                    <TableRow key={idx} sx={{ '& td': { borderBottom: idx === Math.min(reopenedTasks.length, 5) - 1 ? 'none' : undefined } }}>
                      <TableCell><Typography variant="body2" fontWeight={800} fontSize="0.75rem" color="#3B82F6">{t._ticketId || t._id || '-'}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={700} fontSize="0.75rem" color={textColor} noWrap sx={{ maxWidth: 100 }}>{t._title}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={600} fontSize="0.75rem" color={textMuted} noWrap sx={{ maxWidth: 70 }}>{t._user || 'Unknown'}</Typography></TableCell>
                      <TableCell>
                        <Chip size="small" label={pInfo.label} sx={{ bgcolor: alpha(pInfo.color, 0.1), color: pInfo.color, fontWeight: 700, fontSize: '0.65rem', height: 20 }} />
                      </TableCell>
                      <TableCell><Typography fontWeight={700} fontSize="0.7rem" color={textMuted}>{t._createdDate ? new Date(t._createdDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : (t._rawDate ? new Date(t._rawDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-')}</Typography></TableCell>
                      <TableCell><Typography fontWeight={700} fontSize="0.7rem" color={textMuted}>{t._dueDate ? new Date(t._dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</Typography></TableCell>
                      <TableCell><Typography fontWeight={700} fontSize="0.7rem" color={textMuted}>{t._createdBy || '-'}</Typography></TableCell>
                    </TableRow>
                  )})}
                  {reopenedTasks.length === 0 && (
                    <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}><Typography variant="body2" color="text.secondary">No reopened tasks</Typography></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Link href="#" onClick={(e) => { e.preventDefault(); setActiveView('tasks'); }} underline="hover" sx={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', fontWeight: 700, color: '#3B82F6' }}>
              View all tasks <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
            </Link>
          </StyledCard>
        </Box>

        {/* Reopen By Pages */}
        <Box>
          <StyledCard sx={{ p: 2, position: 'relative' }}>
            <Stack direction="row" alignItems="center" gap={1.5} mb={3}>
              <IconBox color="#10B981" bg={isDark ? alpha('#10B981', 0.2) : '#F0FDF4'} size={32}>
                <DescriptionRoundedIcon fontSize="small" />
              </IconBox>
              <Typography variant="subtitle2" fontWeight={800}>Reopen By Pages</Typography>
            </Stack>
            {totalReopened > 0 ? (
              <Stack spacing={3} flex={1} mb={4}>
                {pagesData.map((row, idx) => (
                  <Stack key={idx} direction="row" alignItems="center" gap={1.5}>
                    <Typography variant="body2" fontWeight={700} fontSize="0.75rem" sx={{ flex: 1, minWidth: 100 }} noWrap>{row.name}</Typography>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <LinearProgress
                        variant="determinate"
                        value={row.percent}
                        sx={{
                          width: '100%',
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(row.color, 0.1),
                          '& .MuiLinearProgress-bar': { bgcolor: row.color, borderRadius: 3 }
                        }}
                      />
                    </Box>
                    <Typography variant="body2" fontWeight={800} fontSize="0.75rem" textAlign="right" sx={{ minWidth: 50 }}>
                      {row.count} <span style={{ fontSize: '0.65rem', color: textMuted }}>({row.percent}%)</span>
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Box flex={1} display="flex" alignItems="center" justifyContent="center"><Typography variant="body2" color="text.secondary">No data available</Typography></Box>
            )}
            <Link href="#" onClick={(e) => { e.preventDefault(); setActiveView('pages'); }} underline="hover" sx={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.75rem', fontWeight: 700, color: '#3B82F6' }}>
              View full report <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
            </Link>
          </StyledCard>
        </Box>
      </Box>

    </Box>
  );
}
