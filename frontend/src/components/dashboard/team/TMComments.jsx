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
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import DeleteIcon from "@mui/icons-material/Delete";


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
            <div class="form-container">
              <h3>Add new comment</h3>
              <form onSubmit={handleSubmit(submission)}>
                <Box>
                  <FormControl>
                    <RadioGroup
                      row
                      aria-labelledby="demo-radio-buttons-group-label"
                      defaultValue="Positive"
                      name="positive"
                    >
                      <FormControlLabel
                        value="Positive"
                        control={<Radio />}
                        label={
                          <span> <ThumbUpIcon className="inline-icon icon-S icon-green"/> Positive </span> 
                        } 
                      />
                      <FormControlLabel
                        value="Negative"
                        control={<Radio />}
                        label={
                          <span> <ThumbDownIcon className="inline-icon icon-S icon-red"/> Negative </span> 
                        } 
                      />
                    </RadioGroup>
                  </FormControl>
                  <MyMultilineTextField
                    label={"Comment"}
                    name={"comment"}
                    control={control}
                  />
                </Box>
                <Button
                  type="submit"
                  variant="outlined"
                  startIcon={<AddIcon />}
                >
                  Add comment
                </Button>
              </form>
            </div>
            <Divider />

            {loading ? (
              <p>Loading data...</p>
            ) : comment.length > 0 ? (
              comment.map((commentItem, index) => (
                <div key={commentItem.id}>
                  <div className="comment-row">
                    {commentItem.isPositive ? (
                        <div>
                        <ThumbUpIcon className="inline-icon icon-M icon-green"/>
                        </div>
                      ) : (
                        <div>
                          <ThumbDownIcon className="inline-icon icon-M icon-red"/>
                        </div>
                    )}  
                    <div>
                      <p className="date-label">{commentItem.updateDate.slice(0, 10)}</p>
                      
                      <div>
                        <p>{commentItem.commentContent}</p>
                      </div>
                    </div>
                    <Button
                    variant="text"
                    onClick={() => handleConfirmDeleteComment(commentItem.id)}
                    startIcon={<DeleteIcon />}
                    >
                      Delete
                    </Button>
                  </div>
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
