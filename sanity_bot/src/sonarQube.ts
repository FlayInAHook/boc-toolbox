/**
 * API Documentation for SonarQube
 * Local:  V1 https://docker03ag.boc.group:9091/web_api 
 *         V2 https://docker03ag.boc.group:9091/web_api_v2/
 * Public: V1 https://next.sonarqube.com/sonarqube/web_api/
 *         V2 https://next.sonarqube.com/sonarqube/web_api_v2/
 * 
 * 
 */
import axios, { AxiosRequestConfig } from 'axios';
import { app } from '.';
import config from '../config.json';
import { ISonarQubeBug, ISonarQubeMeasure, ISonarQubeProject, ISonarQubeTodo, ISonarQubeUser, SonarQubeBug, SonarQubeProject, SonarQubeTodo, SonarQubeUser } from './dbDefinitions';

function getUsersFromSonarQube(): Promise<ISonarQubeUser[]> {
  console.log("🤖 Getting users from SonarQube");
  const options: AxiosRequestConfig<any> = {
    method: 'GET',
    url: config.SONARQUBE_URL + "/api/v2/users-management/users",
    params: {pageSize: '500', '': ''},
    headers: {'Content-Type': 'application/json', "Authorization": `Bearer ${config.SONARQUBE_TOKEN}`},
  };
  
  return axios.request(options).then(response => { return response.data.users; })
  .catch((reason) => { console.log("🤖🚨 Error getting users from SonarQube: " + reason); return []; })
}

export function saveUsersToMongoDB(){
  getUsersFromSonarQube().then(users => {
    console.log("💾🤖 Saving users to MongoDB");
    users.forEach(user => {
      SonarQubeUser.updateOne({id: user.id}, user, {upsert: true}).then()
      .catch((reason) => console.log("💾🤖🚨 Error saving user to MongoDB: " + reason));
    });
  });
}

async function getTodosFromSonarQube(component: string, pageIndex = 1, issues: ISonarQubeTodo[] = []): Promise<ISonarQubeTodo[]> {
  console.log("🤖 Getting todos from SonarQube");
  const pageSize = 500; // max 500
  const options: AxiosRequestConfig<any> = {
    method: 'GET',
    url: config.SONARQUBE_URL + "/api/issues/search",
    params: {
      components: component,
      rules: 'javascript:S1135,java:S1135',
      p: pageIndex,
      ps: pageSize,
      issueStatuses: 'OPEN' //CONFIRMED
    },
    headers: {'Content-Type': 'application/json', "Authorization": `Bearer ${config.SONARQUBE_TOKEN}`},
  };
  
  return axios.request(options).then(response => {
    if (response.data.total > pageIndex * pageSize) {
      return getTodosFromSonarQube(component, pageIndex + 1, issues.concat(response.data.issues));
    }
    return issues.concat(response.data.issues);
  }).catch((reason) => { console.log("🤖🚨 Error getting todos from SonarQube: " + reason); return []; })
}

function saveTodosToMongoDB(projects: ISonarQubeProject[]){
  const components = projects.map(project => project.key);

  const promises = components.map(component => getTodosFromSonarQube(component));
  Promise.all(promises).then(values => {
    const todos = values.flat();
    console.log("💾🤖 Saving todos to MongoDB");
    SonarQubeTodo.deleteMany({}).then(() => {
      todos.forEach(todo => {
        SonarQubeUser.findOne({login: todo.assignee}).then(user => {
          if (user) {
            todo.assignee = user._id; 
          } else {
            todo.assignee = null;
          }
          SonarQubeTodo.updateOne({key: todo.key}, todo, {upsert: true}).then()
            .catch((reason) => console.log("💾🤖🚨 Error saving todo to MongoDB: " + reason));
        }).catch((reason) => console.log("💾🤖🚨 Error finding user in MongoDB: " + reason));
      });
    }
    ).catch((reason) => console.log("💾🤖🚨 Error deleting todos from MongoDB: " + reason));
  });
}

async function getBugsFromSonarQube(component: string, pageIndex = 1, bugs: ISonarQubeBug[] = []): Promise<ISonarQubeBug[]> {
  console.log("🤖 Getting bugs from SonarQube");
  const pageSize = 500; // max 500
  const options: AxiosRequestConfig<any> = {
    method: 'GET',
    url: config.SONARQUBE_URL + "/api/issues/search",
    params: {
      components: component,
      types: 'BUG',
      p: pageIndex,
      ps: pageSize,
      issueStatuses: 'OPEN,CONFIRMED'
    },
    headers: {'Content-Type': 'application/json', "Authorization": `Bearer ${config.SONARQUBE_TOKEN}`},
  };
  
  return axios.request(options).then(response => {
    if (response.data.total > pageIndex * pageSize) {
      return getBugsFromSonarQube(component, pageIndex + 1, bugs.concat(response.data.issues));
    }
    return bugs.concat(response.data.issues);
  }).catch((reason) => { console.log("🤖🚨 Error getting bugs from SonarQube: " + reason); return []; })
}

