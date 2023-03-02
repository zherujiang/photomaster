import React from 'react';
import { Outlet } from 'react-router-dom';
import LoginButton from '../components/LoginButton';
import LogoutButton from '../components/LogoutButton';

function Navbar() {
    function navTo(uri) {
        window.location.href = window.location.origin + uri;
    }

    return (
        <div id="layout">
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">Photomaster</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarLinks" aria-controls="navbarNavivation" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNavivation">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="/search">Search</a>
                            </li>
                        </ul>
                        <form className="d-flex">
                            <LoginButton />
                            <LogoutButton />
                        </form>
                    </div>
                </div>
            </nav>
            <Outlet />
        </div>
    )

}

export default Navbar;