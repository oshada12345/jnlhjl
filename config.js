const fs = require("fs");
if (fs.existsSync("config.env"))
    require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
    return text === fault ? true : false;
}
module.exports = {
    SESSION_ID:
        process.env.SESSION_ID ||
        "XYUliSIL#N4k8L_32rdS9EggHk8hi5EfdMPKIyk_FZkSYSY0izjQ",
    MONGODB:
        process.env.MONGODB ||
        "mongodb+srv://Oshada2005:Oshada2005@cluster2005.kuyvoqh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster2005",
};