function saveBugsToMongoDB(projects: ISonarQubeProject[]){
  const components = projects.map(project => project.key);

  const promises = components.map(component => getBugsFromSonarQube(component));
  Promise.all(promises).then(values => {
    const bugs = values.flat();
    console.log("💾🤖 Saving bugs to MongoDB");
    SonarQubeBug.deleteMany({}).then(() => {
      bugs.forEach(bug => {
        SonarQubeUser.findOne({login: bug.assignee}).then(user => {
          if (user) {
            bug.assignee = user._id; 
          } else {
            bug.assignee = null;
          }
          SonarQubeBug.updateOne({key: bug.key}, bug, {upsert: true}).then()
            .catch((reason) => console.log("💾🤖🚨 Error saving bug to MongoDB: " + reason));
        }).catch((reason) => console.log("💾🤖🚨 Error finding user in MongoDB: " + reason));
      });
    }
    ).catch((reason) => console.log("💾🤖🚨 Error deleting bugs from MongoDB: " + reason));
  });
}

function getMeasuresFromSonarQube(projects: ISonarQubeProject[]): Promise<Map<string, any>>{
  const components = projects.map(project => project.key);
  console.log("🤖 Getting measures from SonarQube: " + components)

  const promises = components.map(component => getMeasureFromSonarQube(component));
  return Promise.all(promises).then(values => {
    const measures = new Map<string, any>();
    values.forEach((value, index) => {
      measures.set(components[index], value);
    });
    return measures;
  }).catch((reason) => { console.log("🤖🚨 Error getting measures from SonarQube: " + reason); return new Map(); })

}

function getMeasureFromSonarQube(component: string): Promise<any> {
  console.log("🤖 Getting measure from SonarQube: " + component);
  const options: AxiosRequestConfig<any> = {
    method: 'GET',
    url: config.SONARQUBE_URL + "/api/measures/component",
    params: {
      component: component,
      metricKeys: 'bugs,security_hotspots',
    },
    headers: {'Content-Type': 'application/json', "Authorization": `Bearer ${config.SONARQUBE_TOKEN}`},
  };
  
  return axios.request(options).then(response => {
    return response.data.component.measures;
  }).catch((reason) => { console.log("🤖🚨 Error getting measure from SonarQube: " + reason, "Component: " + component); return null; })
};

function saveMeasuresToMongoDB(projects: ISonarQubeProject[]){
  getMeasuresFromSonarQube(projects).then(measures => {
    console.log("💾🤖 Saving measures to MongoDB");
    measures.forEach( async (value, key) => {
      const componentName = key;
      const measure: ISonarQubeMeasure = {
        date: new Date().toLocaleString().split(',')[0], // with that it looms nicer in the databse cause (00:00 would be the previous day due to our timezone)
        bugs: value.find((m: any) => m.metric === 'bugs')?.value || -1,
        securityHotspots: value.find((m: any) => m.metric === 'security_hotspots')?.value || -1,
      }

      const existingProject = await SonarQubeProject.findOne({ key: componentName});
      if (!existingProject) {
        console.log("💾🤖🚨 Error finding project in MongoDB: " + componentName + ". Tho that should really not be possible oO"); 
        return;
      }
      //measure.date = new Date(new Date().setDate(19)).toLocaleString().split(',')[0];

      const isTodayAlreadyInTheDatabase = existingProject.measures.length == 0 ? false : existingProject.measures.pop()!.date == measure.date

      if (isTodayAlreadyInTheDatabase) {
        SonarQubeProject.updateOne(
          { key: componentName, "measures.date": measure.date },
          {
            $set: {
              "measures.$.bugs": measure.bugs,
              "measures.$.securityHotspots": measure.securityHotspots,
            }
          }
        ).catch((reason) => console.log("💾🤖🚨 Error updating measure in MongoDB: " + reason));
      } else {
        SonarQubeProject.updateOne({ key: componentName }, { $push: { measures: measure } }).then()
          .catch((reason) => console.log("💾🤖🚨 Error saving measure to MongoDB: " + reason));
      }
    });
  });
}

function getProjectsFromSonarQube(): Promise<ISonarQubeProject[]>{
  console.log("🤖 Getting projects from SonarQube");
  const options: AxiosRequestConfig<any> = {
    method: 'GET',
    url: config.SONARQUBE_URL + "/api/components/search",
    params: {ps: '500', qualifiers: 'TRK'},
    headers: {'Content-Type': 'application/json', "Authorization": `Bearer ${config.SONARQUBE_TOKEN}`},
  };
  
  return axios.request(options).then(response => { return response.data.components; })
  .catch((reason) => { console.log("🤖🚨 Error getting projects from SonarQube: " + reason); return []; })
}

