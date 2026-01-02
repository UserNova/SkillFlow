import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import {
  getCompetences,
  type CompetenceDto,
} from "../../../api/competenceApi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CompetenceDetail } from "./Competences"; // 👈 on réutilise le détail

export default function CompetencesStudent() {
  const [competences, setCompetences] = useState<CompetenceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CompetenceDto | null>(null);
  const [search, setSearch] = useState("");

  const reload = async () => {
    setLoading(true);
    try {
      const res = await getCompetences();
      setCompetences(res.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return competences.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.code?.toLowerCase().includes(q)
    );
  }, [competences, search]);

  // 👉 Vue détail en lecture seule
  if (selected) {
    return (
      <CompetenceDetail
        competence={selected}
        mode="view"     // 🔐 lecture seule
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border p-6 bg-gradient-to-b from-blue-50/70 to-white">
        <h2 className="text-2xl font-semibold">Compétences</h2>
        <p className="text-sm text-gray-600">
          Consultation des compétences disponibles
        </p>
        <Badge className="mt-2">Mode étudiant</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des compétences</CardTitle>
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-3"
          />
        </CardHeader>

        <CardContent>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono">{c.code}</TableCell>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.description}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelected(c)}
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
