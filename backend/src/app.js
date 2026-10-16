import express from "express"
const app =express();
import dotenv from "dotenv"
dotenv.config();

import connectdb from "./config/db.js";




app.listen("5000",()=>{
    console.log("server running AT PPORT 5000");
    connectdb();
})