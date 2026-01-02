import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../../../api/authApi";

export default function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isStudent, setIsStudent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isStudent) {
      alert("Seuls les étudiants ont le droit de s’inscrire.");
      return;
    }

    try {
      const response = await register({
        fullName,
        email,
        password
        // ⚠️ pas de role envoyé
      });

      localStorage.setItem("token", response.token);
      localStorage.setItem("role", response.role);

    navigate("/student/competences");
    } catch (error) {
      alert("Email déjà existe ");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-amber-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold">
            <span className="text-blue-900">SkillFlow</span>
            <span className="text-amber-700">360</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Inscription Étudiant
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nom complet"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          {/* Checkbox étudiant */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="student"
              checked={isStudent}
              onChange={(e) => setIsStudent(e.target.checked)}
            />
            <label htmlFor="student" className="text-sm text-gray-700">
              Je confirme que je suis étudiant
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-800 hover:bg-blue-900 text-white py-2 rounded-lg"
          >
            S’inscrire
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-amber-700 hover:underline"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
