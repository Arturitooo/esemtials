import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AxiosInstance from '../../AxiosInstance';
import './TMDetailpage.css';
import { MyModal } from '../../forms/MyModal';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';

//icons
import Face6Icon from '@mui/icons-material/Face6';
import SignalWifi0BarIcon from '@mui/icons-material/SignalWifi0Bar';
import NetworkWifi1BarIcon from '@mui/icons-material/NetworkWifi1Bar';
import NetworkWifi3BarIcon from '@mui/icons-material/NetworkWifi3Bar';
import NetworkWifiIcon from '@mui/icons-material/NetworkWifi';
import SignalWifi4BarIcon from '@mui/icons-material/SignalWifi4Bar';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export const TMDetailpage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tmData, setTMData] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleConfirmDeleteTM = () => {
    setDeleteModalOpen(true);
  };

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
            <SignalWifi0BarIcon sx={{ fontSize: 'medium', position: 'relative', top: '2px', marginRight: '4px' }} />
            {'Internship'}
          </>
        );
      case 'junior':
        return (
          <>
            <NetworkWifi1BarIcon sx={{ fontSize: 'small', position: 'relative', top: '2px', marginRight: '4px' }} />
            {'Junior'}
          </>
        );
      case 'regular':
        return (
          <>
            <NetworkWifi3BarIcon sx={{ fontSize: 'small', position: 'relative', top: '2px', marginRight: '4px' }} />
            {'Medium'}
          </>
        );
      case 'senior':
        return (
          <>
            <NetworkWifiIcon sx={{ fontSize: 'small', position: 'relative', top: '2px', marginRight: '4px' }} />
            {'Senior'}
          </>
        );
      case 'expert':
        return (
          <>
            <SignalWifi4BarIcon sx={{ fontSize: 'small', position: 'relative', top: '2px', marginRight: '4px' }} />
            {'Expert'}
          </>
        );
      default:
        return seniorityCode;
    }
  };

  const GetData = (id) => {
    const url = `team/teammember/${id}`;
    AxiosInstance.get(url)
      .then((res) => {
        const data = res.data;
        // parse string to json
        if (typeof data.tm_stack === 'string') {
          data.tm_stack = JSON.parse(data.tm_stack);
        }
        setTMData(res.data);
        setLoading(false);
        console.log(res.data);
      });
  };

  useEffect(() => {
    GetData(id);
  }, [id]);

  const handleDeleteTM = async () => {
    await DeleteTM();
    setDeleteModalOpen(false);
    navigate('/team/', { state: { refetch: true } });
  };

  const DeleteTM = () => {
    const url = `team/teammember/${id}`;
    AxiosInstance.delete(url)
      .then(() => {
        console.log("you've successfully deleted the team member");
      });
  };

  return (
    <div>
      {loading ? (
        <p>loading data...</p>
      ) : (
        <div>
          <h1>Team member</h1>
          <Card className='team-member__card'>
            <CardContent className='team-member__content'>
              <div className='team-member__content--photo'>
                {tmData.tm_photo ? (
                  <div style={{ height: '180px', width: '180px', overflow: 'hidden', borderRadius: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img
                      src={tmData.tm_photo}
                      alt="Team member photo"
                      style={{ minWidth: '180px', minHeight: '180px', objectFit: 'cover', objectPosition: 'center' }}
                    />
                  </div>
                ) : (
                  <div style={{ height: '180px', width: '180px', border: 'solid rgba(29, 33, 47, 0.1) 2px', borderRadius: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Face6Icon style={{ opacity: '40%' }} />
                  </div>
                )}
              </div>
              <div>
                <div className='team-member__content--name'>
                  <h2>{tmData.tm_name} {tmData.tm_lname} </h2>
                </div>
                <div className='team-member__content--details'>
                  <div>
                    <h4>Role</h4>
                    <p>{getRoleLabel(tmData.tm_position)}</p>
                  </div>
                  <div>
                    <h4>Seniority</h4>
                    <p>{getSeniorityLabel(tmData.tm_seniority)}</p>
                  </div>
                  <div>
                    <h4>Stack</h4>
                    <ul>
                      {tmData.tm_stack && tmData.tm_stack.map((tech, index) => (
                        <li key={index}>{tech}</li>
                      ))}
                    </ul> 
                  </div>
                  <div>
                    <h4>Joined</h4>
                    <p>{tmData.tm_joined}</p>
                  </div>
                  <div>
                    <h4>Summary</h4>
                    <p>{tmData.tm_summary}</p>
                  </div>
                </div>
                <div className="team-member__content--actions">
                  <Button variant="outlined" startIcon={<EditIcon />}>
                    Edit details
                  </Button>
                  <Button variant="outlined" onClick={handleConfirmDeleteTM} startIcon={<DeleteIcon />}>
                    Delete member
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <MyModal
        open={deleteModalOpen}
        handleClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
        content={
          <span>
            Are you sure you want to delete the team member{' '}
            {tmData ? (
              <>
                <strong>{tmData.tm_name}</strong> <strong>{tmData.tm_lname}</strong>
              </>
            ) : (
              ''
            )}
            ?
          </span>
        }
        actions={[
          { label: 'Yes', onClick: handleDeleteTM },
          { label: 'No', onClick: () => setDeleteModalOpen(false) },
        ]}
      />
    </div>
  );
};
