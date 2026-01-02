import { useEffect, useMemo, useState } from "react";
import {
  createActivity,
  deleteActivity,
  getActivities,
  updateActivity,
  type ActivityDto,
  type ActivityLevel,
  type ActivityType,
} from "../../../../api/activityApi";
import { getCompetences, type CompetenceDto } from "../../../../api/competenceApi";

/* shadcn */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Label } from "../../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";

/* icons */
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";

/* detail */
import ActivityDetail from "./ActivityDetail";

/* ================= CONSTS ================= */
const ACTIVITY_TYPES: ActivityType[] = ["EXERCICE", "TP", "QUIZ", "PROJET"];
const LEVELS: ActivityLevel[] = ["EASY", "MEDIUM", "HARD"];

function typeBadgeClass(type: ActivityType) {
  if (type === "PROJET") return "bg-amber-50 text-amber-800 border-amber-200";
  if (type === "QUIZ") return "bg-violet-50 text-violet-700 border-violet-200";
  if (type === "EXERCICE") return "bg-sky-50 text-sky-700 border-sky-200";
  return "bg-blue-50 text-blue-700 border-blue-200"; // TP
}

function levelBadgeClass(level: ActivityLevel) {
  if (level === "HARD") return "bg-red-50 text-red-700 border-red-200";
  if (level === "MEDIUM") return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-green-50 text-green-700 border-green-200";
}

function levelLabel(l: ActivityLevel) {
  return l === "EASY" ? "Easy" : l === "MEDIUM" ? "Medium" : "Hard";
}

function typeLabel(t: ActivityType) {
  return t === "EXERCICE" ? "Exercice" : t === "TP" ? "TP" : t === "QUIZ" ? "Quiz" : "Projet";
}

export default function ActivitesAdmin() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityDto[]>([]);
  const [competences, setCompetences] = useState<CompetenceDto[]>([]);

  /* detail */
  const [selected, setSelected] = useState<ActivityDto | null>(null);

  /* dialog add/edit */
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ActivityDto | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ActivityType>("EXERCICE");
  const [duration, setDuration] = useState<number>(1);
  const [level, setLevel] = useState<ActivityLevel>("MEDIUM");
  const [competenceId, setCompetenceId] = useState<number | "">("");

  const competenceNameById = useMemo(() => {
    const map = new Map<number, string>();
    competences.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [competences]);

  const resetForm = () => {
    setEditing(null);
    setTitle("");
    setDescription("");
    setType("EXERCICE");
    setDuration(1);
    setLevel("MEDIUM");
    setCompetenceId("");
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [aRes, cRes] = await Promise.all([getActivities(), getCompetences()]);
      setActivities(aRes.data ?? []);
      setCompetences(cRes.data ?? []);
    } catch (e) {
      console.error("LOAD ERROR:", e);
      alert("Erreur chargement activités/compétences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openAdd = () => {
    resetForm();
    setOpenForm(true);
  };

  const openEdit = (a: ActivityDto) => {
    setEditing(a);
    setTitle(a.title);
    setDescription(a.description ?? "");
    setType(a.type);
    setDuration(a.duration ?? 1);
    setLevel(a.level);
    setCompetenceId(a.competenceId);
    setOpenForm(true);
  };

  const submitForm = async () => {
    if (!title.trim()) return alert("Titre obligatoire");
    if (!competenceId) return alert("Choisis une compétence");
    if (!duration || duration < 1) return alert("Durée >= 1");

    const payload = {
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      type,
      duration,
      level,
      competenceId: Number(competenceId),
    };

    try {
      if (editing) {
        await updateActivity(editing.id, payload);
      } else {
        await createActivity(payload);
      }
      setOpenForm(false);
      resetForm();
      await loadAll();
    } catch (e: any) {
      console.error("SAVE ERROR:", e);
      const status = e?.response?.status;
      const data = e?.response?.data;

      alert(
        `Erreur lors de l’enregistrement\nStatus: ${status ?? "?"}\nResponse: ${
          typeof data === "string" ? data : JSON.stringify(data)
        }`
      );
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Supprimer cette activité ?")) return;
    try {
      await deleteActivity(id);
      await loadAll();
    } catch (e: any) {
      console.error("DELETE ERROR:", e);
      const status = e?.response?.status;
      const data = e?.response?.data;

      alert(
        `Erreur suppression\nStatus: ${status ?? "?"}\nResponse: ${
          typeof data === "string" ? data : JSON.stringify(data)
        }`
      );
    }
  };

  /* ✅ switch to detail page */
  if (selected) {
    return (
      <ActivityDetail
        activity={selected}
        onBack={async () => {
          setSelected(null);
          await loadAll();
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="shadow-sm border-muted/60">
        <CardHeader>
          <CardTitle className="text-2xl">Activités</CardTitle>
          <CardDescription>Gérer les activités + ressources.</CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-sm border-muted/60">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold">Liste des activités</CardTitle>
            <CardDescription className="text-xs"></CardDescription>
          </div>

          <Button onClick={openAdd} className="rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une activité
          </Button>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[28%]">Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Compétence</TableHead>
                  <TableHead className="text-center w-[90px]">Durée</TableHead>
                  <TableHead className="text-center w-[120px]">Niveau</TableHead>
                  <TableHead className="text-right w-[170px]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-sm text-muted-foreground py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                )}

                {!loading && activities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-sm text-muted-foreground py-8">
                      Aucune activité
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  activities.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.title}</TableCell>

                      <TableCell>
                        <Badge variant="outline" className={`rounded-full ${typeBadgeClass(a.type)}`}>
                          {typeLabel(a.type)}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {competenceNameById.get(a.competenceId) ?? `#${a.competenceId}`}
                      </TableCell>

                      <TableCell className="text-center">{a.duration}</TableCell>

                      <TableCell className="text-center">
                        <Badge variant="outline" className={`rounded-full ${levelBadgeClass(a.level)}`}>
                          {levelLabel(a.level)}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* ✅ Voir -> ouvre détail */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            title="Voir"
                            onClick={() => setSelected(a)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            title="Modifier"
                            onClick={() => openEdit(a)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <Button
                            size="icon"
                            className="h-9 w-9 bg-red-600 hover:bg-red-700 text-white"
                            title="Supprimer"
                            onClick={() => onDelete(a.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={openForm}
        onOpenChange={(v) => {
          setOpenForm(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier une activité" : "Ajouter une activité"}</DialogTitle>
            <DialogDescription>Renseigne les informations de l’activité (lié à une compétence).</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Titre</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: TP Héritage Java" />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optionnel..." />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value as ActivityType)}
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {typeLabel(t)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Niveau</Label>
              <select
                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                value={level}
                onChange={(e) => setLevel(e.target.value as ActivityLevel)}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {levelLabel(l)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Durée (h)</Label>
              <Input type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>

            <div className="space-y-2">
              <Label>Compétence</Label>
              <select
                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                value={competenceId}
                onChange={(e) => setCompetenceId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">-- Choisir --</option>
                {competences.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpenForm(false);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button onClick={submitForm}>{editing ? "Enregistrer" : "Créer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
