import express from "express";
import http from "http";
import cors from "cors";
import { config } from "dotenv";
import setupWebSocketServer from "./webSocket";
config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

app.use(cors());



app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "Server is healthy!",
  });
});

server.listen(PORT, () => {
  try{
    setupWebSocketServer(server);
  }catch(error){
    console.error(`Error starting WS server: ${error}`);
  }
  console.log(`Server listening on http://localhost:${PORT}`);
});
