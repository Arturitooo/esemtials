import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export function MyMultilineTextField({label}) {
  return (
    <Box
      component="form"
      sx={{
        '& .MuiTextField-root': {width: '100%' },
      }}
      noValidate
      autoComplete="off"
    >
      <div>
      <TextField
          id="outlined-multiline-static"
          label={label}
          multiline
          rows={3}
          defaultValue={label}
        />
      </div>

    </Box>
  );
}