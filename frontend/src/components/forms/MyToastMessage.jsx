import * as React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import { blue, green, red } from "@mui/material/colors";

export function MyToastMessage({ type, content }) {
  const [state, setState] = React.useState({
    open: false,
    vertical: "top",
    horizontal: "center",
  });
  const { vertical, horizontal, open } = state;

  const toastBackground = {
    informative: blue[500],
    success: green[500],
    fail: red[500],
  };

  const handleClick = (newState) => () => {
    setState({ ...newState, open: true });
  };

  const handleClose = () => {
    setState({ ...state, open: false });
  };

  const buttons = (
    <React.Fragment>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button
          onClick={handleClick({ vertical: "bottom", horizontal: "center" })}
        ></Button>
      </Box>
    </React.Fragment>
  );

  return (
    <Box sx={{ width: 500 }}>
      {buttons}
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={handleClose}
        message={content}
        key={vertical + horizontal}
        style={{ backgroundColor: toastBackground[type] }}
        autoHideDuration={5000} // Set auto hide duration to 5000 milliseconds (5 seconds)
      />
    </Box>
  );
}
