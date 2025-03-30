import axios, { AxiosRequestConfig } from "axios";
import { app } from ".";
import config from '../config.json';
import { BlackDuckProject, BlackDuckRisk } from "./dbDefinitions";


function getAuthToken(){
  console.log("🦆 Getting BlackDuck auth token");
  const options: AxiosRequestConfig<any> = {
    method: 'POST',
    url: config.BLACKDUCK_URL + "/api/tokens/authenticate",
    headers: {'Authorization': `token ${config.BLACKDUCK_TOKEN}`,},
  };
  
  return axios.request(options).then(response => { return response.data.bearerToken })
  .catch((reason) => { console.log("🦆🚨 Error getting BlackDuck auth token: " + reason); return ""; })
}

function getAllProjects(token: string): Promise<Array<any>>{
  console.log("🦆 Getting all projects from BlackDuck");
  const options: AxiosRequestConfig<any> = {
    method: 'GET',
    url: config.BLACKDUCK_URL + "/api/projects",
    headers: {'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.blackducksoftware.internal-1+json, application/json, */*;q=0.8'},
    params: { limit: 1000 },
  };

  return axios.request(options).then(response => { return response.data.items })
  .catch((reason) => { console.log("🦆🚨 Error getting all projects from BlackDuck: " + reason); return [] });
}

function getProjectVersions(projectID: string, projectName: string, token: string): Promise<Array<any>>{
  console.log("🦆 Getting project versions from BlackDuck for project: " + projectName);
  const options: AxiosRequestConfig<any> = {
    method: 'GET',
    url: `${config.BLACKDUCK_URL}/api/projects/${projectID}/versions`,
    headers: {'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.blackducksoftware.internal-1+json, application/json, */*;q=0.8'},
  };

  return axios.request(options).then(response => { return response.data.items })
  .catch((reason) => { console.log("🦆🚨 Error getting project versions from BlackDuck: " + reason); return [] });
}


function getProjectRisks(version: any): BlackDuckRisk {
  const risks: BlackDuckRisk = {
    licenseRisks: {
      high: version.licenseRiskProfile.counts.find((count: any) => count.countType == "HIGH").count,
      medium: version.licenseRiskProfile.counts.find((count: any) => count.countType == "MEDIUM").count,
      low: version.licenseRiskProfile.counts.find((count: any) => count.countType == "LOW").count,
    },
    securityRisks: {
      critical: version.securityRiskProfile.counts.find((count: any) => count.countType == "CRITICAL").count,
      high: version.securityRiskProfile.counts.find((count: any) => count.countType == "HIGH").count,
      medium: version.securityRiskProfile.counts.find((count: any) => count.countType == "MEDIUM").count,
      low: version.securityRiskProfile.counts.find((count: any) => count.countType == "LOW").count,
    },
    date: new Date().toLocaleString().split(',')[0],
  }
  return risks;
}

async function saveRisksToMongoDB(risks: BlackDuckRisk, projectName: string, projectID: string, versionName: string, versionID: string){
  console.log("💾🦆 Saving risks to MongoDB");
  const existingProject = await BlackDuckProject.findOne({
    versionID: versionID,
  });

  if (!existingProject) {
    const blackDuckProject = new BlackDuckProject({
      name: projectName,
      id: projectID,
      risks: [risks],
      versionName: versionName,
      versionID: versionID,
    });
    return blackDuckProject.save().then().catch((reason) => console.log("💾🦆🚨 Error saving blackduck project to MongoDB: " + reason));
  }

  const isTodayAlreadyInTheDatabase = existingProject.risks.length == 0 ? false : existingProject.risks.pop()!.date == risks.date;

  if (isTodayAlreadyInTheDatabase) {
    BlackDuckProject.updateOne(
      { versionID: versionID, "risks.date": risks.date },
      {
        $set: {
          "risks.$.licenseRisks": risks.licenseRisks,
          "risks.$.securityRisks": risks.securityRisks,
        }
      }
    ).catch((reason) => console.log("💾🦆🚨 Error updating risks in MongoDB: " + reason));
  } else {
    BlackDuckProject.updateOne({ versionID: versionID }, { $push: { risks: risks } }).then()
      .catch((reason) => console.log("💾🦆🚨 Error saving risks to MongoDB: " + reason));
  }
}

export function gatherDataFromBlackDuck(){
  getAuthToken().then(token => {
    getAllProjects(token).then(projects => {
      console.log("🦆 Found " + projects.length + " projects in BlackDuck");
      if (!projects) return;
      projects.forEach((project: any) => {
        const projectName = project.name;
        const projectID = project._meta.href.split('/').pop();
        getProjectVersions(projectID, projectName, token).then(versions => {
          if (!versions) return;
          versions.forEach((version: any) => {
            const versionName = version.versionName;
            const versionID = version._meta.href.split('/').pop();
            const risks = getProjectRisks(version);
            saveRisksToMongoDB(risks, projectName, projectID, versionName, versionID)
          });
        });
      });
    });
  });
}

export function registerBlackDuckRoutes(){
  app.get("/blackduck", () => BlackDuckProject.find({}, {name: 1, risks: {$slice: -14}, id: 1, _id: 0, versionName: 1, versionID: 1}));
}