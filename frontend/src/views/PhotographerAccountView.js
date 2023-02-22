import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function PhotographerAccountView() {
    const location = useLocation();
    const navigate = useNavigate();
    const [photographerId, setPhotographerId] = useState(location.state.photographerId);
    const [photographerDetails, setPhotographerDetails] = useState(location.state.photographerDetails);

    useEffect(() => {
        // if (location.state) {
        //     setPhotographerId(location.state.photographerId);
        //     setPhotographerDetails(location.state.photographerDetails);
        // }
    })

    function handleEditProfile() {
        navigate('/photographer-edit', {
            state: {
                'photographerId': photographerId,
                'photographerDetails': photographerDetails
            }
        })
    }

    function handleEditPhotos() {
        // navigate('/photos-edit', {
        //     state: {
        //         'photographerId': photographerId
        //     }
        // })
    }

    // function UserName(props) {
    //     if (photographerDetails) {
    //         return (
    //             <div className='col'>
    //                 <p>{photographerDetails.name}</p>
    //             </div>
    //         )
    //     } else {
    //         return null
    //     }
    // }

    return (
        <div id='myAccount'>
            <div className='container py-4'>
                <div className='row mb-3'>
                    <div className='col'>
                        <h3>My Account</h3>
                        <p>View and manage your account.</p>
                    </div>
                </div>
                <div className='row mb-3'>
                    <div className='col col-12 col-md-5'>
                        <h5>Profile</h5>
                        <p>Manage your account details.</p>
                        <button type='button' className='btn btn-link p-0' onClick={handleEditProfile}>Edit profile</button>
                    </div>
                    <div className='col col-12 col-md-5'>
                        <h5>Photos</h5>
                        <p>View, upload, and delete photos.</p>
                        <button type='button' className='btn btn-link p-0'>Edit photos</button>
                    </div>
                </div>
                <div className='row py-4 mb-3'>
                    <div className='col col-12 col-md-5'>
                        <button type='button' className='btn btn-link p-0'>Sign out</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PhotographerAccountView