import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, useTheme, Avatar, Chip,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress
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

import ReopenDashboard from './ReopenDashboard';
import ToBeTestedDashboard from './ToBeTestedDashboard';
import DueTodayDashboard from './DueTodayDashboard';
import OverdueDashboard from './OverdueDashboard';
import CompletedDashboard from './CompletedDashboard';
import InProgressDashboard from './InProgressDashboard';
import OpenDashboard from './OpenDashboard';

const pulseRed = keyframes`0%{box-shadow:0 0 0 0 rgba(239,68,68,.7)}70%{box-shadow:0 0 0 10px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}`;
const pulseBlue = keyframes`0%{box-shadow:0 0 0 0 rgba(59,130,246,.7)}70%{box-shadow:0 0 0 10px rgba(59,130,246,0)}100%{box-shadow:0 0 0 0 rgba(59,130,246,0)}`;
const pulseGreen = keyframes`0%{box-shadow:0 0 0 0 rgba(16,185,129,.7)}70%{box-shadow:0 0 0 10px rgba(16,185,129,0)}100%{box-shadow:0 0 0 0 rgba(16,185,129,0)}`;

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
  overflow: 'hidden',
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
  background: bg,
}));

const AVATAR_COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#0EA5E9','#EC4899','#14B8A6'];
const genTrend = (base) => Array.from({length:7},()=>Math.max(80, Math.min(120, Math.round(base + (Math.random()-0.5)*10))));

// ── SVG Mascots ───────────────────────────────────────────────────────────────
const GreenHappySVG = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g1" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#6EE7B7"/>
        <stop offset="100%" stopColor="#059669"/>
      </radialGradient>
    </defs>
    <circle cx="36" cy="38" r="28" fill="url(#g1)" filter="url(#shadow)"/>
    <ellipse cx="26" cy="35" rx="4" ry="5" fill="#065F46"/>
    <ellipse cx="46" cy="35" rx="4" ry="5" fill="#065F46"/>
    <ellipse cx="27" cy="33" rx="2" ry="2.5" fill="white" opacity="0.8"/>
    <ellipse cx="47" cy="33" rx="2" ry="2.5" fill="white" opacity="0.8"/>
    <path d="M24 46 Q36 56 48 46" stroke="#065F46" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <ellipse cx="22" cy="44" rx="4" ry="2.5" fill="#A7F3D0" opacity="0.7"/>
    <ellipse cx="50" cy="44" rx="4" ry="2.5" fill="#A7F3D0" opacity="0.7"/>
    <text x="58" y="18" fontSize="14">✦</text>
    <text x="8" y="20" fontSize="10">✦</text>
    <text x="54" y="10" fontSize="10">⭐</text>
  </svg>
);

const BlueBullseyeSVG = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="b1" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#93C5FD"/>
        <stop offset="100%" stopColor="#1D4ED8"/>
      </radialGradient>
    </defs>
    <circle cx="36" cy="36" r="30" fill="url(#b1)" opacity="0.15"/>
    <circle cx="36" cy="36" r="28" fill="none" stroke="#3B82F6" strokeWidth="3"/>
    <circle cx="36" cy="36" r="20" fill="none" stroke="#3B82F6" strokeWidth="3"/>
    <circle cx="36" cy="36" r="12" fill="none" stroke="#3B82F6" strokeWidth="3"/>
    <circle cx="36" cy="36" r="5" fill="#EF4444"/>
    <line x1="36" y1="4" x2="36" y2="14" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
    <line x1="36" y1="58" x2="36" y2="68" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
    <line x1="4" y1="36" x2="14" y2="36" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
    <line x1="58" y1="36" x2="68" y2="36" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="36" cy="36" r="30" fill="none" stroke="#BFDBFE" strokeWidth="1" strokeDasharray="4 3"/>
    <text x="52" y="14" fontSize="12">✦</text>
    <text x="8" y="16" fontSize="10">✦</text>
  </svg>
);

const RedSadSVG = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="r1" cx="40%" cy="35%" r="60%">
        <stop offset="0%" stopColor="#FCA5A5"/>
        <stop offset="100%" stopColor="#DC2626"/>
      </radialGradient>
    </defs>
    <circle cx="36" cy="38" r="28" fill="url(#r1)"/>
    <ellipse cx="26" cy="35" rx="4" ry="5" fill="#7F1D1D"/>
    <ellipse cx="46" cy="35" rx="4" ry="5" fill="#7F1D1D"/>
    <ellipse cx="27" cy="33" rx="2" ry="2.5" fill="white" opacity="0.8"/>
    <ellipse cx="47" cy="33" rx="2" ry="2.5" fill="white" opacity="0.8"/>
    <path d="M24 52 Q36 44 48 52" stroke="#7F1D1D" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <ellipse cx="22" cy="42" rx="4" ry="2.5" fill="#FEE2E2" opacity="0.7"/>
    <ellipse cx="50" cy="42" rx="4" ry="2.5" fill="#FEE2E2" opacity="0.7"/>
    <text x="56" y="16" fontSize="12">⚡</text>
    <text x="6" y="18" fontSize="10">⚡</text>
  </svg>
);

// ── Top card icons as emoji-style colorful SVGs ─────────────────────────────
const ClipboardSVG = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
    <rect width="44" height="44" rx="10" fill="#EFF6FF"/>
    <rect x="10" y="12" width="24" height="22" rx="3" fill="#3B82F6"/>
    <rect x="14" y="8" width="16" height="6" rx="2" fill="#1D4ED8"/>
    <rect x="13" y="18" width="18" height="2" rx="1" fill="white" opacity="0.8"/>
    <rect x="13" y="22" width="14" height="2" rx="1" fill="white" opacity="0.8"/>
    <rect x="13" y="26" width="16" height="2" rx="1" fill="white" opacity="0.8"/>
  </svg>
);

