import React from 'react';
import { Link } from 'react-router-dom';
import SignupButton from '../components/SignupButton';

function LandingView() {
    return (
        <div id='landing-view'>
            <div className='container text-center py-4 mt-4'>
                <div className='row align-items-center py-4 mt-4'>
                    <div className='col-md-6 border-1 border-end py-4'>
                        <Link className='btn btn-primary' to='/search'>Find photographers</Link>
                        <p className='mt-3'>Find the best photographers near you</p>
                    </div>
                    <div className='col-md-6 border-1 border-start py-4'>
                        <SignupButton />
                        <p className='mt-3'>Join today and start meeting your customers</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LandingView