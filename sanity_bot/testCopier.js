const axios = require("axios");

// Configuration
const config = {
  sonarqubeBaseUrl: "https://docker03ag.boc.group:9091", // Replace with your SonarQube server URL
  apiToken: "squ_7757e283f837ef0854789cd4301a885fe425c1c1", // Replace with your SonarQube API token
  sourceProjectKey: "ADOIT17_HF:ADOIT", // ADOIT17_HF:ADOIT
  targetProjectKey: "ADOIT17.3_tmp:ADOIT", // ADOIT_17_1:ADOIT,
};

// Axios instance for SonarQube API
const sonarqubeApi = axios.create({
  baseURL: config.sonarqubeBaseUrl,
  headers: {
    Authorization: `Basic ${Buffer.from(config.apiToken + ":").toString("base64")}`,
  },
});

// Fetch issues from the source project
async function fetchHotspots(projectKey) {
  try {
    const response = await sonarqubeApi.get("/api/hotspots/search", {
      params: {
        project: projectKey,
        pageSize: 500,
      },
    });
    //console.log(response.data);
    return response.data.hotspots;
  } catch (error) {
    console.error(`Failed to fetch issues for project ${projectKey}:`, error.response.data);
    throw error;
  }
}

async function copyHotspot(hotspot) {
  try {
    const response = await sonarqubeApi.post("/api/hotspots/change_status", null, {params: hotspot});
    console.log(`Hotspot copied successfully: ${hotspot.key}`);
  } catch (error) {
    console.error(`Failed to copy hotspot:`, error.response.data);
    throw error;
  }
}


function replaceComponent(hotspot) {
  return hotspot.component.replace(hotspot.project + ":", "");
}

function formatHotspotsData(hotspots) {
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

function getComment(hotspotFrom) {
  const link = `${config.sonarqubeBaseUrl}/security_hotspots?id=${hotspotFrom.project}&hotspots=${hotspotFrom.key}`;
  return `Security review copied from [${hotspotFrom.project}](${link}) using Sanity Dashboard.`;
}

function compareHotspots(hotspotsToCopyFrom, hotspotsToCopyTo) {
  const newHotspots = [];
  for (const hotspotFrom of hotspotsToCopyFrom) {
    for (const hotspotTo of hotspotsToCopyTo) {
      if (hotspotFrom.component === hotspotTo.component && deepEqual(hotspotFrom.textRange, hotspotTo.textRange)
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



// Main function
(async () => {
  try {
    console.log(`Fetching issues from source project: ${config.sourceProjectKey}`);
    const hotspotsToCopyFrom = formatHotspotsData(await fetchHotspots(config.sourceProjectKey));
    console.log(`Fetched ${hotspotsToCopyFrom.length} hotspots from source project ${config.sourceProjectKey}.`);
    const hotspotsToCopyTo = formatHotspotsData(await fetchHotspots(config.targetProjectKey));
    console.log(`Fetched ${hotspotsToCopyTo.length} hotspots from target project ${config.targetProjectKey}.`);

    const changedHotspots = compareHotspots(hotspotsToCopyFrom, hotspotsToCopyTo);
    console.log(`Found ${changedHotspots.length} hotspots to copy.`);
    for (const hotspot of changedHotspots) {
      //await copyHotspot(hotspot);
    }

    console.log("Security reviews copied successfully!");
  } catch (error) {
    console.error("Error during execution:", error.message);
  }
})();



function deepEqual (x, y) {
  if (x === y) {
    return true;
  }
  else if ((typeof x == "object" && x != null) && (typeof y == "object" && y != null)) {
    if (Object.keys(x).length != Object.keys(y).length)
      return false;

    for (var prop in x) {
      if (y.hasOwnProperty(prop))
      {  
        if (! deepEqual(x[prop], y[prop]))
          return false;
      }
      else
        return false;
    }
    
    return true;
  }
  else 
    return false;
}
