import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { io } from "socket.io-client";

// idle timer
import { useIdleTimer } from "react-idle-timer";
import { socketExternalClient } from "./utils/APIRoutes";

//socket
const socket = io(socketExternalClient);
const user = JSON.parse(
  localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
);

export default function App() {
  const onIdle = () => {
    // Close Modal Prompt
    // Do some idle action like log out your user
    console.log("Idle man...");
    socket.emit("set-away", user._id);
  };

  const onActive = () => {
    // Close Modal Prompt
    // Do some active action
    console.log("Active man...");
    socket.emit("update-user-status-login", user._id);
  };

  const idleTimer = useIdleTimer({ onIdle, onActive, timeout: 1000 * 20 }); //1 minute

  console.log(idleTimer.isIdle());

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Chat socket={socket} />} />
      </Routes>
    </BrowserRouter>
  );
}
