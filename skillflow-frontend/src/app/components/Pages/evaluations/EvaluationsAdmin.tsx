import { useEffect, useMemo, useState } from "react";
import { evaluationApi, type EvaluationResponse, type PrerequisiteLevel } from "../../../../api/evaluationApi";
import { getActivities, type ActivityDto } from "../../../../api/activityApi";

/* shadcn */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Skeleton } from "../../ui/skeleton";

import EvaluationQuestionsManager from "./EvaluationQuestionsManager";
import EvaluationSubmissionsModal from "./EvaluationSubmissionsModal";

const LEVELS: PrerequisiteLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

export default function EvaluationsAdmin() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<EvaluationResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ✅ activities list
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityDto[]>([]);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [activityId, setActivityId] = useState<string>(""); // keep as string for Select
  const [prereq, setPrereq] = useState<PrerequisiteLevel>("BEGINNER");
  const [intro, setIntro] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await evaluationApi.listAll();
      setItems(res.data ?? []);
    } catch (e: any) {
      console.error(e);
      setError("Erreur serveur: /api/v1/evaluations");
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    setActivitiesLoading(true);
    setActivitiesError(null);
    try {
      const res = await getActivities();
      setActivities(res.data ?? []);
    } catch (e: any) {
      console.error(e);
      setActivitiesError("⚠️ Aucune activité trouvée. Ajoute d’abord des activités (microservice Activities).");
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
    loadAll();
  }, []);

  // ✅ map activityId -> activityTitle
  const activityTitleById = useMemo(() => {
    const m = new Map<number, string>();
    for (const a of activities) m.set(a.id, a.title);
    return m;
  }, [activities]);

  const create = async () => {
    const t = title.trim();
    const aId = Number(activityId);

    if (!t || !activityId) return;

    await evaluationApi.create({
      title: t,
      activityId: aId,
      prerequisiteLevel: prereq,
      introduction: intro,
    });

    setTitle("");
    setActivityId("");
    setIntro("");
    await loadAll();
  };

  const togglePublish = async (e: EvaluationResponse) => {
    await evaluationApi.publish(e.id, e.status !== "PUBLISHED");
    await loadAll();
  };

  const deleteEval = async (id: number) => {
    await evaluationApi.delete(id);
    await loadAll();
  };

  const stats = useMemo(() => {
    const published = items.filter((i) => i.status === "PUBLISHED").length;
    return { total: items.length, published };
  }, [items]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold">Liste des évaluations</div>
          <div className="text-sm text-muted-foreground">
            Publier/dépublier, gérer QCM, supprimer, submissions.
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="rounded-full">
            Total: {stats.total}
          </Badge>
          <Badge variant="outline" className="rounded-full">
            Publiées: {stats.published}
          </Badge>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Créer une évaluation</CardTitle>
          <CardDescription>title + activity (liste) + prerequisite + introduction</CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Titre</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: QCM Réseau" />
          </div>

          <div className="space-y-2">
            <Label>Activité</Label>

            {activitiesLoading ? (
              <Skeleton className="h-10 rounded-xl" />
            ) : activitiesError ? (
              <div className="text-sm text-amber-600">{activitiesError}</div>
            ) : (
              <Select value={activityId} onValueChange={setActivityId}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Choisir une activité..." />
                </SelectTrigger>
                <SelectContent>
                  {activities.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      #{a.id} — {a.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Prerequisite</Label>
            <Select value={prereq} onValueChange={(v) => setPrereq(v as PrerequisiteLevel)}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Choisir" />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Introduction</Label>
            <Textarea value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="Petite introduction..." />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button className="rounded-xl" onClick={create} disabled={!title.trim() || !activityId}>
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Évaluations</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-muted-foreground text-center py-10">Aucune évaluation.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Prereq</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>QCM</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((e) => {
                  const activityTitle = activityTitleById.get(e.activityId) ?? `#${e.activityId}`;
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.id}</TableCell>
                      <TableCell>{e.title}</TableCell>

                      {/* ✅ show title instead of id */}
                      <TableCell className="font-medium">{activityTitle}</TableCell>

                      <TableCell>
                        <Badge variant="outline" className="rounded-full">
                          {e.prerequisiteLevel}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={`rounded-full ${
                            e.status === "PUBLISHED"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-gray-50 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {e.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-xl">
                              Gérer
                            </Button>
                          </DialogTrigger>

                          {/* ✅ wider modal */}
                          <DialogContent className="w-[95vw] max-w-6xl">
                            <DialogHeader>
                              <DialogTitle>QCM — {e.title}</DialogTitle>
                            </DialogHeader>
                            <EvaluationQuestionsManager evaluationId={e.id} />
                          </DialogContent>
                        </Dialog>
                      </TableCell>

                      <TableCell className="text-right space-x-2">
                        <Button className="rounded-xl" variant="outline" onClick={() => togglePublish(e)}>
                          {e.status === "PUBLISHED" ? "Dépublier" : "Publier"}
                        </Button>

                        <EvaluationSubmissionsModal evaluationId={e.id} />

                        <Button className="rounded-xl" variant="destructive" onClick={() => deleteEval(e.id)}>
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
