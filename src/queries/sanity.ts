import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const API_URL = "http://localhost:3000" //"https://10.0.5.40/sanity_dashboard/api" "http://localhost:3000"
const SONARQUBE_TODOS_URL = `${API_URL}/todos`;
const SONARQUBE_PROJECTS_URL = `${API_URL}/projects`;
const SONARQUBE_USERS_URL = `${API_URL}/users`;
const BLACKDUCK_PROJECTS_URL = `${API_URL}/blackduck`;
export const BLACKDUCK_VERSION_URL = "https://boc-eu.app.blackduck.com/api/projects/%PROJECT%/versions/%VERSION%/components";
const TEAMS_URL = `${API_URL}/teams`;

export type AsignedTodo = {
  assignee: string;
  avatar: string;
  todos: {key: string, project: string}[];
}

export type Team = {
  name: string;
  config: {
    sonarQubeProjects?: string[];
    members?: string[];
    blackDuckProjects?: string[];
  }
}

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

export interface BlackDuckProject {
  name: string;
  id: string;
  risks: BlackDuckRisk[];
  versionName: string;
  versionID: string;
}

export interface SonarqubeMeasure {
  date: string;
  bugs: number;
  securityHotspots: number;
}

export interface SonarqubeProject {
  key: string;
  name: string;
  measures: SonarqubeMeasure[];
}

export type SonarqubeUser = {
  name: string;
  login: string;
  id: string;
  avatar: string;
}

export const sanityLocalTeamAtom = atomWithStorage<Team | null>("sanityLocalTeamConfig", null);
export const sanityLocalTeamConfigInSyncAtom = atomWithStorage<boolean>("sanityLocalTeamConfigInSync", true);
export const testAtom = atom("test",);
export const SONARQUBE_TODO_LINK_EXTERNAL = "https://docker03ag.boc.group:9091/project/issues";

export async function getSonarQubeTodos(): Promise<AsignedTodo[]> {
  return fetch(SONARQUBE_TODOS_URL)
    .then(response => response.json())
}

export async function getSonarQubeProjects(): Promise<SonarqubeProject[]> {
  return fetch(SONARQUBE_PROJECTS_URL)
    .then(response => response.json())
}

export async function getSonarQubeUsers(): Promise<SonarqubeUser[]> {
  return fetch(SONARQUBE_USERS_URL)
    .then(response => response.json())
}

export async function getBlackduckProjects(): Promise<BlackDuckProject[]> {
  return fetch(BLACKDUCK_PROJECTS_URL)
    .then(response => response.json())
}

export async function getTeams(): Promise<Team[]> {
  return fetch(TEAMS_URL)
    .then(response => response.json())
}

export async function addTeam(team: Team): Promise<Team[]> {
  return fetch(TEAMS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(team)
  }).then(response => response.json())
}

export async function updateTeamConfig(team: Team): Promise<Response> {
  return fetch(TEAMS_URL, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(team)
  })
}