import PropTypes from 'prop-types';
import { useState } from 'react';

// mui
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

// project imports
import useConfig from 'hooks/useConfig';

// assets
import FileCopyIcon from '@mui/icons-material/FileCopyTwoTone';
import FilterListIcon from '@mui/icons-material/FilterListTwoTone';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import PrintIcon from '@mui/icons-material/PrintTwoTone';
import SearchIcon from '@mui/icons-material/Search';

// ==============================|| REFUND - FILTER ||============================== //

export default function Filter({ rows, setRows }) {
  const {
    state: { borderRadius }
  } = useConfig();

  const [selectValue, setSelectValue] = useState('');
  const [search, setSearch] = useState('');

  const handleSearch = (event) => {
    const newString = event?.target.value;
    setSearch(newString || '');

    if (newString) {
      const newRows = rows?.filter((row) => {
        let matches = true;

        const properties = ['date', 'id', 'name', 'qty'];
        let containsQuery = false;

        properties.forEach((property) => {
          if (row[property].toString().toLowerCase().includes(newString.toString().toLowerCase())) {
            containsQuery = true;
          }
        });

        if (!containsQuery) {
          matches = false;
        }
        return matches;
      });
      setRows(newRows);
    } else {
      setRows(rows);
    }
  };

  const handleChangeMonth = (e) => {
    setSelectValue(e.target.value);
  };

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: { xs: 'space-between' }, p: 3, gap: 2 }}
    >
      <TextField
        onChange={handleSearch}
        value={search}
        placeholder="Search Refund"
        size="small"
        sx={{ width: { xs: 1, sm: 'auto' } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }
        }}
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', width: { xs: '100%', sm: 'auto' }, gap: 1.25 }}>
        <Stack direction="row" sx={{ justifyContent: 'center', gap: 1.25 }}>
          <Tooltip title="Copy">
            <IconButton size="large">
              <FileCopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton size="large">
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filter">
            <IconButton size="large">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 1.25 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="demo-simple-select-label">Select Request</InputLabel>
            <Select
              sx={{ width: { xs: 140, sm: 147 } }}
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              onChange={handleChangeMonth}
              value={selectValue}
              label="Select Request"
            >
              <MenuItem value={1}>Open request</MenuItem>
              <MenuItem value={2}>Close request</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
            <Button
              size="large"
              variant="outlined"
              sx={(theme) => ({
                borderRadius: `${borderRadius}px`,
                color: 'grey.900',
                width: { xs: 96, sm: 147 },
                borderColor: 'grey.300',
                '&:hover': { borderColor: 'grey.500' },
                ...theme.applyStyles('dark', {
                  borderColor: 'divider',
                  '&:hover': { borderColor: 'grey.800' }
                })
              })}
              endIcon={<OpenInNewOutlinedIcon sx={{ color: 'grey.500' }} />}
            >
              Export
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}

Filter.propTypes = { rows: PropTypes.array, setRows: PropTypes.func };
