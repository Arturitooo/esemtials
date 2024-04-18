import React, { useEffect, useState } from 'react'
import AxiosInstance from './AxiosInstance'
import { Box } from '@mui/material'

export const Home = () => {
  const [myData, setMyData] = useState()
  const [loading, setLoading] = useState(true)

  const GetData = () => {
    AxiosInstance.get('userslist/').then((res) => {
      setMyData(res.data)
      setLoading(false)
    })
  }

  useEffect(() => {
    GetData();
  },[])

  return (
    <div>
      { loading ? <p>loading data...</p> : <div>
        {myData.map((item, index) => (
          <Box key={index} sx={{p:2, m:2, boxShadow:3}}>
            <div>ID: {item.id}</div>
            <div>EMAIL: {item.email}</div>
          </Box>
        ))}
      </div>}
    </div>
  )
}
