import React, { useMemo, useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Avatar, Chip, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, LinearProgress, IconButton, Link
} from '@mui/material';
import { styled, alpha } from '@mui/system';
import ReactApexChart from 'react-apexcharts';

import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';

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

export default function OpenDashboard({ isDark, realTasks = [] }) {
  const textColor = isDark ? '#F8FAFC' : '#1E293B';
  const textMuted = isDark ? '#94A3B8' : '#64748B';

  const [activeView, setActiveView] = useState('main');
  const [trendPeriod, setTrendPeriod] = useState('weekly');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && activeView !== 'main') setActiveView('main');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView]);

  // --- DERIVE REAL DATA ---
  const openTasks = useMemo(() => {
    return realTasks.filter(t => {
      const st = String(t._status || '').toLowerCase().trim();
      return ['open', 'new', 'pending'].includes(st);
    });
  }, [realTasks]);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const parseDate = (dStr) => {
    if (!dStr) return null;
    const d = new Date(dStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const getStartDate = (t) => {
    const d = parseDate(t._createdDate || t._rawDate || t.createdAt);
    return d || new Date(); 
  };

  const isToday = (d) => {
    return d && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  };

  const isThisWeek = (d) => {
    if (!d) return false;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return d >= weekStart && d <= weekEnd;
  };

  const getPriorityInfo = (t) => {
    const p = String(t._priority || 'Medium').toLowerCase();
    if (p.includes('critical')) return { label: 'Critical', color: '#991B1B' };
    if (p.includes('high'))     return { label: 'High',     color: '#EF4444' };
    if (p.includes('low'))      return { label: 'Low',      color: '#10B981' };
    return                             { label: 'Medium',   color: '#3B82F6' };
  };

  let openedToday = 0;
  let openedThisWeek = 0;
  let totalWaitingDays = 0;
  let critHighCount = 0;
  
  let wait0_1 = 0;
  let wait2_3 = 0;
  let wait4_7 = 0;
  let wait7Plus = 0;

  const userMap = {};
  
  let critCount = 0, highCount = 0, medCount = 0, lowCount = 0;

  openTasks.forEach(t => {
    const start = getStartDate(t);
    if (isToday(start)) openedToday++;
    if (isThisWeek(start)) openedThisWeek++;

    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    totalWaitingDays += diffDays;

    if (diffDays <= 1) wait0_1++;
    else if (diffDays <= 3) wait2_3++;
    else if (diffDays <= 7) wait4_7++;
    else wait7Plus++;

    const pInfo = getPriorityInfo(t);
    if (pInfo.label === 'Critical') critCount++;
    else if (pInfo.label === 'High') highCount++;
    else if (pInfo.label === 'Medium') medCount++;
    else lowCount++;

    if (pInfo.label === 'Critical' || pInfo.label === 'High') critHighCount++;

    const u = t._user || 'Unassigned';
    if (!userMap[u]) userMap[u] = { name: u, total: 0, high: 0, medium: 0, low: 0, totalWait: 0 };
    userMap[u].total++;
    userMap[u].totalWait += diffDays;
    
    if (pInfo.label === 'Critical' || pInfo.label === 'High') userMap[u].high++;
    else if (pInfo.label === 'Medium') userMap[u].medium++;
    else userMap[u].low++;
  });

  const avgWaitingDays = openTasks.length > 0 ? (totalWaitingDays / openTasks.length).toFixed(1) : 0;
  
  const fullDeveloperData = Object.values(userMap).sort((a, b) => b.total - a.total).map(u => ({
    ...u,
    avgWait: u.total > 0 ? (u.totalWait / u.total).toFixed(1) : 0
  }));
  const developerTableData = fullDeveloperData.slice(0, 8);
  const developersWorkingCount = fullDeveloperData.filter(d => d.name !== 'Unassigned').length;

  const topStats = [
    { title: 'Total Open Tasks', value: openTasks.length, subtitle: 'All open tasks', icon: <AssignmentRoundedIcon fontSize="small" />, color: '#3B82F6', bg: '#EFF6FF' },
    { title: 'Assigned Developers', value: developersWorkingCount, subtitle: 'Developers with open tasks', icon: <GroupRoundedIcon fontSize="small" />, color: '#8B5CF6', bg: '#F5F3FF' },
    { title: 'Open This Week', value: openedThisWeek, subtitle: 'Tasks opened this week', icon: <CalendarMonthRoundedIcon fontSize="small" />, color: '#10B981', bg: '#F0FDF4' },
    { title: 'Avg Waiting Days', value: avgWaitingDays, subtitle: 'Average since created', icon: <AccessTimeRoundedIcon fontSize="small" />, color: '#F59E0B', bg: '#FFFBEB' },
    { title: 'New Open Today', value: openedToday, subtitle: 'Tasks opened today', icon: <TimelineRoundedIcon fontSize="small" />, color: '#0EA5E9', bg: '#F0F9FF' }
  ];

  // --- Priority Donut ---
  const allPriorities = [
    { label: 'Critical', count: critCount, color: '#991B1B' },
    { label: 'High',     count: highCount, color: '#EF4444' },
    { label: 'Medium',   count: medCount,  color: '#3B82F6' },
    { label: 'Low',      count: lowCount,  color: '#10B981' },
  ];
  const priorityPieSeries = allPriorities.map(p => p.count);
  const priorityPieLabels = allPriorities.map(p => p.label);
  const priorityPieColors = allPriorities.map(p => p.color);

  const priorityPieOptions = {
    chart: { type: 'donut', fontFamily: "'Inter', sans-serif" },
    labels: priorityPieLabels,
    colors: priorityPieColors,
    stroke: { width: 3, colors: [isDark ? '#1E293B' : '#FFFFFF'] },
    plotOptions: { pie: { donut: { size: '70%', labels: { show: true, name: { show: true, color: textMuted }, value: { show: true, fontSize: '22px', fontWeight: 800, color: textColor }, total: { show: true, label: 'Total Open Tasks', formatter: () => openTasks.length.toString(), color: textMuted, fontSize: '11px', fontWeight: 600 } } } } },
    dataLabels: { enabled: true, formatter: (val) => val.toFixed(1) + '%', style: { fontSize: '11px', fontWeight: 700 } },
    legend: { show: false }
  };

  // --- Wait Duration Bar ---
  const waitDurationSeries = [{ name: 'Tasks', data: [wait0_1, wait2_3, wait4_7, wait7Plus] }];
  const waitDurationOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: "'Inter', sans-serif" },
    colors: ['#3B82F6'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '40%', dataLabels: { position: 'top' } } },
    dataLabels: { enabled: true, offsetY: -20, style: { fontSize: '12px', colors: [textColor] } },
    xaxis: { categories: ['0-1 Day', '2-3 Days', '4-7 Days', '7+ Days'], labels: { style: { colors: textMuted, fontWeight: 600, fontSize: '11px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { show: false },
    grid: { borderColor: isDark ? '#334155' : '#F1F5F9', strokeDashArray: 4, yaxis: { lines: { show: true } } },
  };

  // --- Module (Department/Team) Data ---
  const moduleData = useMemo(() => {
    const counts = {};
    openTasks.forEach(t => {
      const prefix = String(t._id || '').split('-')[0] || 'OTHER';
      const name = prefix === 'CL' ? 'Development' : prefix === 'MOM' ? 'Testing' : prefix === 'TK' ? 'Support' : prefix === 'AUDIT' ? 'HR' : 'Others';
      if (!counts[name]) counts[name] = 0;
      counts[name]++;
    });
    
    const colors = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#94A3B8'];
    const total = openTasks.length || 1;
    
    return Object.keys(counts).map((k, i) => ({
      name: k,
      count: counts[k],
      percent: ((counts[k] / total) * 100).toFixed(1),
      color: colors[i % colors.length]
    })).sort((a, b) => b.count - a.count);
  }, [openTasks]);

  // --- Trend Data ---
  const trendPeriodConfig = useMemo(() => {
    const validTasks = realTasks.filter(t => ['open', 'new', 'pending'].includes(String(t._status || '').toLowerCase().trim()));

    const weekLabels = [];
    const weekCounts = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      weekLabels.push(dayNames[d.getDay()]);
      weekCounts.push(validTasks.filter(t => {
        const start = getStartDate(t);
        return start.getFullYear() === d.getFullYear() && start.getMonth() === d.getMonth() && start.getDate() === d.getDate();
      }).length);
    }

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthLabels = [];
    const monthCounts = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthLabels.push(monthNames[d.getMonth()]);
      monthCounts.push(validTasks.filter(t => {
        const start = getStartDate(t);
        return start.getFullYear() === d.getFullYear() && start.getMonth() === d.getMonth();
      }).length);
    }

    const yearLabels = [];
    const yearCounts = [];
    for (let i = 4; i >= 0; i--) {
      const yr = now.getFullYear() - i;
      yearLabels.push(String(yr));
      yearCounts.push(validTasks.filter(t => getStartDate(t).getFullYear() === yr).length);
    }

    return {
      weekly: { label: 'Open Tasks (Last 7 Days)', categories: weekLabels, data: weekCounts },
      monthly: { label: 'Open Tasks (Monthly)', categories: monthLabels, data: monthCounts },
      yearly: { label: 'Open Tasks (Yearly)', categories: yearLabels, data: yearCounts },
    };
  }, [realTasks]);

  const activeTrend = trendPeriodConfig[trendPeriod];
  const trendOptions = {
    chart: { type: 'area', fontFamily: "'Inter', sans-serif", toolbar: { show: false } },
    colors: ['#3B82F6'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.0, stops: [0, 100] } },
    dataLabels: { enabled: true, offsetY: -5, style: { fontSize: '11px', colors: [textColor] }, background: { enabled: false } },
    stroke: { curve: 'smooth', width: 2 },
    markers: { size: 4, colors: ['#fff'], strokeColors: '#3B82F6', strokeWidth: 2 },
    xaxis: { categories: activeTrend.categories, labels: { style: { colors: textMuted, fontSize: '11px', fontWeight: 600 } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { show: false, min: 0 },
    grid: { borderColor: isDark ? '#334155' : '#F1F5F9', strokeDashArray: 4, yaxis: { lines: { show: true } } },
    tooltip: { theme: isDark ? 'dark' : 'light' },
  };

  // Sparkline options for Developer table
  const sparklineOptions = {
    chart: { type: 'line', sparkline: { enabled: true } },
    stroke: { curve: 'smooth', width: 2 },
    tooltip: { fixed: { enabled: false }, x: { show: false }, y: { title: { formatter: function (seriesName) { return '' } } }, marker: { show: false } }
  };

  if (activeView !== 'main') {
    return (
      <Box sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>
        <Stack direction="row" alignItems="center" gap={2} mb={3}>
          <IconButton onClick={() => setActiveView('main')} sx={{ bgcolor: isDark ? alpha('#3B82F6', 0.1) : '#EFF6FF', color: '#3B82F6' }}>
            <ArrowBackRoundedIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={800} color={textColor}>
            {activeView === 'employee' && 'Open Tasks by Developer'}
            {activeView === 'tasks' && 'Active Open Tasks'}
          </Typography>
        </Stack>

        <StyledCard sx={{ p: 2 }}>
          {activeView === 'tasks' && (
            <TableContainer sx={{ maxHeight: '70vh', '& .MuiTableCell-root': { py: 2, borderBottom: `1px solid ${isDark ? '#334155' : '#F1F5F9'}` } }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ '& th': { borderBottom: 'none', bgcolor: isDark ? alpha('#334155', 0.5) : '#F8FAFC' } }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted }}>Task No</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted }}>Task Name</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted }}>Created On</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted }}>Target Date</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted }}>Created By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {openTasks.sort((a,b) => getStartDate(b) - getStartDate(a)).map((t, idx) => {
                    const pInfo = getPriorityInfo(t);
                    return (
                      <TableRow key={idx} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={900} fontSize="0.9rem" color="#3B82F6">{t._ticketId || t._id || 'TCK-???'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} fontSize="0.9rem" color={textColor}>{t._title}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" gap={1.5}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: '#8B5CF6', fontSize: '12px', fontWeight: 800 }}>{(t._user || 'U').charAt(0)}</Avatar>
                            <Typography variant="body2" fontWeight={700} fontSize="0.85rem" color={textColor}>{t._user || 'Unassigned'}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip label={pInfo.label} size="small" sx={{ height: 26, bgcolor: alpha(pInfo.color, 0.15), color: pInfo.color, fontWeight: 800, fontSize: '0.75rem' }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} fontSize="0.85rem" color={textColor}>{getStartDate(t).toLocaleDateString()}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} fontSize="0.85rem" color={textColor}>{t._dueDate ? new Date(t._dueDate).toLocaleDateString() : '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} fontSize="0.85rem" color={textColor}>{t._createdBy || 'System'}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeView === 'employee' && (
            <TableContainer sx={{ maxHeight: '70vh', '& .MuiTableCell-root': { py: 2, borderBottom: `1px solid ${isDark ? '#334155' : '#F1F5F9'}` } }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow sx={{ '& th': { borderBottom: 'none', bgcolor: isDark ? alpha('#334155', 0.5) : '#F8FAFC' } }}>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted }}>Developer</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, textAlign: 'center' }}>Total Open Tasks</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, textAlign: 'center' }}>High / Critical</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, textAlign: 'center' }}>Medium</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, textAlign: 'center' }}>Low</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.85rem', color: textMuted, textAlign: 'center' }}>Avg Waiting</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fullDeveloperData.map((row, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#3B82F6', fontSize: '13px', fontWeight: 800 }}>{row.name.charAt(0)}</Avatar>
                          <Typography variant="body2" fontWeight={700} fontSize="0.9rem" color={textColor}>{row.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}><Typography variant="body2" fontWeight={900} fontSize="0.9rem" color={textColor}>{row.total}</Typography></TableCell>
                      <TableCell sx={{ textAlign: 'center' }}><Typography variant="body2" fontWeight={800} fontSize="0.9rem" color={row.high > 0 ? '#EF4444' : textMuted}>{row.high}</Typography></TableCell>
                      <TableCell sx={{ textAlign: 'center' }}><Typography variant="body2" fontWeight={800} fontSize="0.9rem" color={row.medium > 0 ? '#F59E0B' : textMuted}>{row.medium}</Typography></TableCell>
                      <TableCell sx={{ textAlign: 'center' }}><Typography variant="body2" fontWeight={800} fontSize="0.9rem" color={row.low > 0 ? '#10B981' : textMuted}>{row.low}</Typography></TableCell>
                      <TableCell sx={{ textAlign: 'center' }}><Typography variant="body2" fontWeight={900} fontSize="0.9rem" color={textColor}>{row.avgWait} Days</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </StyledCard>
      </Box>
    );
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      {/* ROW 1: STATS */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 2, mb: 2.5 }}>
        {topStats.map((stat, idx) => (
          <StyledCard key={idx} sx={{ p: 2, borderBottom: `3px solid ${stat.color}` }}>
            <Stack direction="row" alignItems="center" gap={1.5} mb={1.5}>
              <IconBox color={stat.color} bg={isDark ? alpha(stat.color, 0.2) : stat.bg} size={36}>
                {stat.icon}
              </IconBox>
              <Typography variant="body2" color="text.primary" fontWeight={700} sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>{stat.title}</Typography>
            </Stack>
            <Typography variant="h4" fontWeight={900} color="text.primary" mb={0.25}>{stat.value}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.65rem' }}>{stat.subtitle}</Typography>
          </StyledCard>
        ))}
      </Box>

      {/* ROW 2 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '6fr 3fr 3fr' }, gap: 2, mb: 2.5, alignItems: 'stretch' }}>
        
        {/* Open Tasks By Developer */}
        <StyledCard sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
            <GroupRoundedIcon fontSize="small" sx={{ color: '#3B82F6' }} />
            <Typography variant="subtitle2" fontWeight={800} color="text.primary">Open Tasks By Developer</Typography>
          </Stack>
          <Box flex={1}>
          <TableContainer sx={{ '& .MuiTableCell-root': { py: 1.2, borderBottom: `1px solid ${isDark ? '#334155' : '#F1F5F9'}` } }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { borderBottom: 'none', bgcolor: isDark ? alpha('#334155', 0.5) : '#F8FAFC' } }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem', color: textMuted }}>Developer</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem', color: textMuted, textAlign: 'center' }}>Open Tasks</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem', color: textMuted, textAlign: 'center' }}>
                    <Box display="inline-flex" alignItems="center" gap={0.5}><Box sx={{width:6,height:6,borderRadius:'50%',bgcolor:'#EF4444'}}/> High</Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem', color: textMuted, textAlign: 'center' }}>
                    <Box display="inline-flex" alignItems="center" gap={0.5}><Box sx={{width:6,height:6,borderRadius:'50%',bgcolor:'#F59E0B'}}/> Medium</Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem', color: textMuted, textAlign: 'center' }}>
                    <Box display="inline-flex" alignItems="center" gap={0.5}><Box sx={{width:6,height:6,borderRadius:'50%',bgcolor:'#10B981'}}/> Low</Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem', color: textMuted, textAlign: 'center' }}>Avg Waiting</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {developerTableData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 20, height: 20, bgcolor: '#3B82F6', fontSize: '9px', fontWeight: 800 }}>{row.name.charAt(0)}</Avatar>
                        <Typography fontSize="0.7rem" fontWeight={700} noWrap sx={{ maxWidth: 80 }}>{row.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}><Typography fontWeight={800} fontSize="0.75rem" color={textColor}>{row.total}</Typography></TableCell>
                    <TableCell sx={{ textAlign: 'center' }}><Typography fontWeight={700} fontSize="0.75rem" color={row.high > 0 ? '#EF4444' : textMuted}>{row.high}</Typography></TableCell>
                    <TableCell sx={{ textAlign: 'center' }}><Typography fontWeight={700} fontSize="0.75rem" color={row.medium > 0 ? '#F59E0B' : textMuted}>{row.medium}</Typography></TableCell>
                    <TableCell sx={{ textAlign: 'center' }}><Typography fontWeight={700} fontSize="0.75rem" color={row.low > 0 ? '#10B981' : textMuted}>{row.low}</Typography></TableCell>
                    <TableCell sx={{ textAlign: 'center' }}><Typography fontWeight={800} fontSize="0.75rem" color={textColor}>{row.avgWait} Days</Typography></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </Box>
          <Box
            onClick={() => setActiveView('employee')}
            sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${isDark ? '#334155' : '#F1F5F9'}`, display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: '#3B82F6', '&:hover': { opacity: 0.8 } }}
          >
            <Typography variant="body2" fontWeight={700} color="#3B82F6">View all</Typography>
            <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: '#3B82F6' }} />
          </Box>
        </StyledCard>

        {/* Priority Distribution */}
        <StyledCard sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
            <ShowChartRoundedIcon fontSize="small" sx={{ color: '#3B82F6' }} />
            <Typography variant="subtitle2" fontWeight={800} color="text.primary">Open Task Priority Distribution</Typography>
          </Stack>
          <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <ReactApexChart options={priorityPieOptions} series={priorityPieSeries} type="donut" height={220} />
            <Stack mt={2} spacing={1} width="100%">
              {allPriorities.map((p, i) => (
                <Stack key={i} direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
                    <Typography variant="caption" fontWeight={700} color={textColor}>{p.label}</Typography>
                  </Stack>
                  <Typography variant="caption" fontWeight={800} color={textColor}>
                    {p.count} <span style={{color: textMuted, fontSize: '10px'}}>({openTasks.length > 0 ? ((p.count/openTasks.length)*100).toFixed(1) : 0}%)</span>
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </StyledCard>

        {/* Waiting Duration */}
        <StyledCard sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
            <FormatListBulletedRoundedIcon fontSize="small" sx={{ color: '#3B82F6' }} />
            <Typography variant="subtitle2" fontWeight={800} color="text.primary">Open Tasks Waiting Duration</Typography>
          </Stack>
          <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            <Typography variant="caption" color="text.secondary" alignSelf="flex-start" mb={-2} zIndex={1}>Tasks</Typography>
            <Box width="100%">
              <ReactApexChart options={waitDurationOptions} series={waitDurationSeries} type="bar" height={220} />
            </Box>
            <Box sx={{ mt: 2, bgcolor: isDark ? alpha('#3B82F6', 0.1) : '#EFF6FF', p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <InfoOutlinedIcon sx={{ fontSize: 16, color: '#3B82F6' }} />
              <Typography variant="body2" fontWeight={700} color="#3B82F6">{wait4_7 + wait7Plus} tasks waiting for more than 3 days</Typography>
            </Box>
          </Box>
        </StyledCard>
      </Box>

      {/* ROW 3 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 2, alignItems: 'stretch' }}>

        {/* Open Task */}
        <StyledCard sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
            <FormatListBulletedRoundedIcon fontSize="small" sx={{ color: '#3B82F6' }} />
            <Typography variant="subtitle2" fontWeight={800}>Open Task</Typography>
          </Stack>
          <Box flex={1}>
          <TableContainer sx={{ '& .MuiTableCell-root': { py: 1.2, borderBottom: `1px solid ${isDark ? '#334155' : '#F1F5F9'}` } }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { borderBottom: 'none', bgcolor: isDark ? alpha('#334155', 0.5) : '#F8FAFC' } }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem', color: textMuted }}>Task No</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem', color: textMuted }}>Task Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem', color: textMuted }}>Assigned To</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem', color: textMuted }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem', color: textMuted }}>Created On</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem', color: textMuted }}>Target Date</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem', color: textMuted }}>Created By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {openTasks.sort((a,b) => getStartDate(b) - getStartDate(a)).slice(0, 5).map((t, idx) => {
                  const pInfo = getPriorityInfo(t);
                  return (
                    <TableRow key={idx}>
                      <TableCell><Typography fontWeight={900} fontSize="0.72rem" color="#3B82F6">{t._ticketId || t._id || 'TCK-???'}</Typography></TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#3B82F6' }} />
                          <Typography fontWeight={700} fontSize="0.72rem" color={textColor} noWrap sx={{ maxWidth: 120 }}>{t._title}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell><Typography fontWeight={700} fontSize="0.72rem" color={textColor}>{t._user || 'Unknown'}</Typography></TableCell>
                      <TableCell>
                        <Typography fontWeight={800} fontSize="0.7rem" color={pInfo.color}>{pInfo.label}</Typography>
                      </TableCell>
                      <TableCell>
                         <Typography fontWeight={700} fontSize="0.7rem" color={textMuted}>{getStartDate(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Typography>
                      </TableCell>
                      <TableCell>
                         <Typography fontWeight={700} fontSize="0.7rem" color={textMuted}>{t._dueDate ? new Date(t._dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</Typography>
                      </TableCell>
                      <TableCell>
                         <Typography fontWeight={700} fontSize="0.7rem" color={textMuted}>{t._createdBy || 'System'}</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          </Box>
          <Box
            onClick={() => setActiveView('tasks')}
            sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${isDark ? '#334155' : '#F1F5F9'}`, display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: '#3B82F6', '&:hover': { opacity: 0.8 } }}
          >
            <Typography variant="body2" fontWeight={700} color="#3B82F6">View all open tasks</Typography>
            <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: '#3B82F6' }} />
          </Box>
        </StyledCard>

        {/* Trend Area Chart */}
        <StyledCard sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <FormatListBulletedRoundedIcon fontSize="small" sx={{ color: '#3B82F6' }} />
              <Typography variant="subtitle2" fontWeight={800}>Open Tasks Trend</Typography>
            </Stack>
            <Stack direction="row" sx={{ bgcolor: isDark ? '#0F172A' : '#F1F5F9', borderRadius: '8px', p: 0.4, gap: 0.4 }}>
              {['weekly', 'monthly', 'yearly'].map(p => (
                <Box
                  key={p} onClick={() => setTrendPeriod(p)}
                  sx={{
                    px: 1.5, py: 0.4, borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.65rem', textTransform: 'capitalize',
                    color: trendPeriod === p ? '#fff' : textMuted, bgcolor: trendPeriod === p ? '#3B82F6' : 'transparent',
                    transition: 'all 0.2s', '&:hover': { bgcolor: trendPeriod === p ? '#3B82F6' : alpha('#3B82F6', 0.1) }
                  }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Box>
              ))}
            </Stack>
          </Stack>
          <Box flex={1} sx={{ ml: -2, mt: 1 }}>
            <ReactApexChart key={trendPeriod} options={{...trendOptions, series: [{name: 'Open Tasks', data: activeTrend.data}]}} series={[{name: 'Open Tasks', data: activeTrend.data}]} type="area" height={220} />
          </Box>
          <Box sx={{ mt: 1, bgcolor: isDark ? alpha('#10B981', 0.1) : '#F0FDF4', p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
             <ArrowForwardRoundedIcon sx={{ fontSize: 16, color: '#10B981', transform: 'rotate(-45deg)' }} />
             <Typography variant="body2" fontWeight={700} color="#10B981">5% increase in open tasks vs last 7 days</Typography>
          </Box>
        </StyledCard>
      </Box>
    </Box>
  );
}
