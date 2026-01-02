import { useEffect, useMemo, useState } from "react";
import {
  createCompetence,
  createLevel,
  createPrerequisite,
  createResource,
  createSubCompetence,
  deleteCompetence,
  deleteLevel,
  deletePrerequisite,
  deleteResource,
  deleteSubCompetence,
  getCompetences,
  getLevelsByCompetence,
  getPrerequisites,
  getResourcesByCompetence,
  getSubCompetencesByCompetence,
  updateCompetence,
  updateLevel,
  updatePrerequisite,
  updateResource,
  updateSubCompetence,
  type CompetenceDto,
  type LevelDto,
  type PrerequisiteDto,
  type ResourceDto,
  type SubCompetenceDto,
} from "../../../api/competenceApi";

import { Plus, Eye, Pencil, Trash2, ExternalLink, ArrowLeft, Save } from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

/** ✅ Level types from backend enum (BLOOM / CEFR / INTERNE) */
const LEVEL_TYPES = ["BLOOM", "CEFR", "INTERNE"] as const;
type LevelType = (typeof LEVEL_TYPES)[number];

function normalizeLevelType(v: string): LevelType | null {
  const up = (v ?? "").trim().toUpperCase();
  return (LEVEL_TYPES as readonly string[]).includes(up) ? (up as LevelType) : null;
}

/** ✅ Prerequisite types (OBLIGATOIRE / RECOMMANDE) */
const PREREQ_TYPES = ["OBLIGATOIRE", "RECOMMANDE"] as const;
type PrereqType = (typeof PREREQ_TYPES)[number];

function normalizePrereqType(v: string): PrereqType | null {
  const up = (v ?? "").trim().toUpperCase();
  return (PREREQ_TYPES as readonly string[]).includes(up) ? (up as PrereqType) : null;
}

function selectClassName() {
  return "mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2";
}

function IconButton({
  onClick,
  children,
  title,
  disabled,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className="h-9 w-9 rounded-lg hover:bg-muted/60"
      aria-label={title}
      title={title}
    >
      {children}
    </Button>
  );
}

/* -------------------- Detail Component -------------------- */
type Mode = "view" | "edit";

