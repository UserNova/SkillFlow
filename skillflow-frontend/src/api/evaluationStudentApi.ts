// src/api/evaluationStudentApi.ts
import { http } from "./http";
import type { EvaluationResponse } from "./evaluationApi";

/** TYPES backend - Student */
export type QuestionStudentResponse = {
  id: number;
  label: string;
  options: string[];
  position: number;
};

export type StartEvaluationRequest = {
  studentId: number;
  studentFullName: string;
  studentLevel: string;
};

export type StartEvaluationResponse = {
  submissionId: number;
  evaluationId: number;
  title: string;
  introduction?: string | null;
  startedAt: string;
  questions: QuestionStudentResponse[];
};

export type SubmitAnswersRequest = {
  studentId: number;
  answers: { questionId: number; chosenAnswer: string }[];
};

export type SubmitAnswersResponse = {
  submissionId: number;
  score: number; // 0..100
  submittedAt: string;
  status: string; // "SUBMITTED"
};

export type SubmissionAnswerDetail = {
  questionId: number;
  questionLabel: string;
  chosenAnswer: string;
  correctAnswer: string | null;
  correct: boolean;
};

export type SubmissionDetailResponse = {
  submissionId: number;
  evaluationId: number;
  evaluationTitle: string;
  activityId: number;
  prerequisiteLevel: string;
  studentId: number;
  studentFullName: string;
  studentLevel: string;
  score: number | null;
  startedAt: string;
  submittedAt: string | null;
  status: "IN_PROGRESS" | "SUBMITTED" | string;
  answers: SubmissionAnswerDetail[];
};

/** API */
export const evaluationStudentApi = {
  // ✅ IMPORTANT: name used by EvaluationsStudent.tsx must match
  listPublished: () =>
    http.get<EvaluationResponse[]>("/api/v1/evaluations/published"),

  startEvaluation: (evaluationId: number, payload: StartEvaluationRequest) =>
    http.post<StartEvaluationResponse>(
      `/api/v1/evaluations/${evaluationId}/start`,
      payload
    ),

  listStudentQuestions: (evaluationId: number) =>
    http.get<QuestionStudentResponse[]>(
      `/api/v1/evaluations/${evaluationId}/questions/student`
    ),

  submitAnswers: (submissionId: number, payload: SubmitAnswersRequest) =>
    http.post<SubmitAnswersResponse>(
      `/api/v1/submissions/${submissionId}/submit`,
      payload
    ),

  getSubmissionDetail: (submissionId: number) =>
    http.get<SubmissionDetailResponse>(`/api/v1/submissions/${submissionId}`),
};
