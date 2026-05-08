import { Server } from "socket.io";
import db from "@/pages/api/config/connectDB";

let io = null;
let pgClient = null;
let pgHasListen = false;

export default async function SocketHandler(req, res) {
  if (res.socket.server.io) {
    res.end();
    return;
  }

  io = new Server(res.socket.server, {
    path: "/api/socketio",
    addTrailingSlash: false,
  });

  res.socket.server.io = io;

  if (!pgClient) {
    pgClient = await db.connect();
  }

  if (!pgHasListen) {
    pgHasListen = true;

    await pgClient.query("LISTEN tarefas");

    pgClient.on("notification", (msg) => {
      if (msg.channel === "tarefas") {
        const payload = JSON.parse(msg.payload);

        io.to("tarefas").emit("tarefas", payload);
      }
    });
  }

  io.on("connection", (socket) => {
    console.log("Socket conectado:", socket.id);

    socket.on("join_tarefas", () => {
      socket.join("tarefas");
      console.log(`${socket.id} entrou na room tarefas`);
    });

    socket.on("leave_tarefas", () => {
      socket.leave("tarefas");
      console.log(`${socket.id} saiu da room tarefas`);
    });

    socket.on("disconnect", () => {
      console.log("Socket desconectado:", socket.id);
    });
  });

  res.end();
}
