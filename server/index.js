const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
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

app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);