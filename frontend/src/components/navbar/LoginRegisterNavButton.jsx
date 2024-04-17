import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export function LoginRegisterNavButton(props) {
    const {label} = props
    return (
      <Stack direction="row" spacing={2} >
        <Button
          sx={{
            color: '#1D212F',
            fontWeight:'600',
            '&:hover': {backgroundColor: 'rgba(4, 81, 229, 0.2)', },
            '&:active': {backgroundColor: 'rgba(4, 81, 229, 0.4)', },          
          }} 
        >{label}</Button>
      </Stack>
    );
  }

  