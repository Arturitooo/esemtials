import React, { useState, useEffect } from "react";
import AxiosInstance from "../../AxiosInstance";

import { MyModal } from "../../forms/MyModal";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";

import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

export const TMCommentsList = ({ userData_id, tm_id }) => {
  const [comment, setComment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState(null);

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

  return (
    <div>
      <h2>Comments</h2>
      {loading ? (
        <p>Loading data...</p>
      ) : comment.length > 0 ? (
        <Card>
          <CardContent>
            {comment.map((commentItem) => (
              <div key={commentItem.id}>
                {" "}
                {/* Changed p to div */}
                <p>{commentItem.commentContent}</p>
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
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <p>No comments available</p>
          </CardContent>
        </Card>
      )}

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
  );
};
