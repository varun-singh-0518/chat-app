import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import {allUsersRoute, host} from "../utils/APIRoutes";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import ChatContainer from "../components/ChatContainer";
import {io} from "socket.io-client";

function Chat() {
  // useRef for the socket connection
  const socket = useRef();

  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!localStorage.getItem("chat-app-user")) {
        navigate("/login");
      } else {
        //retrieves the user data from local storage, parses it from JSON, and sets the currentUser
        setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
        setIsLoaded(true);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      // Initializes the socket.current ref with a new socket connection using the io function
      // This establishes a WebSocket connection to the server.
      socket.current = io(host);

      //Emits a "add-user" event to the server with the user's ID.
      // This likely indicates that a new user is connecting to the chat.
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(() => {
    //This function is responsible for fetching the user's contacts from the server.
    const fetchContacts = async () => {
      if (currentUser) {
        if (currentUser.isAvatarImageSet) {
          try {
            const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);

            //Updates the contacts state with the data received from the server.
            setContacts(data.data);
          } catch (error) {
            console.log("Error fetching contacts:", error);
          }
        } else {
          navigate("/setAvatar");
        }
      }
    };

    fetchContacts();
  }, [currentUser]);

  //This function is used when the user selects a different chat to display.
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <Container>
      <div className="container">
        <Contacts
          contacts={contacts} //The list of contacts, fetched from the server.
          changeChat={handleChatChange} //to update the currentChat state when a chat is selected.
          currentUser={currentUser} //The current user object, which may contain information about the logged-in user.
        />

        {/* If isLoaded is true and currentChat is undefined, 
        it renders the Welcome component, passing the currentUser prop. */}
        {isLoaded && currentChat === undefined ? (
          <Welcome currentUser={currentUser} />
        ) : (
          <ChatContainer
            currentChat={currentChat}
            currentUser={currentUser}
            socket={socket} // The WebSocket connection,used by the ChatContainer for real-time communication.
          />
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 90vh;
    width: 90vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1000px) {
      grid-template-columns: 35% 65%;
    }
  }
`;

export default Chat;
