import { useEffect, useState } from "react";
import { evaluationApi, type SubmissionRowResponse } from "../../../../api/evaluationApi";

/* shadcn */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Badge } from "../../ui/badge";

export default function EvaluationSubmissionsModal({ evaluationId }: { evaluationId: number }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SubmissionRowResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    (async () => {
      setLoading(true);
      try {
        const res = await evaluationApi.listSubmissions(evaluationId);
        setItems(res.data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, evaluationId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-xl">
          Submissions
        </Button>
      </DialogTrigger>

      <DialogContent
        className="bg-background fixed top-[50%] left-[50%] z-50
                   w-[98vw] max-w-[1600px]
                   translate-x-[-50%] translate-y-[-50%]
                   grid gap-4 rounded-lg border p-6 shadow-lg"
      >

        <DialogHeader>
          <DialogTitle>Submissions — evaluation #{evaluationId}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-muted-foreground">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="text-muted-foreground">Aucune submission.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Étudiant</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Soumis</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => (
                <TableRow key={s.submissionId}>
                  <TableCell className="font-medium">{s.studentFullName}</TableCell>
                  <TableCell>{s.studentLevel}</TableCell>
                  <TableCell>{s.score ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full">
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{s.startedAt ? new Date(s.startedAt).toLocaleString() : "-"}</TableCell>
                  <TableCell>{s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
