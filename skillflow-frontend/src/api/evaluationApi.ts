import { http } from "./http";

export type PrerequisiteLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type EvaluationStatus = "DRAFT" | "PUBLISHED";

export type EvaluationResponse = {
  id: number;
  title: string;
  prerequisiteLevel: PrerequisiteLevel;
  activityId: number;
  introduction?: string | null;
  status: EvaluationStatus;
  questionsCount?: number;
};

export type EvaluationCreateRequest = {
  title: string;
  prerequisiteLevel: PrerequisiteLevel;
  activityId: number;
  introduction?: string;
};

export type EvaluationUpdateRequest = EvaluationCreateRequest;

export type PublishRequest = { published: boolean };

export type QuestionCreateRequest = {
  label: string;
  options: string[];
  correctAnswer: string;
};

export type QuestionProfessorResponse = {
  id: number;
  label: string;
  options: string[];
  correctAnswer: string;
  position: number;
};

export type SubmissionRowResponse = {
  submissionId: number;
  studentFullName: string;
  studentLevel: string;
  evaluationTitle: string;
  activityId: number;
  prerequisiteLevel: PrerequisiteLevel;
  score: number | null;
  startedAt: string;
  submittedAt: string | null;
  status: "IN_PROGRESS" | "SUBMITTED";
};

export const evaluationApi = {
  listAll: () => http.get<EvaluationResponse[]>("/api/v1/evaluations"),
  get: (id: number) => http.get<EvaluationResponse>(`/api/v1/evaluations/${id}`),

  create: (payload: EvaluationCreateRequest) =>
    http.post<EvaluationResponse>("/api/v1/evaluations", payload),

  update: (id: number, payload: EvaluationUpdateRequest) =>
    http.put<EvaluationResponse>(`/api/v1/evaluations/${id}`, payload),

  delete: (id: number) => http.delete<void>(`/api/v1/evaluations/${id}`),

  publish: (id: number, published: boolean) =>
    http.put<EvaluationResponse>(`/api/v1/evaluations/${id}/publish`, {
      published,
    } as PublishRequest),

  addQuestion: (evaluationId: number, payload: QuestionCreateRequest) =>
    http.post<QuestionProfessorResponse>(`/api/v1/evaluations/${evaluationId}/questions`, payload),

  listQuestionsProf: (evaluationId: number) =>
    http.get<QuestionProfessorResponse[]>(`/api/v1/evaluations/${evaluationId}/questions/prof`),

  listSubmissions: (evaluationId: number) =>
    http.get<SubmissionRowResponse[]>(`/api/v1/evaluations/${evaluationId}/submissions`),
};
