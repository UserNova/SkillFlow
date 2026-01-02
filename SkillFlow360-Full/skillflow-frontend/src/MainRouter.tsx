import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./app/App";

/* AUTH */
import Login from "./app/components/Pages/auth/Login";
import Register from "./app/components/Pages/auth/Register";

/* PROFIL */
import Profile from "./app/components/Pages/profil/Profile";
import Settings from "./app/components/Pages/profil/Settings";

/* COMPETENCES */
import { Competences } from "./app/components/Pages/Competences";
import CompetencesStudent from "./app/components/Pages/CompetencesStudent";

/* ACTIVITES */
import Activites from "./app/components/Pages/activities/Activites";
import ActivitesStudent from "./app/components/Pages/activities/ActivitesStudent";

/* EVALUATIONS */
import EvaluationsAdmin from "./app/components/Pages/evaluations/EvaluationsAdmin";
import EvaluationsStudent from "./app/components/Pages/evaluations/EvaluationsStudent";
import PassEvaluation from "./app/components/Pages/evaluations/PassEvaluation";
import StudentResultPage from "./app/components/Pages/evaluations/StudentResultPage";

/* GRAPHES */
import { GrapheAnalyse } from "./app/components/Pages/GrapheAnalyse";

/* RECOMMANDATIONS */
import  Recommandations from "./app/components/Pages/Recommandations";

export default function MainRouter() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // "ADMIN" | "STUDENT"

  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED */}
        <Route element={token ? <App /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<Navigate to="/profile" replace />} />

          {/* COMMON */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          {/* ADMIN */}
          {role === "ADMIN" && (
            <>
              <Route path="/competences" element={<Competences />} />
              <Route path="/activities" element={<Activites />} />
              <Route path="/evaluations" element={<EvaluationsAdmin />} />
              <Route path="/graphe-analyse" element={<GrapheAnalyse />} />
            </>
          )}

          {/* STUDENT */}
          {role === "STUDENT" && (
            <>
              <Route path="/competence-student" element={<CompetencesStudent />} />
              <Route path="/activities-student" element={<ActivitesStudent />} />
              <Route path="/evaluations-student" element={<EvaluationsStudent />} />
              <Route path="/student/evaluations/:id" element={<PassEvaluation />} />
              <Route
                path="/student/submissions/:submissionId/result"
                element={<StudentResultPage />}
              />

              {/* ✅ RECOMMANDATIONS (STUDENT ONLY) */}
              <Route path="/recommandations" element={<Recommandations />} />
            </>
          )}
        </Route>

        {/* FALLBACK */}
        <Route
          path="*"
          element={<Navigate to={token ? "/profile" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
