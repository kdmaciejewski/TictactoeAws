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
            // const clientID = "3ijg7078a9lf88kinp193l86dv";
            // const clientSecret = "bdomhjia5vfn1pm6kmlr6n438k9352o5i8qgfjef88d8eicgkg7";
            // const cognitoDomain = "https://tiktak.auth.us-east-1.amazoncognito.com";
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

            console.log('autoryzacja: ' + data);
            console.log('naglowwek: ' + headers);
            console.log(cognitoDomain);
            axios
                .post(`${cognitoDomain}/oauth2/token`, data, {headers})
                .then((res) => {
                    if (res.status !== 200) return;
                    const token = res?.data?.access_token;
                    setCognitoToken(token); // Set the Cognito token

                    const userInfoHeaders = {
                        Authorization: "Bearer " + token,
                    };
                    console.log("Token Response:", res.data);

                    return axios.get(`${cognitoDomain}/oauth2/userInfo`, {headers: userInfoHeaders});
                })
                .then(async (userInfo) => {
                    if (userInfo && userInfo.status === 200) {
                        setName(userInfo.data?.username);
                        setEmail(userInfo.data?.email);
                        cookies.set("userId", userInfo.data?.sub);
                        cookies.set("username", userInfo.data?.username);
                        cookies.set("email", userInfo.data?.email);
                        const userId = userInfo.data.sub;

                        const response = await axios.post(`${serverUrl}/signup`, {userId});

                        if (response.status === 200) {
                            const {token} = response.data; // Get the token from the response
                            cookies.set("streamToken", token, {path: "/"});
                        } else {
                            console.error("Nie udało się tokenu signup:", response.data);
                        }

                        console.log("testikik:" + cookies.get("streamToken"));
                        setIsAuth(true); // Set authenticated state
                        return streamClient.connectUser(
                            {id: userId, name: userInfo.data.username},
                            cookies.get("streamToken"),
                        );
                    }
                })
                .catch((err) => console.error("Error fetching user info:", err));
        }
    }, []);


    console.log("stream: " + streamToken);
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
