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

app.use(cors({
    credentials: true,
    origin : "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders:[ 'Content-Type','Authorization', 'X-Refresh-Token']
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

const PORT = process.env.PORT || 7174;

app.get("/",(req,res)=>{
    res.send(`Hello procxa web services, Server is running on port : ${PORT}`)
})
app.listen(PORT,()=>{
    console.log(`Server is running for procxa at port ${PORT} `);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Database Host: ${process.env.DB_HOST || 'not set'}`);
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

