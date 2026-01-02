import { useState } from "react";

export default function Settings() {
  const [fullName, setFullName] = useState(
    localStorage.getItem("fullName") || ""
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdateProfile = () => {
    alert("Modification du nom à connecter au backend");
  };

  const handleUpdatePassword = () => {
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    alert("Modification du mot de passe à connecter au backend");
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-8">

        {/* ================= PROFIL ================= */}
        <div>
          <h2 className="font-semibold text-lg mb-3">Profil</h2>

          <label className="block text-sm text-gray-600 mb-1">
            Nom complet
          </label>
          <input
            type="text"
            className="border px-3 py-2 rounded w-full"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <button
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleUpdateProfile}
          >
            Mettre à jour le profil
          </button>
        </div>

        {/* ================= SÉCURITÉ ================= */}
        <div className="border-t pt-6">
          <h2 className="font-semibold text-lg mb-3">Sécurité</h2>

          <input
            type="password"
            placeholder="Nouveau mot de passe"
            className="border px-3 py-2 rounded w-full mb-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirmer le mot de passe"
            className="border px-3 py-2 rounded w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleUpdatePassword}
          >
            Modifier le mot de passe
          </button>
        </div>

        {/* ================= DÉCONNEXION ================= */}
        <div className="border-t pt-4">
          <button
            onClick={handleLogout}
            className="text-red-600 font-medium"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
