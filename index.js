//environment variables
if (process.env.NODE_ENV || NODE_ENV == "development") {
  require("dotenv").config();
}

//importing required modules
const express = require("express");
const mongoose = require("mongoose");
const workoutVideoRoutes = require("./routes/workoutVideoRoutes");
const userRouter = require("./routes/userRoutes");
const session = require("express-session");
const redis = require("redis");
const cors = require("cors")

let RedisStore = require("connect-redis")(session);

//wiring up redis session
let redisClient = redis.createClient({
  host: process.env.REDIS_URL || REDIS_URI,
  port: process.env.REDIS_PORT || REDIS_PORT,
});

//express applicationd
const app = express();

//Port mapping
const PORT = process.env.PORT || PORT;

//middlewares
app.enable("trust proxy")
app.use(cors({}))
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || SESSION_SECRET,
    cookie: {
      secure: false,
      resave:false,
      saveUninitialized:false,
      httpOnly: true,
      maxAge: 30000,
    },
  })
);
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});
app.use(express.json());

//Routes
app.get("/api/v1", (req, res)=>{
    res.send("Hello there new architecture worked")
    console.log("yeah it ran");
});
    
app.use("/api/v1/workoutVideos/", workoutVideoRoutes);
app.use("/api/v1/users/", userRouter);

//connecting to the database and starting server
const MONGOURL = `mongodb+srv://${process.env.MONGO_USER || MONGO_USER}:${process.env.MONGO_PASSWORD || MONGO_PASSWORD}@workoutvideos.al9mtwj.mongodb.net/?retryWrites=true&w=majority`
mongoose
  .connect(MONGOURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("successfully connected to the database");
    //Run server to receive request at port:PORT
    app.listen(PORT, () => {
      console.log(`listening at PORT ${PORT}`);
    });
  })
  .catch((e) => {
    console.log(e);
  });
