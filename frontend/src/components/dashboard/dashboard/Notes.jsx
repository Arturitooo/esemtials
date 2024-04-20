import React, {useState, useEffect} from 'react'
import { Box } from '@mui/material'
import AxiosInstance from '../../AxiosInstance'
import NotesRTE from './NotesRTE'

export const Notes = () => {
  const [loading, setLoading] = useState(true)
  const [myNotesList, setMyNotesList] = useState(null)
  const [selectedNote, setSelectedNote] = useState(null)
 
  const GetNotesList = () => {
    AxiosInstance.get('dashboard/note/list/').then((res) => {
      setMyNotesList(res.data)
      setLoading(false)
      if (res.data.length > 0) {
        setSelectedNote(res.data[0]); // Assuming the newest note is the first one
      }
    }).catch(error => {
      console.error('Error fetching notes list:', error);
    });
  }

  useEffect(() => {
    GetNotesList();
  },[])

  
  
  return (
    <Box>
        <NotesRTE/>
        { loading ? <p>loading data...</p> : <div>
        {myNotesList.map((item, index) => (
          <Box key={index}>
            {item.note_name}
          </Box>
        ))}
        <p>{selectedNote.note_content}</p>
      </div>}
      

    </Box>
  )
}
