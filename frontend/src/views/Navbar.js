import React, { useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import LoginButton from '../components/LoginButton';
import LogoutButton from '../components/LogoutButton';
import { useAccessToken } from '../hooks/AuthHook';

function Navbar() {
    const { user } = useAccessToken();

    function UserNavOption() {
        if (user) {
            return (
                <div className="d-flex">
                    <NavLink className='nav-link' to='/account'>My Account</NavLink>
                </div>
            )
        } else {
            return (
                <div className="d-flex">
                    <LoginButton />
                </div>
            )
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
                        <UserNavOption />
                    </div>
                </div>
            </nav>
            <Outlet />
        </div>
    )

}

export default Navbar;