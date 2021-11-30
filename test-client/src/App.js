import { io } from "socket.io-client";
import UserTable from "./components/UserTable";
import Chess from "./components/Chess";

const socket = io("http://localhost:5000");

function App() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-4">
          <UserTable socket={socket} />
        </div>
        <div className="col-8">
          <Chess socket={socket} />
        </div>
      </div>
    </div>
  );
}

export default App;
