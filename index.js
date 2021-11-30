const winston = require("winston");
const { combine, timestamp, printf } = winston.format;
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
const { Chess } = require("chess.js");

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
  format: combine(timestamp(), myFormat),
  transports: [new winston.transports.Console()]
});

// DB

/*
{
  name: ben,
  challenged: 9fa83nk
}
*/
let users = {};

// Configure sockets
io.on("connection", socket => {
  logger.info("A user has connected");
  socket.emit(
    "users",
    Object.keys(users).map(id => [id, users[id]["name"]]) // [id, name]
  );

  socket.on("join", name => {
    logger.info(`User: ${name} has joined`);
    users[socket.id] = { name };
    io.emit(
      "users",
      Object.keys(users).map(id => [id, users[id]["name"]]) // [id, name]
    );
  });

  socket.on("leave", () => {
    logger.info(`User: ${users[socket.id]["name"]} has left`);
    delete users[socket.id];
    io.emit(
      "users",
      Object.keys(users).map(id => [id, users[id]["name"]]) // [id, name]
    );
  });

  socket.on("challenge", id => {
    logger.info(
      `User: ${users[socket.id]["name"]} has challenged user: ${
        users[id]["name"]
      }`
    );
    users[socket.id]["challenged"] = id;
    socket.to(id).emit("challenged", users[socket.id]["name"]);
    socket.emit("challenge", id);
  });

  socket.on("revoke challenge", id => {
    logger.info(
      `User: ${users[socket.id]["name"]} has revoked challenge for user: ${
        users[id]["name"]
      }`
    );
    delete users[socket.id]["challenged"];
    socket.to(id).emit("challenge revoked", users[socket.id]["name"]);
    socket.emit("challenge", null);
  });

  socket.on("disconnect", () => {
    logger.info("A user has disconnected");
    delete users[socket.id];
    io.emit(
      "users",
      Object.keys(users).map(id => [id, users[id]["name"]]) // [id, name]
    );
  });
});

// Run server
server.listen(5000, () => {
  logger.info("Listening on port 5000...");
});
