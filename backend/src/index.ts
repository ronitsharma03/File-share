import express from "express";
import http from "http";
import cors from "cors";
import { config } from "dotenv";
import setupWebSocketServer from "./webSocket";
import apiRoutes from './api/routes/index';
import scheduler from "./jobs/scheduler";


config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;
const ip = '192.168.38.131';

app.use(express.json());
app.use(cors());
app.use('/api/v1', apiRoutes);


app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "Server is healthy!",
  });
});

server.listen({port: PORT, hostname: ip}, () => {
  try{
    setupWebSocketServer(server);
    scheduler.startJobs();
    console.log(`Server listening on http://${ip}:${PORT}`);
  }catch(error){
    console.error(`Error starting WS server: ${error}`);
  }
});
