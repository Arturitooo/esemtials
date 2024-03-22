import Button from '@mui/material/Button';

export function MyTextButton(props) {
  const {label} = props
  return (
      <Button variant="text">{label}</Button>
  );
}