import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Box } from '@mui/material';
import PropTypes from 'prop-types';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, selectedValues, theme) {
  return {
    fontWeight:
      selectedValues.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export function MyMultipleSelectField({ options, label }) {
  const theme = useTheme();
  const [selectedValues, setSelectedValues] = React.useState([]);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedValues(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id="multiple-select-label">{label}</InputLabel>
        <Select
          labelId="multiple-select-label"
          id="multiple-select"
          multiple
          value={selectedValues}
          onChange={handleChange}
          input={<OutlinedInput label={label} />}
          MenuProps={MenuProps}
        >
          {options.map((option, index) => (
            <MenuItem
              key={index}
              value={option}
              style={getStyles(option, selectedValues, theme)}
            >
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

MyMultipleSelectField.propTypes = {
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  label: PropTypes.string.isRequired,
};
