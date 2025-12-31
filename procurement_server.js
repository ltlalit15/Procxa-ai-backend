require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const path = require('path');
require('./src/cronJob/cronJob');

const app = express()

// Middleware
// JSON body parser with proper error handling
app.use(bodyParser.json({ 
  limit: '10mb',
  strict: true // Only parse arrays and objects
}));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, "public" )));
app.use(cookieParser());

// app.use(cors({
//     credentials: true,
//     origin : "*",
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     allowedHeaders:[ 'Content-Type','Authorization', 'X-Refresh-Token']
// }));




const allowedOrigins = [
  "http://localhost:5173",
  "https://procxa.netlify.app"
];

app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed from this origin"));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Refresh-Token']
}));

const mainRoutes = require("./src/routes/main.routes")

app.use("/procxa",mainRoutes)

// Error handling middleware for JSON parsing errors (must be after routes)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      status: false,
      message: 'Invalid JSON format in request body'
    });
  }
  next(err);
});

app.get("/",(req,res)=>{
    res.send("Hello procxa  web services, Server  is running on port : 7174")
})

app.listen(process.env.PORT,()=>{
    console.log(`Server is running for procxa at port ${process.env.PORT} `);
})





// require('dotenv').config()
// const express = require('express');
// const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');
// const cors = require("cors");
// const path = require('path');
// require('./src/cronJob/cronJob');

// const app = express();
// const PORT = process.env.PORT || 7374;

// // Middleware
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "public")));
// app.use(cookieParser());

// app.use(cors({
//     credentials: true,
//     origin: "*",
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     allowedHeaders: ['Content-Type','Authorization','X-Refresh-Token']
// }));

// const mainRoutes = require("./src/routes/main.routes");
// app.use("/procxa", mainRoutes);

// app.get("/", (req, res) => {
//     res.send(`Hello procxa web services, Server is running on port : ${PORT}`);
// });

// app.listen(PORT, () => {
//     console.log(`Server is running for procxa at port ${PORT}`);
// });

