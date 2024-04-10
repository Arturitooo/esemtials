import { React, useEffect, useMemo, useState } from 'react'
import AxiosInstance from '../../AxiosInstance'
import { NewTMForm } from './NewTMForm'
import { Box } from '@mui/material'
import SignalWifi0BarIcon from '@mui/icons-material/SignalWifi0Bar';
import NetworkWifi1BarIcon from '@mui/icons-material/NetworkWifi1Bar'
import NetworkWifi3BarIcon from '@mui/icons-material/NetworkWifi3Bar';
import NetworkWifiIcon from '@mui/icons-material/NetworkWifi';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';


export const Team = () => {
  const [teamData, setTeamData] = useState()
  const [loading, setLoading] = useState(true)

  const getRoleLabel = (roleCode) => {
    switch (roleCode) {
      case 'sm':
        return 'Scrum Master';
      case 'fe_dev':
        return 'Frontend Developer';
      case 'be_dev':
        return 'Backend Developer';
      case 'devops':
        return 'DevOps';
      case 'des':
        return 'Designer';
      case 'qa':
        return 'Quality Engineer';
      case 'ba':
        return 'Business Analyst';
      case 'sa':
        return 'Solution Architect';
      default:
        return roleCode;
    }
  };
  const getSeniorityLabel = (seniorityCode) => {
    switch (seniorityCode) {
      case 'intern':
        return (
          <>
            <SignalWifi0BarIcon sx={{fontSize:'medium'}}/> {' Internship'} 
          </>
        );
      case 'junior':
        return (
          <>
            <NetworkWifi1BarIcon sx={{fontSize:'medium'}}/> {'Junior level'} 
          </>
        );
      case 'regular':
        return (
          <>
            <NetworkWifi3BarIcon sx={{fontSize:'medium'}}/> {'Medium level'} 
          </>
        );
      case 'senior':
        return (
          <>
            <NetworkWifiIcon sx={{fontSize:'medium'}}/> {'Senior level'} 
          </>
        );
      case 'expert':
        return (
          <>
            <SignalWifi4BarIcon sx={{fontSize:'medium'}}/> {'Expert level'} 
          </>
        );
      default:
        return seniorityCode;
    }
  };

  const GetData = () => {
    AxiosInstance.get('team/teammember/').then((res) => {
      setTeamData(res.data)
      setLoading(false)
    })
  }

  useEffect(() => {
    GetData();
  },[])

  return (
    <div>
      { loading ? <p>loading data...</p> : <div>
        {teamData.map((item, index) => (
          <Box key={index} sx={{p:2, m:2, boxShadow:3}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center' }}>
              <div style={{ marginLeft: '50px' }}>{item.tm_photo}
                <img 
                  src={item.tm_photo}
                  alt="Team member photo"
                  style={{ maxWidth: '150px', maxHeight: '150px' }}
                />
              </div>
              <div style={{ marginRight: '100px' }}>
                <div>Name: {item.tm_name} {item.tm_lname}</div>
                <div>Role: {getRoleLabel(item.tm_position)}</div>
                <div>Seniority: {getSeniorityLabel(item.tm_seniority)}</div>
              </div>
              <div style={{ marginRight: '50px' }}>LINK</div>
            </div>
          </Box>
        ))}
        <NewTMForm/>
      </div>}
    </div>
  )
}
