import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import Logout from "./Logout";
import ChatInput from "./ChatInput";
import axios from "axios";
import {getAllMessagesRoute, sendMessageRoute} from "../utils/APIRoutes";
import {v4 as uuidv4} from "uuid";

export default function ChatContainer({currentChat, socket}) {
  const [messages, setMessages] = useState([]); // Manages the list of messages in the chat.
  const [arrivalMessage, setArrivalMessage] = useState(null); //Manages the arrival of new messages.
  const scrollRef = useRef(); // used to scroll to the bottom of the chat container.

  useEffect(() => {
    const fetchData = async () => {
      try {
        // parse the user data from the local storage
        const data = await JSON.parse(localStorage.getItem("chat-app-user"));
        const response = await axios.post(getAllMessagesRoute, {
          from: data._id,
          to: currentChat._id,
        });
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (currentChat) {
      fetchData();
    }
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    const data = await JSON.parse(localStorage.getItem("chat-app-user"));

    //Emits a socket event named "send-msg" using the socket ref.
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: data._id,
      message: msg,
    });

    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: msg,
    });

    //Creates a new array (msgs) by spreading the existing messages array.
    const msgs = [...messages];

    //Pushes a new object representing the sent message into the array.
    msgs.push({fromSelf: true, message: msg});

    //Updates the local state with the new array using setMessages
    setMessages(msgs);
  };

  useEffect(() => {
    if (socket.current) {
      //sets up a socket event listener for the "msg-receive" event.
      socket.current.on("msg-receive", (msg) => {
        setArrivalMessage({fromSelf: false, message: msg});
      });
    }
  }, []);

  useEffect(() => {
    //sets the new arrival messages to the existing messages.
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  //responsible for scrolling to the bottom of the chat container
  useEffect(() => {
    scrollRef.current?.scrollIntoView({behaviour: "smooth"});
  }, [messages]);

  return (
    <>
      {currentChat && (
        <Container>
          <div className="chat-header">
            <div className="user-details">
              <div className="avatar">
                <img
                  src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
                  alt="avatar"
                />
              </div>
              <div className="username">
                <h3>{currentChat.username}</h3>
              </div>
            </div>
            <Logout />
          </div>
          <div className="chat-messages">
            {/* Mapping over messages and rendering each */}
            {messages.map((message) => {
              return (
                <div ref={scrollRef} key={uuidv4()}>
                  <div
                    className={`message ${
                      message.fromSelf ? "sended" : "received"
                    }`}
                  >
                    <div className="content">
                      <p>{message.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <ChatInput handleSendMsg={handleSendMsg} />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  padding-top: 1rem;
  display: grid;
  grid-template-rows: 10% 78% 12%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1000px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .received {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;
