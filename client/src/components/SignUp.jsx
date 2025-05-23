import React from "react";
import { CognitoUserPool } from "amazon-cognito-identity-js";

const poolData = {
  UserPoolId: 'us-east-1_QoiXTAHEw',
  ClientId: '3ijg7078a9lf88kinp193l86dv'
};

const userPool = new CognitoUserPool(poolData);

function SignUp({ setIsAuth }) {
  const redirectToSignUp = () => {
    const cognitoDomain = import.meta.env.VITE_APP_COGNITO_DOMAIN || "";
    const redirectEnv = import.meta.env.VITE_APP_PUBLIC_DNS || "";
    const redirectUri = encodeURIComponent(redirectEnv);
    const signUpUrl = `${cognitoDomain}/signup?response_type=code&client_id=${poolData.ClientId}&redirect_uri=${redirectUri}`;

    window.location.href = signUpUrl;
  };

  return (
    <div className="signUp">
      <label style={{ fontSize: '60px' }}> Sign Up</label>
      <button onClick={redirectToSignUp}> Sign Up with Cognito</button>
    </div>
  );
}

export default SignUp;
