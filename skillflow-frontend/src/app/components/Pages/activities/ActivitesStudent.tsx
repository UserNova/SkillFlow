import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Separator } from "../../ui/separator";
import { Skeleton } from "../../ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../../ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { ScrollArea } from "../../ui/scroll-area";
import { ExternalLink, FileText, Search, Timer, Filter } from "lucide-react";

import {
  getActivities,
  getResourcesByActivity,
  type ActivityDto,
  type ResourceDto,
} from "../../../../api/activityApi";

/* ---------- UI helpers ---------- */
type Level = "EASY" | "MEDIUM" | "HARD";
type Type = "EXERCICE" | "TP" | "QUIZ" | "PROJET";

function typeLabel(t?: string) {
  const x = (t ?? "").toUpperCase();
  if (x === "EXERCICE") return "Exercice";
  if (x === "TP") return "TP";
  if (x === "QUIZ") return "Quiz";
  if (x === "PROJET") return "Projet";
  return t ?? "—";
}

function levelLabel(l?: string) {
  const x = (l ?? "").toUpperCase();
  if (x === "EASY") return "Easy";
  if (x === "MEDIUM") return "Medium";
  if (x === "HARD") return "Hard";
  return l ?? "—";
}

function typeBadgeClass(t?: string) {
  const x = (t ?? "").toUpperCase();
  if (x === "PROJET") return "bg-amber-50 text-amber-800 border-amber-200";
  if (x === "QUIZ") return "bg-violet-50 text-violet-700 border-violet-200";
  if (x === "EXERCICE") return "bg-sky-50 text-sky-700 border-sky-200";
  if (x === "TP") return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-muted text-muted-foreground";
}

function levelBadgeClass(l?: string) {
  const x = (l ?? "").toUpperCase();
  if (x === "HARD") return "bg-red-50 text-red-700 border-red-200";
  if (x === "MEDIUM") return "bg-orange-50 text-orange-700 border-orange-200";
  if (x === "EASY") return "bg-green-50 text-green-700 border-green-200";
  return "bg-muted text-muted-foreground";
}

function resourceIcon(type?: string) {
  const x = (type ?? "").toUpperCase();
  if (x === "PDF") return <FileText className="w-4 h-4" />;
  return <ExternalLink className="w-4 h-4" />;
}

