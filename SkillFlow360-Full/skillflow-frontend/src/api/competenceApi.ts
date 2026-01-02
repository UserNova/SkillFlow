import { http } from "./http";

export type CompetenceDto = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
};

export type SubCompetenceDto = {
  id?: number;
  name?: string;
  description?: string;
  competence?: { id: number };
};

export type LevelDto = {
  id?: number;
  type: "BLOOM" | "CEFR" | "INTERNE";
  label?: string;
  description?: string;
  competence?: { id: number };
};

export type ResourceDto = {
  id?: number;
  title?: string;
  url?: string;
  competence?: { id: number };
};

export type PrerequisiteDto = {
  id?: number;
  source?: { id: number };
  target?: { id: number };
  type?: "OBLIGATOIRE" | "RECOMMANDE";
};

// competences
export const getCompetences = () => http.get<CompetenceDto[]>("/api/v1/competences");
export const createCompetence = (body: Partial<CompetenceDto>) => http.post("/api/v1/competences", body);
export const updateCompetence = (id: number, body: Partial<CompetenceDto>) => http.put(`/api/v1/competences/${id}`, body);
export const deleteCompetence = (id: number) => http.delete(`/api/v1/competences/${id}`);

// subcompetences
export const getSubCompetencesByCompetence = (id: number) =>
  http.get<SubCompetenceDto[]>(`/api/v1/subcompetences/competence/${id}`);
export const createSubCompetence = (body: Partial<SubCompetenceDto>) => http.post(`/api/v1/subcompetences`, body);
export const updateSubCompetence = (id: number, body: Partial<SubCompetenceDto>) => http.put(`/api/v1/subcompetences/${id}`, body);
export const deleteSubCompetence = (id: number) => http.delete(`/api/v1/subcompetences/${id}`);

// levels
export const getLevelsByCompetence = (id: number) => http.get<LevelDto[]>(`/api/v1/levels/competence/${id}`);
export const createLevel = (body: Partial<LevelDto>) => http.post(`/api/v1/levels`, body);
export const updateLevel = (id: number, body: Partial<LevelDto>) => http.put(`/api/v1/levels/${id}`, body);
export const deleteLevel = (id: number) => http.delete(`/api/v1/levels/${id}`);

// resources
export const getResourcesByCompetence = (id: number) => http.get<ResourceDto[]>(`/api/v1/resources/competence/${id}`);
export const createResource = (body: Partial<ResourceDto>) => http.post(`/api/v1/resources`, body);
export const updateResource = (id: number, body: Partial<ResourceDto>) => http.put(`/api/v1/resources/${id}`, body);
export const deleteResource = (id: number) => http.delete(`/api/v1/resources/${id}`);

// prerequisites
export const getPrerequisites = () => http.get<PrerequisiteDto[]>(`/api/v1/prerequisites`);
export const createPrerequisite = (body: Partial<PrerequisiteDto>) => http.post(`/api/v1/prerequisites`, body);
export const updatePrerequisite = (id: number, body: Partial<PrerequisiteDto>) => http.put(`/api/v1/prerequisites/${id}`, body);
export const deletePrerequisite = (id: number) => http.delete(`/api/v1/prerequisites/${id}`);
