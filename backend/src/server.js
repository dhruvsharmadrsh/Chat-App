import express from "express"
import  "dotenv/config";
import authRoutes from "./routes/auth.route.js"
import usersRoutes from "./routes/users.routes.js"
import cookieParser from "cookie-parser";
import chatRoutes from "./routes/chat.route.js"

const app =express();
app.use(cookieParser());
const PORT=process.env.PORT;

import {connectDB} from "./lib/db.js";


app.use(express.json())




app.use("/api/auth",authRoutes);
app.use("/api/users",usersRoutes);
app.use("/api/chat",chatRoutes);





app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
    connectDB();
});