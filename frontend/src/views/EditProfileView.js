import React from 'react';
import { useParams } from 'react-router-dom';
import PhotographerEditForm from '../components/PhotographerEditForm';

function EditProfileView(props) {
    const { photographerId } = useParams();

    return (
        <div id='edit-profile-view' className='container py-4'>
            <div className='row justify-content-center mt-2'>
                <div className='col col-auto'>
                    <h3>Edit Profile</h3>
                </div>
            </div>
            <PhotographerEditForm photographerId={photographerId} />
        </div >
    )
}

export default EditProfileView