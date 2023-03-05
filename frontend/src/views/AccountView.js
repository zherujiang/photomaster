import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from '../components/LogoutButton';
import axios from "axios";

function AccountView() {
    const navigate = useNavigate();
    const [photographerId, setPhotographerId] = useState(undefined);
    const [photographerName, setPhotographerName] = useState('');
    const [accountRegistered, setAccountRegistered] = useState(undefined);

    const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
    let accessToken = '';

    async function getToken() {
        accessToken = await getAccessTokenSilently();
        // console.log('token', accessToken);
    }

    // server request to check if the account is alreay registered
    function findPhotographerAccount() {
        axios.post('/photographer-accounts', {
            email: user.email
        })
            .then(response => {
                const data = response.data;
                if (data['account_registered']) {
                    setAccountRegistered(true);
                    setPhotographerId(data['photographer_id']);
                    setPhotographerName(data['photographer_name']);
                } else {
                    setAccountRegistered(false);
                }
            })
            .catch(function (error) {
                console.log(error);
            })
    }

    // server request to create a new photographer account
    function createNewPhotographer() {
        axios.post('/photographers', {
            name: user.nickname,
            email: user.email
        })
            .then(response => {
                const data = response.data;
                if (data['photographer_id']) {
                    // new account has been successfully created, prompt user to initialize profile
                    navigateToInitializeProfile(data['photographer_id']);
                } else {
                    // if new account could not be created
                    navigate('/exception')
                }
            })
    }

    function navigateToInitializeProfile(userId) {
        navigate(`/account/${userId}/initialize`)
    }

    // function navigateToMyAccount() {
    //     navigate(`/account/${photographerId}`)
    // }

    useEffect(() => {
        if (user) {
            getToken();
            findPhotographerAccount();
        }
    }, [user])

    useEffect(() => {
        if (accountRegistered === false) {
            createNewPhotographer();
        }
        // } else if (accountRegistered === true) {
        //     navigateToMyAccount();
        // }
    }, [accountRegistered])

    if (isLoading) {
        return (
            <div id='myAccount'>
                <div className='container py-4'>
                    <div className='row mb-3'>
                        <p>Logging you in...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (isAuthenticated && accountRegistered) {
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
                            <Link to={`${photographerId}/edits`}>Edit profile</Link>
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
    } else {
        return null
    }
}

export default AccountView