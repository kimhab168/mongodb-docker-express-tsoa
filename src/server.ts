import app from "./app";
import configs from "@/config";
import { connectToDB } from "./database/connection";

async function runServer() {
  try {
    await connectToDB();
    app.listen(configs.port, () => {4
      console.log(`User Servifce running on Port: ${configs.port}`);
      console.log("Connecfted ok");
    });
  } catch (err) {
    console.log(err);
  }
}

runServer();
