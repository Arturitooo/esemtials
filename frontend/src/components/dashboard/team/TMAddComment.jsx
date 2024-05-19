import React from "react";
import { useForm } from "react-hook-form";
import AxiosInstance from "../../AxiosInstance";
import { useNavigate } from "react-router-dom";

import { MyMultilineTextField } from "../../forms/MyMultilineTextField";
import { MySelectField } from "../../forms/MySelectField";
import { Box } from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import AddIcon from "@mui/icons-material/Add";

export const TMAddComment = ({ userData_id, tm_id, onCommentAdded }) => {
  const { handleSubmit, control, reset } = useForm();
  const navigate = useNavigate();

  const submission = (data) => {
    const Positive = data.positive === "Positive";
    AxiosInstance.post("team/teammember-comment/", {
      isPositive: Positive,
      commentContent: data.comment,
      created_by: userData_id,
      teammember: tm_id,
    })
      .then(() => {
        onCommentAdded();
        reset();
      })
      .catch((error) => {
        console.error("Error during login", error);
      });
  };

  return (
    <Box>
      <h3>Add new comment</h3>
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(submission)}>
            <Box>
              <MyMultilineTextField
                label={"Comment"}
                name={"comment"}
                control={control}
              />
              <MySelectField
                options={[
                  { label: "Positive", value: "Positive" },
                  { label: "Negative", value: "Negative" },
                ]}
                label={"Positive or Negative?"}
                name={"positive"}
                control={control}
              />
            </Box>
            <Button
              type="submit"
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ height: "50%" }}
            >
              New comment
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};
