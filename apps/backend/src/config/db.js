import mongoose from "mongoose"
import dns  from "dns"
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const connectdb=async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("database connected")
    } catch (error) {
        console.log(error);
    }
}

export default connectdb;