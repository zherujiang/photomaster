import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';

function PhotographerAccountView() {
    const location = useLocation();
    const navigate = useNavigate();
    const { photographerId } = useParams();
    console.log(photographerId);
    // const [photographerId, setPhotographerId] = useState(location.state.photographerId);

    useEffect(() => {
        // if (location.state) {
        //     setPhotographerId(location.state.photographerId);
        // }
    })

    function handleEditProfile() {
        navigate('/photographer-edit', {
            state: {
                'photographerId': photographerId
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
                        <Link to='edit'>Edit profile</Link>
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