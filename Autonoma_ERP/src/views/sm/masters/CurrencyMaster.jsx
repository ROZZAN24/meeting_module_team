import { useState, useEffect, useMemo } from 'react';
import { Typography, Stack } from '@mui/material';
import { IconCoins } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { BOSDataTable } from 'ui-component/bos';

const columns = [
  { id: 'index', label: '#', minWidth: 50 },
  { id: 'currencyCode', label: 'Currency Code', minWidth: 120, bold: true },
  { id: 'currencyName', label: 'Currency Name', minWidth: 150 },
  { id: 'symbol', label: 'Symbol', minWidth: 80 },
  { id: 'status', label: 'Status', minWidth: 100 }
];

export default function CurrencyMaster() {
  const [rows] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  return (
    <MainCard
      title={
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconCoins size={24} />
          <Typography variant="h3">Currency Master</Typography>
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
