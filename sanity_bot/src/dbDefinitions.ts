import { Schema, Types, model } from "mongoose";

export interface ISonarQubeMeasure {
  date: string;
  bugs: number;
  securityHotspots: number;
}

export interface ISonarQubeProject {
  key: string;
  name: string;
  measures: ISonarQubeMeasure[];
}


const measureSchema = new Schema<ISonarQubeMeasure>({
  date: { type: String, required: true },
  bugs: { type: Number, required: true },
  securityHotspots: { type: Number, required: true },
}, { _id: false });

const projectSchema = new Schema<ISonarQubeProject>({
  key: { type: String, required: true },
  name: { type: String, required: true },
  measures: { type: [measureSchema], required: true },
});

projectSchema.pre('find', function() {
  this._startTime = Date.now();
});

projectSchema.post('find', function() {
  const duration = Date.now() - this._startTime;
  console.log(`Query took ${duration}ms`);
});



export const SonarQubeProject = model<ISonarQubeProject>("SonarQube_Project", projectSchema);

/*interface ITodo {
  assignee: string;
  key: string;
  project: string;
}*/

export interface ISonarQubeUser {
  name: string;
  login: string;
  id: string;
  avatar: string;
}

const userSchema = new Schema<ISonarQubeUser>({
  name: { type: String, required: true },
  login: { type: String, required: true },
  id: { type: String, required: true },
  avatar: { type: String, required: false },
});

export const SonarQubeUser = model<ISonarQubeUser>("SonarQube_User", userSchema);

export interface ISonarQubeTodo {
  assignee: Types.ObjectId | null;
  key: string;
  project: string;
}

const todoSchema = new Schema<ISonarQubeTodo>({
  assignee: { type: Schema.Types.ObjectId, ref: "SonarQube_User", required: false },
  key: { type: String, required: true },
  project: { type: String, required: true },
});

export const SonarQubeTodo = model<ISonarQubeTodo>("SonarQube_Todo", todoSchema);

export interface BlackDuckRisk {
  licenseRisks: {
    high: number;
    medium: number;
    low: number;

  },
  securityRisks: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  },
  date: string;
}

const blackDuckRiskSchema = new Schema<BlackDuckRisk>({
  licenseRisks: {
    high: { type: Number, required: true },
    medium: { type: Number, required: true },
    low: { type: Number, required: true },
  },
  securityRisks: {
    critical: { type: Number, required: true },
    high: { type: Number, required: true },
    medium: { type: Number, required: true },
    low: { type: Number, required: true },
  },
  date: { type: String, required: true },
}, { _id: false });


export interface IBlackDuckProject {
  name: string;
  id: string;
  risks: BlackDuckRisk[];
  versionName: string;
  versionID: string;
}

const blackDuckProjectSchema = new Schema<IBlackDuckProject>({
  name: { type: String, required: true },
  id: { type: String, required: true },
  risks: { type: [blackDuckRiskSchema], required: true },
  versionName: { type: String, required: true },
  versionID: { type: String, required: true },
});

export const BlackDuckProject = model<IBlackDuckProject>("BlackDuck_Project", blackDuckProjectSchema);


export interface ITeams {
  name: string;
  config: {
    sonarQubeProjects?: string[];
    members?: string[];
    blackDuckProjects?: string[];
  }
}

const teamsSchema = new Schema<ITeams>({
  name: { type: String, required: true },
  config: {
    sonarQubeProjects: { type: [String], required: false },
    members: { type: [String], required: false },
    blackDuckProjects: { type: [String], required: false },
  }
});

export const Teams = model<ITeams>("Teams", teamsSchema);


