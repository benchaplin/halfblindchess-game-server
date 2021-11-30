import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";

export default function Chess({ socket }) {
    const [chess, setChess] = useState(null);

    useEffect(() => {
        socket.on("chess game", chess => {
            setChess(chess);
        });
    });

    const handleMove = (sourceSquare, targetSquare) => {
        socket.emit("move", {
            gameId: chess["id"],
            move: { from: sourceSquare, to: targetSquare },
        });
    };

    return (
        <div className="m-2 d-flex justify-content-center">
            <div>
                <div>{chess && <p>Black: {chess["players"]["b"]}</p>}</div>
                <div className="mb-3">
                    <Chessboard
                        position={
                            chess ? chess["fen"] : "8/8/8/8/8/8/8/8 w - - 0 1"
                        }
                        onPieceDrop={handleMove}
                    />
                    {chess &&
                        (chess["state"]["loser"] || chess["state"]["draw"]) && (
                            <div className="alert alert-primary">
                                Game over,{" "}
                                {chess["state"]["loser"] === "b"
                                    ? "white won"
                                    : chess["state"]["loser"] === "w"
                                    ? "black won"
                                    : "it's a draw"}
                            </div>
                        )}
                </div>
                <div>{chess && <p>White: {chess["players"]["w"]}</p>}</div>
            </div>
        </div>
    );
}
