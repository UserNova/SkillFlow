import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { evaluationStudentApi } from "../../../../api/evaluationStudentApi";
import type { EvaluationResponse } from "../../../../api/evaluationApi";

/* shadcn */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Skeleton } from "../../ui/skeleton";

export default function EvaluationsStudent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<EvaluationResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await evaluationStudentApi.listPublished();
        setItems(res.data ?? []);
      } catch {
        setError("Erreur de chargement des évaluations publiées.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="text-2xl font-semibold">Évaluations</div>
        <div className="text-sm text-muted-foreground">Choisis une évaluation puis clique “Commencer”.</div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : error ? (
        <Card className="rounded-2xl"><CardContent className="py-8 text-center text-red-600">{error}</CardContent></Card>
      ) : items.length === 0 ? (
        <Card className="rounded-2xl"><CardContent className="py-10 text-center text-muted-foreground">Aucune évaluation publiée.</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((e) => (
            <Card key={e.id} className="rounded-2xl">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle>{e.title}</CardTitle>
                    <CardDescription>Activité #{e.activityId}</CardDescription>
                  </div>
                  <Badge className="rounded-full">{e.prerequisiteLevel}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground line-clamp-2">{e.introduction || "—"}</div>
                <Button className="rounded-xl w-full" onClick={() => navigate(`/student/evaluations/${e.id}`)}>
                  Commencer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
