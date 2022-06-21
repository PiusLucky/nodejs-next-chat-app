const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
// const socket = require("socket.io");
const io = require("socket.io-client");
require("dotenv").config();

app.use(express.json());
const corsOptions = {
  origin: ["http://localhost:3000"],
  credentials: true,
};
app.use(cors(corsOptions));
let socket = io.connect(process.env.SOCKET_URL);

socket.on("connect", () => {
  console.log("Successfully connected to an external socket server...");
});

global.chatSocket = socket;

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connection Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// const server = app.listen(process.env.PORT, () =>
//   console.log(`Server started on ${process.env.PORT}`)
// );
app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);

// const io = socket(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     credentials: true,
//   },
// });

// global.availableUsers = [];

// const getUser = (userId) => {
//   return availableUsers.find((user) => user.userId === userId);
// };

// const getUserBySocketId = (socketId) => {
//   return availableUsers.find((user) => user.socketId === socketId);
// };

// io.on("connection", (socket) => {
//   global.chatSocket = socket;
//   global.modifyUserByUserId = (userId) => {
//     const user = getUser(userId);
//     if (user) {
//       user.online = false;
//       user.lastSeen = new Date();
//       user.away = false;
//     }
//     io.emit("all-users", availableUsers);
//   };
//   global.modifyOnlineUserByUserId = (userId) => {
//     const user = getUser(userId);
//     if (user) {
//       user.online = true;
//       user.lastSeen = null;
//       user.away = false;
//     }
//     io.emit("all-users", availableUsers);
//   };

//   const modifyLastSeenUserBySocketId = (socketId) => {
//     const user = getUserBySocketId(socketId);
//     if (user) {
//       user.online = false;
//       user.lastSeen = new Date();
//       user.away = false;
//     }
//     io.emit("all-users", availableUsers);
//   };

//   global.modifyAwayUserByUserId = (userId) => {
//     const user = getUser(userId);
//     if (user) {
//       user.online = false;
//       user.lastSeen = null;
//       user.away = true;
//     }
//     io.emit("all-users", availableUsers);
//   };

//   const addUserByUserId = (userId) => {
//     const user = getUser(userId);
//     if (user) {
//       user.online = true;
//       user.lastSeen = null;
//       user.away = false;
//     }
//   };

//   const addUser = (userId, socketId) => {
//     if (userId && socketId) {
//       const userIdExists = !availableUsers.some(
//         (user) => user.userId === userId
//       );
//       if (userIdExists) {
//         availableUsers.push({
//           userId,
//           socketId,
//           online: true,
//           away: false,
//           lastSeen: null,
//         });
//       } else {
//         addUserByUserId(userId);
//       }
//       io.emit("all-users", availableUsers);
//     }
//   };

//   socket.on("set-away", (userId) => {
//     modifyAwayUserByUserId(userId);
//   });

//   socket.on("users-on-mount", (mount) => {
//     io.emit("all-users", availableUsers);
//   });

//   socket.on("add-user", (userId) => {
//     addUser(userId, socket.id);
//   });

//   socket.on("send-msg", (data) => {
//     const sendUser = availableUsers.find((user) => user.userId === data.to);
//     if (sendUser) {
//       socket.to(sendUser.socketId).emit("msg-recieve", data.msg);
//     }
//     io.emit("all-users", availableUsers);
//   });

//   socket.on("disconnect", () => {
//     modifyLastSeenUserBySocketId(socket.id);
//   });
// });
