/* eslint-disable react/prop-types */
import React from 'react';
import { Editor, EditorState, convertFromRaw, getDefaultKeyBinding, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css'; // for styling
import "./NotesRTE.css";

// Import icons
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import SpaceBarIcon from '@mui/icons-material/SpaceBar';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ListIcon from '@mui/icons-material/List';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import CodeIcon from '@mui/icons-material/Code';

const mockData = {
  blocks: [
    {
      key: 'abc123',
      text: 'This is a sample note.',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {}
    },
    {
      key: 'def456',
      text: 'It contains some text with different styling.',
      type: 'unstyled',
      depth: 0,
      inlineStyleRanges: [
        {
          offset: 19,
          length: 13,
          style: 'BOLD'
        },
        {
          offset: 38,
          length: 9,
          style: 'ITALIC'
        }
      ],
      entityRanges: [],
      data: {}
    }
  ],
  entityMap: {}
};

class NotesRTE extends React.Component {
  constructor(props) {
    super(props);
    this.editorRef = React.createRef();
    this.state = { editorState: EditorState.createWithContent(convertFromRaw(mockData)) };

    this.onChange = (editorState) => this.setState({ editorState });

    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
    this.toggleBlockType = this._toggleBlockType.bind(this);
    this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
  }

  componentDidMount() {
    this.editorRef.current.focus();
  }

  _handleKeyCommand(command, editorState) {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  _mapKeyToEditorCommand(e) {
    if (e.keyCode === 9 /* TAB */) {
      const newEditorState = RichUtils.onTab(
        e,
        this.state.editorState,
        4, /* maxDepth */
      );
      if (newEditorState !== this.state.editorState) {
        this.onChange(newEditorState);
      }
      return;
    }
    return getDefaultKeyBinding(e);
  }

  _toggleBlockType(blockType) {
    this.onChange(
      RichUtils.toggleBlockType(
        this.state.editorState,
        blockType
      )
    );
  }

  _toggleInlineStyle(inlineStyle) {
    this.onChange(
      RichUtils.toggleInlineStyle(
        this.state.editorState,
        inlineStyle
      )
    );
  }

  render() {
    const { editorState } = this.state;
    // eslint-disable-next-line react/prop-types
    const { myNotesList, selectedNoteContent } = this.props;

    let content = '';
    if (selectedNoteContent) {
      content = selectedNoteContent;
    } else if (myNotesList && myNotesList.length > 0) {
      // eslint-disable-next-line react/prop-types
      content = myNotesList[0].note_content;
    }

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
      <div className="RichEditor-root">
        <div className="RichEditor-controls-container">
          <InlineStyleControls
            editorState={editorState}
            onToggle={this.toggleInlineStyle}
          />
          <BlockStyleControls
            editorState={editorState}
            onToggle={this.toggleBlockType}
          />
        </div>
        <div className={className} onClick={() => this.editorRef.current.focus()}>
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            keyBindingFn={this.mapKeyToEditorCommand}
            onChange={this.onChange}
            placeholder="Type here..."
            ref={this.editorRef}
            spellCheck={true}
            value={selectedNoteContent}
          />
        </div>
      </div>
    );
  }
}

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

class StyleButton extends React.Component {
  constructor() {
    super();
    this.onToggle = (e) => {
      e.preventDefault();
      // eslint-disable-next-line react/prop-types
      this.props.onToggle(this.props.style);
    };
  }

  render() {
    let className = 'RichEditor-styleButton';
    // eslint-disable-next-line react/prop-types
    if (this.props.active) {
      className += ' RichEditor-activeButton';
    }

    return (
      <span className={className} onMouseDown={this.onToggle}>
        {this.props.icon ? this.props.icon : this.props.label}
      </span>
    );
  }
}

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
