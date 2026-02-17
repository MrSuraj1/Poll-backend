require('dotenv').config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const pollRoutes = require("./Routes/routePol");

const app = express();
const server = http.createServer(app);

// ✅ IMPORTANT
app.use(cors({
  origin: "https://tubular-toffee-00fbbf.netlify.app/",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json()); // ✅ VERY IMPORTANT

// 🔌 Socket Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

// ✅ Test route (check this first)
app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

// ⚠️ IMPORTANT — Make sure this exists
app.use("/api/polls", pollRoutes);


const authRoutes = require("./Routes/AuthRoute");
app.use("/api/auth", authRoutes);


const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://surajyadavsy039:Suraj123@cluster0.yassbgc.mongodb.net/?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));


server.listen(5000, () => {
  console.log("Server running on 5000");
});
