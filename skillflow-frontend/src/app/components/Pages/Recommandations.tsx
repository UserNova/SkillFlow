import { useEffect, useMemo, useState } from "react";
import {
  recommendationsApi,
  RecommendationResponse,
} from "../../../api/recommendations";

type Level = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | string;

function levelBadge(level: Level) {
  const L = (level || "").toUpperCase();
  if (L === "BEGINNER")
    return { text: "Beginner", bg: "bg-emerald-100", fg: "text-emerald-800", dot: "bg-emerald-500" };
  if (L === "INTERMEDIATE")
    return { text: "Intermediate", bg: "bg-amber-100", fg: "text-amber-800", dot: "bg-amber-500" };
  if (L === "ADVANCED")
    return { text: "Advanced", bg: "bg-rose-100", fg: "text-rose-800", dot: "bg-rose-500" };
  return { text: level, bg: "bg-slate-100", fg: "text-slate-700", dot: "bg-slate-400" };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Convertit priorityScore (ex: 30..100) en "confiance" 0..100
 * (c’est juste une UI, pas une vraie probabilité)
 */
function toConfidence(priorityScore: number) {
  const p = Number.isFinite(priorityScore) ? priorityScore : 0;
  // Tu peux ajuster la formule selon tes scores
  return clamp(Math.round((p / 100) * 100), 0, 100);
}

function confidenceLabel(c: number) {
  if (c >= 80) return { txt: "Très pertinent", cls: "text-emerald-700" };
  if (c >= 60) return { txt: "Pertinent", cls: "text-amber-700" };
  return { txt: "À explorer", cls: "text-slate-600" };
}

export default function Recommandations() {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [levelFilter, setLevelFilter] = useState<"ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED">("ALL");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const studentId = Number(localStorage.getItem("studentId") || "1");
      const res = await recommendationsApi.getMyRecommendations(studentId, 6);
      setData(res.data);
      setLoading(false);
    };
    load();
  }, []);

  const items = data?.recommendations ?? [];

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return items.filter((r) => {
      const okSearch =
        !qq ||
        (r.title || "").toLowerCase().includes(qq) ||
        (r.reason || "").toLowerCase().includes(qq);

      const L = (r.level || "").toUpperCase();
      const okLevel = levelFilter === "ALL" ? true : L === levelFilter;

      return okSearch && okLevel;
    });
  }, [items, q, levelFilter]);

  const next = filtered[0] ?? null;
  const others = filtered.slice(1);

  if (loading) {
    return (
      <div className="p-6">
        <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="mt-4 h-40 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }
  if (!data) return null;

  const generatedAtText = new Date(data.generatedAt).toLocaleString();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-6 text-white shadow-sm"
           style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 60%, #db2777 120%)" }}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Recommandations IA</h2>
            <p className="text-white/80 text-sm">
              Générées automatiquement à partir de tes scores et du niveau cible.
            </p>
          </div>

          {/* Mini stats */}
          <div className="flex gap-3">
            <div className="rounded-xl bg-white/15 px-4 py-2">
              <div className="text-xs text-white/70">Niveau cible</div>
              <div className="font-semibold">{data.targetLevel}</div>
            </div>
            <div className="rounded-xl bg-white/15 px-4 py-2">
              <div className="text-xs text-white/70">Score moyen</div>
              <div className="font-semibold">{data.studentAvgScore}</div>
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-white/70">
          Stratégie : <span className="font-medium text-white">{data.strategy}</span> • Généré le{" "}
          <span className="font-medium text-white">{generatedAtText}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher une activité, un mot dans l'explication..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="flex gap-2">
          {(["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((x) => (
            <button
              key={x}
              onClick={() => setLevelFilter(x)}
              className={[
                "rounded-xl px-3 py-2 text-sm border",
                levelFilter === x
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50",
              ].join(" ")}
            >
              {x === "ALL" ? "Tous" : x}
            </button>
          ))}
        </div>
      </div>

      {/* Next recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Prochaine activité recommandée</div>
              <div className="text-lg font-semibold text-slate-900">
                {next ? next.title : "Aucune recommandation"}
              </div>
            </div>
            {next ? (
              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                  levelBadge(next.level).bg,
                  levelBadge(next.level).fg,
                ].join(" ")}
              >
                <span className={`h-2 w-2 rounded-full ${levelBadge(next.level).dot}`} />
                {levelBadge(next.level).text}
              </span>
            ) : null}
          </div>

          <div className="p-5">
            {!next ? (
              <div className="text-slate-500">
                Aucune recommandation pour le moment. Fais 1–2 évaluations et reviens ici.
              </div>
            ) : (
              <>
                {/* AI confidence bar */}
                {(() => {
                  const conf = toConfidence(next.priorityScore);
                  const meta = confidenceLabel(conf);
                  return (
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-600">Confiance IA</div>
                        <div className={`text-sm font-medium ${meta.cls}`}>
                          {conf}% • {meta.txt}
                        </div>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${conf}%`,
                            background: "linear-gradient(90deg, #22c55e 0%, #3b82f6 55%, #a855f7 100%)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Explanation */}
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <div className="text-sm font-semibold text-slate-900 mb-1">
                    Pourquoi cette recommandation ?
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {next.reason || "Cette activité correspond à ton niveau cible et à ton historique de performance."}
                  </p>

                  <div className="mt-3 text-xs text-slate-500">
                    💡 L’IA favorise les activités proches du niveau cible ({data.targetLevel}) et ajuste
                    selon le score moyen ({data.studentAvgScore}). Les activités déjà réalisées sont évitées.
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    className="rounded-xl px-4 py-3 text-white font-medium shadow-sm"
                    style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
                    onClick={() => {
                      // TODO: si tu as une route pour démarrer une activité, change ici
                      alert(`Démarrer: ${next.title}`);
                    }}
                  >
                    Démarrer cette activité
                  </button>
                  <button
                    className="rounded-xl px-4 py-3 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      navigator.clipboard?.writeText(JSON.stringify(next, null, 2));
                      alert("Recommandation copiée ✅");
                    }}
                  >
                    Copier les détails
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Side card: “AI Summary” */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <div className="text-sm text-slate-500">Résumé IA</div>
          <div className="text-lg font-semibold text-slate-900">Ton profil</div>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div className="text-xs text-slate-500">Niveau cible</div>
              <div className="text-base font-semibold text-slate-900">{data.targetLevel}</div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div className="text-xs text-slate-500">Score moyen</div>
              <div className="text-base font-semibold text-slate-900">{data.studentAvgScore}</div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div className="text-xs text-slate-500">Conseil IA</div>
              <div className="text-sm text-slate-700">
                Fais <span className="font-medium">2–3 activités</span> au niveau{" "}
                <span className="font-medium">{data.targetLevel}</span> puis repasse une évaluation.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other recommendations list */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Autres activités recommandées</div>
            <div className="text-lg font-semibold text-slate-900">
              {others.length} suggestion(s)
            </div>
          </div>
          <div className="text-xs text-slate-500">Triées par priorité</div>
        </div>

        <div className="p-4">
          {others.length === 0 ? (
            <div className="p-4 text-slate-500">Aucune autre recommandation.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {others.map((r) => {
                const conf = toConfidence(r.priorityScore);
                const badge = levelBadge(r.level);
                return (
                  <div key={r.activityId} className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{r.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{r.reason}</div>
                      </div>

                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${badge.bg} ${badge.fg}`}>
                        <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
                        {badge.text}
                      </span>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Confiance</span>
                        <span className="font-medium text-slate-700">{conf}%</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${conf}%`,
                            background: "linear-gradient(90deg, #22c55e 0%, #3b82f6 55%, #a855f7 100%)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
