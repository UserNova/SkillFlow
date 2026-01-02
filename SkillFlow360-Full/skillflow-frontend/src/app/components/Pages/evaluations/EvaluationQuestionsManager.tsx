import { useEffect, useState } from "react";
import { evaluationApi, type QuestionProfessorResponse } from "../../../../api/evaluationApi";

/* shadcn */
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Separator } from "../../ui/separator";

export default function EvaluationQuestionsManager({ evaluationId }: { evaluationId: number }) {
  const [items, setItems] = useState<QuestionProfessorResponse[]>([]);
  const [label, setLabel] = useState("");
  const [optionsText, setOptionsText] = useState("oui, non, aucun");
  const [correctAnswer, setCorrectAnswer] = useState("oui");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await evaluationApi.listQuestionsProf(evaluationId);
      setItems(res.data ?? []);
    } catch {
      setErr("Erreur chargement questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluationId]);

  const add = async () => {
    const opts = optionsText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (!label.trim()) return setErr("Question obligatoire.");
    if (opts.length < 2) return setErr("Au moins 2 options.");
    if (!opts.includes(correctAnswer.trim())) return setErr("Correct answer doit être dans options.");

    setLoading(true);
    setErr(null);
    try {
      await evaluationApi.addQuestion(evaluationId, {
        label: label.trim(),
        options: opts,
        correctAnswer: correctAnswer.trim(),
      });
      setLabel("");
      await load();
    } catch {
      setErr("Erreur ajout question (backend).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-4 space-y-3">
        <div className="font-medium">Ajouter question</div>
        {err && <div className="text-sm text-red-600">{err}</div>}

        <div className="space-y-2">
          <Label>Question</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Test 1" />
        </div>

        <div className="space-y-2">
          <Label>Options (séparées par virgule)</Label>
          <Input value={optionsText} onChange={(e) => setOptionsText(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Correct Answer</Label>
          <Input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} />
        </div>

        <div className="flex justify-end">
          <Button className="rounded-xl" onClick={add} disabled={loading}>
            {loading ? "..." : "Ajouter"}
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="font-medium">Questions ({items.length})</div>

        {items.length === 0 ? (
          <div className="text-muted-foreground">Aucune question.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Options</TableHead>
                <TableHead>Correct</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>{q.position}</TableCell>
                  <TableCell className="font-medium">{q.label}</TableCell>
                  <TableCell className="space-x-1">
                    {(q.options ?? []).map((o) => (
                      <Badge key={o} variant="outline" className="rounded-full">
                        {o}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Badge className="rounded-full bg-green-50 text-green-700 border border-green-200">
                      {q.correctAnswer}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
