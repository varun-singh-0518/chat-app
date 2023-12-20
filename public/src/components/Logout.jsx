import React from "react";
import styled from "styled-components";
import {BiPowerOff} from "react-icons/bi";
import {useNavigate} from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  const handleClick = () => {
    // Clearing localStorage (removing user data)
    localStorage.clear();
    navigate("/login");
  };

  return (
    <Button>
      <BiPowerOff onClick={handleClick} />
    </Button>
  );
}

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #9a86f3;
  border: none;
  cursor: pointer;
  svg {
    font-size: 1.3rem;
    color: #ebe7ff;
  }
`;
