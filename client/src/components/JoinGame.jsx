import React, {useEffect, useState} from "react";
import {useChatContext, Channel} from "stream-chat-react";
import Game from "./Game";
import CustomInput from "./CustomInput";
import axios from "axios";

function JoinGame() {
    const [rivalUsername, setRivalUsername] = useState("");
    const {client} = useChatContext();
    const [channel, setChannel] = useState(null);
    const [users, setUsers] = useState([]);
    const serverUrl = import.meta.env.VITE_APP_SERVER || "";

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${serverUrl}/users`);
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    const createChannel = async () => {
        const response = await client.queryUsers({name: {$eq: rivalUsername}});

        if (response.users.length === 0) {
            alert("User not found");
            return;
        }

        const newChannel = await client.channel("messaging", {
            members: [client.userID, response.users[0].id],
        });

        await newChannel.watch();
        setChannel(newChannel);
    };
    return (
        <>
            {channel ? (
                <Channel channel={channel} Input={CustomInput}>
                    <Game channel={channel} setChannel={setChannel}/>
                </Channel>
            ) : (
                <div className="joinGame">
                    <h4>Create Game</h4>
                    <input
                        placeholder="Username of rival..."
                        onChange={(event) => {
                            setRivalUsername(event.target.value);
                        }}
                    />
                    <button onClick={createChannel}> Join/Start Game</button>
                    <h4>Available Users</h4>
                    <ul>
                        {users.map((user) => (
                            <li key={user.userid}>
                                {user.username} ({user.email})
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
}

export default JoinGame;
