import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Controller } from 'react-hook-form';
import PropTypes from 'prop-types';

export function MyMultilineTextField({ label, name, control }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Box
          sx={{
            '& .MuiTextField-root': { width: '100%' },
          }}
        >
          <div>
            <TextField
              id={`${name}-multiline`}
              label={label}
              multiline
              rows={3}
              value={value || ''}
              onChange={onChange}
              variant="outlined"
              error={!!error}
              helperText={error ? error.message : ''}
            />
          </div>
        </Box>
      )}
    />
  );
}

MyMultilineTextField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
};
