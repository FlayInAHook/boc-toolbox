import { app } from ".";
import { ITeams, Teams } from "./dbDefinitions";


async function addTeam(team: ITeams){
  const existingTeam = await Teams.findOne({name: team.name});

  if (existingTeam) return getTeams();

  const newTeam = new Teams(team);
  try {
    await newTeam.save();
  } catch (error) {
    console.log("🚨 Error saving team to MongoDB: " + error);
  }

  return getTeams();
}

function saveTeamConfig(team: ITeams){
  console.log("📝 Saving team config to MongoDB: ", team);
  return Teams.updateOne({name: team.name}, {config: team.config}).catch((error) => {
    console.log("🚨 Error saving team config to MongoDB: " + error)
    });
}

function getTeams(){
  return Teams.find({}, {name: 1, config: 1, _id: 0});
}

export function registerTeamRoutes(){
  app.get("/teams", async () => getTeams());
  app.post("/teams", async (req) => addTeam(req.body as ITeams));
  app.put("/teams", async (req) => saveTeamConfig(req.body as ITeams));
}

