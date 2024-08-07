import { Box } from "@mui/material";
import { useState } from "react";
import "../App.scss";
import { MyTextField } from "./forms/MyTextField";
import { MyPassField } from "./forms/MyPassField";
import { MyContainedButton } from "./forms/MyContainedButton";
import { MyTextButton } from "./forms/MyTextButton";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import AxiosInstance from "./AxiosInstance";
import { MyMessage } from "./forms/MyMessage";

export const ConfirmPasswordReset = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { handleSubmit, control } = useForm();
  const [showMessage, setShowMessage] = useState(false);

  const submission = (data) => {
    AxiosInstance.post("api/password_reset/confirm/", {
      password: data.password,
      token: token,
    }).then((response) => {
      setShowMessage(true);
      setTimeout(() => {
        navigate("/login");
      }, 4000);
    });
  };
  return (
    <div className={"background"}>
      {showMessage ? (
        <MyMessage
          text={`Your password reset request was successfull`}
          severity={"success"}
        />
      ) : null}
      <form onSubmit={handleSubmit(submission)}>
        <Box className={"loginWhiteBox"}>
          <Box className={"itemBox"}>
            <Box className={"title"}>New Password</Box>
          </Box>
          <Box className={"itemBox"}>
            <MyPassField
              label={"Password"}
              name={"password"}
              control={control}
            />
          </Box>
          <Box className={"itemBox"}>
            <MyPassField
              label={"Confirm password"}
              name={"password2"}
              control={control}
            />
          </Box>
          <Box className={"itemBox"} sx={{ marginBottom: "0px" }}>
            <MyContainedButton label={"Set new password"} type={"submit"} />
          </Box>
        </Box>
      </form>
    </div>
  );
};
