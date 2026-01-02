import { useMemo, useState } from "react";
import {
  Calendar,
  Eye,
  Download,
  ListFilter,
  Plus,
  Users,
  BookOpen,
  ClipboardList,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";

/**
 * UI statique adapté au projet SkillFlow360
 * - Prof: créer une évaluation liée à une activité, ajouter QCM, consulter soumissions
 * - Étudiant: liste des évaluations + démarrer QCM + soumettre
 * - Score calculé automatiquement à partir des bonnes réponses (non visibles côté étudiant)
 */

// -------------------- Types --------------------
type Prerequisite = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type StudentLevel = "L1" | "L2" | "L3" | "M1" | "M2";

type Activity = {
  id: number;
  title: string;
  competenceCode: string;
};

type Student = {
  id: number;
  fullName: string;
  level: StudentLevel;
};

type MCQQuestion = {
  id: number;
  label: string;
  options: string[];
  correctAnswer: string; // IMPORTANT: not shown to students
};

type Evaluation = {
  id: number;
  title: string;
  prerequisite: Prerequisite;
  activityId: number;
  introduction: string;
  createdAt: string; // ISO date
  questions: MCQQuestion[];
  status: "DRAFT" | "PUBLISHED";
};

type StudentAnswer = {
  questionId: number;
  chosen: string;
};

type Submission = {
  id: number;
  evaluationId: number;
  activityId: number;
  student: Student;
  prerequisite: Prerequisite;
  startedAt: string; // ISO datetime
  submittedAt?: string; // ISO datetime
  status: "IN_PROGRESS" | "SUBMITTED";
  score?: number; // %
  answers: StudentAnswer[];
};

// -------------------- Mock Data --------------------
const mockActivities: Activity[] = [
  { id: 201, title: "TP Héritage Java", competenceCode: "COMP001" },
  { id: 202, title: "Projet Base de Données", competenceCode: "COMP002" },
  { id: 203, title: "Quiz Algorithmique", competenceCode: "COMP003" },
  { id: 204, title: "Workshop Architecture", competenceCode: "COMP004" },
];

const mockStudents: Student[] = [
  { id: 101, fullName: "Aya Hassaoui", level: "M2" },
  { id: 102, fullName: "Siham Jardi", level: "M2" },
  { id: 103, fullName: "Jean Dupont", level: "L3" },
  { id: 104, fullName: "Marie Martin", level: "M1" },
];

const initialEvaluations: Evaluation[] = [
  {
    id: 1,
    title: "QCM - Java POO (Héritage)",
    prerequisite: "BEGINNER",
    activityId: 201,
    introduction: "Répondez à toutes les questions. Une seule réponse correcte par question.",
    createdAt: "2025-12-15",
    status: "PUBLISHED",
    questions: [
      {
        id: 11,
        label: "Quel mot-clé permet d'hériter d'une classe en Java ?",
        options: ["implements", "extends", "inherit", "super"],
        correctAnswer: "extends",
      },
      {
        id: 12,
        label: "Le polymorphisme permet :",
        options: [
          "D'avoir plusieurs constructeurs uniquement",
          "D'appeler des méthodes différentes via une référence commune",
          "De créer une classe abstraite automatiquement",
          "De supprimer l'héritage",
        ],
        correctAnswer: "D'appeler des méthodes différentes via une référence commune",
      },
    ],
  },
  {
    id: 2,
    title: "QCM - Normalisation BD",
    prerequisite: "INTERMEDIATE",
    activityId: 202,
    introduction: "QCM sur les formes normales et dépendances fonctionnelles.",
    createdAt: "2025-12-18",
    status: "DRAFT",
    questions: [
      {
        id: 21,
        label: "Quelle forme normale élimine les dépendances partielles ?",
        options: ["1NF", "2NF", "3NF", "BCNF"],
        correctAnswer: "2NF",
      },
    ],
  },
];

const initialSubmissions: Submission[] = [
  {
    id: 9001,
    evaluationId: 1,
    activityId: 201,
    prerequisite: "BEGINNER",
    student: { id: 103, fullName: "Jean Dupont", level: "L3" },
    startedAt: "2025-12-20T10:05:00",
    submittedAt: "2025-12-20T10:17:00",
    status: "SUBMITTED",
    score: 100,
    answers: [
      { questionId: 11, chosen: "extends" },
      { questionId: 12, chosen: "D'appeler des méthodes différentes via une référence commune" },
    ],
  },
  {
    id: 9002,
    evaluationId: 1,
    activityId: 201,
    prerequisite: "BEGINNER",
    student: { id: 104, fullName: "Marie Martin", level: "M1" },
    startedAt: "2025-12-21T09:30:00",
    status: "IN_PROGRESS",
    answers: [{ questionId: 11, chosen: "extends" }],
  },
];

// -------------------- Helpers --------------------
function formatDateFR(dateIso: string) {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function formatDateTimeFR(dateIso: string) {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function prereqLabel(p: Prerequisite) {
  if (p === "BEGINNER") return "Beginner";
  if (p === "INTERMEDIATE") return "Intermediate";
  return "Advanced";
}

function prereqBadgeClass(p: Prerequisite) {
  if (p === "BEGINNER") return "bg-green-100 text-green-700";
  if (p === "INTERMEDIATE") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

function scoreBadgeClass(score?: number) {
  if (score == null) return "bg-gray-100 text-gray-700";
  if (score >= 80) return "bg-green-100 text-green-700";
  if (score >= 60) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

// -------------------- Dialogs --------------------
function SubmissionDetailDialog({
  submission,
  evaluation,
  activityTitle,
  onClose,
}: {
  submission: Submission;
  evaluation: Evaluation;
  activityTitle: string;
  onClose: () => void;
}) {
  const completion = useMemo(() => {
    const total = evaluation.questions.length || 1;
    const answered = submission.answers.filter((a) => a.chosen?.trim()?.length).length;
    return Math.round((answered / total) * 100);
  }, [evaluation.questions.length, submission.answers]);

  const answersMap = useMemo(() => {
    const m = new Map<number, string>();
    submission.answers.forEach((a) => m.set(a.questionId, a.chosen));
    return m;
  }, [submission.answers]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Détails de la soumission</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 bg-blue-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">Étudiant</div>
              <div className="text-xl font-semibold">{submission.student.fullName}</div>
              <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <Users className="w-4 h-4" /> Niveau : {submission.student.level}
              </div>
            </div>

            <div className="text-left md:text-right">
              <div className="text-sm text-gray-600">Score</div>
              <div className="text-3xl font-bold text-blue-700">
                {submission.score != null ? `${submission.score}%` : "—"}
              </div>
              <div className="mt-2">
                <Badge className={prereqBadgeClass(submission.prerequisite)}>
                  {prereqLabel(submission.prerequisite)}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <Label>Progression</Label>
            <div className="mt-2 flex items-center gap-3">
              <Progress value={completion} className="flex-1" />
              <span className="text-sm font-medium">{completion}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-500">Évaluation</div>
              <div className="font-medium">{evaluation.title}</div>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-500">Activité associée</div>
              <div className="font-medium">{activityTitle}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Début
              </div>
              <div className="font-medium">{formatDateTimeFR(submission.startedAt)}</div>
            </div>
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Soumission
              </div>
              <div className="font-medium">
                {submission.submittedAt ? formatDateTimeFR(submission.submittedAt) : "—"}
              </div>
            </div>
          </div>

          <div>
            <Label>Réponses (avec correction interne prof)</Label>
            <div className="mt-2 space-y-3">
              {evaluation.questions.map((q, idx) => {
                const chosen = answersMap.get(q.id) ?? "";
                const ok = chosen && chosen === q.correctAnswer;
                return (
                  <div key={q.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm text-gray-500">Q{idx + 1} • QCM</div>
                        <div className="font-medium">{q.label}</div>
                      </div>
                      <Badge className={ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                        {chosen ? (ok ? "Correct" : "Incorrect") : "Non répondu"}
                      </Badge>
                    </div>

                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded bg-gray-50 border border-gray-100">
                        <div className="text-gray-500">Réponse étudiant</div>
                        <div className="font-medium">{chosen || "—"}</div>
                      </div>
                      <div className="p-2 rounded bg-gray-50 border border-gray-100">
                        <div className="text-gray-500">Bonne réponse (visible prof)</div>
                        <div className="font-medium">{q.correctAnswer}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Télécharger rapport
            </Button>
            <Button onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StudentQuizDialog({
  evaluation,
  activityTitle,
  answers,
  onClose,
  onChoose,
  onSubmit,
}: {
  evaluation: Evaluation;
  activityTitle: string;
  answers: Record<number, string>;
  onClose: () => void;
  onChoose: (questionId: number, chosen: string) => void;
  onSubmit: () => void;
}) {
  const completion = useMemo(() => {
    const total = evaluation.questions.length || 1;
    const answered = Object.values(answers).filter((v) => v?.trim()?.length).length;
    return Math.round((answered / total) * 100);
  }, [answers, evaluation.questions.length]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Passer le QCM</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 bg-blue-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">Évaluation</div>
              <div className="text-xl font-semibold">{evaluation.title}</div>
              <div className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Activité : {activityTitle}
              </div>
              <div className="mt-2">
                <Badge className={prereqBadgeClass(evaluation.prerequisite)}>
                  {prereqLabel(evaluation.prerequisite)}
                </Badge>
              </div>
            </div>

            <div className="min-w-[220px]">
              <div className="text-sm text-gray-600">Progression</div>
              <div className="mt-2 flex items-center gap-3">
                <Progress value={completion} className="flex-1" />
                <span className="text-sm font-medium">{completion}%</span>
              </div>
            </div>
          </div>

          <div>
            <Label>Introduction</Label>
            <Textarea readOnly value={evaluation.introduction} className="mt-2" rows={3} />
          </div>

          <div className="space-y-3">
            {evaluation.questions.map((q, idx) => {
              const chosen = answers[q.id] ?? "";
              return (
                <div key={q.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="text-sm text-gray-500">Q{idx + 1} • QCM</div>
                  <div className="font-medium mt-1">{q.label}</div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt) => {
                      const active = chosen === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => onChoose(q.id, opt)}
                          className={[
                            "text-left px-3 py-2 rounded-lg border transition",
                            active ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:bg-gray-50",
                          ].join(" ")}
                        >
                          <div className="text-sm font-medium">{opt}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Quitter
            </Button>
            <Button onClick={onSubmit}>Soumettre</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// -------------------- Main Component --------------------
export function Evaluations() {
  const [tab, setTab] = useState<"prof" | "student" | "submissions">("prof");

  // state
  const [activities] = useState<Activity[]>(mockActivities);
  const [students] = useState<Student[]>(mockStudents);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(initialEvaluations);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);

  // student selection
  const [selectedStudentId, setSelectedStudentId] = useState<number>(students[0].id);
  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId)!,
    [students, selectedStudentId]
  );

  // ---------- PROF: create evaluation ----------
  const [newTitle, setNewTitle] = useState("");
  const [newPrereq, setNewPrereq] = useState<Prerequisite>("BEGINNER");
  const [newActivityId, setNewActivityId] = useState<number>(activities[0].id);
  const [newIntro, setNewIntro] = useState("");

  // question builder
  const [editingEvalId, setEditingEvalId] = useState<number | null>(null);
  const editingEval = useMemo(
    () => evaluations.find((e) => e.id === editingEvalId) ?? null,
    [evaluations, editingEvalId]
  );

  const [qLabel, setQLabel] = useState("");
  const [qOptions, setQOptions] = useState("Option A; Option B; Option C; Option D");
  const [qCorrect, setQCorrect] = useState("");

  // filters for submissions
  const [filterStudent, setFilterStudent] = useState<string>("all");

  // dialogs
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // student quiz flow
  const [activeEvalId, setActiveEvalId] = useState<number | null>(null);
  const activeEvaluation = useMemo(
    () => evaluations.find((e) => e.id === activeEvalId) ?? null,
    [evaluations, activeEvalId]
  );
  const [studentAnswers, setStudentAnswers] = useState<Record<number, string>>({});

  const activityTitle = (activityId: number) => activities.find((a) => a.id === activityId)?.title ?? "—";

  const createEvaluation = () => {
    const title = newTitle.trim();
    if (!title) return;

    const nextId = Math.max(0, ...evaluations.map((e) => e.id)) + 1;

    const ev: Evaluation = {
      id: nextId,
      title,
      prerequisite: newPrereq,
      activityId: newActivityId,
      introduction: newIntro.trim() || "—",
      createdAt: new Date().toISOString().slice(0, 10),
      status: "DRAFT",
      questions: [],
    };

    setEvaluations((prev) => [ev, ...prev]);

    setNewTitle("");
    setNewIntro("");
    setNewPrereq("BEGINNER");
    setNewActivityId(activities[0].id);
  };

  const addQuestion = () => {
    if (!editingEval) return;

    const label = qLabel.trim();
    const options = qOptions
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    const correct = qCorrect.trim();

    if (!label || options.length < 2 || !correct) return;

    const nextQId = Math.max(0, ...evaluations.flatMap((e) => e.questions.map((q) => q.id))) + 1;

    const q: MCQQuestion = {
      id: nextQId,
      label,
      options,
      correctAnswer: correct,
    };

    setEvaluations((prev) =>
      prev.map((e) => (e.id === editingEval.id ? { ...e, questions: [...e.questions, q] } : e))
    );

    setQLabel("");
    setQCorrect("");
  };

  const togglePublish = (evaluationId: number) => {
    setEvaluations((prev) =>
      prev.map((e) => {
        if (e.id !== evaluationId) return e;

        // optional rule: can't publish without questions
        if (e.status === "DRAFT" && e.questions.length === 0) return e;

        return { ...e, status: e.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" };
      })
    );
  };

  // ---------- STUDENT flow ----------
  const startQuiz = (evaluation: Evaluation) => {
    // create submission IN_PROGRESS
    const nextId = Math.max(0, ...submissions.map((s) => s.id)) + 1;
    const startedAt = new Date().toISOString();

    const sub: Submission = {
      id: nextId,
      evaluationId: evaluation.id,
      activityId: evaluation.activityId,
      prerequisite: evaluation.prerequisite,
      student: selectedStudent,
      startedAt,
      status: "IN_PROGRESS",
      answers: [],
    };

    setSubmissions((prev) => [sub, ...prev]);
    setStudentAnswers({});
    setActiveEvalId(evaluation.id);
  };

  const chooseAnswer = (questionId: number, chosen: string) => {
    setStudentAnswers((prev) => ({ ...prev, [questionId]: chosen }));
  };

  const submitQuiz = () => {
    if (!activeEvaluation) return;

    // compute score
    const total = activeEvaluation.questions.length || 1;
    let correctCount = 0;

    for (const q of activeEvaluation.questions) {
      const chosen = studentAnswers[q.id];
      if (chosen && chosen === q.correctAnswer) correctCount++;
    }

    const score = Math.round((correctCount / total) * 100);
    const submittedAt = new Date().toISOString();

    // update latest in-progress submission for this student/eval
    setSubmissions((prev) =>
      prev.map((s) => {
        if (
          s.status === "IN_PROGRESS" &&
          s.student.id === selectedStudent.id &&
          s.evaluationId === activeEvaluation.id
        ) {
          return {
            ...s,
            status: "SUBMITTED",
            submittedAt,
            score,
            answers: Object.entries(studentAnswers).map(([qid, chosen]) => ({
              questionId: Number(qid),
              chosen,
            })),
          };
        }
        return s;
      })
    );

    setActiveEvalId(null);
    setStudentAnswers({});
  };

  // ---------- Derived lists ----------
  const publishedEvaluations = useMemo(
    () => evaluations.filter((e) => e.status === "PUBLISHED"),
    [evaluations]
  );

  const submissionsForProf = useMemo(() => {
    return submissions
      .filter((s) => (filterStudent === "all" ? true : String(s.student.id) === filterStudent))
      .map((s) => ({
        ...s,
        evaluation: evaluations.find((e) => e.id === s.evaluationId),
      }))
      .filter((x) => Boolean(x.evaluation));
  }, [submissions, evaluations, filterStudent]);

  // KPIs
  const kpis = useMemo(() => {
    const total = evaluations.length;
    const published = evaluations.filter((e) => e.status === "PUBLISHED").length;
    const totalSub = submissions.length;
    const submitted = submissions.filter((s) => s.status === "SUBMITTED").length;
    return { total, published, totalSub, submitted };
  }, [evaluations, submissions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Évaluations</h2>
        <p className="text-gray-500 mt-1">
          UI statique adaptée à ton microservice (Prof / Étudiant) — QCM uniquement — score auto — soumissions visibles côté prof
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full">
          <TabsTrigger value="prof" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Prof • Créer & Gérer
          </TabsTrigger>
          <TabsTrigger value="student" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Étudiant • Passer QCM
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Prof • Soumissions
          </TabsTrigger>
        </TabsList>

        {/* -------------------- PROF: Create + Questions -------------------- */}
        <TabsContent value="prof" className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total évaluations</CardDescription>
                <CardTitle className="text-2xl">{kpis.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Publiées</CardDescription>
                <CardTitle className="text-2xl">{kpis.published}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total soumissions</CardDescription>
                <CardTitle className="text-2xl">{kpis.totalSub}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Soumises</CardDescription>
                <CardTitle className="text-2xl">{kpis.submitted}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Create Evaluation */}
          <Card>
            <CardHeader>
              <CardTitle>Créer une évaluation (liée à une activité)</CardTitle>
              <CardDescription>
                Title + prerequis + activité (liste) + introduction. Ensuite ajouter des questions QCM.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Titre</Label>
                <Input className="mt-1" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: QCM Java POO" />
              </div>

              <div>
                <Label>Prérequis</Label>
                <Select value={newPrereq} onValueChange={(v) => setNewPrereq(v as Prerequisite)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label>Activité (depuis la base / liste)</Label>
                <Select value={String(newActivityId)} onValueChange={(v) => setNewActivityId(Number(v))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activities.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.title} • {a.competenceCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label>Introduction</Label>
                <Textarea className="mt-1" value={newIntro} onChange={(e) => setNewIntro(e.target.value)} rows={3} placeholder="Petite introduction / consignes..." />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button onClick={createEvaluation}>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer l’évaluation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Evaluations list */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Évaluations</CardTitle>
                  <CardDescription>Publier/Dépublier + ajouter des questions QCM.</CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Activité</TableHead>
                    <TableHead>Prérequis</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-56">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evaluations.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.title}</TableCell>
                      <TableCell>{activityTitle(e.activityId)}</TableCell>
                      <TableCell>
                        <Badge className={prereqBadgeClass(e.prerequisite)}>{prereqLabel(e.prerequisite)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{e.questions.length}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDateFR(e.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline" onClick={() => setEditingEvalId(e.id)}>
                            Ajouter QCM
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => togglePublish(e.id)}
                            disabled={e.status === "DRAFT" && e.questions.length === 0}
                            title={e.status === "DRAFT" && e.questions.length === 0 ? "Ajoute au moins 1 question avant publier" : undefined}
                          >
                            {e.status === "PUBLISHED" ? "Dépublier" : "Publier"}
                          </Button>
                          <Badge className={e.status === "PUBLISHED" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}>
                            {e.status === "PUBLISHED" ? "Publiée" : "Brouillon"}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* QCM Builder panel */}
              {editingEval && (
                <div className="mt-6 border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="text-sm text-gray-500">Ajouter QCM à</div>
                      <div className="text-lg font-semibold">{editingEval.title}</div>
                      <div className="text-sm text-gray-500 mt-1">Activité : {activityTitle(editingEval.activityId)}</div>
                    </div>
                    <Button variant="outline" onClick={() => setEditingEvalId(null)}>
                      Fermer
                    </Button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-3">
                      <Label>Question (QCM)</Label>
                      <Input className="mt-1" value={qLabel} onChange={(e) => setQLabel(e.target.value)} placeholder="Écrire l'énoncé..." />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Options (séparées par “;”)</Label>
                      <Input className="mt-1" value={qOptions} onChange={(e) => setQOptions(e.target.value)} />
                    </div>

                    <div>
                      <Label>Bonne réponse (stockée pour calcul score)</Label>
                      <Input className="mt-1" value={qCorrect} onChange={(e) => setQCorrect(e.target.value)} placeholder="Doit correspondre à une option" />
                    </div>

                    <div className="md:col-span-3 flex justify-end">
                      <Button onClick={addQuestion}>Ajouter la question</Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Questions existantes</Label>
                    <div className="mt-2 space-y-2">
                      {editingEval.questions.length === 0 ? (
                        <div className="text-sm text-gray-500">Aucune question pour l’instant.</div>
                      ) : (
                        editingEval.questions.map((q, idx) => (
                          <div key={q.id} className="p-3 border border-gray-200 rounded-lg">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm text-gray-500">Q{idx + 1} • QCM</div>
                                <div className="font-medium">{q.label}</div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Options: {q.options.join(" • ")}
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                Bonne: {q.correctAnswer}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------- STUDENT: list + start -------------------- */}
        <TabsContent value="student" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Espace étudiant</CardTitle>
              <CardDescription>Liste des évaluations publiées + Démarrer (QCM uniquement).</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Étudiant</Label>
                <Select value={String(selectedStudentId)} onValueChange={(v) => setSelectedStudentId(Number(v))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.fullName} • {s.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex items-end justify-end">
                <Badge variant="secondary" className="text-sm">
                  Statique • pas de backend
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Évaluations disponibles</CardTitle>
              <CardDescription>Colonnes demandées : titre, activité, nb questions, date, action (démarrer).</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Activité</TableHead>
                    <TableHead>Nb questions</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-40">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publishedEvaluations.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.title}</TableCell>
                      <TableCell>{activityTitle(e.activityId)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{e.questions.length}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {formatDateFR(e.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => startQuiz(e)}
                          disabled={e.questions.length === 0}
                          title={e.questions.length === 0 ? "Évaluation vide" : undefined}
                        >
                          Démarrer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-3 text-sm text-gray-500">
                NB: La bonne réponse n'est jamais affichée côté étudiant — seulement utilisée pour calculer le score.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* -------------------- PROF: submissions -------------------- */}
        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ListFilter className="w-5 h-5 text-gray-500" />
                <CardTitle>Filtres</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Étudiant</Label>
                <Select value={filterStudent} onValueChange={setFilterStudent}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Soumissions</CardTitle>
                  <CardDescription>
                    Liste: Nom étudiant, évaluation, activité associée, score, prerequis, niveau, début, soumission.
                  </CardDescription>
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Étudiant</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Évaluation</TableHead>
                    <TableHead>Activité</TableHead>
                    <TableHead>Prérequis</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Début</TableHead>
                    <TableHead>Soumission</TableHead>
                    <TableHead className="w-20">Voir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissionsForProf.map((s) => {
                    const ev = s.evaluation!;
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.student.fullName}</TableCell>
                        <TableCell>{s.student.level}</TableCell>
                        <TableCell>{ev.title}</TableCell>
                        <TableCell>{activityTitle(s.activityId)}</TableCell>
                        <TableCell>
                          <Badge className={prereqBadgeClass(s.prerequisite)}>{prereqLabel(s.prerequisite)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={scoreBadgeClass(s.score)}>
                            {s.score != null ? `${s.score}%` : "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDateTimeFR(s.startedAt)}</TableCell>
                        <TableCell>{s.submittedAt ? formatDateTimeFR(s.submittedAt) : "—"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedSubmission(s)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Student Quiz Dialog */}
      {activeEvaluation && (
        <StudentQuizDialog
          evaluation={activeEvaluation}
          activityTitle={activityTitle(activeEvaluation.activityId)}
          answers={studentAnswers}
          onClose={() => setActiveEvalId(null)}
          onChoose={chooseAnswer}
          onSubmit={submitQuiz}
        />
      )}

      {/* Submission Details (Prof) */}
      {selectedSubmission && (
        <SubmissionDetailDialog
          submission={selectedSubmission}
          evaluation={evaluations.find((e) => e.id === selectedSubmission.evaluationId)!}
          activityTitle={activityTitle(selectedSubmission.activityId)}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
}
