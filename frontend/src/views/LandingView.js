import React, { Component } from 'react';

class LandingView extends Component {
    navTo(uri) {
        window.location.href = window.location.origin + uri;
    }

    render() {
        return (
            <div id='landing-view'>
                <div className='container text-center'>
                    <div className='row align-items-center m-2 g-2'>
                        <div className='col-md-6'>
                            <button type='button' className='btn btn-primary'
                                onClick={() => {
                                    this.navTo('/search')
                                }}>Find Photographers
                            </button>
                            <p>Find the best photographers in your area</p>
                        </div>
                        <div className='col-md-6'>
                            <button type='button' className='btn btn-outline-primary'
                                onClick={() => {
                                    this.navTo('/join')
                                }}>Join as a Photographer</button>
                            <p>Join today and start meeting your customers</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default LandingView