import React from "react";
import Cookies from "universal-cookie";

function Login({setIsAuth}) {
    const cookies = new Cookies();

    const redirectToLogin = () => {
        const cognitoDomain = import.meta.env.VITE_APP_COGNITO_DOMAIN || "";
        const clientId = import.meta.env.VITE_APP_COGNITO_CLIENT_ID || "";
        const redirectUri = import.meta.env.VITE_APP_PUBLIC_DNS || "";
        console.log("Jestem w logowaniu");
        console.log("Redirec uri: " + redirectUri);
        const loginUrl = `${cognitoDomain}/login?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
        window.location.href = loginUrl; // Redirect to the login page
    };

    return (
        <div className="login">
            <label style={{fontSize: '60px'}}> Login</label>
            <button onClick={redirectToLogin}> Login with Cognito</button>
        </div>
    );
}

export default Login;
