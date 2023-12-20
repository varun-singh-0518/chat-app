import React, {useEffect, useState} from "react";
import styled from "styled-components";
import {useNavigate} from "react-router-dom";
import loader from "../assets/loader.gif";
import {ToastContainer, toast} from "react-toastify";
import axios from "axios";
import {Buffer} from "buffer";
import "react-toastify/dist/ReactToastify.css";
import {setAvatarRoute} from "../utils/APIRoutes";

export default function SetAvatar() {
  const api = `https://api.multiavatar.com/45678945`;
  const navigate = useNavigate();

  const [avatars, setAvatars] = useState([]); //for storing avatar data
  const [isLoading, setIsLoading] = useState(true); //to track whether data is being loaded
  const [selectedAvatar, setSelectedAvatar] = useState(undefined); //to store the currently selected avatar

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    if (!localStorage.getItem("chat-app-user")) {
      navigate("/login");
    }
  }, []);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
    } else {
      // Retrieve user data from local storage
      const user = await JSON.parse(localStorage.getItem("chat-app-user"));

      // Send a POST request to set the avatar for the user
      const {data} = await axios.post(`${setAvatarRoute}/${user._id}`, {
        image: avatars[selectedAvatar],
      });

      // Check if the avatar is successfully set
      if (data.isSet) {
        // Update user data in local storage
        user.isAvatarImageSet = true;
        user.avatarImage = data.image;
        localStorage.setItem("chat-app-user", JSON.stringify(user));
        navigate("/");
      } else {
        toast.error("Error setting avatar. Please try again", toastOptions);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Create an empty array to store fetched avatar data
      const data = [];

      // Loop to fetch avatar data for four random images
      for (let i = 0; i < 4; i++) {
        try {
          // Generate a random number and append it to the API URL
          const image = await axios.get(
            `${api}/${Math.round(Math.random() * 1000)}`
          );

          // Convert the fetched image data to a base64-encoded string
          const buffer = new Buffer(image.data);
          data.push(buffer.toString("base64"));
        } catch (error) {
          console.error("Error fetching avatar:", error);
        }
      }
      // Update the component state with the fetched avatar data
      setAvatars(data);

      // Set isLoading to false to indicate that data fetching is complete
      setIsLoading(false);
    };

    // Call the fetchData function when the component mounts
    fetchData();
  }, []);

  return (
    <>
      {isLoading ? (
        <Container>
          <img src={loader} alt="loader" className="loader" />
        </Container>
      ) : (
        <Container>
          <div className="title-container">
            <h1>Pick an avatar as your profile picture</h1>
          </div>
          <div className="avatars">
            {avatars.map((avatar, index) => {
              return (
                <div
                  key={index}
                  className={`avatar ${
                    selectedAvatar === index ? "selected" : ""
                  }`}
                >
                  <img
                    src={`data:image/svg+xml;base64,${avatar}`}
                    alt="avatar"
                    key={avatar}
                    onClick={() => setSelectedAvatar(index)}
                  />
                </div>
              );
            })}
          </div>
          <button className="submit-btn" onClick={setProfilePicture}>
            Set as Profile Picture
          </button>
        </Container>
      )}
      <ToastContainer />
    </>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  background-color: #131324;
  height: 100vh;
  width: 100vw;
  .loader {
    max-inline-size: 100%;
  }

  .title-container {
    h1 {
      color: white;
    }
  }

  .avatars {
    display: flex;
    gap: 2rem;
    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.5s ease-in-out;
      img {
        height: 6rem;
      }
    }

    .selected {
      border: 0.4rem solid #4e0eff;
    }
  }

  .submit-btn {
    background-color: #997af0;
    color: white;
    padding: 1rem 2rem;
    border: none;
    font-weight: bold;
    cursor: pointer;
    border-radius: 0.4rem;
    font-size: 1rem;
    text-transform: uppercase;
    transition: 0.5s ease-in-out;
    &:hover {
      background-color: #4e0eff;
    }
  }
`;
