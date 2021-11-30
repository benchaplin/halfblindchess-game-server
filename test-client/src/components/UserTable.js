import { useState, useEffect } from "react";

export default function UserTable({ socket }) {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [challenged, setChallenged] = useState(null);

  useEffect(() => {
    socket.on("users", incUsers => {
      setUsers(incUsers);
    });
    socket.on("challenged", name => {
      setChallenges(challenges => [...challenges, name]);
    });
    socket.on("challenge revoked", name => {
      setChallenges(challenges => challenges.filter(n => n !== name));
    });
    socket.on("challenge", id => {
      setChallenged(id);
    });
  }, [socket]);

  const handleJoin = e => {
    e.preventDefault();
    setName("");
    setJoined(true);
    socket.emit("join", name);
  };

  const handleLeave = () => {
    socket.emit("leave", name);
    setJoined(false);
  };

  const handleChallenge = id => {
    if (challenged !== id) {
      socket.emit("challenge", id);
    } else {
      socket.emit("revoke challenge", id);
    }
  };

  return (
    <div className="my-2">
      <form className="mb-3" onSubmit={handleJoin}>
        <div className="input-group">
          <input
            className="form-control"
            type="text"
            placeholder="Enter your username"
            value={name}
            onChange={e =>
              e.target.value.length <= 10 && setName(e.target.value)
            }
            disabled={joined}
          />
          <div className="input-group-append">
            <button
              className="btn btn-outline-dark"
              type="submit"
              disabled={joined}
            >
              Join
            </button>
          </div>
        </div>
      </form>
      {challenges.map((name, i) => (
        <div
          key={i}
          className="alert alert-primary mb-3 p-2 pl-2"
          style={{ borderRadius: 0 }}
        >
          <span>
            &#9888; {name} has challenged you{" "}
            <span style={{ float: "right", position: "relative", top: -3 }}>
              <button
                className="btn btn-sm btn-outline-success mx-2"
                style={{ borderRadius: 0 }}
              >
                Accept
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                style={{ borderRadius: 0 }}
              >
                Decline
              </button>
            </span>
          </span>
        </div>
      ))}
      <table className="table table-bordered">
        <tbody>
          {users.length === 0 ? (
            <p className="text-muted" style={{ position: "relative", left: 4 }}>
              No users online
            </p>
          ) : (
            users.map(([id, name], i) => (
              <tr key={i}>
                <td className="p-0">
                  <span
                    className="p-2"
                    style={{ position: "relative", top: 3 }}
                  >
                    {name}
                  </span>
                  <span style={{ float: "right" }}>
                    {id !== socket.id ? (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        style={{ borderRadius: 0 }}
                        onClick={() => handleChallenge(id)}
                        disabled={!joined}
                      >
                        {challenged === id ? "Revoke Challenge" : "Challenge"}
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        style={{ borderRadius: 0 }}
                        onClick={handleLeave}
                      >
                        Leave
                      </button>
                    )}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
