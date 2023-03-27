import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PhotographerEditForm from '../components/PhotographerEditForm';
import ErrorBoundary from '../components/ErrorBoundary';

function InitializeProfileView() {
    const { photographerId } = useParams();
    const [initializeSuccessful, setInitializeSuccessful] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setInitializeSuccessful(false);
        }, 2000);
    })
    return (
        <div id='initialize-profile-view' className='container py-4'>
            <ErrorBoundary>
                <div className='row'>
                    {initializeSuccessful && <div className='col'>
                        <div className='alert alert-success alert-dismissible' role='alert'>
                            <div>Account created successfully!</div>
                            <button type='button' className='btn-close' data-bs-dismiss='alert' aria-label='Close'></button>
                        </div>
                    </div>}
                </div>
                <div className='row justify-content-center mt-2'>
                    <div className='col col-auto'>
                        <h4>Next, build your profile</h4>
                    </div>
                </div>
                <PhotographerEditForm photographerId={photographerId} />
            </ErrorBoundary>
        </div>
    )
}

export default InitializeProfileView