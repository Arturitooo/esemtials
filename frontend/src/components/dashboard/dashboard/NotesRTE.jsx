import React, { useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  convertFromRaw,
  convertToRaw,
  getDefaultKeyBinding,
  RichUtils,
} from "draft-js";
import "draft-js/dist/Draft.css"; // for styling
import debounce from "lodash.debounce";

import "./NotesRTE.css";
import AxiosInstance from "../../AxiosInstance";
import Button from "@mui/material/Button";
import { UserInfo } from "../../UserInfo";
import { MyModal } from "../../forms/MyModal";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

// Import icons
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import SpaceBarIcon from "@mui/icons-material/SpaceBar";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import ListIcon from "@mui/icons-material/List";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import CodeIcon from "@mui/icons-material/Code";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";

const NotesRTE = ({ limitHeight }) => {
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [myNotesList, setMyNotesList] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [editingNoteName, setEditingNoteName] = useState(false); // State to manage editing mode
  const [editedNoteName, setEditedNoteName] = useState(""); // State to store the edited note name
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { userData } = UserInfo();

  const editorRef = React.createRef();

  useEffect(() => {
    const storedProjectId = localStorage.getItem("selectedProjectId");
    if (storedProjectId) {
      setSelectedProjectId(storedProjectId);
      GetNotesList(storedProjectId);
    }
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      GetNotesList(selectedProjectId);
    }
  }, [selectedProjectId]);

  const GetNotesList = (projectId) => {
    AxiosInstance.get("dashboard/note/list/")
      .then((res) => {
        const filteredNotes = res.data.filter(
          (note) => note.project === Number(projectId)
        );
        setMyNotesList(filteredNotes);
        setLoading(false);
        if (filteredNotes.length > 0) {
          setSelectedNote(filteredNotes[0]);
          fetchNoteContent(filteredNotes[0]);
        } else {
          setSelectedNote(null);
          setEditorState(EditorState.createEmpty());
        }
      })
      .catch((error) => {
        console.error("Error fetching notes list:", error);
      });
  };

  const fetchNoteContent = (note) => {
    AxiosInstance.get(`dashboard/note/${note.id}/`)
      .then((res) => {
        const contentState = convertFromRaw(res.data.note_content);
        setEditorState(EditorState.createWithContent(contentState));
      })
      .catch((error) => {
        console.error("Error fetching note content:", error);
      });
  };

  const updateNoteContent = () => {
    if (!selectedNote) {
      console.error("No note selected");
      return;
    }

    const contentState = editorState.getCurrentContent();
    const rawContentState = convertToRaw(contentState);

    // Compare the current content state with the previous content state
    if (
      JSON.stringify(rawContentState) ===
      JSON.stringify(selectedNote.note_content)
    ) {
      // Content hasn't changed, no need to send update request
      console.log("Content not changed");
      return;
    }

    const updatedNote = {
      ...selectedNote,
      note_content: rawContentState,
    };

    AxiosInstance.put(`dashboard/note/${selectedNote.id}/update/`, updatedNote)
      .then((res) => {})
      .catch((error) => {
        console.error("Error updating note:", error);
      });
  };

  const handleNoteClick = (note) => {
    if (note != selectedNote && editingNoteName) {
      setEditingNoteName(false);
    }
    setSelectedNote(note);
    fetchNoteContent(note);
  };

  const debouncedUpdateNoteContent = debounce(updateNoteContent, 500);

  const onChange = (editorState) => {
    if (!editorState.getCurrentContent().hasText() && !selectedNote) {
      handleNewPageClick();
    }
    setEditorState(editorState);
    debouncedUpdateNoteContent();
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      onChange(newState);
      return true;
    }
    return false;
  };

  const mapKeyToEditorCommand = (e) => {
    if (e.keyCode === 9 /* TAB */) {
      const newEditorState = RichUtils.onTab(e, editorState, 4 /* maxDepth */);
      if (newEditorState !== editorState) {
        onChange(newEditorState);
      }
      return;
    }
    return getDefaultKeyBinding(e);
  };

  const toggleBlockType = (blockType) => {
    onChange(RichUtils.toggleBlockType(editorState, blockType));
  };

  const toggleInlineStyle = (inlineStyle) => {
    onChange(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };

  const handleNewPageClick = () => {
    setEditedNoteName("");
    const newNote = {
      note_updated: new Date().toISOString(),
      note_owner: userData.id,
      project: Number(selectedProjectId),
    };

    AxiosInstance.post("dashboard/note/create/", newNote)
      .then((res) => {
        console.log("New note created successfully:", res.data.note_name);
        GetNotesList(selectedProjectId);
        handleEditNoteName();
      })
      .catch((error) => {
        console.error("Error while creating new note:", error);
      });
  };

  const handleEditNoteName = () => {
    setEditingNoteName(true); // Enable editing mode
    setEditedNoteName(selectedNote.note_name); // Set the current note name for editing
  };

  const handleCheckNoteName = () => {
    const updatedNote = {
      ...selectedNote,
      note_name: editedNoteName,
    };

    AxiosInstance.put(`dashboard/note/${selectedNote.id}/update/`, updatedNote)
      .then((res) => {
        console.log("Note name updated successfully:", res.data.note_name);
        setEditingNoteName(false); // Disable editing mode
        GetNotesList(selectedProjectId);
        fetchNoteContent(updatedNote);
      })
      .catch((error) => {
        console.error("Error updating note name:", error);
      });
  };

  const handleConfirmDeleteNote = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteNote = () => {
    const updatedNote = {
      ...selectedNote,
    };

    AxiosInstance.delete(
      `dashboard/note/${selectedNote.id}/delete/`,
      updatedNote
    )
      .then((res) => {
        console.log("Note deleted successfully");
        setDeleteModalOpen(false);
        GetNotesList(selectedProjectId);
      })
      .catch((error) => {
        console.error("Error while deleting note", error);
      });
  };

  const handleProjectChange = (projectId) => {
    setSelectedProjectId(projectId);
    localStorage.setItem("selectedProjectId", projectId);
    setMyNotesList(null);
    setSelectedNote(null);
    setEditorState(EditorState.createEmpty());
    GetNotesList(projectId);
  };

  let className = "RichEditor-editor";
  var contentState = editorState.getCurrentContent();
  if (!contentState.hasText()) {
    if (contentState.getBlockMap().first().getType() !== "unstyled") {
      className += " RichEditor-hidePlaceholder";
    }
  }

  if (!selectedProjectId) {
    return (
      <div>
        <h1>Notes</h1>
        <Card sx={{ borderRadius: "15px" }}>
          <CardContent>
            <p>
              To create or review <b>Notes</b>, please select a project first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <h1>Notes</h1>
      <div className={`RichEditor-root ${limitHeight ? "limit-height" : ""}`}>
        <MyModal
          open={deleteModalOpen}
          handleClose={() => setDeleteModalOpen(false)}
          title="Confirm Deletion"
          content="Are you sure you want to delete this note?"
          actions={[
            { label: "Yes", onClick: handleDeleteNote },
            { label: "No", onClick: () => setDeleteModalOpen(false) },
          ]}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginRight: "110px",
            maxWidth: "calc(100% - 50px)",
            overflowX: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "end",
              flex: 0.75,
              minHeight: "35px",
            }}
          >
            {myNotesList &&
              myNotesList.map((note, index) => (
                <div
                  key={note.id}
                  onClick={() => handleNoteClick(note)}
                  style={{
                    cursor: "pointer",
                    fontSize: "16px",
                    marginRight: "3px",
                  }}
                >
                  <div
                    className="note-list-item"
                    style={{
                      fontWeight:
                        selectedNote && selectedNote.id === note.id
                          ? "bold"
                          : "normal",
                      padding: "0 5px",
                      borderBottom:
                        selectedNote && selectedNote.id === note.id
                          ? "2px solid #0451E5"
                          : "none",
                      paddingBottom: "3px",
                    }}
                  >
                    {editingNoteName && selectedNote.id === note.id ? ( // Display input field if in editing mode and selected note matches
                      <>
                        <input
                          type="text"
                          value={editedNoteName}
                          style={{
                            borderWidth: "0px",
                            width: "100px",
                            maxWidth: "100%",
                            fontSize: "16px",
                            fontWeight: "bold",
                            padding: "3px 0",
                            marginRight: "3px",
                          }}
                          onChange={(e) => setEditedNoteName(e.target.value)}
                          autoComplete="off"
                        />
                        <ThumbUpAltIcon
                          style={{
                            position: "relative",
                            top: "4px",
                            fontSize: "medium",
                            marginLeft: "3px",
                            color: "#1D212F66",
                          }}
                          onMouseEnter={(e) => (e.target.style.color = "black")}
                          onMouseLeave={(e) =>
                            (e.target.style.color = "#1D212F66")
                          }
                          onClick={handleCheckNoteName}
                        />
                      </>
                    ) : (
                      <>
                        <div className="note-name">{note.note_name}</div>
                        {selectedNote &&
                          selectedNote.id === note.id && ( // Check if the note is selected or bolded
                            <div className="note-edit-icons">
                              <EditIcon
                                style={{
                                  position: "relative",
                                  fontSize: "medium",
                                  marginLeft: "3px",
                                  color: "#1D212F66",
                                  top: "2px",
                                }}
                                onMouseEnter={(e) =>
                                  (e.target.style.color = "black")
                                }
                                onMouseLeave={(e) =>
                                  (e.target.style.color = "#1D212F66")
                                }
                                onClick={handleEditNoteName} // Enable editing mode on click
                              />
                              <DeleteIcon
                                style={{
                                  position: "relative",
                                  fontSize: "medium",
                                  marginLeft: "0px",
                                  color: "#1D212F66",
                                  top: "2px",
                                }}
                                onMouseEnter={(e) =>
                                  (e.target.style.color = "black")
                                }
                                onMouseLeave={(e) =>
                                  (e.target.style.color = "#1D212F66")
                                }
                                onClick={handleConfirmDeleteNote}
                              />
                            </div>
                          )}
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>

          <div className="Button-container">
            <Button
              variant="outlined"
              style={{
                padding: "0 10px",
                textTransform: "none",
                color: "rgba(29, 33, 47, 0.5)",
                borderColor: "rgba(29, 33, 47, 0.2)",
                borderRadius: "7px",
                backgroundColor: "white",
              }}
              onClick={handleNewPageClick}
            >
              + New Page
            </Button>
          </div>
        </div>

        <div
          className={className}
          onClick={() => editorRef.current.focus()}
        ></div>

        <div className="RichEditor-controls-container">
          <InlineStyleControls
            editorState={editorState}
            onToggle={toggleInlineStyle}
          />
          <BlockStyleControls
            editorState={editorState}
            onToggle={toggleBlockType}
          />
        </div>
        <div className={className} onClick={() => editorRef.current.focus()}>
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={handleKeyCommand}
            keyBindingFn={mapKeyToEditorCommand}
            onChange={onChange}
            placeholder="Type here..."
            ref={editorRef}
            spellCheck={true}
          />
        </div>
      </div>
    </>
  );
};

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16,
    padding: 2,
  },
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case "blockquote":
      return "RichEditor-blockquote";
    default:
      return null;
  }
}

const StyleButton = (props) => {
  const onToggle = (e) => {
    e.preventDefault();
    props.onToggle(props.style);
  };

  let className = "RichEditor-styleButton";
  if (props.active) {
    className += " RichEditor-activeButton";
  }

  return (
    <span className={className} onMouseDown={onToggle}>
      {props.icon ? props.icon : props.label}
    </span>
  );
};

const BLOCK_TYPES = [
  {
    label: "Blockquote",
    style: "blockquote",
    icon: <FormatQuoteIcon fontSize="small" />,
  },
  {
    label: "UL",
    style: "unordered-list-item",
    icon: <ListIcon fontSize="small" />,
  },
  {
    label: "OL",
    style: "ordered-list-item",
    icon: <FormatListNumberedIcon fontSize="small" />,
  },
  {
    label: "Code Block",
    style: "code-block",
    icon: <CodeIcon fontSize="small" />,
  },
];

const BlockStyleControls = (props) => {
  const { editorState } = props;
  const selection = editorState.getSelection();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <div className="RichEditor-controls">
      {BLOCK_TYPES.map((type) => (
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          icon={type.icon}
          onToggle={props.onToggle}
          style={type.style}
        />
      ))}
    </div>
  );
};

const INLINE_STYLES = [
  { label: "Bold", style: "BOLD", icon: <FormatBoldIcon fontSize="small" /> },
  {
    label: "Italic",
    style: "ITALIC",
    icon: <FormatItalicIcon fontSize="small" />,
  },
  {
    label: "Underline",
    style: "UNDERLINE",
    icon: <FormatUnderlinedIcon fontSize="small" />,
  },
  {
    label: "Monospace",
    style: "CODE",
    icon: <SpaceBarIcon fontSize="small" />,
  },
];

const InlineStyleControls = (props) => {
  const currentStyle = props.editorState.getCurrentInlineStyle();

  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map((type) => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          icon={type.icon}
          onToggle={props.onToggle}
          style={type.style}
        />
      ))}
    </div>
  );
};

export default NotesRTE;
