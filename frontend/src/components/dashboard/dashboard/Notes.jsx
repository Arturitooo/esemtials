import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import AxiosInstance from '../../AxiosInstance';
import NotesRTE from './NotesRTE';

export const Notes = () => {
  const [loading, setLoading] = useState(true);
  const [myNotesList, setMyNotesList] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
 
  const GetNotesList = () => {
    AxiosInstance.get('dashboard/note/list/')
      .then((res) => {
        setMyNotesList(res.data);
        setLoading(false);
        if (res.data.length > 0) {
          setSelectedNote(res.data[0]); // by default selected note = updated lately
        }
      })
      .catch(error => {
        console.error('Error fetching notes list:', error);
      });
  };

  useEffect(() => {
    GetNotesList();
  }, []);

  const handleNoteClick = (note) => {
    setSelectedNote(note);
  };

  return (
    <Box>
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        {selectedNote && (
          <h2 style={{ margin: '0px', marginRight: '10px', marginBottom: '3px' }}>{selectedNote.note_name}</h2>
        )}
        {myNotesList && myNotesList.length > 0 && (
          myNotesList.map((note, index) => (
            <React.Fragment key={note.id}>
              {index === 0 && selectedNote !== null && selectedNote.note_name !== note.note_name && (
                <React.Fragment key={note.id}>
                  <h3
                    style={{
                      margin: '0px',
                      display: 'inline',
                      cursor: 'pointer',
                      marginLeft: index === 0 ? '0px' : '5px',
                      marginBottom: '3px',
                    }}
                    onClick={() => handleNoteClick(note)}
                  >
                    {note.note_name}
                  </h3>
                </React.Fragment>
              )}
              {selectedNote !== null && selectedNote.note_name !== note.note_name && index !== 0 && (
                <React.Fragment key={note.id}>
                  <h3
                    style={{
                      margin: '0px',
                      display: 'inline',
                      cursor: 'pointer',
                      marginLeft: '5px',
                      marginBottom: '3px',
                    }}
                    onClick={() => handleNoteClick(note)}
                  >
                    {note.note_name}
                  </h3>
                </React.Fragment>
              )}
            </React.Fragment>
          ))
        )}
        {myNotesList && myNotesList.length === 0 && (
          <h2 style={{ margin: '0px', marginBottom: '3px' }}>Notes</h2>
        )}
      </div>

      <NotesRTE selectedNoteContent={selectedNote?.note_content} />
    </Box>
  );
};
