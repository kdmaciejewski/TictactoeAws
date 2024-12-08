import React, {useEffect, useState} from "react";
import axios from "axios";

function Chat() {
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
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
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`${serverUrl}/messages`);
                setMessages(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        fetchUsers();
        fetchMessages();
        // Set up polling every 2 seconds
        const interval = setInterval(fetchMessages, 2000);
        return () => clearInterval(interval);
    }, []);

    const sendMessage = async () => {
        try {
            const response = await fetch(`${serverUrl}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({text: message}),
            });

            if (response.ok) {
                console.log("Message sent successfully!");
                setMessage(""); // Clear the input field
            } else {
                console.log("Failed to send message.");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="chat" style={{padding: "20px"}}>
            <h1 style={{fontSize: "60px"}}>Chat</h1>
            <ul>
                {messages.map((mes) => (
                    <li key={mes.id}>
                        {mes.text}
                    </li>
                ))}
            </ul>
            <textarea
                style={{width: "100%", height: "100px", fontSize: "18px"}}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
            ></textarea>
            <br/>
            <button
                style={{
                    marginTop: "10px",
                    padding: "10px 20px",
                    fontSize: "18px",
                    cursor: "pointer",
                }}
                onClick={sendMessage}
            >
                Send Message
            </button>
            <h4>Available Users</h4>
            <ul>
                {users.map((user) => (
                    <li key={user.userid}>
                        {user.username} ({user.email})
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Chat;

