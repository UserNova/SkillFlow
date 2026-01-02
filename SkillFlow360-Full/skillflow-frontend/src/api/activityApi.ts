import { http } from "./http";

/* ===================== TYPES ===================== */
export type ActivityType = "EXERCICE" | "TP" | "QUIZ" | "PROJET";
export type ActivityLevel = "EASY" | "MEDIUM" | "HARD";

/** ⚠️ DOIT être identique à ton enum backend ResourceType */
export type ResourceType = "PDF" | "VIDEO" | "LINK" | "ARTICLE" | "AUTRE";

export type ActivityDto = {
  id: number;
  title: string;
  description?: string | null;
  type: ActivityType;
  duration?: number | null;
  level: ActivityLevel;
  competenceId: number;
};

export type ResourceDto = {
  id?: number;
  title?: string;
  type?: ResourceType;
  url?: string | null;
  description?: string | null;
  activityId?: number;
};

/* ===================== ACTIVITIES ===================== */
export const getActivities = () => http.get<ActivityDto[]>("/api/v1/activities");
export const getActivityById = (id: number) => http.get<ActivityDto>(`/api/v1/activities/${id}`);

export const createActivity = (body: Partial<ActivityDto>) =>
  http.post<ActivityDto>("/api/v1/activities", body);

export const updateActivity = (id: number, body: Partial<ActivityDto>) =>
  http.put<ActivityDto>(`/api/v1/activities/${id}`, body);

export const deleteActivity = (id: number) => http.delete<void>(`/api/v1/activities/${id}`);

/* ===================== RESOURCES (BY ACTIVITY) ===================== */
/** GET /api/v1/activities/{activityId}/resources */
export const getResourcesByActivity = (activityId: number) =>
  http.get<ResourceDto[]>(`/api/v1/activities/${activityId}/resources`);

/** POST /api/v1/activities/{activityId}/resources */
export const createResource = (activityId: number, body: Partial<ResourceDto>) =>
  http.post<ResourceDto>(`/api/v1/activities/${activityId}/resources`, body);

/** PUT /api/v1/activities/resources/{id} */
export const updateResource = (id: number, body: Partial<ResourceDto>) =>
  http.put<ResourceDto>(`/api/v1/activities/resources/${id}`, body);

/** DELETE /api/v1/activities/resources/{id} */
export const deleteResource = (id: number) =>
  http.delete<void>(`/api/v1/activities/resources/${id}`);
