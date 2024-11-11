import React from "react";
import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: 'us-east-1_QoiXTAHEw',
  ClientId: '3ijg7078a9lf88kinp193l86dv'
};

const userPool = new CognitoUserPool(poolData);

function SignUp({ setIsAuth }) {
  const redirectToSignUp = () => {
    const redirectUri = encodeURIComponent("http://localhost:3000"); // Your app's redirect URI
    const signUpUrl = `https://tiktak.auth.us-east-1.amazoncognito.com/signup?response_type=code&client_id=${poolData.ClientId}&redirect_uri=${redirectUri}`;

    window.location.href = signUpUrl; // Redirect to Cognito hosted UI sign-up page
  };

  return (
    <div className="signUp">
      <label style={{ fontSize: '60px' }}> Sign Up</label>
      <button onClick={redirectToSignUp}> Sign Up with Cognito</button>
    </div>
  );
}

export default SignUp;
