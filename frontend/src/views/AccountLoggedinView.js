import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';

function AccountLoggedinView() {
    const location = useLocation();

    return (
        <div id='myAccount'>
            <div className='container py-4'>
                <div className='row mb-3'>
                    <div className='col'>
                        <h3>My Account</h3>
                        <p>View and manage your account.</p>
                        {/* <h6>Welcome, {photographerName}</h6> */}
                    </div>
                </div>
                <div className='row py-4 mb-3'>
                    <div className='col col-12 col-md-5'>
                        <h5>Profile</h5>
                        <p>Manage your account details.</p>
                        <Link to='edits'>Edit profile</Link>
                    </div>
                    <div className='col col-12 col-md-5'>
                        <h5>Photos</h5>
                        <p>View, upload, and delete photos.</p>
                        <Link to='photos'>Edit photos</Link>
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
}

export default AccountLoggedinView