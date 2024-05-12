import { React, useEffect, useMemo, useState } from 'react'
import AxiosInstance from '../AxiosInstance'
import { Box } from '@mui/material'
import { Link, useLocation } from 'react-router-dom';
import { MyTextButton } from '../forms/MyTextButton';
import { TMDetailpage } from './team/TMDetailpage';

//import MUI icons
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
          <Box key={index} sx={{p:2, m:2, boxShadow:2, backgroundColor:'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', paddingLeft:'50px', paddingRight:'50px' }}>
              {item.tm_photo? (
                <div style={{ height: '150px', width: '150px', overflow:'hidden',border:'solid rgba(29, 33, 47, 0.1) 2px', borderRadius:'15px', display:'flex', justifyContent:'center',alignItems:'center',}}>
                <img 
                  src={`${item.tm_photo}`}
                  alt="Team member photo"
                  style={{ minWidth: '150px', minHeight: '150px', objectFit:'cover', objectPosition:'center' }}
                />
              </div>
              ) : (
                <div style={{ height:'150px', width:'150px', border:'solid rgba(29, 33, 47, 0.1) 2px', borderRadius:'15px', display:'flex', justifyContent:'center',alignItems:'center'}}>No photo</div>
              )
            }
              
              <div>
                <div>Name: {item.tm_name} {item.tm_lname}</div>
                <div>Role: {getRoleLabel(item.tm_position)}</div>
                <div>Seniority: {getSeniorityLabel(item.tm_seniority)}</div>
              </div>
              <div>
                <Link to={`${item.tm_name}-${item.tm_lname}/`}>
                  <MyTextButton label = {"Details page"} />
                </Link>
              </div>
            </div>
          </Box>
        ))}
      </div>}
    </div>
  )
}
