import { http } from "./http";

export type ScoreDistributionBucket = { range: string; count: number };
export type TopActivity = {
  activityId: number;
  activityTitle: string;
  avgScore: number;
  submissionsCount: number;
};

export type StudentPerformance = {
  studentId: number;
  studentName: string;
  avgScore: number;
  lastScore: number | null;
  submissionsCount: number;
  atRisk?: boolean;
};

export type DashboardStatsResponse = {
  generatedAt: string;
  totalStudents?: number;

  totalEvaluations: number;
  publishedEvaluations: number;

  totalActivities: number;

  totalSubmissions: number;
  submittedCount: number;
  inProgressCount: number;

  atRiskStudentsCount?: number;

  scoreDistribution?: ScoreDistributionBucket[];
  topActivities?: TopActivity[];
  studentsPerformance?: StudentPerformance[];
};

export const grapheApi = {
  getDashboardStats: async () => {
    try {
      // Use the original endpoint with real data
      const response = await http.get<DashboardStatsResponse>("/api/v1/graphes/dashboard");
      return response;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error("Authentification requise. Veuillez vous reconnecter.");
      }
      if (error.response?.status === 403) {
        throw new Error("Accès refusé. Rôle administrateur requis.");
      }
      if (error.response?.status === 500) {
        throw new Error("Erreur serveur. Veuillez réessayer plus tard.");
      }
      throw new Error(error.message || "Erreur de chargement des statistiques.");
    }
  },
};