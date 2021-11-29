import { useState } from "react";
import { Chessboard } from "react-chessboard";

export default function Chess({ socket }) {
  const [fen, setFen] = useState("8/8/8/8/8/8/8/8 w - - 0 1");

  return (
    <div className="m-2 d-flex justify-content-center">
      <Chessboard position={fen} />
    </div>
  );
}
