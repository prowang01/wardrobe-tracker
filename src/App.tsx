import { useState, useEffect } from "react";

type Status =
  | "Wishlist"
  | "Commandé"
  | "En cours de livraison"
  | "Reçu et gardé"
  | "À retourner"
  | "Retour en cours"
  | "En cours de remboursement"
  | "Remboursé"
  | "Revendu";

type Item = {
  id: number;
  name: string;
  marque: string;
  prix: number;
  taille: string;
  couleur: string;
  ref: string;
  statut: Status;
};

type DonutView = "bilan" | "attente" | "recupere" | "total";

const STATUSES: Status[] = [
  "Wishlist","Commandé","En cours de livraison","Reçu et gardé",
  "À retourner","Retour en cours","En cours de remboursement","Remboursé","Revendu",
];

const STATUTS_DEPENSES: Status[] = [
  "Commandé","En cours de livraison","Reçu et gardé","À retourner",
  "Retour en cours","En cours de remboursement",
];

const EMPTY_FORM = {
  name: "", marque: "", prix: "", taille: "", couleur: "", ref: "", statut: "Wishlist" as Status,
};

const R = 52;
const C = 2 * Math.PI * R;

export default function App() {
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem("wardrobe-items");
    return saved ? JSON.parse(saved) : [];
  });
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [nextId, setNextId] = useState(1);
  const [error, setError] = useState("");
  const [filtre, setFiltre] = useState<Status | "Tous">("Tous");
  const [editId, setEditId] = useState<number | null>(null);
  const [donutView, setDonutView] = useState<DonutView>("bilan");

  useEffect(() => {
    localStorage.setItem("wardrobe-items", JSON.stringify(items));
  }, [items]);

  // Calculs trésorerie
  const totalDepense = items.filter(i => STATUTS_DEPENSES.includes(i.statut)).reduce((s, i) => s + i.prix, 0);
  const enAttente = items.filter(i => i.statut === "En cours de remboursement").reduce((s, i) => s + i.prix, 0);
  const recupere = items.filter(i => i.statut === "Remboursé" || i.statut === "Revendu").reduce((s, i) => s + i.prix, 0);
  const bilanNet = totalDepense - recupere;
  const perdu = Math.max(bilanNet - enAttente, 0);

  // Donut
  const total = totalDepense || 1;
  const segR = (perdu / total) * C;
  const segA = (enAttente / total) * C;
  const segG = (recupere / total) * C;
  const G_ROT = 193;
  const rotR = 0;
  const rotA = (perdu / total) * 360;
  const rotG = ((perdu + enAttente) / total) * 360;

  const donutLabel = donutView === "bilan" ? "Bilan net" : donutView === "attente" ? "En attente" : donutView === "recupere" ? "Récupéré" : "Total dépensé";
  const donutAmount =
    donutView === "bilan"
      ? bilanNet > 0
        ? `-${bilanNet.toFixed(2)} €`
        : bilanNet < 0
        ? `+${Math.abs(bilanNet).toFixed(2)} €`
        : `0.00 €`
      : donutView === "attente"
      ? `${enAttente.toFixed(2)} €`
      : donutView === "recupere"
      ? `${recupere.toFixed(2)} €`
      : `${totalDepense.toFixed(2)} €`;
  const donutColor =
    donutView === "bilan"
      ? bilanNet > 0 ? "#ef4444" : bilanNet < 0 ? "#22c55e" : "#111827"
      : donutView === "attente" ? "#f59e0b"
      : donutView === "recupere" ? "#22c55e"
      : "#111827";
  const itemsFiltres = filtre === "Tous" ? items : items.filter(i => i.statut === filtre);

  function handleOpenForm() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
    setError("");
    setShowOptional(false);
  }

  function handleEdit(item: Item) {
    setForm({ ...item, prix: item.prix.toString() });
    setEditId(item.id);
    setShowOptional(!!(item.taille || item.couleur || item.ref));
    setShowForm(true);
    setError("");
  }

  function handleSubmit() {
    if (!form.name || !form.marque || !form.prix) {
      setError("Le nom, la marque et le prix sont obligatoires.");
      return;
    }
    if (editId !== null) {
      setItems(prev => prev.map(i => i.id === editId ? { ...form, id: editId, prix: parseFloat(form.prix) } : i));
      setEditId(null);
    } else {
      setItems(prev => [...prev, { ...form, id: nextId, prix: parseFloat(form.prix) }]);
      setNextId(n => n + 1);
    }
    setForm(EMPTY_FORM);
    setShowForm(false);
    setShowOptional(false);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-5 max-w-xl mx-auto pb-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">👕 Wardrobe Tracker</h1>
        <button onClick={handleOpenForm} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Ajouter
        </button>
      </div>

      {/* Dashboard donut */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex flex-col items-center">
          <svg width="180" height="180" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r={R} fill="none" stroke="#f1f5f9" strokeWidth="16" />
            <g transform={`rotate(${G_ROT}, 65, 65)`}>
              <circle cx="65" cy="65" r={R} fill="none" stroke="#ef4444" strokeWidth="16"
                strokeDasharray={`${segR} ${C - segR}`} strokeDashoffset={C / 4}
                style={{ transform: `rotate(${rotR}deg)`, transformOrigin: "65px 65px", cursor: "pointer" }}
                onClick={() => setDonutView("bilan")} opacity={donutView === "bilan" ? 1 : 0.35} />
              <circle cx="65" cy="65" r={R} fill="none" stroke="#f59e0b" strokeWidth="16"
                strokeDasharray={`${segA} ${C - segA}`} strokeDashoffset={C / 4}
                style={{ transform: `rotate(${rotA}deg)`, transformOrigin: "65px 65px", cursor: "pointer" }}
                onClick={() => setDonutView("attente")} opacity={donutView === "attente" ? 1 : 0.35} />
              <circle cx="65" cy="65" r={R} fill="none" stroke="#22c55e" strokeWidth="16"
                strokeDasharray={`${segG} ${C - segG}`} strokeDashoffset={C / 4}
                style={{ transform: `rotate(${rotG}deg)`, transformOrigin: "65px 65px", cursor: "pointer" }}
                onClick={() => setDonutView("recupere")} opacity={donutView === "recupere" ? 1 : 0.35} />
            </g>
            <circle cx="65" cy="65" r="34" fill="transparent" style={{ cursor: "pointer" }} onClick={() => setDonutView("bilan")} />
            <text x="65" y="60" textAnchor="middle" fontSize="8" fill="#9ca3af" fontWeight="500">{donutLabel}</text>
            <text x="65" y="75" textAnchor="middle" fontSize="14" fill={donutColor} fontWeight="700">{donutAmount}</text>
            {donutView !== "bilan" && <text x="65" y="86" textAnchor="middle" fontSize="7" fill="#d1d5db">↩ retour</text>}
          </svg>

          <div className="flex gap-4 mt-1 text-xs">
            {[
              { v: "bilan" as DonutView, bg: bilanNet > 0 ? "bg-red-500" : bilanNet < 0 ? "bg-green-500" : "bg-gray-800", label: "Bilan" },
              { v: "attente" as DonutView, bg: "bg-amber-400", label: "En attente" },
              { v: "recupere" as DonutView, bg: "bg-green-500", label: "Récupéré" },
            ].map(({ v, bg, label }) => (
              <button key={v} onClick={() => setDonutView(v)}
                className={`flex items-center gap-1.5 transition-opacity ${donutView === v ? "opacity-100 font-semibold" : "opacity-40"}`}>
                <span className={`w-2.5 h-2.5 rounded-full ${bg} inline-block`} /> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats secondaires */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { v: "attente" as DonutView, label: "En attente", amount: `${enAttente.toFixed(2)} €`, sub: "remb. en cours", color: "#f59e0b" },
          { v: "recupere" as DonutView, label: "Récupéré", amount: `${recupere.toFixed(2)} €`, sub: "remboursé + Vinted", color: "#22c55e" },
          { v: "total" as DonutView, label: "Total dépensé", amount: `${totalDepense.toFixed(2)} €`, sub: `${items.filter(i => STATUTS_DEPENSES.includes(i.statut)).length} articles`, color: "#111827" },
        ].map(({ v, label, amount, sub, color }) => (
          <button key={v} onClick={() => setDonutView(v)}
            className={`bg-white rounded-xl p-3 shadow-sm text-left transition-all ${donutView === v ? "ring-2 ring-black" : ""}`}>
            <p className="text-xs text-gray-400 font-medium leading-tight">{label}</p>
            <p className="text-sm font-bold mt-1" style={{ color }}>{amount}</p>
            <p className="text-xs text-gray-300 mt-0.5 leading-tight">{sub}</p>
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {(["Tous", ...STATUSES] as (Status | "Tous")[]).map(s => (
          <button key={s} onClick={() => setFiltre(s)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filtre === s ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-300"}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Liste */}
      {itemsFiltres.length === 0 ? (
        <p className="text-gray-400 text-sm text-center mt-12">Aucun article pour l'instant.</p>
      ) : (
        <ul className="space-y-3">
          {itemsFiltres.map(item => (
            <li key={item.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.marque}{item.taille ? ` · ${item.taille}` : ""}{item.couleur ? ` · ${item.couleur}` : ""}
                  </p>
                  {item.ref && <p className="text-xs text-gray-400 font-mono mt-0.5">#{item.ref}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{item.prix.toFixed(2)} €</p>
                  <p className="text-xs text-gray-400 mt-1">{item.statut}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-3">
                <button onClick={() => handleEdit(item)} className="text-xs text-blue-400 hover:text-blue-600">
                  Modifier
                </button>
                <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} className="text-xs text-red-400 hover:text-red-600">
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}
            onKeyDown={e => { if (e.key === "Escape") setShowForm(false); }}
            className="bg-white rounded-xl p-5 w-full max-w-md shadow-xl space-y-3">

            <h2 className="font-semibold text-gray-800">{editId !== null ? "Modifier l'article" : "Nouvel article"}</h2>
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div>
              <label className="text-xs font-medium text-gray-700">Nom <span className="text-red-500">*</span></label>
              <input autoFocus className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="Ex: T-shirt Oversize AIRism"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Marque <span className="text-red-500">*</span></label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="Ex: Uniqlo"
                value={form.marque} onChange={e => setForm(f => ({ ...f, marque: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Prix (€) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="19.90"
                value={form.prix} onChange={e => setForm(f => ({ ...f, prix: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">Statut</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
                value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value as Status }))}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button type="button" onClick={() => setShowOptional(v => !v)} className="text-xs text-gray-400 hover:text-gray-600 underline">
              {showOptional ? "Masquer les détails" : "+ Ajouter des détails (taille, couleur, référence)"}
            </button>

            {showOptional && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-700">Taille</label>
                    <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="M"
                      value={form.taille} onChange={e => setForm(f => ({ ...f, taille: e.target.value }))} />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-700">Couleur</label>
                    <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="Beige"
                      value={form.couleur} onChange={e => setForm(f => ({ ...f, couleur: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700">Référence produit</label>
                  <input className="w-full border rounded-lg px-3 py-2 text-sm mt-1" placeholder="UQ-OV-2024"
                    value={form.ref} onChange={e => setForm(f => ({ ...f, ref: e.target.value }))} />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border rounded-lg py-2 text-sm text-gray-600">
                Annuler
              </button>
              <button type="submit" className="flex-1 bg-black text-white rounded-lg py-2 text-sm font-medium">
                {editId !== null ? "Enregistrer" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}