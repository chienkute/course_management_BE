const mongoose = require("mongoose");
const dbConnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    if (conn.connection.readyState === 1)
      console.log("DB Connection Succesfully");
    else console.log("Connect Failled");
  } catch (error) {
    console.log("DB connect failt!!");
  }
};
module.exports = dbConnect;
