import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import { CheckCircle2, XCircle, RotateCcw, ArrowLeft } from "lucide-react";

export default function EvaluationResult({
  score,
  maxScore,
  onRetry,
  onBack,
}: {
  score: number;
  maxScore: number;
  onRetry?: () => void;
  onBack?: () => void;
}) {
  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  const status =
    pct >= 80 ? { label: "Réussi", cls: "bg-green-50 text-green-700 border-green-200", icon: <CheckCircle2 className="w-4 h-4 mr-1" /> } :
    pct >= 60 ? { label: "À améliorer", cls: "bg-orange-50 text-orange-700 border-orange-200", icon: <RotateCcw className="w-4 h-4 mr-1" /> } :
    { label: "Échoué", cls: "bg-red-50 text-red-700 border-red-200", icon: <XCircle className="w-4 h-4 mr-1" /> };

  return (
    <div className="p-6">
      <Card className="rounded-2xl max-w-2xl mx-auto shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">Résultat</CardTitle>
              <CardDescription>Voici ton score pour cette évaluation.</CardDescription>
            </div>

            <Badge variant="outline" className={`rounded-full border ${status.cls}`}>
              {status.icon}
              {status.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-2xl border p-4">
            <div className="flex items-end justify-between">
              <div className="text-sm text-muted-foreground">Score</div>
              <div className="text-3xl font-semibold">
                {score} <span className="text-muted-foreground text-base">/ {maxScore}</span>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Performance</span>
                <span>{pct}%</span>
              </div>
              <Progress value={pct} className="mt-2" />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {onBack && (
              <Button variant="outline" className="rounded-xl gap-2" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            )}
            {onRetry && (
              <Button className="rounded-xl gap-2" onClick={onRetry}>
                <RotateCcw className="w-4 h-4" />
                Refaire l’évaluation
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
