import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

function LogIn(props) {
    const navigate = useNavigate();
    const [photographerEmail, setPhotographerEmail] = useState(undefined);
    const [photographerId, setPhotographerId] = useState(undefined);
    const [accountVerified, setAccountVerified] = useState(false);

    function handleEmailChange(event) {
        setPhotographerEmail(event.target.value);
    }

    function handleLogIn() {
        axios.get('/photographer-accounts', {
            params: {
                email: photographerEmail
            }
        })
            .then(response => {
                const data = response.data;

                if ('photographer_id' in data) {
                    setPhotographerId(data['photographer_id']);
                    setAccountVerified(true);

                    navigate('/my-account', {
                        state: {
                            'photographerId': data['photographer_id'],
                            'photographerDetails': data['photographer_details']
                        }
                    })
                } else {
                    setAccountVerified(false);
                }
            })
    }

    return (
        <div id='log-in'>
            <div className='container py-4'>
                <div className='row justify-content-center'>
                    <div className='col col-6 col-lg-4'>
                        <h3 className='text-center mb-3'>LOGIN</h3>
                        <form className='p-4'>
                            <div className='mb-3'>
                                <label htmlFor='emailInput'>Email</label>
                                <input type='email' className='form-control' id='emailInput' onChange={handleEmailChange}></input>
                            </div>
                            <div className='mb-3'>
                                <label htmlFor='passwordInput'>Password</label>
                                <input type='password' className='form-control' id='passwordInput'></input>
                            </div>
                            <div className='mb-3'>
                                <button type='button' className='btn btn-primary w-100' onClick={handleLogIn}>Sign In</button>
                            </div>
                            <div className='mb-3 text-center'>
                                <button type='button' className='btn btn-link'>Create Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LogIn