require('dotenv').config();
const express = require('express');
const db = require('./db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const router = require('./router/index')

const PORT = process.env.PORT || 5000;
const app = express(); 

app.use(express.json()); 
app.use(cookieParser());
app.use(cors());
app.use('/api', router)


  
const start = async () => {
    try {
        app.listen(PORT, () => console.log(`Server started on PORT = ${PORT}`))
    } catch (err) {
        console.log(err);
    }
}


start()