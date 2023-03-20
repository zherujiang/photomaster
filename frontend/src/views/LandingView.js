import React from 'react';
import { Link } from 'react-router-dom';
import SignupButton from '../components/SignupButton';
import '../stylesheets/LandingView.css'

function LandingView() {
    const BUKET_BASE_URL = 'https://photomasterbucket.s3.us-west-2.amazonaws.com/';

    return (
        <div id='landing-view'>
            <div className='container-fluid text-center'>
                <div className='row'>
                    <div className='col-lg-6'
                        style={{ backgroundImage: `url(${BUKET_BASE_URL + 'fixed_bg_album.jpg'})`, backgroundSize: 'cover' }}>
                        <div className='row full-page-row align-items-center'>
                            <div className='col'>
                                <Link className='btn btn-primary' to='/search'>Find photographers</Link>
                                <p className='CTA-texts mt-3'>Find the best photographers near you</p>
                            </div>
                        </div>
                    </div>
                    <div className='col-lg-6'
                        style={{ backgroundImage: `url(${BUKET_BASE_URL + 'fixed_bg_photography.jpg'})`, backgroundSize: 'cover' }}>
                        <div className='row full-page-row align-items-center'>
                            <div className='col'>
                                <SignupButton />
                                <p className='CTA-texts mt-3'>Join today and meet your customers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default LandingView