import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import mongoose from "mongoose";
import config from '../config.json';
import { gatherDataFromBlackDuck, registerBlackDuckRoutes } from "./blackDuck";
import { gatherDataFromSonarQube, registerSonarQubeRoutes } from './sonarQube';
import { registerTeamRoutes } from "./teams";
import { registerSecurityHotspotsRoutes } from "./securityHotspots";

export const app = new Elysia().get("/", () => "Hello Elysia").use(cors());

registerSonarQubeRoutes();
registerBlackDuckRoutes();
registerTeamRoutes();
registerSecurityHotspotsRoutes();

app.listen(config.SERVER_PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

await mongoose.connect(config.MONGODB_URL);



function gatherData(){
  console.log("📡 Starting data gathering cycle, this should happen every " + config.DATA_GATHER_INTERVAL_IN_MINUTES + " minutes.");
  gatherDataFromSonarQube();
  gatherDataFromBlackDuck();
}



//gatherData();

//setInterval(gatherData, 1000 * 60 * config.DATA_GATHER_INTERVAL_IN_MINUTES); 