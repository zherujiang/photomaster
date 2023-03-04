import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from '../components/LogoutButton';
import axios from "axios";

function PhotographerAccountView() {
    const [photographerId, setPhotographerId] = useState(undefined);
    const [photographerName, setPhotographerName] = useState('');
    const [accountValidated, setAccountValidated] = useState(0);

    const { user, getAccessTokenSilently } = useAuth0();
    let accessToken = '';

    async function getToken() {
        accessToken = await getAccessTokenSilently();
        console.log('token', accessToken);
    }

    function validatePhotographerAccount() {
        axios.post('/photographer-accounts', {
            email: user.email
        })
            .then(response => {
                const data = response.data;
                if (data.success) {
                    setPhotographerId(data['photographer_id']);
                    setPhotographerName(data['photographer_name']);
                    setAccountValidated(1);
                } else {
                    setAccountValidated(-1);
                }
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    useEffect(() => {
        if (user) {
            getToken();
            validatePhotographerAccount();
        }
    })

    if (accountValidated === 1) {
        return (
            <div id='myAccount'>
                <div className='container py-4'>
                    <div className='row mb-3'>
                        <div className='col'>
                            <h3>My Account</h3>
                            <p>View and manage your account.</p>
                            <h6>Welcome, {photographerName}</h6>
                        </div>
                    </div>
                    <div className='row py-4 mb-3'>
                        <div className='col col-12 col-md-5'>
                            <h5>Profile</h5>
                            <p>Manage your account details.</p>
                            <Link to={`${photographerId}/edits`}>Edit photos</Link>
                            {/* <Link to={photographerId}>Edit profile</Link> */}
                        </div>
                        <div className='col col-12 col-md-5'>
                            <h5>Photos</h5>
                            <p>View, upload, and delete photos.</p>
                            <Link to={`${photographerId}/photos`}>Edit photos</Link>
                        </div>
                    </div>
                    <div className='row py-4 mb-3'>
                        <div className='col col-12 col-md-5'>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </div>
        )
    } else if (accountValidated === 0) {
        return (
            <div id='myAccount'>
                <div className='container py-4'>
                    <div className='row mb-3'>
                        <p>Logging you in.</p>
                    </div>
                </div>
            </div>
        )
    } else if (accountValidated === -1) {
        <div id='myAccount'>
            <div className='container py-4'>
                <div className='row mb-3'>
                    <p>Sorry, it seems you don't have an account with us. Please Sign Up first.</p>
                </div>
            </div>
        </div>
    }
}

export default PhotographerAccountView