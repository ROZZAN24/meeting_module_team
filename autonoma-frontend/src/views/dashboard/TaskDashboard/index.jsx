import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, useTheme, Avatar, Chip,
  Select, MenuItem, FormControl, Button, Stack
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import ReactApexChart from 'react-apexcharts';
import axios from 'utils/axios';
import useAuth from 'hooks/useAuth';

// Icons
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';

// --- Styled Components ---

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: theme.palette.mode === 'dark' 
    ? '#0F172A' 
    : '#F8FAFC',
  padding: theme.spacing(3),
  fontFamily: "'Inter', 'Roboto', sans-serif"
}));

const StyledCard = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  background: theme.palette.mode === 'dark' ? '#1E293B' : '#FFFFFF',
  border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`,
  boxShadow: theme.palette.mode === 'dark' 
    ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' 
    : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  overflow: 'hidden',
  height: '100%',
}));

const TopStatCard = styled(StyledCard)(({ theme }) => ({
  transition: 'transform 0.2s',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 10px 15px -3px rgba(0,0,0,0.05)`,
  }
}));

const IconBox = styled(Box)(({ color, bg, size = 48 }) => ({
  width: size,
  height: size,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: color,
  background: bg,
}));

// --- Main Component ---
export default function TaskDashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const textColor = isDark ? '#F8FAFC' : '#1E293B';
  const textMuted = isDark ? '#94A3B8' : '#64748B';

  const { user } = useAuth();
  const activeUserId = user?.id || user?.userId || user?.email || user?.empCode || '';

  const [loading, setLoading] = useState(true);
  const [realData, setRealData] = useState({
    total: 0, completed: 0, open: 0, inProgress: 0, toBeTested: 0, overdue: 0, dueToday: 0, reopened: 0
  });
  const [realOverdueTasks, setRealOverdueTasks] = useState([]);
  const [realRecentActivity, setRealRecentActivity] = useState([]);
  const [realWorkload, setRealWorkload] = useState([]);

  useEffect(() => {
    if (!activeUserId) return;
    const fetchData = async () => {
      try {
        const [r1, r2, r3, r4, r5] = await Promise.allSettled([
          axios.get('/api/qms/checklist/assignments', { params: { size: 200, page: 0 } }),
          axios.get('/api/qms/moms/actions'),
          axios.get('/api/tickets'),
          axios.get('/api/qms/audit-schedules'),
          axios.get('/api/master/hr/employees')
        ]);

        const cl = r1.status === 'fulfilled' ? (r1.value.data?.content || r1.value.data || []) : [];
        const mom = r2.status === 'fulfilled' ? (r2.value.data || []) : [];
        const tk = r3.status === 'fulfilled' ? (r3.value.data || []) : [];
        const audit = r4.status === 'fulfilled' ? (r4.value.data || []) : [];
        const employees = r5.status === 'fulfilled' ? (r5.value.data || []) : [];
        
        let empLookupByCode = {};
        let workloadMap = {};

        employees.forEach(emp => {
            const fullName = emp.employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.empCode || 'Unknown';
            if (emp.empCode) empLookupByCode[emp.empCode] = fullName;
            if (emp.userId) empLookupByCode[emp.userId] = fullName;
            if (emp.email) empLookupByCode[emp.email] = fullName;
            
            if (fullName !== 'Unknown') {
                workloadMap[fullName] = { user: fullName, hours: 0, tasks: 0 };
                empLookupByCode[fullName] = fullName;
            }
        });

        const getFullName = (u) => {
           if (!u) return 'Unknown';
           if (typeof u === 'object') {
              const name = u.employeeName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.empCode;
              if (name && empLookupByCode[name]) return empLookupByCode[name];
              return name || 'Unknown';
           }
           return empLookupByCode[u] || u;
        };

        let tasksList = [];

        cl.forEach(a => {
          let name = getFullName(a.assignedToObj || a.employee || a.assignedTo);
          tasksList.push({ _status: a.status?.name || a.status?.statusName || 'Pending', _dueDate: a.checklistDate || a.assignedDate, _title: a.checklist?.checkingPoint || a.checklist?.description || `Checklist #${a.id}`, _id: `CL-${a.id}`, _user: name, _rawDate: a.assignedDate || a.checklistDate });
        });

        mom.forEach(a => {
          let name = getFullName(a.assignedTo);
          tasksList.push({ _status: a.status || 'Open', _dueDate: a.targetDate, _title: a.discussedPoint || `MOM Action #${a.id}`, _id: `MOM-${a.id}`, _user: name, _rawDate: a.targetDate });
        });

        tk.forEach(t => {
          let name = getFullName(t.assignedTo);
          tasksList.push({ _status: t.ticketStatus || 'Open', _dueDate: t.dueDate || t.targetDate, _title: t.title || t.ticketId || `Ticket ${t.rowId}`, _id: `TK-${t.rowId}`, _user: name, _rawDate: t.createdDate || t.targetDate });
        });

        audit.forEach(a => {
           let name = getFullName(a.auditee || a.auditor);
           tasksList.push({ _status: a.status || 'Pending', _dueDate: a.auditDate || a.scheduleDate, _title: `Audit Schedule ${a.scheduleNo || ''}`, _id: `AUDIT-${a.id}`, _user: name, _rawDate: a.auditDate || a.scheduleDate });
        });

        let stats = { total: tasksList.length, completed: 0, open: 0, inProgress: 0, toBeTested: 0, overdue: 0, dueToday: 0, reopened: 0 };
        const today = new Date(); today.setHours(0,0,0,0);
        let overdueList = [];

        tasksList.forEach(t => {
           const st = String(t._status).toLowerCase();
           const isDone = ['completed', 'verified', 'approved', 'closed', 'resolved'].includes(st);
           
           if (!isDone) {
              const u = t._user || 'Unknown';
              if (!workloadMap[u]) workloadMap[u] = { user: u, hours: 0, tasks: 0 };
              workloadMap[u].tasks += 1;
              workloadMap[u].hours += (t.estimatedHours || t.plannedHours || 8); // default to 8 hrs (1 day) per task if no data
           }
           
           if (isDone) {
             stats.completed++;
           }
           
           if (['open', 'new', 'pending'].includes(st)) {
             stats.open++;
           } else if (['in progress', 'wip', 'assigned'].includes(st)) {
             stats.inProgress++;
           } else if (['to be tested', 'testing', 'ready for testing'].includes(st)) {
             stats.toBeTested++;
           } else if (['reopened', 're-opened'].includes(st)) {
             stats.reopened++;
           } else if (!isDone) {
             stats.open++;
           }
           
           if (t._dueDate) {
              const dDate = new Date(t._dueDate); dDate.setHours(0,0,0,0);
              if (dDate < today && !isDone) {
                 stats.overdue++;
                 const diff = Math.ceil(Math.abs(today - dDate) / (1000 * 60 * 60 * 24));
                 overdueList.push({ id: t._id, title: t._title, user: t._user, days: `${diff} Days` });
              } else if (dDate.getTime() === today.getTime() && !isDone) {
                 stats.dueToday++;
              }
           }
        });

        let recentArr = tasksList.filter(t => t._rawDate).sort((a, b) => new Date(b._rawDate) - new Date(a._rawDate)).slice(0, 4).map(t => ({
             id: t._id, action: t._status, by: t._user, time: new Date(t._rawDate).toLocaleDateString(),
             color: ['completed', 'closed', 'resolved'].includes(String(t._status).toLowerCase()) ? '#10B981' : '#3B82F6',
             icon: ['completed', 'closed', 'resolved'].includes(String(t._status).toLowerCase()) ? <CheckCircleRoundedIcon fontSize="small"/> : <AssignmentRoundedIcon fontSize="small"/>
        }));

        let workloadArr = Object.values(workloadMap).map(w => {
           const days = Math.round((w.hours / 8) * 10) / 10;
           let color = '#10B981'; // Green (more than 5)
           let status = 'Healthy';
           if (days < 5) { color = '#EF4444'; status = 'Critical'; } // Red (less than 5)
           else if (days === 5) { color = '#EAB308'; status = 'Warning'; } // Yellow (exactly 5)
           return { ...w, days, color, status };
        }).sort((a, b) => a.days - b.days);

        setRealData(stats);
        setRealOverdueTasks(overdueList.slice(0, 5));
        setRealRecentActivity(recentArr);
        setRealWorkload(workloadArr);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };
    fetchData();
  }, [activeUserId]);

  const topStats = [
    { title: 'Total Task', value: realData.total, change: '+40%', isPositive: true, icon: <AssignmentRoundedIcon fontSize="small" />, color: '#3B82F6', bg: '#EFF6FF' },
    { title: 'Open', value: realData.open, change: '0%', isPositive: true, icon: <PendingActionsRoundedIcon fontSize="small" />, color: '#64748B', bg: '#F1F5F9' },
    { title: 'In Progress', value: realData.inProgress, change: '+100%', isPositive: true, icon: <HistoryRoundedIcon fontSize="small" />, color: '#F59E0B', bg: '#FFFBEB' },
    { title: 'To Be Tested', value: realData.toBeTested, change: '0%', isPositive: true, icon: <ScienceRoundedIcon fontSize="small" />, color: '#8B5CF6', bg: '#F5F3FF' },
    { title: 'OverDue', value: realData.overdue, change: '0%', isPositive: true, icon: <ReportProblemRoundedIcon fontSize="small" />, color: '#EF4444', bg: '#FEF2F2' },
    { title: 'Due today', value: realData.dueToday, change: '+25%', isPositive: true, icon: <TodayRoundedIcon fontSize="small" />, color: '#0EA5E9', bg: '#F0F9FF' },
    { title: 'Reopen', value: realData.reopened, change: '0%', isPositive: false, icon: <AutorenewRoundedIcon fontSize="small" />, color: '#EAB308', bg: '#FEF9C3' },
  ];

  // --- Charts Config ---
  const statusDistributionOptions = {
    chart: { type: 'donut', fontFamily: "'Inter', sans-serif" },
    labels: ['Completed', 'In Progress', 'To Be Tested', 'Overdue', 'Due Today'],
    colors: ['#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#0EA5E9'],
    stroke: { width: 4, colors: [isDark ? '#1E293B' : '#FFFFFF'] },
    plotOptions: {
      pie: { donut: { size: '80%', labels: { show: true, name: { show: true, fontSize: '14px', color: textMuted }, value: { show: true, fontSize: '28px', fontWeight: 700, color: textColor, offsetY: 10 }, total: { show: true, label: 'Total', formatter: () => realData.total.toString(), color: textMuted, fontSize: '14px' } } } }
    },
    dataLabels: { enabled: false },
    legend: { show: false }
  };

  const statusSeries = [realData.completed, realData.inProgress, realData.toBeTested, realData.overdue, realData.dueToday];
  const percent = (val) => realData.total > 0 ? Math.round((val / realData.total) * 100) + '%' : '0%';

  const performanceRadialOptions = {
    chart: { type: 'radialBar', fontFamily: "'Inter', sans-serif" },
    colors: ['#3B82F6'],
    plotOptions: {
      radialBar: { hollow: { size: '70%' }, track: { background: isDark ? '#334155' : '#E2E8F0', strokeWidth: '100%' }, dataLabels: { name: { show: true, fontSize: '13px', color: textMuted, offsetY: 25 }, value: { show: true, fontSize: '36px', fontWeight: 800, color: textColor, offsetY: -10, formatter: (val) => `${val}%` } } }
    },
    labels: ['Overall Efficiency'],
    stroke: { lineCap: 'round' }
  };

  const priorityBarOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: "'Inter', sans-serif" },
    colors: ['#EF4444', '#F59E0B', '#10B981', '#94A3B8'],
    plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: '35%', distributed: true, dataLabels: { position: 'top' } } },
    dataLabels: { enabled: true, textAnchor: 'start', style: { colors: [textColor], fontSize: '13px', fontWeight: 600 }, offsetX: 10, formatter: function (val, opt) { const percentages = ['25%', '43%', '21%', '11%']; return val + '  (' + percentages[opt.dataPointIndex] + ')'; } },
    xaxis: { categories: ['High', 'Medium', 'Low', 'No Priority'], labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: textMuted, fontSize: '13px', fontWeight: 500 } } },
    grid: { show: false },
    legend: { show: false }
  };

  const weeklyTrendOptions = {
    chart: { type: 'area', toolbar: { show: false }, fontFamily: "'Inter', sans-serif" },
    colors: ['#3B82F6', '#10B981'],
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0.02, stops: [0, 90, 100] } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2.5 },
    xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], labels: { style: { colors: textMuted, fontSize: '12px' } }, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { colors: textMuted, fontSize: '12px' } } },
    grid: { borderColor: isDark ? '#334155' : '#F1F5F9', strokeDashArray: 4, xaxis: { lines: { show: true } }, yaxis: { lines: { show: true } } },
    legend: { position: 'top', horizontalAlign: 'left', labels: { colors: textColor }, markers: { radius: 12 }, itemMargin: { horizontal: 10, vertical: 0 } }
  };

  const reopenedOptions = {
    chart: { type: 'donut', fontFamily: "'Inter', sans-serif" },
    labels: ['Fixed & Verified', 'Reopened', 'In Progress', 'Pending'],
    colors: ['#10B981', '#F59E0B', '#8B5CF6', '#EF4444'],
    stroke: { width: 4, colors: [isDark ? '#1E293B' : '#FFFFFF'] },
    plotOptions: { pie: { donut: { size: '80%', labels: { show: true, value: { fontSize: '24px', fontWeight: 700, color: textColor }, total: { show: true, label: 'Total', formatter: () => '45', color: textMuted } } } } },
    dataLabels: { enabled: false },
    legend: { show: false }
  };

  return (
    <PageContainer>

      {/* ROW 1: TOP STATS */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(7, 1fr)' },
        gap: 2,
        mb: 3
      }}>
        {topStats.map((stat, idx) => {
          const waveColor = encodeURIComponent(stat.color);
          const waveSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" opacity="0.1"><path fill="${waveColor}" d="M0,256L48,261.3C96,267,192,277,288,266.7C384,256,480,224,576,218.7C672,213,768,235,864,245.3C960,256,1056,256,1152,240C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>`;

          return (
          <TopStatCard key={idx} sx={{ 
              backgroundImage: `url('${waveSvg}')`, 
              backgroundPosition: 'bottom', 
              backgroundSize: 'cover', 
              backgroundRepeat: 'no-repeat' 
          }}>
            <Box p={2} pb={2.5}>
              <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
                <IconBox color={stat.color} bg={isDark ? alpha(stat.color, 0.2) : stat.bg} size={32}>
                  {stat.icon}
                </IconBox>
                <Typography variant="body2" color="text.secondary" fontWeight={600} noWrap sx={{ fontSize: '0.8rem' }}>{stat.title}</Typography>
              </Stack>
              <Typography variant="h4" fontWeight={900} color="text.primary">{stat.value}</Typography>
            </Box>
          </TopStatCard>
        )})}
      </Box>

      {/* ROW 2: OVERVIEWS & DISTRIBUTION */}
      <Grid container spacing={2} mb={3}>
        {/* Today's Overview */}
        <Grid item xs={12} md={4}>
          <StyledCard sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={4}>Today's Overview</Typography>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mt={2}>
              {[
                { v: realData.dueToday, l: 'Due Today', icon: <TodayRoundedIcon/>, c: '#3B82F6', bg: '#EFF6FF' },
                { v: realData.inProgress, l: 'In Progress', icon: <HistoryRoundedIcon/>, c: '#F59E0B', bg: '#FFFBEB' },
                { v: realData.toBeTested, l: 'To Be Tested', icon: <ScienceRoundedIcon/>, c: '#8B5CF6', bg: '#F5F3FF' },
                { v: realData.overdue, l: 'Overdue', icon: <ReportProblemRoundedIcon/>, c: '#EF4444', bg: '#FEF2F2' },
              ].map((item, idx) => (
                <Stack key={idx} alignItems="center" gap={1.5}>
                  <Typography variant="h5" fontWeight={800}>{item.v}</Typography>
                  <IconBox color={item.c} bg={isDark ? alpha(item.c, 0.2) : item.bg} size={40}>
                    {item.icon}
                  </IconBox>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>{item.l}</Typography>
                </Stack>
              ))}
            </Stack>
          </StyledCard>
        </Grid>

        {/* Status Distribution */}
        <Grid item xs={12} md={4}>
          <StyledCard sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Task Status Distribution</Typography>
            <Stack direction="row" alignItems="center" justifyContent="center">
              <Box width={180}>
                <ReactApexChart options={statusDistributionOptions} series={statusSeries} type="donut" height={200} />
              </Box>
              <Stack gap={1.5} ml={3} flex={1}>
                {[
                  { l: 'Completed', v: realData.completed, p: percent(realData.completed), c: '#10B981' },
                  { l: 'In Progress', v: realData.inProgress, p: percent(realData.inProgress), c: '#F59E0B' },
                  { l: 'To Be Tested', v: realData.toBeTested, p: percent(realData.toBeTested), c: '#8B5CF6' },
                  { l: 'Overdue', v: realData.overdue, p: percent(realData.overdue), c: '#EF4444' },
                  { l: 'Due Today', v: realData.dueToday, p: percent(realData.dueToday), c: '#0EA5E9' },
                ].map((item, i) => (
                  <Box display="flex" alignItems="center" justifyContent="space-between" key={i}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.c }} />
                      <Typography variant="body2" color="text.secondary" fontSize="13px">{item.l}</Typography>
                    </Box>
                    <Box textAlign="right" ml={2}>
                      <Typography variant="body2" fontWeight={600} display="inline" fontSize="13px">{item.v}</Typography>
                      <Typography variant="caption" color="text.secondary" ml={0.5}>({item.p})</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </StyledCard>
        </Grid>

        {/* Priority Counts */}
        <Grid item xs={12} md={4}>
          <StyledCard sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>Priority Wise Task Count</Typography>
            <Box mt={0}>
              <ReactApexChart options={priorityBarOptions} series={[{ data: [320, 540, 260, 136] }]} type="bar" height={250} />
            </Box>
          </StyledCard>
        </Grid>
      </Grid>

      {/* ROW 3: TRENDS, PERFORMANCE, ACTIVITY */}
      <Grid container spacing={2} mb={3}>
        {/* Weekly Trend */}
        <Grid item xs={12} md={4}>
          <StyledCard sx={{ p: 3 }}>
             <Typography variant="subtitle1" fontWeight={700} mb={1}>Weekly Productivity Trend</Typography>
             <ReactApexChart options={weeklyTrendOptions} series={[{ name: 'Estimated Time (Hrs)', data: [65, 85, 60, 75, 80, 50, 45] }, { name: 'Actual Time (Hrs)', data: [45, 55, 45, 65, 50, 40, 35] }]} type="area" height={240} />
          </StyledCard>
        </Grid>

        {/* Time Performance */}
        <Grid item xs={12} md={4}>
          <StyledCard sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Time Performance Overview</Typography>
            <Stack direction="row" alignItems="center" justifyContent="center" height={200}>
              <Box width={200}>
                <ReactApexChart options={performanceRadialOptions} series={[78]} type="radialBar" height={240} />
              </Box>
              <Stack gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Total Estimated Time</Typography>
                  <Typography variant="body2" fontWeight={700}>320.0 Hrs</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Actual Completed Time</Typography>
                  <Typography variant="body2" fontWeight={700}>286.5 Hrs</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Remaining Time</Typography>
                  <Typography variant="body2" fontWeight={700}>33.5 Hrs</Typography>
                </Box>
              </Stack>
            </Stack>
            <Box textAlign="center" mt={2}>
              <Chip size="small" icon={<ArrowUpwardRoundedIcon />} label="33.5 Hrs Ahead of Schedule" sx={{ bgcolor: alpha('#10B981', 0.1), color: '#10B981', fontWeight: 600, '& .MuiChip-icon': { color: '#10B981' }, py: 1 }} />
            </Box>
          </StyledCard>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <StyledCard sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
               <Typography variant="subtitle1" fontWeight={700}>Recent Activity</Typography>
               <Button size="small">View All</Button>
            </Box>
            <Stack spacing={3} flex={1} mt={1}>
               {realRecentActivity.slice(0,4).map((act, idx) => (
                 <Stack direction="row" gap={2} alignItems="flex-start" key={idx}>
                    <IconBox color={act.color} bg={isDark ? alpha(act.color, 0.2) : alpha(act.color, 0.1)} size={36}>
                      <AssignmentRoundedIcon fontSize="small"/>
                    </IconBox>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {act.id} {act.action}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">by {act.by}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" whiteSpace="nowrap">{act.time}</Typography>
                 </Stack>
               ))}
               {realRecentActivity.length === 0 && (
                 <Typography variant="body2" color="text.secondary" py={2} textAlign="center">No recent activity.</Typography>
               )}
            </Stack>
          </StyledCard>
        </Grid>
      </Grid>

      {/* ROW 4: REOPENED, OVERDUE */}
      <Grid container spacing={2}>
        {/* Reopened Analytics */}
        <Grid item xs={12} md={4}>
          <StyledCard sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Reopened Task Analytics</Typography>
             <Stack direction="row" alignItems="center" justifyContent="center">
              <Box width={160}>
                <ReactApexChart options={reopenedOptions} series={[20, 15, 7, 3]} type="donut" height={180} />
              </Box>
              <Stack gap={1.5} ml={2} flex={1}>
                {[
                  { l: 'Fixed & Verified', v: '20', p: '44%', c: '#10B981' },
                  { l: 'Reopened', v: '15', p: '33%', c: '#F59E0B' },
                  { l: 'In Progress', v: '7', p: '16%', c: '#8B5CF6' },
                  { l: 'Pending', v: '3', p: '7%', c: '#EF4444' },
                ].map((item, i) => (
                  <Box display="flex" alignItems="center" justifyContent="space-between" key={i}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.c }} />
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>{item.l}</Typography>
                    </Box>
                    <Box textAlign="right" ml={1}>
                      <Typography variant="caption" fontWeight={600}>{item.v}</Typography>
                      <Typography variant="caption" color="text.secondary" ml={0.5}>({item.p})</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </StyledCard>
        </Grid>

        {/* Overdue Tasks */}
        <Grid item xs={12} md={8}>
          <StyledCard sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight={700}>Overdue Tasks</Typography>
              <Button size="small">View All</Button>
            </Box>
            
            {realOverdueTasks.length > 0 ? (
               <Stack spacing={2}>
                {realOverdueTasks.map((t, i) => (
                  <Stack direction="row" alignItems="center" justifyContent="space-between" key={i}>
                    <Stack direction="row" gap={1.5} alignItems="center">
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', minWidth: 6, bgcolor: '#EF4444' }} />
                      <Box>
                        <Typography variant="body2" color="primary" fontWeight={600} sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>{t.id}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>{t.title}</Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: 100 }}>{t.user}</Typography>
                    <Chip size="small" label={t.days} sx={{ bgcolor: alpha('#EF4444', 0.1), color: '#EF4444', fontWeight: 600, fontSize: '0.7rem' }} />
                  </Stack>
                ))}
              </Stack>
            ) : (
               <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={4}>
                 <Box sx={{ position: 'relative', mb: 2 }}>
                   <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: isDark ? alpha('#3B82F6', 0.1) : '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <AssignmentRoundedIcon sx={{ fontSize: 40, color: '#3B82F6' }} />
                   </Box>
                   <Box sx={{ position: 'absolute', bottom: -5, right: -5, bgcolor: 'background.paper', borderRadius: '50%', p: 0.5 }}>
                      <CheckCircleRoundedIcon sx={{ color: '#10B981', fontSize: 20 }} />
                   </Box>
                 </Box>
                 <Typography variant="subtitle1" fontWeight={700}>Great! No overdue tasks.</Typography>
                 <Typography variant="body2" color="text.secondary">You're all caught up!</Typography>
               </Box>
            )}
          </StyledCard>
        </Grid>
      </Grid>

      {/* ROW 5: EMPLOYEE WORKLOAD (NEW) */}
      <Grid container spacing={2} mt={1} mb={3}>
        <Grid item xs={12}>
          <StyledCard sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>Employee Workload Capacity</Typography>
                <Typography variant="caption" color="text.secondary">Based on assigned active tasks (Assumes 8 hours = 1 day)</Typography>
              </Box>
            </Box>
            
            {realWorkload.length > 0 ? (
               <Grid container spacing={2}>
                {realWorkload.map((w, i) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: isDark ? alpha(w.color, 0.1) : alpha(w.color, 0.05), border: `1px solid ${alpha(w.color, 0.2)}` }}>
                      <Stack direction="row" alignItems="center" gap={1.5} mb={1.5}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: w.color, fontSize: '0.8rem', fontWeight: 800 }}>{w.user.charAt(0).toUpperCase()}</Avatar>
                        <Box flex={1} overflow="hidden">
                          <Typography variant="body2" fontWeight={700} noWrap>{w.user}</Typography>
                          <Typography variant="caption" sx={{ color: w.color, fontWeight: 600 }}>{w.status}</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                         <Box>
                           <Typography variant="caption" color="text.secondary" display="block">Active Tasks</Typography>
                           <Typography variant="body2" fontWeight={700}>{w.tasks}</Typography>
                         </Box>
                         <Box textAlign="right">
                           <Typography variant="caption" color="text.secondary" display="block">Total Work</Typography>
                           <Typography variant="h5" fontWeight={900} color={w.color}>{w.days} <Typography component="span" variant="caption" fontWeight={700}>Days</Typography></Typography>
                         </Box>
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
               <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>No active tasks assigned to employees.</Typography>
            )}
          </StyledCard>
        </Grid>
      </Grid>

    </PageContainer>
  );
}
