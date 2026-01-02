// src/app/components/Pages/evaluations/StudentResultPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { evaluationStudentApi, SubmissionDetailResponse } from "../../../../api/evaluationStudentApi";

import EvaluationResult from "./EvaluationResult";

/* shadcn */
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Skeleton } from "../../ui/skeleton";

import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";

export default function StudentResultPage() {
  const { submissionId } = useParams();
  const sid = Number(submissionId);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SubmissionDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!Number.isFinite(sid) || sid <= 0) return;

      setLoading(true);
      setError(null);

      try {
        const res = await evaluationStudentApi.getSubmissionDetail(sid);
        setData(res.data);
      } catch (e: any) {
        console.error(e);
        setError(e?.response?.data?.message || "Erreur lors du chargement du résultat.");
      } finally {
        setLoading(false);
      }
    })();
  }, [sid]);

  const maxScore = 100;

  const score = data?.score ?? 0;

  const correctCount = useMemo(() => {
    if (!data?.answers) return 0;
    return data.answers.filter((a) => a.correct).length;
  }, [data]);

  const total = data?.answers?.length ?? 0;
  const pointsPerQuestion = total > 0 ? Math.round(100 / total) : 0;

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="outline" className="rounded-xl gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" className="rounded-xl gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>

        <Badge variant="outline" className="rounded-full">
          Submission #{data.submissionId}
        </Badge>
      </div>

      <EvaluationResult
        score={score}
        maxScore={maxScore}
        onBack={() => navigate("/evaluations-student")}
        onRetry={() => navigate(`/student/evaluations/${data.evaluationId}`)}
      />

      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg">Détails des réponses</CardTitle>
          <div className="text-sm text-muted-foreground">
            {correctCount}/{total} correct • {pointsPerQuestion} pts / question
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {data.answers.map((a, idx) => (
            <div key={a.questionId} className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">Q{idx + 1}</div>
                  <div className="font-medium mt-1">{a.questionLabel}</div>
                </div>

                {a.correct ? (
                  <Badge className="rounded-full bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Correct
                  </Badge>
                ) : (
                  <Badge className="rounded-full bg-red-50 text-red-700 border border-red-200">
                    <XCircle className="w-4 h-4 mr-1" /> Faux
                  </Badge>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border p-3">
                  <div className="text-muted-foreground">Ta réponse</div>
                  <div className="font-medium mt-1">{a.chosenAnswer?.trim() ? a.chosenAnswer : "— (non répondu)"}</div>
                </div>

                <div className="rounded-xl border p-3">
                  <div className="text-muted-foreground">Bonne réponse</div>
                  <div className="font-medium mt-1">{a.correctAnswer ?? "—"}</div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
