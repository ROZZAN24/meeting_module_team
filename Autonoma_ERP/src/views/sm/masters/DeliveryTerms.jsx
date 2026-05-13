import { useState, useMemo } from 'react';
import { Typography, Stack } from '@mui/material';
import { IconTruckDelivery } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { BOSDataTable } from 'ui-component/bos';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'termCode', label: 'Term Code', minWidth: 120, bold: true },
  { id: 'termName', label: 'Term Name', minWidth: 250 },
  { id: 'status', label: 'Status', minWidth: 100 }
];

export default function DeliveryTerms() {
  const [rows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconTruckDelivery size={24} />
          <Typography variant="h3">Delivery Terms</Typography>
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
