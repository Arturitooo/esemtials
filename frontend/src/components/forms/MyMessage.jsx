import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Stack from "@mui/material/Stack";

export const MyMessage = ({ text, severity }) => {
  // severity options: success, info, warning, error
  return (
    <Stack
      sx={{ width: "100%" }}
      spacing={2}
      position={"absolute"}
      top={"20px"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <Alert severity={severity}>
        <AlertTitle>{severity}</AlertTitle>
        {text}
      </Alert>
    </Stack>
  );
};
