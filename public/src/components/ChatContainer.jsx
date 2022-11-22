import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { v4 as uuid } from "uuid";

const offerId = "6313d361c979f66cbda76fa7"; //demo -- offerId

export default function ChatContainer({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const [senderId, setSenderId] = useState(null);
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);

  const getAllMessagesFunc = async () => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    const response = await axios.get(
      `http://127.0.0.1:5000/api/v2/market/offer/chat/${data._id}/${offerId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_TOKEN}`,
        },
      }
    );
    return response;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    setSenderId(data._id);
    const response = await getAllMessagesFunc();
    setMessages(response.data.data);
  }, [currentChat]);

  console.log(">>>>>>>>>>>>", messages);

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        )._id;
      }
    };
    getCurrentChat();
  }, [currentChat]);

  //main logic
  const handleSendMsg = async ({ msg = null, file = null, name = null }) => {
    const data = await JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );
    await socket.emit("send-trade-message", {
      from: data._id,
      to: currentChat._id,
      // for sending of message in "TEXT" format
      ...(msg && {
        message: msg,
      }),
      // for sending of message in "FILE" format [accepts all of these formats - /pdf|jpg|jpeg|png|gif|mp4|webm|mov|avi|mkv|3gp/]
      ...(file && {
        file,
        name,
      }),
      offerId,
      trackId: uuid(),
      // type === 'status'
      // type === 'normal'
    });

    const msgs = [...messages];
    msgs.push({
      from: "SELF",
      ...(msg && {
        message: msg,
      }),
      ...(file && {
        file,
        name,
      }),
      type: "normal",
    });
    setMessages(msgs);
  };

  const detectSender = (msg) => {
    if (msg?.sender?.toString() === senderId) {
      return "SELF";
    }
    if (msg?.type?.toString() === "STATUS") {
      return "BOT";
    }
    if (msg?.type?.toString() === "ADMIN") {
      return "ADMIN";
    }
    return "COUNTER_PARTY";
  };

  useEffect(() => {
    if (socket) {
      socket.on("receive-trade-message", (msg) => {
        console.log("Receiving normal message", msg);
        setArrivalMessage({
          from: detectSender(msg),
          message: msg.message,
          ...(msg.message && {
            message: msg.message,
          }),
          // for sending of message in "FILE" format [RESERVED]
          ...(msg.file && {
            file: msg.file,
            name: msg.name,
          }),
          type: "normal",
        });
      });

      socket.on("receive-status-message", (msg) => {
        console.log("Receiving status message", msg);
        setArrivalMessage({
          from: "BOT",
          type: "status",
          offerInitiatorId: msg?.offerInitiatorId,
          advertCreatorId: msg?.advertCreatorId,
          buyerMsg: msg?.buyerMsg,
          sellerMsg: msg?.sellerMsg,
        });
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    //get all unread messages
    const unreadMessages = messages?.filter((msg) => msg.read === false);
    unreadMessages?.map((msg) => {
      socket.emit("message-read", msg);
    });
  }, [messages]);

  useEffect(() => {
    socket.on("message-read-response", async (_) => {
      const response = await getAllMessagesFunc();
      setMessages(response.data.data);
    });
  }, [messages]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img src={currentChat.avatarImage} alt="" className="roundImage" />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        <Logout />
      </div>
      <div className="chat-messages">
        {messages?.map((message) => {
          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${
                  message.from === "SELF" ? "sent" : "received"
                } ${message?.type !== "normal" ? "specialMessage" : ""}`}
              >
                <div
                  className={`content ${
                    message?.type !== "normal" ? "specialMessage" : ""
                  }`}
                >
                  {message?.message ? (
                    <>
                      {message.from === "SELF" ? (
                        <b>read: {message?.read ? "true" : "false"} </b>
                      ) : (
                        ""
                      )}
                      <p>
                        {message?.type === "normal"
                          ? message?.message
                          : message?.offerInitiatorId === senderId
                          ? message?.buyerMsg
                          : message?.sellerMsg}
                      </p>
                    </>
                  ) : (
                    <>
                      <b>read: {message?.read} </b>
                      <img
                        src={message.file}
                        alt="post avr"
                        className="image"
                      />
                      <small>{message.name}</small>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .roundImage {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
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
    .sent {
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

    .specialMessage {
      justify-content: center;
      .content {
        background-color: #fff;
        color: #000;
      }
    }

    .image {
      width: 100%;
      border-radius: 0.5rem;
    }
  }
`;
