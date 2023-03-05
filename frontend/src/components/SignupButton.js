import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const SignupButton = () => {
    const { loginWithRedirect } = useAuth0();

    return (
        <button className='btn btn-outline-primary'
            onClick={() => loginWithRedirect({
                authorizationParams: {
                    screen_hint: 'signup',
                }
            })}>Sign up as a photographer</button>
    );
};

export default SignupButton;