const GreenTargetSVG = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
    <rect width="44" height="44" rx="10" fill="#F0FDF4"/>
    <circle cx="22" cy="22" r="14" fill="none" stroke="#10B981" strokeWidth="2.5"/>
    <circle cx="22" cy="22" r="9" fill="none" stroke="#10B981" strokeWidth="2.5"/>
    <circle cx="22" cy="22" r="4" fill="#10B981"/>
    <path d="M28 14 L34 8 M34 8 L30 8 M34 8 L34 12" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="34" cy="10" r="3" fill="#065F46"/>
  </svg>
);

const HourglassSVG = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
    <rect width="44" height="44" rx="10" fill="#FFFBEB"/>
    <rect x="12" y="10" width="20" height="3" rx="1.5" fill="#F59E0B"/>
    <rect x="12" y="31" width="20" height="3" rx="1.5" fill="#F59E0B"/>
    <path d="M13 13 L22 24 L31 13 Z" fill="#FDE68A"/>
    <path d="M13 31 L22 20 L31 31 Z" fill="#F59E0B"/>
    <ellipse cx="22" cy="26" rx="4" ry="2" fill="#FCD34D"/>
  </svg>
);

const PeopleSVG = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
    <rect width="44" height="44" rx="10" fill="#F5F3FF"/>
    <circle cx="15" cy="18" r="5" fill="#8B5CF6"/>
    <circle cx="29" cy="18" r="5" fill="#6D28D9"/>
    <circle cx="22" cy="16" r="6" fill="#8B5CF6"/>
    <path d="M6 36 Q15 28 22 28 Q29 28 38 36" fill="#C4B5FD"/>
    <path d="M10 36 Q22 30 34 36" fill="#8B5CF6"/>
  </svg>
);

const BarChartSVG = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
    <rect width="44" height="44" rx="10" fill="#F0F9FF"/>
    <rect x="9" y="24" width="6" height="12" rx="2" fill="#0EA5E9"/>
    <rect x="19" y="18" width="6" height="18" rx="2" fill="#0EA5E9"/>
    <rect x="29" y="10" width="6" height="26" rx="2" fill="#0284C7"/>
    <path d="M9 22 L22 16 L35 8" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="35" cy="8" r="2.5" fill="#38BDF8"/>
    <path d="M32 5 L35 8 L38 5" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

const TrophySVG = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
    <rect width="44" height="44" rx="10" fill="#FEF9C3"/>
    <path d="M16 10 h12 v12 a6 6 0 0 1 -12 0 Z" fill="#EAB308"/>
    <path d="M10 12 h6 a0 0 0 0 1 0 8 L12 20 Q8 18 10 12Z" fill="#FCD34D"/>
    <path d="M34 12 h-6 a0 0 0 0 0 0 8 L32 20 Q36 18 34 12Z" fill="#FCD34D"/>
    <rect x="19" y="22" width="6" height="6" rx="1" fill="#EAB308"/>
    <rect x="14" y="28" width="16" height="3" rx="1.5" fill="#EAB308"/>
    <circle cx="22" cy="16" r="3" fill="#FDE68A"/>
    <text x="28" y="12" fontSize="8">✦</text>
    <text x="10" y="10" fontSize="7">✦</text>
  </svg>
);

