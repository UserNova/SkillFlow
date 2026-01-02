import { useEffect, useMemo, useState } from "react";
import {
  createResource,
  deleteResource,
  getResourcesByActivity,
  updateResource,
  type ResourceDto,
  type ResourceType,
  type ActivityDto,
} from "../../../../api/activityApi";

import { ArrowLeft, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { Badge } from "../../ui/badge";

const RESOURCE_TYPES: ResourceType[] = ["PDF", "VIDEO", "LINK", "ARTICLE", "AUTRE"];

function selectClassName() {
  return "mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm";
}

export default function ActivityDetail({
  activity,
  onBack,
}: {
  activity: ActivityDto;
  onBack: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<ResourceDto[]>([]);

  // create
  const [rTitle, setRTitle] = useState("");
  const [rType, setRType] = useState<ResourceType>("PDF");
  const [rUrl, setRUrl] = useState("");
  const [rDesc, setRDesc] = useState("");

  const reload = async () => {
    setLoading(true);
    try {
      const res = await getResourcesByActivity(activity.id);
      setResources(res.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity.id]);

  const canOpen = useMemo(() => (url?: string | null) => !!url && url.startsWith("http"), []);

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="rounded-2xl border bg-gradient-to-b from-blue-50/70 to-white p-5 sm:p-6 shadow-sm">
        <Button variant="ghost" onClick={onBack} className="mb-4 rounded-xl hover:bg-muted/60">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la liste
        </Button>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              {activity.title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Détails + gestion des ressources liées à cette activité.
            </p>
          </div>

          <Badge variant="outline" className="rounded-full border-blue-200 text-blue-700 bg-blue-50">
            Ressources
          </Badge>
        </div>
      </div>

      {/* Resources card */}
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Ressources</CardTitle>
          <CardDescription>Ajouter / modifier / supprimer les ressources de l’activité</CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* add form */}
          <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <Label>Titre</Label>
                <Input value={rTitle} onChange={(e) => setRTitle(e.target.value)} className="mt-1 h-10" />
              </div>

              <div>
                <Label>Type</Label>
                <select value={rType} onChange={(e) => setRType(e.target.value as ResourceType)} className={selectClassName()}>
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>URL</Label>
                <Input value={rUrl} onChange={(e) => setRUrl(e.target.value)} className="mt-1 h-10" placeholder="https://..." />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea value={rDesc} onChange={(e) => setRDesc(e.target.value)} className="mt-1" rows={3} />
            </div>

            <div className="flex justify-end">
              <Button
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
                disabled={loading}
                onClick={async () => {
                  try {
                    if (!rTitle.trim()) return alert("Titre obligatoire");
                    await createResource(activity.id, {
                      title: rTitle.trim(),
                      type: rType,
                      url: rUrl.trim() ? rUrl.trim() : null,
                      description: rDesc.trim() ? rDesc.trim() : null,
                    });
                    setRTitle("");
                    setRUrl("");
                    setRDesc("");
                    setRType("PDF");
                    await reload();
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

          {/* list */}
          {loading ? (
            <div className="text-gray-500">Chargement...</div>
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Titre</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-36 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {resources.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-10">
                        Aucune ressource.
                      </TableCell>
                    </TableRow>
                  ) : (
                    resources.map((r, idx) => (
                      <TableRow key={r.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-muted/10"} hover:bg-muted/30`}>
                        <TableCell className="font-medium">{r.title}</TableCell>
                        <TableCell>{r.type}</TableCell>
                        <TableCell className="text-gray-600">
                          {r.url ? (
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:underline inline-flex items-center gap-1"
                            >
                              ouvrir <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-gray-600">{r.description ?? "—"}</TableCell>

                        <TableCell className="text-right">
                          <div className="inline-flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-lg"
                              title="Modifier"
                              onClick={async () => {
                                const t = prompt("Titre :", r.title ?? "") ?? "";
                                const ty = (prompt("Type (PDF/VIDEO/LINK/ARTICLE/AUTRE) :", String(r.type ?? "PDF")) ?? "PDF").toUpperCase() as ResourceType;
                                const u = prompt("URL :", r.url ?? "") ?? "";
                                const d = prompt("Description :", r.description ?? "") ?? "";
                                try {
                                  await updateResource(r.id!, {
                                    title: t,
                                    type: ty,
                                    url: u.trim() ? u.trim() : null,
                                    description: d.trim() ? d.trim() : null,
                                  });
                                  await reload();
                                } catch (e) {
                                  console.error(e);
                                  alert("Erreur update ressource");
                                }
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>

                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-9 w-9 rounded-lg"
                              title="Supprimer"
                              onClick={async () => {
                                if (!confirm("Supprimer cette ressource ?")) return;
                                try {
                                  await deleteResource(r.id!);
                                  await reload();
                                } catch (e) {
                                  console.error(e);
                                  alert("Erreur delete ressource");
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>

                            {canOpen(r.url) && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-lg"
                                title="Voir (ouvrir)"
                                onClick={() => window.open(r.url!, "_blank")}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
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
