// src/app/components/Pages/evaluations/PassEvaluation.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { evaluationStudentApi } from "../../../../api/evaluationStudentApi";

/* shadcn */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Progress } from "../../ui/progress";
import { Separator } from "../../ui/separator";
import { Skeleton } from "../../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../../ui/alert";

import { CheckCircle2, Clock, ArrowLeft, Send } from "lucide-react";

type Question = {
  id: number;
  label: string;
  options: string[];
};

export default function PassEvaluation() {
  const { id } = useParams();
  const evaluationId = Number(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!Number.isFinite(evaluationId) || evaluationId <= 0) return;

      setLoading(true);
      setError(null);
      setSubmittedOnce(false);
      setAnswers({});
      setSubmissionId(null);

      try {
        const studentId = Number(localStorage.getItem("userId"));
        const fullName = localStorage.getItem("fullName") || "Student";
        const studentLevel = localStorage.getItem("studentLevel") || "L3";

        const startPayload = {
          studentId,
          studentFullName: fullName,
          studentLevel,
        };

        // IMPORTANT: récupérer submissionId depuis start()
        const startRes = await evaluationStudentApi.startEvaluation(evaluationId, startPayload);
        setSubmissionId(startRes.data.submissionId);

        // tu peux soit utiliser startRes.data.questions, soit l’endpoint listStudentQuestions
        // je garde listStudentQuestions pour rester compatible avec ton code existant
        const qRes = await evaluationStudentApi.listStudentQuestions(evaluationId);
        setQuestions(qRes.data ?? []);
      } catch (e: any) {
        console.error(e);
        setError(e?.response?.data?.message || "Erreur lors du chargement de l’évaluation.");
      } finally {
        setLoading(false);
      }
    })();
  }, [evaluationId]);

  const answeredCount = useMemo(
    () => Object.values(answers).filter((v) => (v ?? "").trim().length > 0).length,
    [answers]
  );

  const completion = useMemo(() => {
    const total = Math.max(questions.length, 1);
    return Math.round((answeredCount / total) * 100);
  }, [answeredCount, questions.length]);

  const onChoose = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const unanswered = useMemo(() => {
    const set = new Set(Object.keys(answers).map(Number));
    return questions.filter((q) => !set.has(q.id) || !(answers[q.id] ?? "").trim());
  }, [questions, answers]);

  const onSubmit = async () => {
    setSubmittedOnce(true);
    setError(null);

    if (!submissionId) {
      setError("submissionId introuvable. Relance l’évaluation (refresh) puis réessaie.");
      return;
    }

    try {
      setSubmitting(true);

      const studentId = Number(localStorage.getItem("userId"));

      const payload = {
        studentId,
        answers: questions.map((q) => ({
          questionId: q.id,
          chosenAnswer: (answers[q.id] ?? "").trim(),
        })),
      };

      const res = await evaluationStudentApi.submitAnswers(submissionId, payload);

      // aller vers la page résultat
      navigate(`/student/submissions/${res.data.submissionId}/result`);
    } catch (e: any) {
      console.error(e);
      setError(e?.response?.data?.message || "Erreur lors de la soumission.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" className="rounded-xl gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>

        <Badge variant="outline" className="rounded-full border-blue-200 text-blue-700 bg-blue-50">
          Évaluation #{evaluationId}
        </Badge>
      </div>

      {error && (
        <Alert>
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Passer l’évaluation</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Réponds à toutes les questions puis clique sur “Soumettre”.
          </CardDescription>

          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Progression</span>
              <span>
                {answeredCount}/{questions.length || 0}
              </span>
            </div>
            <Progress value={completion} className="mt-2" />
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-6 space-y-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <Alert>
              <AlertTitle>Aucune question</AlertTitle>
              <AlertDescription>Cette évaluation n’a pas de questions pour le moment.</AlertDescription>
            </Alert>
          ) : (
            <>
              {submittedOnce && unanswered.length > 0 && (
                <Alert>
                  <AlertTitle>Questions non répondues</AlertTitle>
                  <AlertDescription>
                    Il reste {unanswered.length} question(s) sans réponse. Tu peux quand même soumettre.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                {questions.map((q, idx) => {
                  const chosen = answers[q.id] ?? "";
                  return (
                    <div key={q.id} className="rounded-2xl border p-4 hover:bg-muted/20 transition">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Question {idx + 1}</div>
                          <div className="font-medium mt-1">{q.label}</div>
                        </div>

                        {chosen.trim() ? (
                          <Badge className="bg-green-50 text-green-700 border border-green-200 rounded-full">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Répondu
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="rounded-full">
                            Non répondu
                          </Badge>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt) => {
                          const active = chosen === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => onChoose(q.id, opt)}
                              className={[
                                "text-left px-3 py-2 rounded-xl border transition",
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

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" className="rounded-xl" onClick={() => setAnswers({})} disabled={submitting}>
                  Réinitialiser
                </Button>
                <Button className="rounded-xl gap-2" onClick={onSubmit} disabled={submitting}>
                  <Send className="w-4 h-4" />
                  {submitting ? "Envoi..." : "Soumettre"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
