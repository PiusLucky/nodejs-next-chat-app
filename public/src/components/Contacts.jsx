import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.svg";
import moment from "moment";

export default function Contacts({ contacts, changeChat, socket }) {
  const [currentUserName, setCurrentUserName] = useState(null);
  const [currentUserImage, setCurrentUserImage] = useState(null);
  const [currentSelected, setCurrentSelected] = useState(null);
  const [allAvailableUsers, setAllAvailableUsers] = useState(null);
  const data = JSON.parse(
    localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
  );

  useEffect(() => {
    setCurrentUserName(data.username);
    setCurrentUserImage(data.avatarImage);
  }, []);

  const changeCurrentChat = (index, contact) => {
    const users = {
      initiator: data._id,
      guest: contact._id,
    };
    setCurrentSelected(index);
    changeChat(contact);
    socket.emit("join-room", users);
  };

  useEffect(() => {
    socket.on("all-users", (users) => {
      setAllAvailableUsers(users);
    });
  });

  // USE THIS CUSTOM FUNCTION TO LEAVE A ROOM [optional]
  // const handleLeaveRoom = (contact) => {
  //   const users = {
  //     initiator: data._id,
  //     guest: contact._id,
  //   };
  //   socket.emit("leave-room", users);
  // };

  const statusDectector = (userSocketArr, userId) => {
    if (userSocketArr && userId) {
      for (let i = 0; i < userSocketArr.length; i++) {
        if (userSocketArr[i].userId === userId) {
          const specUser = userSocketArr[i];
          if (specUser.online) {
            return "online";
          } else if (specUser.away) {
            return "away";
          } else if (specUser.lastSeen) {
            return (
              <span style={{ color: "yellow" }}>
                {" "}
                {moment(specUser.lastSeen).calendar()} (last seen)
              </span>
            );
          } else {
            return "offline";
          }
        }
      }
    }
  };

  return (
    <>
      {currentUserImage && currentUserImage && (
        <Container>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h3>LocoQ</h3>
          </div>

          <div className="contacts">
            {contacts.map((contact, index) => {
              return (
                <div
                  key={contact._id}
                  className={`contact ${
                    index === currentSelected ? "selected" : ""
                  }`}
                  onClick={() => changeCurrentChat(index, contact)}
                >
                  <div className="avatar">
                    <img
                      src={contact?.avatarImage}
                      alt=""
                      className="roundImage"
                    />
                  </div>
                  <div className="username">
                    <h3>{contact.username}</h3>
                    <br />
                    <div>
                      {allAvailableUsers &&
                      statusDectector(allAvailableUsers, contact._id) ===
                        "away" ? (
                        <div
                          style={{
                            backgroundColor: "#faa61a",
                            height: "8px",
                            width: "8px",
                            borderRadius: "50%",
                          }}
                        />
                      ) : statusDectector(allAvailableUsers, contact._id) ===
                        "online" ? (
                        <div
                          style={{
                            backgroundColor: "#43b581",
                            height: "8px",
                            width: "8px",
                            borderRadius: "50%",
                          }}
                        />
                      ) : statusDectector(allAvailableUsers, contact._id) ===
                        "offline" ? (
                        <div
                          style={{
                            backgroundColor: "#f04747",
                            height: "8px",
                            width: "8px",
                            borderRadius: "50%",
                          }}
                        />
                      ) : (
                        statusDectector(allAvailableUsers, contact._id)
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="current-user">
            <div className="avatar">
              <img
                src={currentUserImage}
                alt="avatar"
                className="roundImageOther"
              />
            </div>
            <div className="username">
              <h2>{currentUserName}</h2>
            </div>
          </div>
        </Container>
      )}
    </>
  );
}
const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  background-color: #080420;
  .roundImage {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
  }
  .roundImageOther {
    width: 50px;
    height: 50px !important;
    border-radius: 50%;
    object-fit: cover;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 2rem;
    }
    h3 {
      color: white;
      text-transform: uppercase;
    }
  }
  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .contact {
      background-color: #ffffff34;
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
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
    .selected {
      background-color: #9a86f3;
    }
  }

  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    .avatar {
      img {
        height: 4rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h2 {
        color: white;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
`;
