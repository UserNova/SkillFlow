import { BookOpen, Activity, ClipboardCheck, Network, Sparkles } from "lucide-react";
import { cn } from "../ui/utils";
import { useNavigate, useLocation } from "react-router-dom";

type Role = "ADMIN" | "STUDENT" | null;

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  admin?: string;
  student?: string;
};

const menuItems: MenuItem[] = [
  {
    id: "competences",
    label: "Compétences",
    icon: BookOpen,
    admin: "/competences",
    student: "/competence-student",
  },
  {
    id: "activities",
    label: "Activités",
    icon: Activity,
    admin: "/activities",
    student: "/activities-student",
  },
  {
    id: "evaluations",
    label: "Évaluations",
    icon: ClipboardCheck,
    admin: "/evaluations",
    student: "/evaluations-student",
  },

  // ✅ ADMIN only
  {
    id: "graphe",
    label: "Graphe & Analyse",
    icon: Network,
    admin: "/graphe-analyse",
  },

  // ✅ STUDENT only
  {
    id: "recommandations",
    label: "Recommandations",
    icon: Sparkles,
    student: "/recommandations",
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = (localStorage.getItem("role") as Role) ?? null;

  // ✅ garde seulement les menus accessibles par le rôle
  const visibleItems = menuItems.filter((item) => {
    if (!role) return false;
    if (role === "ADMIN") return !!item.admin;
    if (role === "STUDENT") return !!item.student;
    return false;
  });

  const handleNavigation = (item: MenuItem) => {
    if (!role) return;
    const path = role === "ADMIN" ? item.admin : item.student;
    if (path) navigate(path);
  };

  return (
    <div className="w-64 bg-white border-r h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b text-center">
        <h1 className="text-3xl font-extrabold">
          <span className="text-blue-900">SkillFlow</span>
          <span className="text-amber-700">360</span>
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;

          const activePath = role === "ADMIN" ? item.admin : item.student;
          const isActive = activePath ? location.pathname === activePath : false;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
