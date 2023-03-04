import React, { useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import LoginButton from '../components/LoginButton';
import { useAuth0 } from '@auth0/auth0-react';

function Navbar() {
    const { user, getAccessTokenSilently } = useAuth0();
    let accessToken = '';

    async function getToken() {
        accessToken = await getAccessTokenSilently();
        console.log('token', accessToken);
    }

    function UserNavOption() {
        if (user) {
            return <NavLink className='nav-link' to='/account'>My Account</NavLink>
        } else {
            return <LoginButton />
        }
    }

    useEffect(() => {
    })

    return (
        <div id="layout">
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid mx-3">
                    <NavLink className='navbar-brand' to='/'>Photomaster</NavLink>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarLinks"
                        aria-controls="navbarNavivation" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarLinks">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <NavLink className='nav-link' to='/search'>Search</NavLink>
                            </li>
                        </ul>
                        <div className="d-flex">
                            <UserNavOption />
                        </div>
                    </div>
                </div>
            </nav>
            <Outlet />
        </div>
    )

}

export default Navbar;