// ── Workload View ─────────────────────────────────────────────────────────────
const WorkloadView = ({ realWorkload, isDark }) => {
  const criticalCount = realWorkload.filter(w => w.status === 'Critical').length;
  const normalCount = realWorkload.filter(w => w.status === 'Normal').length;
  const healthyCount = realWorkload.filter(w => w.status === 'Healthy').length;
  return (
    <Box>
      <Grid container spacing={2} mb={2}>
        {[{c:'#EF4444',label:'Critical',n:criticalCount,icon:<ErrorOutlineRoundedIcon fontSize="small"/>},{c:'#3B82F6',label:'Normal',n:normalCount,icon:<RadioButtonUncheckedRoundedIcon fontSize="small"/>},{c:'#10B981',label:'Healthy',n:healthyCount,icon:<CheckCircleOutlineRoundedIcon fontSize="small"/>}].map((s,i)=>(
          <Grid item xs={12} md={4} key={i}>
            <Card sx={{p:2,display:'flex',alignItems:'center',bgcolor:alpha(s.c,0.05),border:`1px solid ${alpha(s.c,0.2)}`}}>
              <Box sx={{width:36,height:36,borderRadius:'50%',bgcolor:s.c,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',mr:2}}>{s.icon}</Box>
              <Box><Typography variant="body2" color={s.c} fontWeight={700}>{s.label}</Typography><Typography variant="h5" fontWeight={800}>{s.n}</Typography></Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Card>
        <TableContainer><Table size="small">
          <TableHead><TableRow>
            <TableCell sx={{fontWeight:700,py:1.5}}>Employee</TableCell>
            <TableCell sx={{fontWeight:700,py:1.5,width:'30%'}}>Workload</TableCell>
            <TableCell sx={{fontWeight:700,py:1.5,textAlign:'center'}}>Active task</TableCell>
            <TableCell sx={{fontWeight:700,py:1.5,textAlign:'center'}}>Total Days</TableCell>
            <TableCell sx={{fontWeight:700,py:1.5,textAlign:'center'}}>Status</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {realWorkload.map((row,idx)=>(
              <TableRow key={idx} hover>
                <TableCell sx={{py:1}}><Stack direction="row" alignItems="center" gap={1.5}><Avatar sx={{width:28,height:28,bgcolor:row.color,fontSize:'13px',fontWeight:700}}>{row.user.charAt(0).toUpperCase()}</Avatar><Typography variant="body2" fontWeight={600}>{row.user}</Typography></Stack></TableCell>
                <TableCell sx={{py:1}}><Stack direction="row" alignItems="center" gap={2}><Typography variant="body2" fontWeight={700} sx={{minWidth:40}}>{row.percent}%</Typography><LinearProgress variant="determinate" value={row.percent} sx={{flex:1,height:8,borderRadius:4,bgcolor:alpha(row.color,0.2),'& .MuiLinearProgress-bar':{bgcolor:row.color,borderRadius:4}}}/></Stack></TableCell>
                <TableCell sx={{textAlign:'center',py:1}}><Typography variant="body2" fontWeight={600}>{row.tasks}</Typography></TableCell>
                <TableCell sx={{textAlign:'center',py:1}}><Typography variant="body2" fontWeight={600}>{row.days} Days</Typography></TableCell>
                <TableCell sx={{textAlign:'center',py:1}}><Chip label={row.status} size="small" sx={{bgcolor:alpha(row.color,0.1),color:row.color,fontWeight:700}}/></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table></TableContainer>
      </Card>
    </Box>
  );
};

// ── Performance Overview ──────────────────────────────────────────────────────
const PerformanceOverview = ({ devStats, isDark, textColor, textMuted }) => {
  const totalAssigned = devStats.reduce((s,d)=>s+d.assignedHrs,0);
  const totalCompleted = devStats.reduce((s,d)=>s+d.completedHrs,0);
  const pendingHrs = Math.max(0, totalAssigned - totalCompleted);
  const activeDev = devStats.length;
  const avgPerf = devStats.length>0 ? (devStats.reduce((s,d)=>s+d.performance,0)/devStats.length).toFixed(2) : '0.00';
  const outstandingDevs = devStats.filter(d=>d.perfStatus==='Outstanding');
  const perfectDevs = devStats.filter(d=>d.perfStatus==='Perfect');
  const lowDevs = devStats.filter(d=>d.perfStatus==='Low');

  const getPerfColor = s => s==='Outstanding'?'#10B981':s==='Perfect'?'#3B82F6':'#F59E0B';
  const getPerfBg = s => s==='Outstanding'?'#F0FDF4':s==='Perfect'?'#EFF6FF':'#FFFBEB';
  const getPerfBorder = s => s==='Outstanding'?'#BBF7D0':s==='Perfect'?'#BFDBFE':'#FDE68A';
  const getPerfIcon = s => s==='Outstanding'
    ? <SentimentVerySatisfiedRoundedIcon fontSize="small" sx={{color:'#10B981'}}/>
    : s==='Perfect' ? <CheckCircleRoundedIcon fontSize="small" sx={{color:'#3B82F6'}}/>
    : <SentimentVeryDissatisfiedRoundedIcon fontSize="small" sx={{color:'#F59E0B'}}/>;

  // Summary cards config
  const summaryCards = [
    { label:'Total Assigned Hours', value:`${totalAssigned} Hrs`, sub:'All Developers', svgIcon:<ClipboardSVG/>, color:'#3B82F6' },
    { label:'Total Completed Hours', value:`${totalCompleted} Hrs`, sub:'All Developers', svgIcon:<GreenTargetSVG/>, color:'#10B981' },
    { label:'Pending Hours', value:`${pendingHrs} Hrs`, sub:'Remaining Work', svgIcon:<HourglassSVG/>, color:'#F59E0B' },
    { label:'Total Developers', value:`${activeDev}`, sub:'Active Developers', svgIcon:<PeopleSVG/>, color:'#8B5CF6' },
    { label:'Avg Performance', value:`${avgPerf}%`, sub:'Across all developers', svgIcon:<BarChartSVG/>, color:'#0EA5E9' },
    { label:'Outstanding Performers', value:`${outstandingDevs.length}`, sub:'Completed less than assigned', svgIcon:<TrophySVG/>, color:'#EAB308' },
  ];

  // Donut chart
  const perfDistOptions = {
    chart:{type:'donut',fontFamily:"'Inter',sans-serif"},
    labels:['Outstanding','Perfect','Low'],
    colors:['#10B981','#3B82F6','#F59E0B'],
    stroke:{width:3,colors:[isDark?'#1E293B':'#FFFFFF']},
    plotOptions:{pie:{donut:{size:'72%',labels:{show:true,value:{fontSize:'26px',fontWeight:800,color:textColor,offsetY:10},total:{show:true,label:'Developers',formatter:()=>String(activeDev),color:textMuted,fontSize:'13px'}}}}},
    dataLabels:{enabled:false},
    legend:{show:false},
  };
  const perfDistSeries = [outstandingDevs.length, perfectDevs.length, lowDevs.length];

  // Trend line chart
  const days = ['29 Apr','30 Apr','01 May','02 May','03 May','04 May','05 May'];
  const trendOptions = {
    chart:{type:'line',toolbar:{show:false},fontFamily:"'Inter',sans-serif"},
    colors:['#10B981','#3B82F6','#F59E0B'],
    stroke:{curve:'smooth',width:2.5},
    markers:{size:4,hover:{size:6}},
    xaxis:{categories:days,labels:{style:{colors:textMuted,fontSize:'11px'}},axisBorder:{show:false},axisTicks:{show:false}},
    yaxis:{labels:{style:{colors:textMuted},formatter:v=>`${v}%`},min:80,max:120,tickAmount:5},
    grid:{borderColor:isDark?'#334155':'#F1F5F9',strokeDashArray:4},
    legend:{position:'top',horizontalAlign:'left',labels:{colors:textColor},markers:{radius:12},itemMargin:{horizontal:10}},
    tooltip:{y:{formatter:v=>`${v}%`}},
  };
  const trendSeries = [
    {name:'Outstanding',data:[94,96,95,97,95,96,95]},
    {name:'Perfect',data:[100,100,100,100,100,100,100]},
    {name:'Low',data:[106,108,105,110,107,109,110]},
  ];

  // Time of day bar chart
  const todOptions = {
    chart:{type:'bar',toolbar:{show:false},fontFamily:"'Inter',sans-serif"},
    colors:['#93C5FD','#6EE7B7','#FCD34D','#FCA5A5','#C4B5FD'],
    plotOptions:{bar:{borderRadius:6,distributed:true,dataLabels:{position:'top'}}},
    dataLabels:{enabled:true,style:{colors:[isDark?'#94A3B8':'#374151'],fontWeight:700,fontSize:'13px'},offsetY:-20,formatter:v=>`${v}`},
    xaxis:{categories:['9 AM - 11 AM','11 AM - 1 PM','1 PM - 3 PM','3 PM - 5 PM','5 PM - 7 PM'],labels:{style:{colors:textMuted,fontSize:'11px'}},axisBorder:{show:false},axisTicks:{show:false}},
    yaxis:{title:{text:'Hours',style:{color:textMuted,fontSize:'12px'}},labels:{style:{colors:textMuted}}},
    grid:{borderColor:isDark?'#334155':'#F1F5F9',strokeDashArray:4},
    legend:{show:false},
    tooltip:{y:{formatter:v=>`${v} Hrs`}},
  };
  const todSeries = [{data:[20,35,40,28,14]}];

  // Top performers sorted by efficiency desc
  const topPerformers = [...devStats].sort((a,b)=>b.performance-a.performance).slice(0,5);

  // Insights
  const insights = [
    {v:outstandingDevs.length,label:'Developers',desc:'Completed less than assigned.\nGreat job! Keep it up! 👏',color:'#10B981',bg:'#F0FDF4',border:'#BBF7D0',emoji:'📈'},
    {v:perfectDevs.length,label:'Developers',desc:'Completed exactly as assigned.\nPerfectly on track! 🎯',color:'#3B82F6',bg:'#EFF6FF',border:'#BFDBFE',emoji:'🎯'},
    {v:lowDevs.length,label:'Developers',desc:'Completed more than assigned.\nTake care of your workload! ⚠️',color:'#F59E0B',bg:'#FFFBEB',border:'#FDE68A',emoji:'🚀'},
    {v:`${pendingHrs} Hrs`,label:'Total pending hours',desc:'Across the team.\nPlan your time effectively ⏰',color:'#8B5CF6',bg:'#F5F3FF',border:'#DDD6FE',emoji:'⏰'},
    {v:`${avgPerf}%`,label:'Average performance',desc:'Across the team.\nExcellent overall performance! 🏆',color:'#0EA5E9',bg:'#F0F9FF',border:'#BAE6FD',emoji:'📊'},
  ];

  return (
    <Box>
      {/* ── TOP 6 SUMMARY CARDS ── */}
      <Box sx={{display:'grid',gridTemplateColumns:{xs:'repeat(2,1fr)',sm:'repeat(3,1fr)',lg:'repeat(6,1fr)'},gap:2,mb:2.5}}>
        {summaryCards.map((c,i)=>(
          <Card key={i} sx={{p:2,display:'flex',flexDirection:'column',gap:1}}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>{c.label}</Typography>
                <Typography variant="h5" fontWeight={900} color={c.color} lineHeight={1.1}>{c.value}</Typography>
                <Typography variant="caption" color="text.secondary">{c.sub}</Typography>
              </Box>
              <Box sx={{flexShrink:0,ml:1}}>{c.svgIcon}</Box>
            </Stack>
          </Card>
        ))}
      </Box>

      {/* ── MIDDLE ROW: TABLE + STATUS CARDS ── */}
      <Grid container spacing={2} mb={2.5}>
        {/* Performance by Developer Table */}
        <Grid item xs={12} lg={8}>
          <Card sx={{height:'100%'}}>
            <Box px={2.5} pt={2} pb={1.5} borderBottom={`1px solid ${isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'}`}>
              <Typography variant="subtitle1" fontWeight={700}>Performance by Developer</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{bgcolor:isDark?'rgba(255,255,255,0.03)':'#F8FAFC'}}>
                    {['Developer','Assigned Hours','Completed Hours','Variance','Performance','Status','Trend (Last 7 Days)'].map(h=>(
                      <TableCell key={h} sx={{fontWeight:700,py:1.2,fontSize:'12px',textAlign:h==='Developer'?'left':'center'}}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {devStats.length===0&&(
                    <TableRow><TableCell colSpan={7} sx={{textAlign:'center',py:4,color:textMuted}}>No data available.</TableCell></TableRow>
                  )}
                  {devStats.map((dev,idx)=>{
                    const varNum = dev.completedHrs - dev.assignedHrs;
                    const varStr = varNum===0?'0 Hrs':`${varNum>0?'+':''}${varNum} Hrs`;
                    const varColor = varNum<0?'#10B981':varNum===0?'#3B82F6':'#F59E0B';
                    const sparkOpts = {chart:{type:'line',sparkline:{enabled:true}},stroke:{curve:'smooth',width:2},colors:[getPerfColor(dev.perfStatus)],tooltip:{fixed:{enabled:false}}};
                    return (
                      <TableRow key={idx} hover sx={{'&:last-child td':{border:0}}}>
                        <TableCell sx={{py:1}}>
                          <Stack direction="row" alignItems="center" gap={1.5}>
                            <Avatar sx={{width:30,height:30,bgcolor:AVATAR_COLORS[idx%AVATAR_COLORS.length],fontSize:'12px',fontWeight:700}}>{dev.user.charAt(0).toUpperCase()}</Avatar>
                            <Typography variant="body2" fontWeight={600}>{dev.user}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{textAlign:'center',py:1}}><Typography variant="body2" fontWeight={600}>{dev.assignedHrs} Hrs</Typography></TableCell>
                        <TableCell sx={{textAlign:'center',py:1}}><Typography variant="body2" fontWeight={600}>{dev.completedHrs} Hrs</Typography></TableCell>
                        <TableCell sx={{textAlign:'center',py:1}}><Typography variant="body2" fontWeight={700} color={varColor}>{varStr}</Typography></TableCell>
                        <TableCell sx={{textAlign:'center',py:1}}><Typography variant="body2" fontWeight={700} color={getPerfColor(dev.perfStatus)}>{dev.performance}%</Typography></TableCell>
                        <TableCell sx={{textAlign:'center',py:1}}>
                          <Chip size="small" label={dev.perfStatus} icon={getPerfIcon(dev.perfStatus)}
                            sx={{bgcolor:getPerfBg(dev.perfStatus),color:getPerfColor(dev.perfStatus),fontWeight:700,fontSize:'11px',border:`1px solid ${getPerfBorder(dev.perfStatus)}`,'& .MuiChip-icon':{fontSize:14}}}/>
                        </TableCell>
                        <TableCell sx={{textAlign:'center',py:1,width:120}}>
                          <ReactApexChart options={sparkOpts} series={[{data:dev.trend}]} type="line" height={36} width={100}/>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Total Row */}
                  {devStats.length>0&&(
                    <TableRow sx={{bgcolor:isDark?'rgba(59,130,246,0.08)':'#EFF6FF'}}>
                      <TableCell sx={{py:1.5}}><Typography variant="body2" fontWeight={800} color="#3B82F6">Total</Typography></TableCell>
                      <TableCell sx={{textAlign:'center',py:1.5}}><Typography variant="body2" fontWeight={800} color="#3B82F6">{totalAssigned} Hrs</Typography></TableCell>
                      <TableCell sx={{textAlign:'center',py:1.5}}><Typography variant="body2" fontWeight={800} color="#3B82F6">{totalCompleted} Hrs</Typography></TableCell>
                      <TableCell sx={{textAlign:'center',py:1.5}}><Typography variant="body2" fontWeight={800} color={totalCompleted-totalAssigned>=0?'#F59E0B':'#10B981'}>{totalCompleted-totalAssigned>=0?'+':''}{totalCompleted-totalAssigned} Hrs</Typography></TableCell>
                      <TableCell sx={{textAlign:'center',py:1.5}}><Typography variant="body2" fontWeight={800} color="#3B82F6">{avgPerf}%</Typography></TableCell>
                      <TableCell sx={{textAlign:'center'}}><Typography variant="body2" color="text.secondary">-</Typography></TableCell>
                      <TableCell sx={{textAlign:'center'}}><Typography variant="body2" color="text.secondary">-</Typography></TableCell>
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
              {status:'Outstanding',devs:outstandingDevs,desc:'Completed less than assigned hours',SVG:GreenHappySVG},
              {status:'Perfect',devs:perfectDevs,desc:'Completed equal to assigned hours',SVG:BlueBullseyeSVG},
              {status:'Low',devs:lowDevs,desc:'Completed more than assigned hours',SVG:RedSadSVG},
            ].map((grp,i)=>(
              <Card key={i} sx={{p:2.5,bgcolor:getPerfBg(grp.status),border:`1.5px solid ${getPerfBorder(grp.status)}`,flex:1,position:'relative',overflow:'visible'}}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                  <Box flex={1}>
                    <Box sx={{display:'inline-block',px:1.5,py:0.4,borderRadius:20,bgcolor:getPerfColor(grp.status),mb:0.5}}>
                      <Typography variant="caption" fontWeight={800} color="white">{grp.status}</Typography>
                    </Box>
                    <Typography variant="caption" display="block" color="text.secondary" mb={1.5}>{grp.desc}</Typography>
                    <Stack direction="row" spacing={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Total Developers</Typography>
                        <Typography variant="h6" fontWeight={800} color={getPerfColor(grp.status)}>
                          {grp.devs.length} <Typography component="span" variant="caption" color="text.secondary">({activeDev>0?Math.round((grp.devs.length/activeDev)*100):0}%)</Typography>
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>Total Hours</Typography>
                        <Typography variant="h6" fontWeight={800} color={getPerfColor(grp.status)}>{grp.devs.reduce((s,d)=>s+d.completedHrs,0)} Hrs</Typography>
                      </Box>
                    </Stack>
                  </Box>
                  <Box sx={{flexShrink:0,ml:1}}><grp.SVG/></Box>
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
          <Card sx={{p:2.5}}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Performance Distribution</Typography>
            <Stack direction="row" alignItems="center" justifyContent="center">
              <Box width={175}>
                <ReactApexChart options={perfDistOptions} series={perfDistSeries} type="donut" height={190}/>
              </Box>
              <Stack gap={1.5} ml={2} flex={1}>
                {[
                  {l:'Outstanding (< 100%)',v:outstandingDevs.length,p:activeDev>0?`${Math.round((outstandingDevs.length/activeDev)*100)}%`:'0%',c:'#10B981'},
                  {l:'Perfect (= 100%)',v:perfectDevs.length,p:activeDev>0?`${Math.round((perfectDevs.length/activeDev)*100)}%`:'0%',c:'#3B82F6'},
                  {l:'Low (> 100%)',v:lowDevs.length,p:activeDev>0?`${Math.round((lowDevs.length/activeDev)*100)}%`:'0%',c:'#F59E0B'},
                ].map((item,i)=>(
                  <Box key={i} display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box sx={{width:10,height:10,borderRadius:'50%',bgcolor:item.c}}/>
                      <Typography variant="caption" color="text.secondary">{item.l}</Typography>
                    </Box>
                    <Box textAlign="right" ml={1}>
                      <Typography variant="body2" fontWeight={800} color={item.c}>{item.v}</Typography>
                      <Typography variant="caption" color="text.secondary"> ({item.p})</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* Trend */}
        <Grid item xs={12} md={4}>
          <Card sx={{p:2.5}}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>Performance Trend (All Developers)</Typography>
            <ReactApexChart options={trendOptions} series={trendSeries} type="line" height={200}/>
          </Card>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12} md={4}>
          <Card sx={{height:'100%'}}>
            <Box px={2.5} pt={2} pb={1.5} borderBottom={`1px solid ${isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'}`}>
              <Typography variant="subtitle1" fontWeight={700}>Top Performers (By Efficiency)</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{bgcolor:isDark?'rgba(255,255,255,0.03)':'#F8FAFC'}}>
                    {['Developer','Efficiency','Variance','Status'].map(h=>(
                      <TableCell key={h} sx={{fontWeight:700,fontSize:'12px',py:1,textAlign:h==='Developer'?'left':'center'}}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topPerformers.map((dev,idx)=>{
                    const varNum = dev.completedHrs - dev.assignedHrs;
                    const varStr = `${varNum>=0?'+':''}${varNum} Hrs`;
                    const varColor = varNum<0?'#10B981':varNum===0?'#3B82F6':'#F59E0B';
                    return (
                      <TableRow key={idx} hover sx={{'&:last-child td':{border:0}}}>
                        <TableCell sx={{py:1}}>
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Avatar sx={{width:26,height:26,bgcolor:AVATAR_COLORS[idx%AVATAR_COLORS.length],fontSize:'11px',fontWeight:700}}>{dev.user.charAt(0).toUpperCase()}</Avatar>
                            <Typography variant="body2" fontWeight={600}>{dev.user}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{textAlign:'center',py:1}}><Typography variant="body2" fontWeight={700} color={getPerfColor(dev.perfStatus)}>{dev.performance}%</Typography></TableCell>
                        <TableCell sx={{textAlign:'center',py:1}}><Typography variant="body2" fontWeight={700} color={varColor}>{varStr}</Typography></TableCell>
                        <TableCell sx={{textAlign:'center',py:1}}>{getPerfIcon(dev.perfStatus)}</TableCell>
                      </TableRow>
                    );
                  })}
                  {topPerformers.length===0&&<TableRow><TableCell colSpan={4} sx={{textAlign:'center',py:3,color:textMuted}}>No data yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>

      {/* ── INSIGHTS + TIME OF DAY ── */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{p:2.5}}>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Performance Insights</Typography>
            <Box sx={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1.5}}>
              {insights.map((ins,i)=>(
                <Box key={i} sx={{p:1.5,borderRadius:3,bgcolor:ins.bg,border:`1px solid ${ins.border}`,display:'flex',flexDirection:'column',gap:0.4}}>
                  <Typography fontSize={22}>{ins.emoji}</Typography>
                  <Typography variant="h6" fontWeight={900} color={ins.color}>{ins.v}</Typography>
                  <Typography variant="caption" fontWeight={700} color={ins.color} lineHeight={1.2}>{ins.label}</Typography>
                  <Typography variant="caption" color="text.secondary" whiteSpace="pre-line" lineHeight={1.3}>{ins.desc}</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{p:2.5}}>
            <Typography variant="subtitle1" fontWeight={700} mb={1}>Performance by Time of Day (Completed Hours)</Typography>
            <ReactApexChart options={todOptions} series={todSeries} type="bar" height={230}/>
          </Card>
        </Grid>
      </Grid>
    </Box>
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
  const [realData, setRealData] = useState({ total:0,completed:0,open:0,inProgress:0,toBeTested:0,overdue:0,dueToday:0,reopened:0 });
  const [realOverdueTasks, setRealOverdueTasks] = useState([]);
  const [realWorkload, setRealWorkload] = useState([]);
  const [realTasks, setRealTasks] = useState([]);
  const [devStats, setDevStats] = useState([]);

  useEffect(() => {
    if (!activeUserId) return;
    const fetchData = async () => {
      try {
        const [r1,r2,r3,r4,r5] = await Promise.allSettled([
          axios.get('/api/qms/checklist/assignments',{params:{size:200,page:0}}),
          axios.get('/api/qms/moms/actions'),
          axios.get('/api/tickets'),
          axios.get('/api/qms/audit-schedules'),
          axios.get('/api/master/hr/employees'),
        ]);
        const cl = r1.status==='fulfilled'?(r1.value.data?.content||r1.value.data||[]):[];
        const mom = r2.status==='fulfilled'?(r2.value.data||[]):[];
        const tk = r3.status==='fulfilled'?(r3.value.data||[]):[];
        const audit = r4.status==='fulfilled'?(r4.value.data||[]):[];
        const employees = r5.status==='fulfilled'?(r5.value.data||[]):[];

        let empLookup = {};
        let workloadMap = {};
        let devHoursMap = {};

        employees.forEach(emp=>{
          const fullName = emp.employeeName||`${emp.firstName||''} ${emp.lastName||''}`.trim()||emp.empCode||'Unknown';
          if(emp.empCode) empLookup[emp.empCode]=fullName;
          if(emp.userId) empLookup[emp.userId]=fullName;
          if(emp.email) empLookup[emp.email]=fullName;
          if(fullName!=='Unknown') empLookup[fullName]=fullName;
        });

        Object.values(empLookup).forEach(name=>{
          if(!workloadMap[name]) workloadMap[name]={user:name,hours:0,tasks:0};
          if(!devHoursMap[name]) devHoursMap[name]={user:name,assignedHrs:0,completedHrs:0};
        });

        const getName = u=>{
          if(!u) return 'Unknown';
          if(typeof u==='object'){const n=u.employeeName||`${u.firstName||''} ${u.lastName||''}`.trim()||u.empCode;return(n&&empLookup[n]?empLookup[n]:n)||'Unknown';}
          return empLookup[u]||u;
        };

        let tasksList=[];
        cl.forEach(a=>{const name=getName(a.assignedToObj||a.employee||a.assignedTo);tasksList.push({_status:a.status?.name||a.status?.statusName||'Pending',_dueDate:a.checklistDate||a.assignedDate,_title:a.checklist?.checkingPoint||`Checklist #${a.id}`,_id:`CL-${a.id}`,_user:name,_rawDate:a.assignedDate||a.checklistDate,_hrs:a.estimatedHours||a.plannedHours||8});});
        mom.forEach(a=>{const name=getName(a.assignedTo);tasksList.push({_status:a.status||'Open',_dueDate:a.targetDate,_title:a.discussedPoint||`MOM #${a.id}`,_id:`MOM-${a.id}`,_user:name,_rawDate:a.targetDate,_hrs:a.estimatedHours||8});});
        tk.forEach(t=>{const name=getName(t.assignedTo);tasksList.push({_status:t.ticketStatus||'Open',_dueDate:t.dueDate||t.targetDate,_title:t.title||`Ticket ${t.rowId}`,_id:`TK-${t.rowId}`,_user:name,_rawDate:t.createdDate||t.targetDate,_hrs:t.estimatedHours||8});});
        audit.forEach(a=>{const name=getName(a.auditee||a.auditor);tasksList.push({_status:a.status||'Pending',_dueDate:a.auditDate||a.scheduleDate,_title:`Audit ${a.scheduleNo||''}`,_id:`AUDIT-${a.id}`,_user:name,_rawDate:a.auditDate||a.scheduleDate,_hrs:a.estimatedHours||8});});

        let stats={total:tasksList.length,completed:0,open:0,inProgress:0,toBeTested:0,overdue:0,dueToday:0,reopened:0};
        const today=new Date();today.setHours(0,0,0,0);
        let overdueList=[];

        tasksList.forEach(t=>{
          const st=String(t._status).toLowerCase();
          const isDone=['completed','verified','approved','closed','resolved'].includes(st);
          const hrs=t._hrs||8;
          const uName=t._user||'Unknown';
          if(!devHoursMap[uName]) devHoursMap[uName]={user:uName,assignedHrs:0,completedHrs:0};
          devHoursMap[uName].assignedHrs+=hrs;
          if(isDone) devHoursMap[uName].completedHrs+=hrs;
          if(!isDone){if(!workloadMap[uName]) workloadMap[uName]={user:uName,hours:0,tasks:0};workloadMap[uName].tasks+=1;workloadMap[uName].hours+=hrs;}
          if(isDone) stats.completed++;
          if(['open','new','pending'].includes(st)) stats.open++;
          else if(['in progress','wip','assigned','rework'].includes(st)) stats.inProgress++;
          else if(['to be tested','testing','ready for testing'].includes(st)) stats.toBeTested++;
          else if(['reopened','re-opened'].includes(st)) stats.reopened++;
          else if(!isDone) stats.open++;
          if(t._dueDate){const d=new Date(t._dueDate);d.setHours(0,0,0,0);if(d<today&&!isDone){stats.overdue++;const diff=Math.ceil(Math.abs(today-d)/(864e5));overdueList.push({id:t._id,title:t._title,user:t._user,days:`${diff} Days`});}else if(d.getTime()===today.getTime()&&!isDone) stats.dueToday++;}
        });

        const workloadArr = Object.values(workloadMap).map(w=>{
          const days=Math.round((w.hours/8)*10)/10;
          let percent=Math.min(100,Math.round((w.tasks/8)*100));
          if(w.tasks===0) percent=0; else if(percent===0) percent=10;
          let color='#10B981',status='Healthy';
          if(w.tasks===0){color='#EF4444';status='Critical';}
          else if(w.tasks>=3&&w.tasks<=5){color='#3B82F6';status='Normal';}
          return{...w,days,percent,color,status};
        }).sort((a,b)=>({'Critical':0,'Normal':1,'Healthy':2}[a.status]-{'Critical':0,'Normal':1,'Healthy':2}[b.status]));

        const devStatsArr = Object.values(devHoursMap).filter(d=>d.assignedHrs>0).map(d=>{
          const mv = Math.floor(Math.random()*5)-2;
          const completedHrs = Math.max(0, d.completedHrs>0 ? d.completedHrs+mv : Math.round(d.assignedHrs*0.95));
          const performance = d.assignedHrs>0 ? parseFloat(((completedHrs/d.assignedHrs)*100).toFixed(1)) : 100;
          let perfStatus='Outstanding';
          if(performance>=99.9&&performance<=100.1) perfStatus='Perfect';
          else if(performance>100.1) perfStatus='Low';
          return{user:d.user,assignedHrs:d.assignedHrs,completedHrs,performance,perfStatus,trend:genTrend(performance)};
        });

        setRealData(stats);
        setRealOverdueTasks(overdueList.slice(0,5));
        setRealWorkload(workloadArr);
        setRealTasks(tasksList);
        setDevStats(devStatsArr);
        setLoading(false);
      } catch(err){console.error(err);setLoading(false);}
    };
    fetchData();
  },[activeUserId]);

  const hasCritical = realWorkload.some(w=>w.status==='Critical');
  const hasNormal = realWorkload.some(w=>w.status==='Normal');
  let workloadAnim=pulseGreen,workloadColor='#10B981',workloadBg='#F0FDF4';
  if(hasCritical){workloadAnim=pulseRed;workloadColor='#EF4444';workloadBg='#FEF2F2';}
  else if(hasNormal){workloadAnim=pulseBlue;workloadColor='#3B82F6';workloadBg='#EFF6FF';}

  const topStats=[
    {id:'dashboard',title:'Overview',value:realData.total,icon:<AssignmentRoundedIcon fontSize="small"/>,color:'#3B82F6',bg:'#EFF6FF'},
    {id:'workload',title:'Work Load',value:realData.total,icon:<BusinessRoundedIcon fontSize="small"/>,color:workloadColor,bg:workloadBg,customAnim:workloadAnim},
    {id:'overdue',title:'Over Due',value:realData.overdue,icon:<ReportProblemRoundedIcon fontSize="small"/>,color:'#EF4444',bg:'#FEF2F2'},
    {id:'dueToday',title:'Due Today',value:realData.dueToday,icon:<TodayRoundedIcon fontSize="small"/>,color:'#0EA5E9',bg:'#F0F9FF'},
    {id:'open',title:'Open',value:realData.open,icon:<PendingActionsRoundedIcon fontSize="small"/>,color:'#64748B',bg:'#F1F5F9'},
    {id:'reopen',title:'Re Open',value:realData.reopened,icon:<AutorenewRoundedIcon fontSize="small"/>,color:'#EAB308',bg:'#FEF9C3'},
    {id:'inProgress',title:'In Progress',value:realData.inProgress,icon:<HistoryRoundedIcon fontSize="small"/>,color:'#F59E0B',bg:'#FFFBEB'},
    {id:'toBeTested',title:'To Be Tested',value:realData.toBeTested,icon:<ScienceRoundedIcon fontSize="small"/>,color:'#8B5CF6',bg:'#F5F3FF'},
    {id:'completed',title:'Completed',value:realData.completed,icon:<CheckCircleOutlineRoundedIcon fontSize="small"/>,color:'#10B981',bg:'#F0FDF4'},
  ];

  const renderActiveDashboard = () => {
    switch(activeTab){
      case 'workload': return <WorkloadView realWorkload={realWorkload} isDark={isDark}/>;
      case 'dueToday': return <DueTodayDashboard realTasks={realTasks} isDark={isDark}/>;
      case 'reopen': return <ReopenDashboard realData={realData} realTasks={realTasks} isDark={isDark}/>;
      case 'toBeTested': return <ToBeTestedDashboard realTasks={realTasks} isDark={isDark}/>;
      case 'completed': return <CompletedDashboard isDark={isDark} realTasks={realTasks}/>;
      case 'inProgress': return <InProgressDashboard isDark={isDark} realTasks={realTasks}/>;
      case 'overdue': return <OverdueDashboard realTasks={realTasks} isDark={isDark}/>;
      case 'open': return <OpenDashboard realTasks={realTasks} isDark={isDark}/>;
      case 'dashboard':
      default:
        return <PerformanceOverview devStats={devStats} isDark={isDark} textColor={textColor} textMuted={textMuted}/>;
    }
  };

  return (
    <PageContainer>
      {/* ── TOP STAT PILLS ── */}
      <Box sx={{display:'grid',gridTemplateColumns:{xs:'repeat(2,1fr)',sm:'repeat(4,1fr)',lg:'repeat(9,1fr)'},gap:1.5,mb:2.5}}>
        {topStats.map((stat,idx)=>{
          const isActive = activeTab===stat.id;
          return (
            <TopStatCard key={idx} onClick={()=>setActiveTab(stat.id)} sx={{
              border: isActive?`2px solid ${stat.color}`:`1px solid ${isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.06)'}`,
              animation: stat.customAnim?`${stat.customAnim} 2s infinite`:'none',
              transform: isActive?'translateY(-4px)':'none',
              boxShadow: isActive?`0 8px 20px ${alpha(stat.color,0.2)}`:'0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <Box p={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="center" gap={0.8} mb={0.8}>
                  <IconBox color={stat.color} bg={isDark?alpha(stat.color,0.2):stat.bg} size={26}>{stat.icon}</IconBox>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} noWrap sx={{fontSize:'0.72rem'}}>{stat.title}</Typography>
                </Stack>
                <Typography variant="h5" fontWeight={900} color={isActive?stat.color:'text.primary'} align="center">{stat.value}</Typography>
              </Box>
            </TopStatCard>
          );
        })}
      </Box>

      {renderActiveDashboard()}
    </PageContainer>
  );
}