function saveProjectsToMongoDB(){
  getProjectsFromSonarQube().then(projects => {
    console.log("💾🤖 Saving projects to MongoDB");
    projects.forEach( async project => {
      const newProject = new SonarQubeProject({
        key: project.key,
        name: project.name,
        measures: [],
      }); 
    
      const existingProject = await SonarQubeProject.findOne({key: project.key});
      if (!existingProject) {
        newProject.save().then().catch((reason) => console.log("💾🤖🚨 Error saving project to MongoDB: " + reason));
      }
    });
    saveMeasuresToMongoDB(projects);
    saveTodosToMongoDB(projects);
    saveBugsToMongoDB(projects);
  }).catch((reason) => console.log("💾🤖🚨 Error getting projects from SonarQube: " + reason));
};

export function gatherDataFromSonarQube(){
  saveUsersToMongoDB();
  saveProjectsToMongoDB();
}

function getTodosAggregatedByAssignees(){
  return SonarQubeTodo.aggregate([
    { $lookup: { from: "sonarqube_users", localField: "assignee", foreignField: "_id", as: "assignee" } },
    { $unwind: "$assignee" },
    { $group: { _id: "$assignee.name", todos: { $push: "$$ROOT" }, avatar: { $first: "$assignee.avatar" }} },
    { $project: { _id: 0, assignee: "$_id", todos: 1, avatar: 1 } },
    { $unset:["todos.assignee", "todos._id", "todos.__v"] }
  ]).then(result => {
    return result;
  }).catch((reason) => { console.log("🤖🚨 Error getting todos aggregated by assignees: " + reason); return []; });
}

function getTodosAggregated() {
  return SonarQubeTodo.aggregate([
    { $lookup: { from: "sonarqube_users", let: { assigneeId: "$assignee" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$assigneeId"] } } },
          { $project: { _id: 1, name: 1, avatar: 1 } },
        ],
        as: "assignee",
      },
    },
    {
      $addFields: {assignee: { $arrayElemAt: ["$assignee", 0] }, },},
    { $addFields: { assigneeName: { $ifNull: ["$assignee.name", null] }, assigneeAvatar: { $ifNull: ["$assignee.avatar", null] }, }, },
    { $group: { _id: "$assigneeName", todos: { $push: "$$ROOT" }, avatar: { $first: "$assigneeAvatar" }, }, },
    { $project: { _id: 0, assignee: "$_id", todos: 1, avatar: 1, },},
    { $unset: [ "todos.assignee", "todos._id", "todos.__v", "todos.assigneeAvatar", "todos.assigneeName", ], },
  ]).then((result) => {
      return result;
    }).catch((reason) => {
      console.log("🤖🚨 Error getting todos aggregated by assignees: " + reason);
      return [];
    });
}

function getBugsAggregated() {
  return SonarQubeBug.aggregate([
    { $lookup: { from: "sonarqube_users", let: { assigneeId: "$assignee" },
        pipeline: [
          { $match: { $expr: { $eq: ["$_id", "$$assigneeId"] } } },
          { $project: { _id: 1, name: 1, avatar: 1 } },
        ],
        as: "assignee",
      },
    },
    {
      $addFields: {assignee: { $arrayElemAt: ["$assignee", 0] }, },},
    { $addFields: { assigneeName: { $ifNull: ["$assignee.name", null] }, assigneeAvatar: { $ifNull: ["$assignee.avatar", null] }, }, },
    { $group: { _id: "$assigneeName", bugs: { $push: "$$ROOT" }, avatar: { $first: "$assigneeAvatar" }, }, },
    { $project: { _id: 0, assignee: "$_id", bugs: 1, avatar: 1, },},
    { $unset: [ "bugs.assignee", "bugs._id", "bugs.__v", "bugs.assigneeAvatar", "bugs.assigneeName", ], },
  ]).then((result) => {
      return result;
    }).catch((reason) => {
      console.log("🤖🚨 Error getting bugs aggregated by assignees: " + reason);
      return [];
    });
}

export function registerSonarQubeRoutes(){
  //app.get("/todos", async () => getTodosAggregatedByAssignees());
  app.get("/todos", async () => getTodosAggregated());
  app.get("/bugs", async () => getBugsAggregated());
  // only return relevant measure fields
  app.get("/projects", async () => SonarQubeProject.find({}, {key: 1, name: 1, measures: {$slice: -14}, _id: 0}));
  app.get("/users", async () => SonarQubeUser.find({}, {name: 1, login: 1, id: 1, avatar: 1, _id: 0}));
}
