import "./App.css";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import {StreamChat} from "stream-chat";
import {Chat} from "stream-chat-react";
import Cookies from "universal-cookie";
import {useState, useEffect} from "react";
import JoinGame from "./components/JoinGame";
import axios from "axios";

function App() {
    const api_key = "842k9artxzb2";
    const cookies = new Cookies();
    const streamToken = cookies.get("token"); // Stream token
    const streamClient = StreamChat.getInstance(api_key);
    const [isAuth, setIsAuth] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [cognitoToken, setCognitoToken] = useState(""); // Store Cognito token here

    const logOut = () => {
        cookies.remove("streamToken");
        cookies.remove("userId");
        cookies.remove("username");
        cookies.remove("email");
        streamClient.disconnectUser();
        setIsAuth(false);
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const code = queryParams.get("code");

        if (code) {
            const clientID = import.meta.env.VITE_APP_COGNITO_CLIENT_ID || "";
            const clientSecret = import.meta.env.VITE_APP_COGNITO_CLIENT_SECRET || "";
            const cognitoDomain = import.meta.env.VITE_APP_COGNITO_DOMAIN || "";
            const redUrl = import.meta.env.VITE_APP_PUBLIC_DNS || "";
            const serverUrl = import.meta.env.VITE_APP_SERVER || "";
            const credentials = `${clientID}:${clientSecret}`;
            const base64Credentials = btoa(credentials);
            const basicAuthorization = `Basic ${base64Credentials}`;
            const headers = {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: basicAuthorization,
            };

            const data = new URLSearchParams();
            data.append("grant_type", "authorization_code");
            data.append("client_id", clientID);
            data.append("code", code);
            data.append("redirect_uri", redUrl);

            axios
                .post(`${cognitoDomain}/oauth2/token`, data, {headers})
                .then((res) => {
                    if (res.status !== 200) return;

                    const token = res?.data?.access_token;
                    setCognitoToken(token); // Set the Cognito token

                    const userInfoHeaders = {
                        Authorization: "Bearer " + token,
                    };

                    return axios.get(`${cognitoDomain}/oauth2/userInfo`, {headers: userInfoHeaders});
                })
                .then(async (userInfo) => {
                    if (userInfo && userInfo.status === 200) {
                        const userId = userInfo.data.sub;
                        const userUsername = userInfo.data.username;
                        const userEmail = userInfo.data.email;

                        setName(userUsername);
                        setEmail(userEmail);

                        cookies.set("userId", userId);
                        cookies.set("username", userUsername);
                        cookies.set("email", userEmail);

                        // Check if the user already exists
                        console.log("przed checkuser: " + userUsername);
                        const userExistsResponse = await axios.get(`${serverUrl}/checkUser`, {
                            params: {userUsername},
                        });
                        console.log(userExistsResponse.data.exists)
                        if (userExistsResponse.status === 200 && userExistsResponse.data.exists) {
                            // User exists, proceed with login
                            const loginResponse = await axios.post(`${serverUrl}/login`, {userId});

                            if (loginResponse.status === 200) {
                                const {token} = loginResponse.data;
                                cookies.set("streamToken", token, {path: "/"});
                            } else {
                                console.error("Login failed:", loginResponse.data);
                            }
                        } else {
                            // User doesn't exist, proceed with signup
                            console.log("Co przesyłam: " + userId + " " + userUsername + " " + userEmail);
                            // const responseSignup = await axios.post(`${serverUrl}/signup`, {
                            //     userId,
                            //     userUsername,
                            //     userEmail,
                            // });
                            const responseSignup = await axios.post(
                                `${serverUrl}/signup`,
                                {
                                    userId,
                                    userUsername,
                                    userEmail,
                                },
                                {
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                }
                            );
                            console.log("Nowy user ");
                            console.log(responseSignup.status);
                            if (responseSignup.status === 200) {
                                const {token} = responseSignup.data;
                                cookies.set("streamToken", token, {path: "/"});
                                console.log("Udało się dodać nowego usera")
                            } else {
                                console.error("Nie udało się dodać nowego usera, response: ", responseSignup.data);
                            }
                        }

                        setIsAuth(true); // Set authenticated state
                        return streamClient.connectUser(
                            {id: userId, name: userUsername},
                            cookies.get("streamToken")
                        );
                    }
                })
                .catch((err) => {
                    console.error("Error fetching user info:", err);
                });
        }
    }, []);


    return (
        <div className="App">
            {isAuth ? (
                <Chat client={streamClient}>
                    <JoinGame/>
                    <button onClick={logOut}> Log Out</button>
                </Chat>
            ) : (
                <>
                    <SignUp setIsAuth={setIsAuth}/>
                    <Login setIsAuth={setIsAuth}/>
                </>
            )}
        </div>
    );
}

export default App;