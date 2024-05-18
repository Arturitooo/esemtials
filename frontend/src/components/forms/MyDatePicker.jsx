import * as React from 'react';
import { Controller } from 'react-hook-form';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { TextField } from '@mui/material'; 
import PropTypes from 'prop-types';

export function MyDatePicker({ label, name, control }) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <DatePicker
            label={label}
            value={value || null}
            onChange={onChange}
          >
            {({ inputRef, inputProps, openPicker }) => (
              <TextField 
                {...inputProps}
                error={!!error}
                helperText={error ? error.message : null}
                onClick={openPicker}
              />
            )}
          </DatePicker>
        )}
      />
    </LocalizationProvider>
  );
}

MyDatePicker.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
};
