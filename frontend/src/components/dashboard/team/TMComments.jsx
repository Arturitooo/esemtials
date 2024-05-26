import React, { useState, useEffect } from "react";
import AxiosInstance from "../../AxiosInstance";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { MyMultilineTextField } from "../../forms/MyMultilineTextField";
import { MySelectField } from "../../forms/MySelectField";
import { Box } from "@mui/material";
import { MyModal } from "../../forms/MyModal";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import AddIcon from "@mui/icons-material/Add";

export const TMComments = ({ userData_id, tm_id, onCommentAdded }) => {
  const [comment, setComment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState(null);
  const schema = yup.object({
    comment: yup
      .string()
      .required("You need to provide comment content to submit"),
    positive: yup
      .string()
      .required("You need to choose if it's positive or negative comment"),
  });
  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const GetComments = (id) => {
    const url = `team/teammember-comment/?id=${id}`;
    AxiosInstance.get(url)
      .then((res) => {
        if (res && res.data) {
          setComment(res.data);
          setLoading(false);
        } else {
          // Handle case when response or response data is undefined
          setComment([]);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          // If the error is 404, it means no comments were found for the user
          setComment([]);
          setLoading(false);
        } else {
          console.error("Error fetching comments:", error);
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    GetComments(tm_id);
  }, [tm_id]);

  const handleConfirmDeleteComment = (id) => {
    setCommentToDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteComment = async () => {
    await DeleteComment(commentToDeleteId);
    setDeleteModalOpen(false);
  };

  const DeleteComment = (id) => {
    const url = `team/teammember-comment/${id}`;
    AxiosInstance.delete(url).then(() => {
      console.log("you've successfully deleted the comment");
      GetComments(tm_id);
    });
  };

  const submission = (data) => {
    const Positive = data.positive === "Positive";

    AxiosInstance.post("team/teammember-comment/", {
      isPositive: Positive,
      commentContent: data.comment,
      created_by: userData_id,
      teammember: tm_id,
      updateDate: new Date(),
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
      <h2>Comments</h2>
      <div>
        <Card>
          <CardContent>
            <div style={{ marginBottom: "20px" }}>
              <h3>Add new comment</h3>
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
            </div>
            <Divider />

            {loading ? (
              <p>Loading data...</p>
            ) : comment.length > 0 ? (
              comment.map((commentItem, index) => (
                <div key={commentItem.id}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ width: "90%" }}>
                      <p>{commentItem.commentContent}</p>
                    </div>
                    <div
                      style={{
                        position: "relative",
                        color: "rgba(29, 33, 47, 0.4)",
                        width: "auto",
                      }}
                    >
                      <p>{commentItem.updateDate.slice(0, 10)}</p>
                    </div>
                  </div>
                  {commentItem.isPositive ? (
                    <div style={{ color: "green" }}>
                      <ThumbUpIcon />
                    </div>
                  ) : (
                    <div style={{ color: "red" }}>
                      <ThumbDownIcon />
                    </div>
                  )}
                  <Button
                    variant="text"
                    onClick={() => handleConfirmDeleteComment(commentItem.id)}
                  >
                    Delete
                  </Button>
                  {index < comment.length - 1 && <Divider />}
                </div>
              ))
            ) : (
              <p>You didn&apos;t add any comments so far...</p>
            )}
          </CardContent>
        </Card>

        <MyModal
          open={deleteModalOpen}
          handleClose={() => setDeleteModalOpen(false)}
          title="Confirm Deletion"
          content={"Are you sure you want to delete the comment?"}
          actions={[
            { label: "Yes", onClick: handleDeleteComment },
            { label: "No", onClick: () => setDeleteModalOpen(false) },
          ]}
        />
      </div>
    </Box>
  );
};
