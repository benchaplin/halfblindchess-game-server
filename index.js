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
        methods: ["GET", "POST"],
    },
});
const { v4: uuidv4 } = require("uuid");
const { HalfBlindChess } = require("halfblindchess");

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const logger = winston.createLogger({
    format: combine(timestamp(), myFormat),
    transports: [new winston.transports.Console()],
});

// DB
let users = {};
let games = {};

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
        socket.to(id).emit("challenged", [socket.id, users[socket.id]["name"]]); // [id, name]
        socket.emit("challenge", id);
    });

    socket.on("revoke challenge", id => {
        logger.info(
            `User: ${
                users[socket.id]["name"]
            } has revoked challenge for user: ${users[id]["name"]}`
        );
        delete users[socket.id]["challenged"];
        socket.to(id).emit("challenge revoked", socket.id);
        socket.emit("challenge", null);
    });

    socket.on("decline", id => {
        logger.info(
            `User: ${
                users[socket.id]["name"]
            } has declined challenge from user: ${users[id]["name"]}`
        );
        delete users[id]["challenged"];
        socket.emit("challenge revoked", id);
        socket.to(id).emit("challenge", null);
    });

    socket.on("accept", id => {
        logger.info(
            `User: ${
                users[socket.id]["name"]
            } has accepted challenge from user: ${users[id]["name"]}`
        );
        delete users[id]["challenged"];
        socket.emit("challenge revoked", id);
        socket.to(id).emit("challenge", null);

        const newId = uuidv4();
        const newGame = new HalfBlindChess();
        games[newId] = {
            game: newGame,
            players: { w: users[socket.id]["name"], b: users[id]["name"] },
        };

        socket.join(newId);
        socket.to(id).emit("challenge accepted", newId);
    });

    socket.on("join room", gameId => {
        socket.join(gameId);

        io.to(gameId).emit("chess game", {
            id: gameId,
            players: games[gameId]["players"],
            state: { winner: null, draw: false },
            fen: games[gameId]["game"].fen(),
        });
    });

    socket.on("move", ({ gameId, move }) => {
        logger.info(
            `The move: ${JSON.stringify(
                move
            )} has been attempted in game: ${gameId}`
        );
        if (
            /*(games[gameId]["game"].turn() === "w" &&
                games[gameId]["players"]["w"] === users[socket.id]["name"]) ||
            (games[gameId]["game"].turn() === "b" &&
                games[gameId]["players"]["b"] === users[socket.id]["name"])*/
            true
        ) {
            games[gameId]["game"].move(move);
            io.to(gameId).emit("chess game", {
                id: gameId,
                players: games[gameId]["players"],
                state: {
                    loser: games[gameId]["game"].inCheckmate()
                        ? games[gameId]["game"].turn()
                        : null,
                    draw: games[gameId]["game"].inDraw(),
                },
                fen: games[gameId]["game"].fen(),
            });
        }
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
