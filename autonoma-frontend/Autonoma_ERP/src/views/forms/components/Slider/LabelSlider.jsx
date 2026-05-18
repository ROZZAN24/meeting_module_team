import React from 'react';

// material-ui
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ==============================|| LABEL SLIDER ||============================== //

export default function LabelSlider() {
  const [value, setValue] = React.useState(50);
  const handleChange = (even, newValue) => {
    setValue(newValue);
  };

  const [valueSecondary, setValueSecondary] = React.useState(78);
  const handleChangeSecondary = (event, newValue) => {
    setValueSecondary(newValue);
  };

  return (
    <Stack sx={{ gap: 1 }}>
      <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
        <Typography variant="caption">Progress</Typography>
        <Slider value={value} onChange={handleChange} aria-labelledby="continuous-slider" />
        <Typography variant="h6">{value}%</Typography>
      </Stack>
      <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
        <Typography variant="caption">Progress</Typography>
        <Slider value={valueSecondary} color="secondary" onChange={handleChangeSecondary} aria-labelledby="continuous-slider" />
        <Typography variant="h6">{valueSecondary}%</Typography>
      </Stack>
    </Stack>
  );
}
