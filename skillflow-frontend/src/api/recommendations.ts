import { http } from "./http";

export type RecommendationItem = {
  activityId: number;
  title: string;
  level: string;
  priorityScore: number;
  reason: string;
};

export type RecommendationResponse = {
  generatedAt: string;
  studentId: number;
  strategy: string;
  studentAvgScore: number;
  targetLevel: string;
  recommendations: RecommendationItem[];
};

export const recommendationsApi = {
  getMyRecommendations(studentId: number, limit = 6) {
    return http.get<RecommendationResponse>(
      `/api/v1/recommendations/student/${studentId}?limit=${limit}`
    );
  },
};