export function CompetenceDetail({
  competence,
  mode,
  onBack,
}: {
  competence: CompetenceDto;
  mode: Mode;
  onBack: () => void;
}) {
  const isEdit = mode === "edit";
  const [loading, setLoading] = useState(true);

  // loaded lists
  const [subCompetences, setSubCompetences] = useState<SubCompetenceDto[]>([]);
  const [levels, setLevels] = useState<LevelDto[]>([]);
  const [resources, setResources] = useState<ResourceDto[]>([]);
  const [prerequisites, setPrerequisites] = useState<PrerequisiteDto[]>([]);

  // local editable competence
  const [editCode, setEditCode] = useState(competence.code);
  const [editName, setEditName] = useState(competence.name);
  const [editDescription, setEditDescription] = useState(competence.description ?? "");

  // create forms
  const [scName, setScName] = useState("");
  const [scDesc, setScDesc] = useState("");

  const [lvlType, setLvlType] = useState<LevelType>("BLOOM");
  const [lvlLabel, setLvlLabel] = useState("");
  const [lvlDesc, setLvlDesc] = useState("");

  const [resTitle, setResTitle] = useState("");
  const [resUrl, setResUrl] = useState("");

  const [preSourceId, setPreSourceId] = useState<number>(competence.id);
  const [preTargetId, setPreTargetId] = useState<number>(competence.id);
  const [preType, setPreType] = useState<PrereqType>("OBLIGATOIRE");

  // all competences list (for prerequisites helper text)
  const [allCompetences, setAllCompetences] = useState<CompetenceDto[]>([]);

  const reloadAll = async () => {
    setLoading(true);
    try {
      const [scRes, lvlRes, resRes, preRes, compsRes] = await Promise.all([
        getSubCompetencesByCompetence(competence.id),
        getLevelsByCompetence(competence.id),
        getResourcesByCompetence(competence.id),
        getPrerequisites(),
        getCompetences(),
      ]);

      setSubCompetences(scRes.data ?? []);
      setLevels(lvlRes.data ?? []);
      setResources(resRes.data ?? []);
      setAllCompetences(compsRes.data ?? []);

      const allPre = preRes.data ?? [];
      const filtered = allPre.filter((p) => p.source?.id === competence.id || p.target?.id === competence.id);
      setPrerequisites(filtered);
    } catch (e) {
      console.error("Erreur load detail:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [competence.id]);

  const competenceNameById = useMemo(() => {
    const map = new Map<number, string>();
    allCompetences.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [allCompetences]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-gradient-to-b from-blue-50/70 to-white p-5 sm:p-6 shadow-sm">
        <Button variant="ghost" onClick={onBack} className="mb-4 rounded-xl hover:bg-muted/60">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">{competence.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Code: <span className="font-mono">{competence.code}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full border-blue-200 text-blue-700 bg-blue-50">
              {isEdit ? "Mode édition" : "Mode lecture"}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="informations" className="space-y-4">
        <TabsList className="w-full justify-start gap-2 rounded-2xl bg-muted/40 p-2">
          <TabsTrigger value="informations" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Informations
          </TabsTrigger>
          <TabsTrigger value="sous-competences" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Sous-compétences
          </TabsTrigger>
          <TabsTrigger value="niveaux" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Niveaux
          </TabsTrigger>
          <TabsTrigger value="prerequis" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Prérequis
          </TabsTrigger>
          <TabsTrigger value="ressources" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Ressources
          </TabsTrigger>
        </TabsList>

        {/* ---------------- Informations ---------------- */}
        <TabsContent value="informations">
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>{isEdit ? "Modifier la compétence" : "Détails de la compétence"}</CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Code</Label>
                  <Input
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    readOnly={!isEdit}
                    className="mt-1 h-10"
                  />
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    readOnly={!isEdit}
                    className="mt-1 h-10"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  readOnly={!isEdit}
                  className="mt-1"
                  rows={4}
                  placeholder="Décrivez la compétence…"
                />
              </div>

              {isEdit && (
                <div className="flex justify-end">
                  <Button
                    disabled={loading}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700"
                    onClick={async () => {
                      try {
                        await updateCompetence(competence.id, {
                          code: editCode.trim(),
                          name: editName.trim(),
                          description: editDescription.trim(),
                        });
                        alert("Compétence modifiée ✅");
                      } catch (e) {
                        console.error(e);
                        alert("Erreur modification compétence");
                      }
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Sous-compétences ---------------- */}
        <TabsContent value="sous-competences">
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Sous-compétences</CardTitle>
                  <CardDescription>Associées à cette compétence</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {isEdit && (
                <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Nom</Label>
                      <Input value={scName} onChange={(e) => setScName(e.target.value)} className="mt-1 h-10" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Input value={scDesc} onChange={(e) => setScDesc(e.target.value)} className="mt-1 h-10" />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      disabled={loading}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700"
                      onClick={async () => {
                        try {
                          if (!scName.trim()) return alert("Nom obligatoire");
                          await createSubCompetence({
                            name: scName.trim(),
                            description: scDesc.trim(),
                            competence: { id: competence.id },
                          });
                          setScName("");
                          setScDesc("");
                          await reloadAll();
                        } catch (e) {
                          console.error(e);
                          alert("Erreur ajout sous-compétence");
                        }
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-gray-500">Chargement...</div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Nom</TableHead>
                        <TableHead>Description</TableHead>
                        {isEdit && <TableHead className="w-32 text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subCompetences.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={isEdit ? 3 : 2} className="text-center text-gray-500 py-10">
                            Aucune sous-compétence trouvée.
                          </TableCell>
                        </TableRow>
                      ) : (
                        subCompetences.map((sc, idx) => (
                          <TableRow
                            key={sc.id}
                            className={`${idx % 2 === 0 ? "bg-white" : "bg-muted/10"} hover:bg-muted/30`}
                          >
                            <TableCell className="font-medium">{sc.name ?? "—"}</TableCell>
                            <TableCell className="text-gray-600">{sc.description ?? "—"}</TableCell>
                            {isEdit && (
                              <TableCell className="text-right">
                                <div className="inline-flex gap-1">
                                  <IconButton
                                    disabled={loading}
                                    title="Modifier"
                                    onClick={async () => {
                                      const newName = prompt("Nom :", sc.name ?? "");
                                      if (newName === null) return;
                                      const newDesc = prompt("Description :", sc.description ?? "") ?? "";
                                      try {
                                        await updateSubCompetence(sc.id!, {
                                          name: newName,
                                          description: newDesc,
                                        });
                                        await reloadAll();
                                      } catch (e) {
                                        console.error(e);
                                        alert("Erreur update sous-compétence");
                                      }
                                    }}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </IconButton>

                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    disabled={loading}
                                    className="h-9 w-9 rounded-lg"
                                    title="Supprimer"
                                    onClick={async () => {
                                      if (!confirm("Supprimer cette sous-compétence ?")) return;
                                      try {
                                        await deleteSubCompetence(sc.id!);
                                        await reloadAll();
                                      } catch (e) {
                                        console.error(e);
                                        alert("Erreur delete sous-compétence");
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Niveaux ---------------- */}
        <TabsContent value="niveaux">
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Niveaux</CardTitle>
              <CardDescription>Liés à cette compétence</CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {isEdit && (
                <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <Label>Type</Label>
                      <select value={lvlType} onChange={(e) => setLvlType(e.target.value as LevelType)} className={selectClassName()}>
                        {LEVEL_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label>Label</Label>
                      <Input value={lvlLabel} onChange={(e) => setLvlLabel(e.target.value)} className="mt-1 h-10" />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Input value={lvlDesc} onChange={(e) => setLvlDesc(e.target.value)} className="mt-1 h-10" />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      disabled={loading}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700"
                      onClick={async () => {
                        try {
                          if (!lvlLabel.trim()) return alert("Label obligatoire");
                          await createLevel({
                            type: lvlType,
                            label: lvlLabel.trim(),
                            description: lvlDesc.trim(),
                            competence: { id: competence.id },
                          });
                          setLvlLabel("");
                          setLvlDesc("");
                          setLvlType("BLOOM");
                          await reloadAll();
                        } catch (e) {
                          console.error(e);
                          alert("Erreur ajout niveau");
                        }
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-gray-500">Chargement...</div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Type</TableHead>
                        <TableHead>Label</TableHead>
                        <TableHead>Description</TableHead>
                        {isEdit && <TableHead className="w-32 text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {levels.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={isEdit ? 4 : 3} className="text-center text-gray-500 py-10">
                            Aucun niveau trouvé.
                          </TableCell>
                        </TableRow>
                      ) : (
                        levels.map((lvl, idx) => (
                          <TableRow
                            key={lvl.id}
                            className={`${idx % 2 === 0 ? "bg-white" : "bg-muted/10"} hover:bg-muted/30`}
                          >
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="rounded-full border-blue-200 text-blue-700 bg-blue-50"
                              >
                                {lvl.type ?? "—"}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{lvl.label ?? "—"}</TableCell>
                            <TableCell className="text-gray-600">{lvl.description ?? "—"}</TableCell>

                            {isEdit && (
                              <TableCell className="text-right">
                                <div className="inline-flex gap-1">
                                  <IconButton
                                    disabled={loading}
                                    title="Modifier"
                                    onClick={async () => {
                                      const rawType =
                                        prompt("Type (BLOOM/CEFR/INTERNE) :", String(lvl.type ?? "BLOOM")) ?? "";
                                      const newType = normalizeLevelType(rawType);
                                      if (!newType) return alert("Type invalide. Choisis: BLOOM / CEFR / INTERNE");

                                      const newLabel = prompt("Label :", lvl.label ?? "") ?? "";
                                      const newDesc = prompt("Description :", lvl.description ?? "") ?? "";
                                      try {
                                        await updateLevel(lvl.id!, { type: newType, label: newLabel, description: newDesc });
                                        await reloadAll();
                                      } catch (e) {
                                        console.error(e);
                                        alert("Erreur update niveau");
                                      }
                                    }}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </IconButton>

                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    disabled={loading}
                                    className="h-9 w-9 rounded-lg"
                                    title="Supprimer"
                                    onClick={async () => {
                                      if (!confirm("Supprimer ce niveau ?")) return;
                                      try {
                                        await deleteLevel(lvl.id!);
                                        await reloadAll();
                                      } catch (e) {
                                        console.error(e);
                                        alert("Erreur delete niveau");
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Prérequis ---------------- */}
        <TabsContent value="prerequis">
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Prérequis</CardTitle>
              <CardDescription>Source ou cible = cette compétence</CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {isEdit && (
                <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <Label>Source ID</Label>
                      <Input
                        type="number"
                        value={preSourceId}
                        onChange={(e) => setPreSourceId(Number(e.target.value))}
                        className="mt-1 h-10"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {competenceNameById.get(preSourceId) ? (
                          <>
                            <span className="font-medium text-amber-700">{competenceNameById.get(preSourceId)}</span>
                            <span className="ml-2">• compétence source</span>
                          </>
                        ) : (
                          "Astuce: mets un ID de compétence existant"
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Target ID</Label>
                      <Input
                        type="number"
                        value={preTargetId}
                        onChange={(e) => setPreTargetId(Number(e.target.value))}
                        className="mt-1 h-10"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {competenceNameById.get(preTargetId) ? (
                          <>
                            <span className="font-medium text-amber-700">{competenceNameById.get(preTargetId)}</span>
                            <span className="ml-2">• compétence cible</span>
                          </>
                        ) : (
                          "Astuce: mets un ID de compétence existant"
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Type</Label>
                      <select
                        value={preType}
                        onChange={(e) => setPreType(e.target.value as PrereqType)}
                        className={selectClassName()}
                      >
                        {PREREQ_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <div className="text-xs text-gray-500 mt-1">Choisis le type de relation</div>
                    </div>

                    <div className="flex items-end justify-end">
                      <Button
                        disabled={loading}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
                        onClick={async () => {
                          try {
                            await createPrerequisite({
                              source: { id: preSourceId },
                              target: { id: preTargetId },
                              type: preType,
                            });
                            await reloadAll();
                          } catch (e) {
                            console.error(e);
                            alert("Erreur ajout prérequis (vérifie IDs existent)");
                          }
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-gray-500">Chargement...</div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Source</TableHead>
                        <TableHead>Cible</TableHead>
                        <TableHead>Type</TableHead>
                        {isEdit && <TableHead className="w-32 text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {prerequisites.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={isEdit ? 4 : 3} className="text-center text-gray-500 py-10">
                            Aucun prérequis trouvé.
                          </TableCell>
                        </TableRow>
                      ) : (
                        prerequisites.map((p, idx) => (
                          <TableRow
                            key={p.id}
                            className={`${idx % 2 === 0 ? "bg-white" : "bg-muted/10"} hover:bg-muted/30`}
                          >
                            <TableCell className="font-medium">{p.source?.name ?? "—"}</TableCell>
                            <TableCell className="text-gray-700">{p.target?.name ?? "—"}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="rounded-full border-amber-200 text-amber-800 bg-amber-50"
                              >
                                {p.type ?? "—"}
                              </Badge>
                            </TableCell>

                            {isEdit && (
                              <TableCell className="text-right">
                                <div className="inline-flex gap-1">
                                  <IconButton
                                    disabled={loading}
                                    title="Modifier"
                                    onClick={async () => {
                                      const s = Number(prompt("Source ID:", String(p.source?.id ?? "")));
                                      if (!s) return;
                                      const t = Number(prompt("Target ID:", String(p.target?.id ?? "")));
                                      if (!t) return;

                                      const rawTy =
                                        prompt("Type (OBLIGATOIRE/RECOMMANDE) :", String(p.type ?? "OBLIGATOIRE")) ?? "";
                                      const ty = normalizePrereqType(rawTy);
                                      if (!ty) return alert("Type invalide. Choisis: OBLIGATOIRE / RECOMMANDE");

                                      try {
                                        await updatePrerequisite(p.id!, { source: { id: s }, target: { id: t }, type: ty });
                                        await reloadAll();
                                      } catch (e) {
                                        console.error(e);
                                        alert("Erreur update prérequis");
                                      }
                                    }}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </IconButton>

                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    disabled={loading}
                                    className="h-9 w-9 rounded-lg"
                                    title="Supprimer"
                                    onClick={async () => {
                                      if (!confirm("Supprimer ce prérequis ?")) return;
                                      try {
                                        await deletePrerequisite(p.id!);
                                        await reloadAll();
                                      } catch (e) {
                                        console.error(e);
                                        alert("Erreur delete prérequis");
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Ressources ---------------- */}
        <TabsContent value="ressources">
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle>Ressources</CardTitle>
              <CardDescription>Liées à cette compétence</CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {isEdit && (
                <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Titre</Label>
                      <Input value={resTitle} onChange={(e) => setResTitle(e.target.value)} className="mt-1 h-10" />
                    </div>

                    <div className="md:col-span-2">
                      <Label>URL</Label>
                      <Input value={resUrl} onChange={(e) => setResUrl(e.target.value)} className="mt-1 h-10" />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      disabled={loading}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700"
                      onClick={async () => {
                        try {
                          if (!resTitle.trim()) return alert("Titre obligatoire");
                          await createResource({
                            title: resTitle.trim(),
                            url: resUrl.trim(),
                            competence: { id: competence.id },
                          });
                          setResTitle("");
                          setResUrl("");
                          await reloadAll();
                        } catch (e) {
                          console.error(e);
                          alert("Erreur ajout ressource");
                        }
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="text-gray-500">Chargement...</div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Titre</TableHead>
                        <TableHead>URL</TableHead>
                        {isEdit && <TableHead className="w-32 text-right">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {resources.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={isEdit ? 3 : 2} className="text-center text-gray-500 py-10">
                            Aucune ressource trouvée.
                          </TableCell>
                        </TableRow>
                      ) : (
                        resources.map((r, idx) => (
                          <TableRow
                            key={r.id}
                            className={`${idx % 2 === 0 ? "bg-white" : "bg-muted/10"} hover:bg-muted/30`}
                          >
                            <TableCell className="font-medium">{r.title ?? "—"}</TableCell>
                            <TableCell className="text-gray-600">
                              {r.url ? (
                                <a
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-700 hover:underline inline-flex items-center gap-1"
                                >
                                  {r.url}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                "—"
                              )}
                            </TableCell>

                            {isEdit && (
                              <TableCell className="text-right">
                                <div className="inline-flex gap-1">
                                  <IconButton
                                    disabled={loading}
                                    title="Modifier"
                                    onClick={async () => {
                                      const t = prompt("Titre :", r.title ?? "") ?? "";
                                      const u = prompt("URL :", r.url ?? "") ?? "";
                                      try {
                                        await updateResource(r.id!, { title: t, url: u });
                                        await reloadAll();
                                      } catch (e) {
                                        console.error(e);
                                        alert("Erreur update ressource");
                                      }
                                    }}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </IconButton>

                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    disabled={loading}
                                    className="h-9 w-9 rounded-lg"
                                    title="Supprimer"
                                    onClick={async () => {
                                      if (!confirm("Supprimer cette ressource ?")) return;
                                      try {
                                        await deleteResource(r.id!);
                                        await reloadAll();
                                      } catch (e) {
                                        console.error(e);
                                        alert("Erreur delete ressource");
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* -------------------- Main Page -------------------- */
export function Competences() {
  const [competences, setCompetences] = useState<CompetenceDto[]>([]);
  const [loading, setLoading] = useState(true);

  // selection mode
  const [selected, setSelected] = useState<CompetenceDto | null>(null);
  const [selectedMode, setSelectedMode] = useState<Mode>("view");

  // add competence dialog
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // UI-only search (no backend changes)
  const [search, setSearch] = useState("");

  const reload = async () => {
    setLoading(true);
    try {
      const res = await getCompetences();
      setCompetences(res.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return competences;
    return competences.filter((c) => (c.name ?? "").toLowerCase().includes(q) || (c.code ?? "").toLowerCase().includes(q));
  }, [competences, search]);

  if (selected) {
    return (
      <CompetenceDetail
        competence={selected}
        mode={selectedMode}
        onBack={async () => {
          setSelected(null);
          await reload();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-gradient-to-b from-blue-50/70 to-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">Compétences</h2>
            <p className="text-sm text-gray-600 mt-1">Gérer les compétences et leurs sous-éléments (niveaux, ressources, prérequis).</p>
          </div>

          <Badge variant="outline" className="w-fit rounded-full border-amber-200 text-amber-800 bg-amber-50">
            Tableau de gestion
          </Badge>
        </div>
      </div>

      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Liste des compétences</CardTitle>
              <CardDescription>Rechercher, consulter, modifier ou supprimer</CardDescription>
            </div>

            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
              <div className="w-full md:w-[320px]">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par code ou nom…"
                  className="h-10 rounded-xl"
                />
              </div>

              <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
                <DialogTrigger asChild>
                  <Button disabled={loading} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une compétence
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-[520px]">
                  <DialogHeader>
                    <DialogTitle>Ajouter une compétence</DialogTitle>
                    <DialogDescription>Créer une nouvelle compétence</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-2">
                    <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
                      <div>
                        <Label>Code</Label>
                        <Input value={code} onChange={(e) => setCode(e.target.value)} className="mt-1 h-10" placeholder="ex: COMP-001" />
                      </div>

                      <div>
                        <Label>Nom</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 h-10" placeholder="ex: Développement Web" />
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                          className="mt-1"
                          placeholder="Décrivez brièvement la compétence…"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" className="rounded-xl" onClick={() => setOpenAddDialog(false)}>
                        Annuler
                      </Button>

                      <Button
                        disabled={loading}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700"
                        onClick={async () => {
                          try {
                            if (!code.trim() || !name.trim()) return alert("Code et Nom obligatoires");
                            await createCompetence({ code: code.trim(), name: name.trim(), description: description.trim() });
                            setCode("");
                            setName("");
                            setDescription("");
                            setOpenAddDialog(false);
                            await reload();
                          } catch (e) {
                            console.error(e);
                            alert("Erreur création compétence");
                          }
                        }}
                      >
                        Créer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {loading ? (
            <div className="text-gray-500">Chargement...</div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Code</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-40 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-10">
                        Aucune compétence trouvée{search.trim() ? " pour cette recherche." : "."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((c, idx) => (
                      <TableRow
                        key={c.id}
                        className={`${idx % 2 === 0 ? "bg-white" : "bg-muted/10"} hover:bg-muted/30`}
                      >
                        <TableCell className="font-mono text-sm">{c.code}</TableCell>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-gray-600">{c.description ?? ""}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1">
                            <IconButton
                              title="Voir"
                              onClick={() => {
                                setSelected(c);
                                setSelectedMode("view");
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </IconButton>

                            <IconButton
                              title="Éditer"
                              onClick={() => {
                                setSelected(c);
                                setSelectedMode("edit");
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </IconButton>

                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="h-9 w-9 rounded-lg"
                              title="Supprimer"
                              onClick={async () => {
                                if (!confirm(`Supprimer "${c.name}" ?`)) return;
                                try {
                                  await deleteCompetence(c.id);
                                  await reload();
                                } catch (e) {
                                  console.error(e);
                                  alert("Erreur suppression compétence");
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
