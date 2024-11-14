import React from "react";
import Cookies from "universal-cookie";

function Login({setIsAuth}) {
    const cookies = new Cookies();

    // Redirect to the AWS Cognito login page
    const redirectToLogin = () => {
        // const cognitoDomain = "tiktak.auth.us-east-1.amazoncognito.com"; // Update with your Cognito domain
        // const clientId = "3ijg7078a9lf88kinp193l86dv"; // Your Cognito Client ID
        // const redirectUri = "https://localhost:3000"; // Your redirect URI after login

        const cognitoDomain = import.meta.env.VITE_APP_COGNITO_DOMAIN || ""; // Update with your Cognito domain
        const clientId = import.meta.env.VITE_APP_COGNITO_CLIENT_ID || ""; // Your Cognito Client ID
        const redirectUri = import.meta.env.VITE_APP_PUBLIC_DNS || ""; // Your redirect URI after login

        console.log(redirectUri)
        const loginUrl = `${cognitoDomain}/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
        // const loginUrl = 'https://tiktak.auth.us-east-1.amazoncognito.com/login?response_type=code&' +
        //     'client_id=3ijg7078a9lf88kinp193l86dv&redirect_uri=http://localhost:3000';

        window.location.href = loginUrl; // Redirect to the login page
    };


        // const loginUrl = 'https://tiktak.auth.us-east-1.amazoncognito.com/login?response_type=code&' +
        //     'client_id=3ijg7078a9lf88kinp193l86dv&redirect_uri=http://localhost:3000';


    return (
        <div className="login">
            <label style={{fontSize: '60px'}}> Login</label>
            <button onClick={redirectToLogin}> Login with Cognito</button>
        </div>
    );
}

export default Login;
