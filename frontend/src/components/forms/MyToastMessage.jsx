import * as React from "react";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import { blue, green, red } from "@mui/material/colors";

export function MyToastMessage({ type, content, open, handleClose }) {
  const toastBackground = {
    informative: blue[500],
    success: green[500],
    fail: red[500],
  };

  return (
    <Box
      sx={{
        width: 500,
        position: "fixed",
        top: "50px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2,
      }}
    >
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={open}
        onClose={handleClose}
        message={content}
        key={"top" + "center"}
        autoHideDuration={5000}
        ContentProps={{
          sx: {
            backgroundColor: toastBackground[type],
            alignContent: "center",
            justifyContent: "center",
            textAlign: "center",
            display: "flex",
          },
        }}
      />
    </Box>
  );
}
