import { Server } from "socket.io";
import db from "@/pages/api/config/connectDB";
import getQuadroRoom from "@/utils/getQuadroRoom";

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
        try {
          const payload = JSON.parse(msg.payload);
          const room = getQuadroRoom(payload.id_espaco);

          if (!room) {
            console.error("Notificação do Quadro com ID de espaço inválido:", payload);
            return;
          }

          io.to(room).emit("tarefas", payload);
        } catch (error) {
          console.error("Erro ao processar notificação do Quadro:", error);
        }
      }
    });
  }

  io.on("connection", (socket) => {
    console.log("Socket conectado:", socket.id);

    socket.on("join_quadro", ({ id_espaco } = {}) => {
      const room = getQuadroRoom(id_espaco);

      if (!room) {
        console.error(`${socket.id} tentou entrar em uma room com ID de espaço inválido`);
        return;
      }

      socket.join(room);
    });

    socket.on("leave_quadro", ({ id_espaco } = {}) => {
      const room = getQuadroRoom(id_espaco);

      if (!room) {
        console.error(`${socket.id} tentou sair de uma room com ID de espaço inválido`);
        return;
      }

      socket.leave(room);
    });

    socket.on("disconnect", () => {
      console.log("Socket desconectado:", socket.id);
    });
  });

  res.end();
}
