const express = require("express");
const dotenv = require('dotenv');
const cors = require('cors');
const firebase_routes = require("./routes/firebase");
const http =  require("http");
const { Server } = require("socket.io");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// socket
const server = http.createServer(app);
const socket = new Server(server, {
  cors: {
    origin: "*"
  }
});

socket.on('connection', (client) => {
  console.log('socket connected');
  
  client.on('firebase-create', (data) => {
    console.log("Connected Users", data);
  })
})

// server.listen(3002, () =>
//   console.log(`Socket running on port: 3002`)
// )

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.json("server running");
});

app.use('/firebase', firebase_routes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


module.exports = {
  socket,
}