import { useState } from 'react';
import AxiosInstance from '../../AxiosInstance';

export const NewTMForm = () => {
    const [formData, setFormData] = useState({
        tm_name: '',
        tm_lname: '',
        tm_seniority: '',
        tm_position: '',
        tm_joined: '',
        tm_summary: '',
        tm_photo: null,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, tm_photo: e.target.files[0] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        for (const key in formData) {
            formDataToSend.append(key, formData[key]);
        }
        AxiosInstance.post('team/teammember/', formDataToSend)
            .then((res) => {
                console.log('Team member created:', res.data);
            })
            .catch((error) => {
                console.error('Error creating team member:', error);
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="tm_name" value={formData.tm_name} onChange={handleChange} />
            <input type="file" name="tm_photo" onChange={handleFileChange} />
            <button type="submit">Add Team Member</button>
        </form>
    );
};

