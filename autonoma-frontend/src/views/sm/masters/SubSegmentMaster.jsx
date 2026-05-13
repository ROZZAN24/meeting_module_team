import { useState, useMemo } from 'react';
import { Typography, Stack } from '@mui/material';
import { IconChartPie } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { BOSDataTable } from 'ui-component/bos';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'subSegmentCode', label: 'Sub Segment Code', minWidth: 150, bold: true },
  { id: 'subSegmentName', label: 'Sub Segment Name', minWidth: 200 },
  { id: 'parentSegment', label: 'Parent Segment', minWidth: 150 },
  { id: 'status', label: 'Status', minWidth: 100 }
];

export default function SubSegmentMaster() {
  const [rows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconChartPie size={24} />
          <Typography variant="h3">Sub Segment Master</Typography>
        </Stack>
      }
    >
      <BOSDataTable
        columns={columns}
        rows={rows}
        page={page}
        size={size}
        totalCount={rows.length}
        onPageChange={(p) => setPage(p)}
        onSizeChange={(s) => { setSize(s); setPage(0); }}
      />
    </MainCard>
  );
}
