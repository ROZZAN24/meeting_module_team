import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';

// project imports
import { useDispatch, useSelector } from 'store';
import { editColumn } from 'store/slices/kanban';

// ==============================|| KANBAN BOARD - COLUMN EDIT ||============================== //

export default function EditColumn({ column }) {
  const theme = useTheme();
  const dispatch = useDispatch();

  const { columns } = useSelector((state) => state.kanban);

  const handleColumnRename = (event) => {
    dispatch(
      editColumn(
        {
          id: column.id,
          title: event.target.value,
          itemIds: column.itemIds
        },
        columns
      )
    );
  };

  return (
    <OutlinedInput
      fullWidth
      value={column.title}
      onChange={handleColumnRename}
      sx={{
        mb: 1.5,
        '&, & input': { bgcolor: 'transparent' },
        '& fieldset': { display: 'none' },
        '& input:focus + fieldset': { display: 'block' },
        '& input:hover + fieldset': { display: 'block' },

        ...theme.applyStyles('dark', {
          '& input:focus, & input:hover': {
            bgcolor: 'dark.800'
          }
        }),
        ...theme.applyStyles('light', {
          '& input:focus, & input:hover': {
            bgcolor: 'grey.50'
          }
        })
      }}
      placeholder="title"
    />
  );
}

EditColumn.propTypes = { column: PropTypes.any };
