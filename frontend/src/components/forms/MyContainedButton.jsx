import Button from '@mui/material/Button';

export function MyContainedButton(props) {
  const {label, type} = props
  return (
    <Button type={type} variant="contained" className={'myForm myLoginRegisterButton'}>{label}</Button>
  );
}