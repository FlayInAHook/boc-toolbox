import axios, { AxiosRequestConfig } from "axios";
import config from '../config.json';
import { deepEquals } from "bun";
import { app } from ".";

function getSecurityHotspotsFromSonarQube(projectKey: string): Promise<any[]> {
  console.log("🤖 Getting Security Hotspots from SonarQube for project " + projectKey);
  const options: AxiosRequestConfig<any> = {
    method: 'GET',
    url: config.SONARQUBE_URL + "/api/hotspots/search",
    params: {
      project: projectKey,
      pageSize: 500,
    },
    headers: {'Content-Type': 'application/json', "Authorization": `Bearer ${config.SONARQUBE_TOKEN}`},
  };
  
  return axios.request(options).then(response => { return response.data.hotspots })
  .catch((reason) => { console.log("🤖🚨 Error getting hotspots from SonarQube: " + reason); return []; })
}

function replaceComponent(hotspot: any) {
  return hotspot.component.replace(hotspot.project + ":", "");
}

function formatHotspotsData(hotspots: any[]) {
  return hotspots.map((hotspot) =>  {return {
    status: hotspot.status, 
    resolution: hotspot.resolution, 
    component: replaceComponent(hotspot), 
    textRange: hotspot.textRange, 
    securityCategory: hotspot.securityCategory,
    project: hotspot.project,
    key: hotspot.key
  }});
}

function getComment(hotspotFrom:any) {
  const link = `${config.SONARQUBE_URL}/security_hotspots?id=${hotspotFrom.project}&hotspots=${hotspotFrom.key}`;
  return `Security review copied from [${hotspotFrom.project}](${link}) using Sanity Dashboard.`;
}

function migrateOldComponent(component: string) {
  if (component.startsWith("scm/mfbs/")){
    return component.replace("scm/mfbs/", "");
  }
  return component;
}

function compareHotspots(hotspotsToCopyFrom: any[], hotspotsToCopyTo: any[]) {
  const newHotspots = [];
  for (const hotspotFrom of hotspotsToCopyFrom) {
    for (const hotspotTo of hotspotsToCopyTo) {
      const componentFrom = migrateOldComponent(hotspotFrom.component);
      const componentTo = migrateOldComponent(hotspotTo.component);
      if (componentFrom === componentTo && deepEquals(hotspotFrom.textRange, hotspotTo.textRange)
          && hotspotFrom.securityCategory === hotspotTo.securityCategory
          && hotspotFrom.status == "REVIEWED" && hotspotTo.status == "TO_REVIEW") {
        const newHotspot = {
          hotspot: hotspotTo.key,
          status: "REVIEWED",
          resolution: hotspotFrom.resolution,
          comment: getComment(hotspotFrom),
        };
        newHotspots.push(newHotspot);
      }
    }
  }

  return newHotspots;
}

async function copyHotspot(hotspot: any, sonarqubeToken: string) {
  const options: AxiosRequestConfig<any> = {
    method: 'POST',
    url: config.SONARQUBE_URL + "/api/hotspots/change_status",
    params: hotspot,
    headers: {'Content-Type': 'application/json', "Authorization": `Bearer ${sonarqubeToken}`},
  };

  return axios.request(options).then(response => { return response.data.hotspots })
  .catch((reason) => { console.log("🤖🚨 Error copying hotspot: " + reason); return {customError: reason}; })
}

type CopyBody = {
  body: {
    securityHotspots: any[],
    sonarqubeToken: string,
  }
}

export function registerSecurityHotspotsRoutes(){
  app.get("/compareProjectsHotspots", async ({query: {projectKeyFrom, projectKeyTo}}) => {
    console.log("🤖 Comparing hotspots from", projectKeyFrom, "to", projectKeyTo);
    if (!projectKeyFrom || !projectKeyTo) {
      return {message: "Missing project keys"};
    }
    const hotspotsFrom = formatHotspotsData(await getSecurityHotspotsFromSonarQube(projectKeyFrom));
    const hotspotsTo = formatHotspotsData(await getSecurityHotspotsFromSonarQube(projectKeyTo));

    const hotspotsToCopy = compareHotspots(hotspotsFrom, hotspotsTo);

    return hotspotsToCopy;
  });

  app.post("/copySecurityHotspots", async ({body}: CopyBody) => {
    const sonarqubeToken = body.sonarqubeToken;
    const hotspotsToCopy = body.securityHotspots;
    const errors: string[] = [];
    console.log("🤖 Copying hotspots");
    for (const hotspot of hotspotsToCopy) {
      const response = await copyHotspot(hotspot, sonarqubeToken);
      if (response?.customError) {
        errors.push(response.customError ?? "Unknown error");
      }
    }

    if (errors.length > 0) {
      return {message: "Failed to copy " + errors.length + " hotspots: " + errors.join("\\n ")};
    }
    return {message: "Hotspots copied successfully"};
  });

}