import { Search, Bell, User } from "lucide-react";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export function TopBar() {
  const navigate = useNavigate(); // ✅ OBLIGATOIRE

  const fullName = localStorage.getItem("fullName") || "Utilisateur";
  const role = localStorage.getItem("role");

  const roleLabel =
    role === "ADMIN"
      ? "Administrateur"
      : role === "STUDENT"
      ? "Étudiant"
      : "Utilisateur";

  return (
    <div className="h-16 bg-white border-b fixed top-0 left-64 right-0 z-10 flex items-center px-6">

      {/* SEARCH */}
      <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-xl relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Rechercher compétences, activités..."
          className="pl-10 bg-gray-50"
        />
      </div>

      {/* RIGHT */}
      <div className="ml-auto flex items-center gap-3">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-600 text-white">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>

              <div className="text-left">
                <div className="text-sm font-medium">{fullName}</div>
                <div className="text-xs text-gray-500">{roleLabel}</div>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate("/profile")}>
              Profil
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate("/settings")}>
              Paramètres
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
            >
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
