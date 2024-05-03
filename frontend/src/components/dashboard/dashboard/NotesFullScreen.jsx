import React from 'react'
import { Box } from '@mui/material'
import NotesRTE from './NotesRTE'

export const NotesFullScreen = () => {
  return (
    
    <Box style={{ maxWidth: '100%', width: '100%' }}>
        <NotesRTE limitHeight={false}/>
    </Box>
  )
}
