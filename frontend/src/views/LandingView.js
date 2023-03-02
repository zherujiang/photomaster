import React, { Component } from 'react';
import LoginButton from '../components/LoginButton';

class LandingView extends Component {
    navTo(uri) {
        window.location.href = window.location.origin + uri;
    }

    render() {
        return (
            <div id='landing-view'>
                <div className='container text-center py-4 mt-4'>
                    <div className='row align-items-center py-4 mt-4'>
                        <div className='col-md-6 border-1 border-end py-4'>
                            <button type='button' className='btn btn-primary'
                                onClick={() => {
                                    this.navTo('/search')
                                }}>Find Photographers
                            </button>
                            <p className='mt-3'>Find the best photographers near you</p>
                        </div>
                        <div className='col-md-6 border-1 border-start py-4'>
                            <LoginButton />
                            <p className='mt-3'>Join today and start meeting your customers</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default LandingView