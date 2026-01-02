import { User, Mail, Shield } from "lucide-react";

export default function Profile() {
  const fullName = localStorage.getItem("fullName") || "Utilisateur";
  const email = localStorage.getItem("email") || "email@exemple.com";
  const role = localStorage.getItem("role");

  const roleLabel =
    role === "ADMIN" ? "Administrateur" : "Étudiant";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Profil</h1>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-8 flex items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white">
            <User className="w-10 h-10" />
          </div>

          {/* Infos principales */}
          <div className="text-white">
            <h2 className="text-2xl font-semibold">{fullName}</h2>
            <p className="text-sm opacity-90">{roleLabel}</p>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-8 space-y-6">
          {/* Email */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Adresse email</p>
              <p className="font-medium text-gray-900">{email}</p>
            </div>
          </div>

          {/* Rôle */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-lg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rôle</p>
              <span className="inline-block mt-1 px-3 py-1 text-sm rounded-full bg-amber-200 text-amber-800 font-semibold">
                {roleLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
