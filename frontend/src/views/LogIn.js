import React, { Component } from 'react';

class LogIn extends Component {
    render() {
        return (
            <div className='log-in'>
                <div className='container text-center'>
                    <div className='row justify-content-center'>
                        <div className='col'>
                            <button type='button' className='btn btn-primary'>Log In</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default LogIn