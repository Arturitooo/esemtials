import React, { useState, useEffect } from 'react';
import { Editor, EditorState, convertFromRaw, convertToRaw, getDefaultKeyBinding, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css'; // for styling
import "./NotesRTE.css";
import AxiosInstance from '../../AxiosInstance';
import Button from '@mui/material/Button';

// Import icons
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import SpaceBarIcon from '@mui/icons-material/SpaceBar';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ListIcon from '@mui/icons-material/List';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CodeIcon from '@mui/icons-material/Code';

const NotesRTE = ({ limitHeight }) => {
  const [loading, setLoading] = useState(true);
  const [myNotesList, setMyNotesList] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const editorRef = React.createRef();
  let saveTimeout;

  useEffect(() => {
    GetNotesList();
  }, []);

  const GetNotesList = () => {
    AxiosInstance.get('dashboard/note/list/')
      .then((res) => {
        setMyNotesList(res.data);
        setLoading(false);
        if (res.data.length > 0) {
          setSelectedNote(res.data[0]); // by default selected note = updated lately
          fetchNoteContent(res.data[0]);
        }
      })
      .catch(error => {
        console.error('Error fetching notes list:', error);
      });
  };

  const fetchNoteContent = (note) => {
    AxiosInstance.get(`dashboard/note/${note.id}/`)
      .then((res) => {
        const contentState = convertFromRaw(res.data.note_content);
        setEditorState(EditorState.createWithContent(contentState));
      })
      .catch(error => {
        console.error('Error fetching note content:', error);
      });
  };

  const updateNoteContent = () => {
    if (!selectedNote) {
      console.error('No note selected');
      return;
    }
  
    const contentState = editorState.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
  
    // Compare the current content state with the previous content state
    if (JSON.stringify(rawContentState) === JSON.stringify(selectedNote.note_content)) {
      // Content hasn't changed, no need to send update request
      console.log('Content not changed');
      return;
    }
  
    const updatedNote = {
      ...selectedNote,
      note_content: rawContentState,
    };
  
    // Send a PUT request to update the note
    AxiosInstance.put(`dashboard/note/${selectedNote.id}/update/`, updatedNote)
      .then((res) => {
        console.log('Note updated successfully:', res.data);
        // You can add any additional logic here, such as showing a success message
      })
      .catch((error) => {
        console.error('Error updating note:', error);
        // You can add error handling logic here, such as showing an error message
      });
  };

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    fetchNoteContent(note);
  };

  const onChange = (editorState) => {
    setEditorState(editorState);
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(updateNoteContent, 500);
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
      const newEditorState = RichUtils.onTab(
        e,
        editorState,
        4, /* maxDepth */
      );
      if (newEditorState !== editorState) {
        onChange(newEditorState);
      }
      return;
    }
    return getDefaultKeyBinding(e);
  };

  const toggleBlockType = (blockType) => {
    onChange(
      RichUtils.toggleBlockType(
        editorState,
        blockType
      )
    );
  };

  const toggleInlineStyle = (inlineStyle) => {
    onChange(
      RichUtils.toggleInlineStyle(
        editorState,
        inlineStyle
      )
    );
  };

  // If the user changes block type before entering any text, we can
  // either style the placeholder or hide it. Let's just hide it now.
  let className = 'RichEditor-editor';
  var contentState = editorState.getCurrentContent();
  if (!contentState.hasText()) {
    if (contentState.getBlockMap().first().getType() !== 'unstyled') {
      className += ' RichEditor-hidePlaceholder';
    }
  }

  return (
    <div className={`RichEditor-root ${limitHeight ? 'limit-height' : ''}` }>
        <div style={{width:'100%', display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
          
        <div style={{ display: 'flex', alignItems:'end' , flex: 0.75 }}>
          {myNotesList &&
            myNotesList.map((note, index) => (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note)}
                style={{
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginRight: '15px',
                  fontWeight: selectedNote && selectedNote.id === note.id ? 'bold' : 'normal',
                  padding: '0 5px',
                  borderBottom: selectedNote && selectedNote.id === note.id ? '2px solid #0451E5' : 'none',
                  paddingBottom: '3px',
                }}
              >
                {note.note_name}
              </div>
            ))}
        </div>


          <div style={{display:'flex'}}>
            <Button variant="outlined" style={{padding: "0 10px", textTransform: 'none' , color:'rgba(29, 33, 47, 0.5)', borderColor:'rgba(29, 33, 47, 0.2)', borderRadius: '7px', marginBottom:'10px' }} >+ New page</Button>
          </div>
        </div>

      <div className={className} onClick={() => editorRef.current.focus()}></div>
      
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
  );
};

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 16,
    padding: 2,
  },
};

function getBlockStyle(block) {
  switch (block.getType()) {
    case 'blockquote': return 'RichEditor-blockquote';
    default: return null;
  }
}

const StyleButton = (props) => {
  const onToggle = (e) => {
    e.preventDefault();
    props.onToggle(props.style);
  };

  let className = 'RichEditor-styleButton';
  if (props.active) {
    className += ' RichEditor-activeButton';
  }

  return (
    <span className={className} onMouseDown={onToggle}>
      {props.icon ? props.icon : props.label}
    </span>
  );
};

const BLOCK_TYPES = [
  { label: 'Blockquote', style: 'blockquote', icon: <FormatQuoteIcon fontSize="small" /> },
  { label: 'UL', style: 'unordered-list-item', icon: <ListIcon fontSize="small" /> },
  { label: 'OL', style: 'ordered-list-item', icon: <FormatListNumberedIcon fontSize="small" /> },
  { label: 'Code Block', style: 'code-block', icon: <CodeIcon fontSize="small" /> },
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
      {BLOCK_TYPES.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          icon={type.icon}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

const INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD', icon: <FormatBoldIcon fontSize="small" /> },
  { label: 'Italic', style: 'ITALIC', icon: <FormatItalicIcon fontSize="small" /> },
  { label: 'Underline', style: 'UNDERLINE', icon: <FormatUnderlinedIcon fontSize="small" /> },
  { label: 'Monospace', style: 'CODE', icon: <SpaceBarIcon fontSize="small" /> },
];

const InlineStyleControls = (props) => {
  const currentStyle = props.editorState.getCurrentInlineStyle();

  return (
    <div className="RichEditor-controls">
      {INLINE_STYLES.map((type) =>
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          icon={type.icon}
          onToggle={props.onToggle}
          style={type.style}
        />
      )}
    </div>
  );
};

export default NotesRTE;
