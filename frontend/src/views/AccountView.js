import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccessToken } from '../hooks/AuthHook';
import LogoutButton from '../components/LogoutButton';
import axios from "axios";
import ErrorBoundary from '../components/ErrorBoundary';

function AccountView() {
    const navigate = useNavigate();
    const [axiosError, setAxiosError] = useState(null);

    const [photographerId, setPhotographerId] = useState(undefined);
    const [photographerName, setPhotographerName] = useState('');
    const [accountRegistered, setAccountRegistered] = useState(undefined);

    const { JWTReady, buildAuthHeader, user } = useAccessToken();

    // server request to check if the account is alreay registered
    function findPhotographerAccount() {
        axios.get(
            '/photographer-accounts', buildAuthHeader())
            .then(response => {
                const data = response.data;
                if (data['account_registered'] === true) {
                    setAccountRegistered(true);
                    setPhotographerId(data['photographer_id']);
                    setPhotographerName(data['photographer_name']);
                } else if (data['account_registered'] === false) {
                    setAccountRegistered(false);
                }
            })
            .catch(function (error) {
                setAxiosError(error);
                console.log(error);
            })
    }

    // server request to create a new photographer account
    function createNewPhotographer() {
        axios.post(
            '/photographers',
            {
                name: user.nickname,
                email: user.email
            },
            buildAuthHeader()
        )
            .then(response => {
                const data = response.data;
                if (data['photographer_id']) {
                    // new account has been successfully created, prompt user to initialize profile
                    navigateToInitializeProfile(data['photographer_id']);
                }
            })
            .catch(function (error) {
                setAxiosError(error);
                console.log(error);
            })
    }

    function navigateToInitializeProfile(userId) {
        navigate(`/account/${userId}/initialize`)
    }

    // helper function to format words intotitle case
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    function titleCase(string) {
        const words = string.split(' ');
        let titleCasedString = '';
        for (let i = 0; i < words.length; i++) {
            titleCasedString += capitalizeFirstLetter(words[i])
            if (i < words.length - 1) {
                titleCasedString += ' '
            }
        }
        return titleCasedString;
    }

    useEffect(() => {
        if (user && JWTReady) {
            findPhotographerAccount();
        }
    }, [user, JWTReady])

    useEffect(() => {
        if (accountRegistered === false) {
            createNewPhotographer();
        }
    }, [accountRegistered])

    // when there is an axios error, throw the error to be handled by ErrorBoundary
    const AxiosError = () => {
        if (axiosError) {
            throw axiosError;
        }
        return null
    };

    if (!JWTReady) {
        return (
            <div id='myAccount'>
                <div className='container py-4'>
                    <ErrorBoundary>
                        <AxiosError />
                        <div className='row mb-3'>
                            <p>Logging you in...</p>
                        </div>
                    </ErrorBoundary>
                </div>
            </div>
        )
    }

    if (JWTReady && accountRegistered) {
        return (
            <div id='myAccount'>
                <div className='container py-4'>
                    <ErrorBoundary>
                        <AxiosError />
                        <div className='row mb-3'>
                            <div className='col'>
                                <h3>My Account</h3>
                                <p>View and manage your account.</p>
                                <h6>Welcome, {titleCase(photographerName)}</h6>
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
                    </ErrorBoundary>
                </div>
            </div>
        )
    } else {
        return null
    }
}

export default AccountView