/* ---------- Component ---------- */
export default function ActivitesStudent() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityDto[]>([]);

  // UI state
  const [q, setQ] = useState("");
  const [type, setType] = useState<"ALL" | Type>("ALL");
  const [level, setLevel] = useState<"ALL" | Level>("ALL");

  // resources drawer
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ActivityDto | null>(null);
  const [resLoading, setResLoading] = useState(false);
  const [resources, setResources] = useState<ResourceDto[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getActivities();
        setActivities(res.data ?? []);
      } catch {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return activities
      .filter((a) => {
        const matchQ =
          !query ||
          (a.title ?? "").toLowerCase().includes(query) ||
          (a.description ?? "").toLowerCase().includes(query);

        const matchType = type === "ALL" ? true : String(a.type).toUpperCase() === type;
        const matchLevel = level === "ALL" ? true : String(a.level).toUpperCase() === level;

        return matchQ && matchType && matchLevel;
      })
      // small sort: HARD first then MEDIUM then EASY (optional)
      .sort((a, b) => {
        const order = (x?: string) =>
          String(x ?? "").toUpperCase() === "HARD" ? 0 : String(x ?? "").toUpperCase() === "MEDIUM" ? 1 : 2;
        return order(a.level) - order(b.level);
      });
  }, [activities, q, type, level]);

  const openResources = async (activity: ActivityDto) => {
    setSelected(activity);
    setOpen(true);
    setResLoading(true);
    setResources([]);

    try {
      const res = await getResourcesByActivity(activity.id);
      setResources(res.data ?? []);
    } finally {
      setResLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* ---------- Header ---------- */}
      <div className="rounded-2xl border bg-gradient-to-b from-blue-50/60 to-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              Activités disponibles
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Cherche une activité, filtre par type/niveau, puis ouvre les ressources.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full border-blue-200 text-blue-700 bg-blue-50">
              Espace Étudiant
            </Badge>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Search + Filters */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xl">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher compétences, activités..."
              className="pl-9 h-11 rounded-xl"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              Filtres
            </div>

            <Tabs value={type} onValueChange={(v) => setType(v as any)} className="w-full sm:w-auto">
              <TabsList className="rounded-xl">
                <TabsTrigger value="ALL">Tous</TabsTrigger>
                <TabsTrigger value="EXERCICE">Exercice</TabsTrigger>
                <TabsTrigger value="TP">TP</TabsTrigger>
                <TabsTrigger value="QUIZ">Quiz</TabsTrigger>
                <TabsTrigger value="PROJET">Projet</TabsTrigger>
              </TabsList>
            </Tabs>

            <Tabs value={level} onValueChange={(v) => setLevel(v as any)} className="w-full sm:w-auto">
              <TabsList className="rounded-xl">
                <TabsTrigger value="ALL">Tous</TabsTrigger>
                <TabsTrigger value="EASY">Easy</TabsTrigger>
                <TabsTrigger value="MEDIUM">Medium</TabsTrigger>
                <TabsTrigger value="HARD">Hard</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* ---------- Content ---------- */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="rounded-2xl">
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-10 w-36 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="py-10 text-center text-muted-foreground">
            Aucune activité ne correspond à ta recherche.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <Card key={a.id} className="rounded-2xl border shadow-sm hover:shadow-md transition">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg leading-tight">{a.title}</CardTitle>
                  <Badge variant="outline" className={`rounded-full ${typeBadgeClass(String(a.type))}`}>
                    {typeLabel(String(a.type))}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`rounded-full ${levelBadgeClass(String(a.level))}`}>
                    {levelLabel(String(a.level))}
                  </Badge>

                  <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                    <Timer className="w-4 h-4" />
                    Durée : {a.duration ?? 0}h
                  </span>
                </div>

                {a.description ? (
                  <CardDescription className="line-clamp-2">{a.description}</CardDescription>
                ) : (
                  <CardDescription className="italic">Aucune description</CardDescription>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => openResources(a)}
                >
                  Voir ressources
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ---------- Resources Sheet ---------- */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:w-[520px] p-0">
          <div className="p-6">
            <SheetHeader>
              <SheetTitle className="text-xl">{selected?.title ?? "Ressources"}</SheetTitle>
              <SheetDescription>
                Télécharge/ouvre les ressources liées à cette activité.
              </SheetDescription>
            </SheetHeader>

            <Separator className="my-4" />

            <div className="flex items-center gap-2">
              {selected?.type && (
                <Badge variant="outline" className={`rounded-full ${typeBadgeClass(String(selected.type))}`}>
                  {typeLabel(String(selected.type))}
                </Badge>
              )}
              {selected?.level && (
                <Badge variant="outline" className={`rounded-full ${levelBadgeClass(String(selected.level))}`}>
                  {levelLabel(String(selected.level))}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground">
                Durée : {selected?.duration ?? 0}h
              </span>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-210px)] px-6 pb-6">
            {resLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border p-4 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-9 w-28 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : resources.length === 0 ? (
              <div className="rounded-2xl border p-6 text-muted-foreground">
                Aucune ressource pour cette activité.
              </div>
            ) : (
              <div className="space-y-3">
                {resources.map((r) => (
                  <div key={r.id} className="rounded-2xl border p-4 hover:bg-muted/20 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{r.title}</div>
                        {r.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {r.description}
                          </p>
                        )}
                      </div>

                      <Badge variant="secondary" className="rounded-full shrink-0">
                        {String(r.type ?? "—")}
                      </Badge>
                    </div>

                    <div className="mt-3">
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noreferrer">
                          <Button variant="outline" className="rounded-xl gap-2">
                            {resourceIcon(String(r.type))}
                            Ouvrir
                          </Button>
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucune URL</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
