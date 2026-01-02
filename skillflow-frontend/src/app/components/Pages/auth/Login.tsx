import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../../../api/authApi";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   setError("");

   try {
     const response = await login({ email, password });
     console.log("LOGIN RESPONSE 👉", response);

     // ✅ récupérer email DU BACKEND
     const { token, role, fullName, email: backendEmail } = response;

     if (!token || !role) {
       throw new Error("Données manquantes");
     }

     localStorage.setItem("userId", String(response.id));
     localStorage.setItem("token", token);
     localStorage.setItem("role", role);
     localStorage.setItem("fullName", fullName);
     localStorage.setItem("email", backendEmail); // ✅ ICI LA VRAIE CORRECTION

     const normalizedRole = role.toUpperCase();

     if (normalizedRole === "ADMIN") {
       navigate("/competences");
     } else if (normalizedRole === "STUDENT") {
       navigate("/competence-student");
     } else {
       navigate("/login");
     }

   } catch (err: any) {
     console.error("LOGIN ERROR ❌", err);
     if (err.response?.status === 401) {
       setError("Email ou mot de passe incorrect");
     } else {
       setError("Erreur serveur, réessayez plus tard");
     }
   }
 };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-amber-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Logo */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-extrabold">
            <span className="text-blue-900">SkillFlow</span>
            <span className="text-amber-700">360</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Système intelligent de suivi des compétences
          </p>
        </div>

        {error && (
          <p className="text-red-600 text-sm text-center mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full border px-3 py-2 rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            required
            className="w-full border px-3 py-2 rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-blue-800 text-white py-2 rounded-lg">
            Se connecter
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">Pas encore de compte ?</p>
          <button
            onClick={() => navigate("/register")}
            className="mt-2 text-amber-700 font-semibold hover:underline"
          >
            S’inscrire
          </button>
        </div>
      </div>
    </div>
  );
}
