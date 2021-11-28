import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Chessboard } from "react-chessboard";

const socket = io("http://localhost:5000");

function App() {
  const [fen, setFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );

  useEffect(() => {
    socket.on("fen", incFen => {
      setFen(incFen);
    });
  });

  const handleMove = (sourceSquare, targetSquare) => {
    socket.emit("move", `${sourceSquare}:${targetSquare}`);
    return true;
  };

  return (
    <div>
      <h1>Test client</h1>
      <Chessboard position={fen} onPieceDrop={handleMove} />
    </div>
  );
}

export default App;
