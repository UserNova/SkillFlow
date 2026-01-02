import Activites from "./Activites";
import ActivitesStudent from "./ActivitesStudent";

export default function ActivitiesRouter() {
  const role = localStorage.getItem("role");

  if (role === "ADMIN") {
    return <Activites />;
  }

  if (role === "STUDENT") {
    return <ActivitesStudent />;
  }

  return (
    <div className="p-6 text-red-600 font-semibold">
      Accès non autorisé
    </div>
  );
}
