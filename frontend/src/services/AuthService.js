import { useAuth0 } from '@auth0/auth0-react';
import React, { useState, useEffect } from 'react';

export function useAccessToken() {
    const JWTS_LOCAL_KEY = 'JWTS_LOCAL_KEY';
    const { user, getAccessTokenSilently } = useAuth0();
    const [JWTReady, setJWTReady] = useState(false);

    async function getAuth0Token() {
        const accessToken = await getAccessTokenSilently();
        localStorage.setItem(JWTS_LOCAL_KEY, accessToken);
        setJWTReady(true);
    }

    function loadLocalJWT() {
        return localStorage.getItem(JWTS_LOCAL_KEY) || null;
    }

    function resetLocalJWT() {
        localStorage.setItem(JWTS_LOCAL_KEY, '');
    }

    useEffect(() => {
        if (user) {
            getAuth0Token();
        }
    }, [user])

    return { loadLocalJWT, JWTReady, user, resetLocalJWT }
}