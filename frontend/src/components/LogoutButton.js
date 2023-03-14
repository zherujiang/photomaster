import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useAccessToken } from '../services/AuthService';

const LogoutButton = () => {
    const { logout } = useAuth0();
    const { resetLocalJWT } = useAccessToken();

    return (
        <button className='btn btn-outline-primary'
            onClick={() => {
                resetLocalJWT();
                logout({ logoutParams: { returnTo: window.location.origin } })
            }}>
            Log Out
        </button>
    );
};

export default LogoutButton;