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

app.use(express.json());
app.use(cors());
app.use('/api/v1', apiRoutes);


app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "Server is healthy!",
  });
});

server.listen(PORT, () => {
  try{
    setupWebSocketServer(server);
    scheduler.startJobs();
  }catch(error){
    console.error(`Error starting WS server: ${error}`);
  }
  console.log(`Server listening on http://localhost:${PORT}`);
});
