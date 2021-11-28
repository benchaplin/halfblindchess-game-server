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

// Set up logger
const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
  format: combine(timestamp(), myFormat),
  transports: [new winston.transports.Console()]
});

// Configure sockets
io.on("connection", socket => {
  logger.info("A user has connected");

  const chess = new Chess();

  socket.on("move", move => {
    logger.info("User makes move: " + move);
    const [sourceSquare, targetSquare] = move.split(":");
    chess.move({ from: sourceSquare, to: targetSquare });
    io.emit("fen", chess.fen());
  });

  socket.on("disconnect", () => {
    logger.info("A user has disconnected");
  });
});

// Run server
server.listen(5000, () => {
  logger.info("Listening on port 5000...");
});
