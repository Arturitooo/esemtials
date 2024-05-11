import { React, useEffect, useMemo, useState } from 'react'
import AxiosInstance from '../AxiosInstance'
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
            <SignalWifi0BarIcon sx={{fontSize:'medium', paddingTop: '2px', marginRight:'1px' }}/>{' Internship'} 
          </>
        );
      case 'junior':
        return (
          <>
            <NetworkWifi1BarIcon sx={{fontSize:'medium', paddingTop: '2px', marginRight:'1px' }}/>{'Junior'} 
          </>
        );
      case 'regular':
        return (
          <>
            <NetworkWifi3BarIcon sx={{fontSize:'medium', paddingTop: '2px', marginRight:'1px' }}/>{'Medium'} 
          </>
        );
      case 'senior':
        return (
          <>
            <NetworkWifiIcon sx={{fontSize:'medium', paddingTop: '2px', marginRight:'1px' }}/>{'Senior'} 
          </>
        );
      case 'expert':
        return (
          <>
            <SignalWifi4BarIcon sx={{fontSize:'medium', paddingTop: '2px', marginRight:'1px'}}/>{'Expert'} 
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
          <Box key={index} sx={{p:2, m:2, boxShadow:2}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', paddingLeft:'50px', paddingRight:'50px' }}>
              {item.tm_photo? (
                <div style={{ height: '150px', width: '150px' }}>{`http://localhost:8000/backend${item.tm_photo}`}
                <img 
                  src={`http://localhost:8000/esemtials/backend${item.tm_photo}`}
                  alt="Team member photo"
                  style={{ maxWidth: '150px', maxHeight: '150px' }}
                />
              </div>
              ) : (
                <div style={{ height:'150px', width:'150px', border:'solid rgba(29, 33, 47, 0.1) 2px', borderRadius:'15px', display:'flex', justifyContent:'center',alignItems:'center'}}>No photo</div>
              )
            }
              
              <div style={{ marginRight: '100px' }}>
                <div>Name: {item.tm_name} {item.tm_lname}</div>
                <div>Role: {getRoleLabel(item.tm_position)}</div>
                <div>Seniority: {getSeniorityLabel(item.tm_seniority)}</div>
              </div>
              <div style={{ marginRight: '50px' }}>LINK</div>
            </div>
          </Box>
        ))}
      </div>}
    </div>
  )
}
