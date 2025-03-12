import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import cors from "cors";
import { config } from "dotenv";
config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

app.use(cors());

const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
  ws.on("error", console.error);

  ws.on("message", (data: Buffer) => {
    const message = data.toString()
    console.log(`Meessage: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

});

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "Server is healthy!",
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
