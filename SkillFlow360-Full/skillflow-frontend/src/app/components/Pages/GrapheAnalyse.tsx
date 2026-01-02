import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { CircleCheck, TrendingUp, TriangleAlert, Clock } from "lucide-react";
import { grapheApi, type DashboardStatsResponse } from "../../../api/grapheApi";

function pct(n: number) {
  return `${Math.round(n)}%`;
}

export function GrapheAnalyse() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        const res = await grapheApi.getDashboardStats();
        if (!mounted) return;
        setStats(res.data);
      } catch (e: any) {
        if (!mounted) return;
        setErrorMsg(e?.message ?? "Erreur de chargement des statistiques.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const submissionRate = useMemo(() => {
    if (!stats || !stats.totalSubmissions) return 0;
    return (stats.submittedCount / stats.totalSubmissions) * 100;
  }, [stats]);

  const statusPieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "SUBMITTED", value: stats.submittedCount },
      { name: "IN_PROGRESS", value: stats.inProgressCount },
    ];
  }, [stats]);

  const scoreBarData = useMemo(() => {
    return stats?.scoreDistribution ?? [];
  }, [stats]);

  const topActivities = useMemo(() => {
    return stats?.topActivities ?? [];
  }, [stats]);

  const indicators = useMemo(() => {
    if (!stats) return [];

    return [
      {
        title: "Étudiants (Total)",
        value: String(stats.totalStudents ?? 0),
        subtitle: "Inscrits dans la plateforme",
        icon: CircleCheck,
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
      },
      {
        title: "Évaluations (Total)",
        value: String(stats.totalEvaluations),
        subtitle: `${stats.publishedEvaluations} publiées`,
        icon: CircleCheck,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
      },
      {
        title: "Submissions (Total)",
        value: String(stats.totalSubmissions),
        subtitle: `${stats.submittedCount} soumises`,
        icon: TrendingUp,
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
      },
      {
        title: "En cours",
        value: String(stats.inProgressCount),
        subtitle: `Soumission: ${pct(submissionRate)}`,
        icon: Clock,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-700",
      },
      {
        title: "Alertes",
        value: String(
          (stats.scoreDistribution?.find((x) => x.range === "0-20")?.count ?? 0) +
            (stats.scoreDistribution?.find((x) => x.range === "21-40")?.count ?? 0)
        ),
        subtitle: "Scores < 40%",
        icon: TriangleAlert,
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
      },
    ];
  }, [stats, submissionRate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Graphe & Analyse</h2>
        <p className="text-gray-500 mt-1">Dashboard des évaluations & submissions</p>
      </div>

      {/* Loading / Error */}
      {loading && (
        <Card>
          <CardContent className="py-10 text-center text-gray-600">Chargement des statistiques...</CardContent>
        </Card>
      )}

      {!loading && errorMsg && (
        <Card>
          <CardContent className="py-10 text-center">
            <div className="text-red-600 font-medium">{errorMsg}</div>
            <div className="text-gray-500 text-sm mt-1">Vérifie le Gateway route + endpoint graphe-service.</div>
          </CardContent>
        </Card>
      )}

      {!loading && !errorMsg && stats && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {indicators.map((it, idx) => {
              const Icon = it.icon;
              return (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{it.title}</p>
                        <p className="text-2xl font-semibold mt-1">{it.value}</p>
                        <p className="text-xs text-gray-500 mt-2">{it.subtitle}</p>
                      </div>
                      <div className={`${it.iconBg} p-3 rounded-lg`}>
                        <Icon className={`w-6 h-6 ${it.iconColor}`} />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <span>Généré le</span>
                      <Badge variant="secondary">
                        {new Date(stats.generatedAt).toLocaleString()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut: submissions status */}
            <Card>
              <CardHeader>
                <CardTitle>Status des submissions</CardTitle>
                <CardDescription>SUBMITTED vs IN_PROGRESS</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip />
                      <Pie
                        data={statusPieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                      >
                        {/* couleurs fixes simples */}
                        <Cell fill="#22c55e" /> {/* submitted */}
                        <Cell fill="#f59e0b" /> {/* in progress */}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded bg-green-500" />
                    <span>SUBMITTED: {stats.submittedCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded bg-amber-500" />
                    <span>IN_PROGRESS: {stats.inProgressCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bar: score distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution des scores</CardTitle>
                <CardDescription>Nombre de submissions par tranche</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreBarData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" name="Submissions" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  Tip: si beaucoup de scores sont dans 0–20 → évaluation trop difficile.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top activities */}
          <Card>
            <CardHeader>
              <CardTitle>Top activités</CardTitle>
              <CardDescription>Activités les plus tentées + score moyen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 text-gray-600 font-medium">Activité</th>
                      <th className="text-center p-2 text-gray-600 font-medium">Submissions</th>
                      <th className="text-center p-2 text-gray-600 font-medium">Avg score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topActivities.map((a) => (
                      <tr key={a.activityId} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-2 font-medium">
                          {a.activityTitle}{" "}
                          <span className="text-xs text-gray-500">(# {a.activityId})</span>
                        </td>
                        <td className="p-2 text-center">
                          <Badge variant="secondary">{a.submissionsCount}</Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Badge
                            className={
                              a.avgScore >= 80
                                ? "bg-green-100 text-green-700"
                                : a.avgScore >= 60
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }
                          >
                            {a.avgScore}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {topActivities.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-gray-500">
                          Aucune activité trouvée.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Students Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance des étudiants</CardTitle>
              <CardDescription>Performance individuelle par étudiant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 text-gray-600 font-medium">Étudiant</th>
                      <th className="text-center p-2 text-gray-600 font-medium">Submissions</th>
                      <th className="text-center p-2 text-gray-600 font-medium">Score Moyen</th>
                      <th className="text-center p-2 text-gray-600 font-medium">Dernier Score</th>
                      <th className="text-center p-2 text-gray-600 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.studentsPerformance?.map((student) => (
                      <tr key={student.studentId} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="p-2 font-medium">
                          {student.studentName}{" "}
                          <span className="text-xs text-gray-500">(# {student.studentId})</span>
                        </td>
                        <td className="p-2 text-center">
                          <Badge variant="secondary">{student.submissionsCount}</Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Badge
                            className={
                              student.avgScore >= 80
                                ? "bg-green-100 text-green-700"
                                : student.avgScore >= 60
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }
                          >
                            {student.avgScore}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          {student.lastScore !== null ? (
                            <Badge
                              className={
                                student.lastScore >= 80
                                  ? "bg-green-100 text-green-700"
                                  : student.lastScore >= 60
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }
                            >
                              {student.lastScore}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {student.atRisk ? (
                            <Badge className="bg-red-100 text-red-700">À risque</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700">OK</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!stats?.studentsPerformance || stats.studentsPerformance.length === 0) && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-gray-500">
                          Aucune performance d'étudiant trouvée.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}