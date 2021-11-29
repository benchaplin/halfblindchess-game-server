import { useState, useEffect } from "react";

export default function UserTable({ socket }) {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState({});

  useEffect(() => {
    socket.on("users changed", incUsers => {
      setUsers(incUsers);
    });
  }, [socket]);

  const handleLeave = () => {
    socket.emit("leave", name);
    setJoined(false);
  };

  const handleJoin = e => {
    e.preventDefault();
    setName("");
    setJoined(true);
    socket.emit("join", name);
  };

  return (
    <div className="my-2">
      <form className="mb-3" onSubmit={handleJoin}>
        <div className="input-group">
          <input
            className="form-control"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={e =>
              e.target.value.length <= 10 && setName(e.target.value)
            }
          />
          <div className="input-group-append">
            <button className="btn btn-outline-dark" type="submit">
              Join
            </button>
          </div>
        </div>
      </form>
      <table className="table table-bordered">
        <tbody>
          {Object.keys(users).length === 0 ? (
            <p className="text-muted" style={{ position: "relative", left: 4 }}>
              No users online
            </p>
          ) : (
            Object.keys(users).map((id, i) => (
              <tr key={i}>
                <td className="p-0">
                  <span
                    className="p-2"
                    style={{ position: "relative", top: 3 }}
                  >
                    {users[id]}
                  </span>
                  <span style={{ float: "right" }}>
                    {id !== socket.id ? (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        style={{ borderRadius: 0 }}
                        disabled={!joined}
                      >
                        Challenge
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
