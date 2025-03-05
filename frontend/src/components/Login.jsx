import { Box } from "@mui/material";
import "../App.scss";
import { MyTextField } from "./forms/MyTextField";
import { MyPassField } from "./forms/MyPassField";
import { MyContainedButton } from "./forms/MyContainedButton";
import { MyTextButton } from "./forms/MyTextButton";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState, useContext } from "react";
import AxiosInstance from "./AxiosInstance";
import { MyMessage } from "./forms/MyMessage";
import { UserContext } from "./UserContext";

export const Login = () => {
  const navigate = useNavigate();
  const [showMessage, setShowMessage] = useState(false);
  const { setUser } = useContext(UserContext);
  const schema = yup.object({
    email: yup
      .string()
      .email("Provide correct email address")
      .required("Email is a required field"),
    password: yup.string().required("Password is a required field"),
  });
  const { handleSubmit, control } = useForm({ resolver: yupResolver(schema) });

  const submission = (data) => {
    AxiosInstance.post("login/", {
      email: data.email,
      password: data.password,
    })
      .then((response) => {
        localStorage.setItem("Token", response.data.token);

        AxiosInstance.get("user-info/")
          .then((res) => {
            setUser({
              id: res.data.id,
              email: res.data.email,
              username: res.data.username,
              subscription: res.data.subscription,
              role: res.data.role,
            });
          })
          .catch((error) => {
            console.error("Error fetching user info:", error);
          });
        navigate(`/`);
      })
      .catch((error) => {
        setShowMessage(true);
        console.error("Error during login", error);
      });
  };

  return (
    <div className={"background"}>
      {showMessage ? (
        <MyMessage
          text={`Login has failed, please try again`}
          severity={"info"}
        />
      ) : null}
      <Box
        sx={{
          position: "absolute",
          top: 10,
          left: 10,
        }}
      >
        <Link to="/">
          <MyTextButton label={"< Home"} />
        </Link>
      </Box>
      <form onSubmit={handleSubmit(submission)}>
        <Box className={"loginWhiteBox"}>
          <Box className={"itemBox"}>
            <Box className={"title"}>Login to SMtials</Box>
          </Box>
          <Box className={"itemBox"}>
            <MyTextField label={"Email"} name={"email"} control={control} />
          </Box>
          <Box className={"itemBox"}>
            <MyPassField
              label={"Password"}
              name={"password"}
              control={control}
            />
          </Box>
          <Box className={"itemBox"}>
            <MyContainedButton label={"Login"} type={"submit"} />
          </Box>
          <Box className={"itemBox"} sx={{ marginBottom: "0px" }}>
            <Link to="/password-reset">
              <MyTextButton label={"Forgot password? Reset it here"} />
            </Link>
          </Box>
          <Box className={"itemBox"} sx={{ marginTop: "0px" }}>
            <Link to="/register">
              <MyTextButton label={"No account? Register here!"} />
            </Link>
          </Box>
        </Box>
      </form>
    </div>
  );
};
