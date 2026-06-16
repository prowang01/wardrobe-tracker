import { useState, useEffect } from "react";
import {
  ShoppingBag, Plus, Pencil, Trash2, ExternalLink,
  X, CreditCard, Calendar, Tag, Palette, Shirt, Watch, ChevronDown, Check
} from "lucide-react";

// ─── Types & Constants ────────────────────────────────────────────────────────

type Statut =
  | "Wishlist" | "Commandé" | "En cours de livraison" | "Reçu et gardé"
  | "À retourner" | "Retour en cours" | "En cours de remboursement" | "Remboursé" | "Revendu";

type Item = {
  id: number; name: string; marque: string; prix: number; taille: string;
  couleur: string; ref: string; statut: Statut; photo: string; lien: string;
  paiement: string; banque: string; date: string; categorie: string;
};

const STATUTS: Statut[] = [
  "Wishlist","Commandé","En cours de livraison","Reçu et gardé",
  "À retourner","Retour en cours","En cours de remboursement","Remboursé","Revendu"
];
const STATUTS_DEPENSES: Statut[] = [
  "Commandé","En cours de livraison","Reçu et gardé","À retourner",
  "Retour en cours","En cours de remboursement","Remboursé","Revendu"
];
const STATUS_COLORS: Record<string,string> = {
  "Wishlist":"#94a3b8","Commandé":"#fcd34d","En cours de livraison":"#93c5fd",
  "Reçu et gardé":"#6ee7b7","À retourner":"#f87171","Retour en cours":"#fb923c",
  "En cours de remboursement":"#fb923c","Remboursé":"#a3e635","Revendu":"#c084fc",
};
const PAIEMENTS = ["Espèces","Carte bancaire"];
const CATEGORIES = ["Hauts","Bas","Chaussures","Accessoires","Sous-vêtements","Autre"];
const BG_DARK = "#1c1c1e";

const emptyForm = (): Omit<Item,"id"> => ({
  name:"",marque:"",prix:0,taille:"",couleur:"",ref:"",
  statut:"Wishlist",photo:"",lien:"",paiement:"",banque:"",date:"",categorie:""
});

const CategorieIcon = ({ cat }: { cat: string }) => {
  if (cat === "Hauts") return <Shirt size={13}/>;
  if (cat === "Accessoires") return <Watch size={13}/>;
  return <Tag size={13}/>;
};

// ─── FilterDropdown — hors App ────────────────────────────────────────────────

interface FDProps {
  label: string; value: string; options: string[];
  onSelect: (v: string) => void;
  search: string; onSearch: (v: string) => void;
  isOpen: boolean; onToggle: () => void;
  colorMap?: Record<string,string>;
}

function FilterDropdown({ label, value, options, onSelect, search, onSearch, isOpen, onToggle, colorMap }: FDProps) {
  const active = value !== "Tous";
  const visible = ["Tous",...options].filter(o => o.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ position:"relative" }}>
      <button onClick={e => { e.stopPropagation(); onToggle(); }}
        style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", borderRadius:100,
          border:`1px solid ${active?"#374151":"#d1d5db"}`,
          background: active ? BG_DARK : "#fff",
          color: active ? "#fff" : "#374151",
          fontSize:13, fontWeight:500, cursor:"pointer", whiteSpace:"nowrap" }}>
        {active ? value : label}
        <ChevronDown size={13} style={{ transform:isOpen?"rotate(180deg)":"none", transition:"0.2s" }}/>
      </button>
      {isOpen && (
        <div onClick={e => e.stopPropagation()}
          style={{ position:"absolute", top:"calc(100% + 8px)", left:0, zIndex:30,
            background:"#fff", borderRadius:14, minWidth:220,
            boxShadow:"0 8px 32px rgba(0,0,0,0.12)", border:"1px solid #f0f0ee", overflow:"hidden" }}>
          <div style={{ padding:"10px 12px 8px" }}>
            <input autoFocus value={search} onChange={e => onSearch(e.target.value)}
              placeholder="Rechercher..."
              style={{ width:"100%", padding:"7px 10px", borderRadius:8,
                border:"1px solid #e5e7eb", fontSize:12, boxSizing:"border-box", outline:"none" }}/>
          </div>
          <div style={{ maxHeight:220, overflowY:"auto", paddingBottom:6 }}>
            {visible.length === 0 && <p style={{ color:"#94a3b8", fontSize:12, padding:"8px 16px", margin:0 }}>Aucun résultat</p>}
            {visible.map(o => (
              <button key={o} onClick={() => { onSelect(o); onToggle(); onSearch(""); }}
                style={{ width:"100%", textAlign:"left", padding:"9px 16px", border:"none",
                  background: value===o?"#f8f7f5":"transparent",
                  fontSize:13, cursor:"pointer", fontWeight:value===o?600:400, color:"#374151",
                  display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {colorMap && o!=="Tous" && (
                    <div style={{ width:7, height:7, borderRadius:4, background:colorMap[o]||"#94a3b8", flexShrink:0 }}/>
                  )}
                  <span>{o}</span>
                </div>
                {value===o && <span style={{ color:"#6366f1", fontSize:11 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [items, setItems] = useState<Item[]>(() => {
    try { return JSON.parse(localStorage.getItem("wardrobe-items") || "[]"); }
    catch { return []; }
  });
  const [nextId, setNextId] = useState<number>(() => {
    try { return JSON.parse(localStorage.getItem("wardrobe-nextid") || "1"); }
    catch { return 1; }
  });

  const [showForm, setShowForm] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [form, setForm] = useState<Omit<Item,"id">>(emptyForm());
  const [editId, setEditId] = useState<number|null>(null);
  const [error, setError] = useState("");

  // Filtres
  const [filtreCategorie, setFiltreCategorie] = useState("Tous");
  const [filtreStatut, setFiltreStatut] = useState("Tous");
  const [filtreMarque, setFiltreMarque] = useState("Tous");
  const [filtrePaiement, setFiltrePaiement] = useState("Tous");
  const [filtreFinance, setFiltreFinance] = useState<"all"|"depense"|"attente"|"recupere">("all");

  const [openFilter, setOpenFilter] = useState<"categorie"|"statut"|"marque"|"paiement"|null>(null);
  const [searchCat, setSearchCat] = useState("");
  const [searchStat, setSearchStat] = useState("");
  const [searchMarq, setSearchMarq] = useState("");
  const [searchPaie, setSearchPaie] = useState("");

  // Insights
  const [selectedMarqueInsight, setSelectedMarqueInsight] = useState<string|null>(null);

  // Drawer
  const [drawerItem, setDrawerItem] = useState<Item|null>(null);
  const [editingBadge, setEditingBadge] = useState<"statut"|"categorie"|"paiement"|null>(null);
  const [editBanque, setEditBanque] = useState(""); // banque temporaire dans le dropdown paiement


  // Inline editing dans le drawer
  const [editingDrawerKey, setEditingDrawerKey] = useState<string|null>(null);
  const [editValue, setEditValue] = useState("");

  const [lightboxPhoto, setLightboxPhoto] = useState<string|null>(null);

  useEffect(() => {
    localStorage.setItem("wardrobe-items", JSON.stringify(items));
    localStorage.setItem("wardrobe-nextid", JSON.stringify(nextId));
  }, [items, nextId]);

  // ── Finance ──
  const totalDepense = items.filter(i => STATUTS_DEPENSES.includes(i.statut)).reduce((s,i) => s+i.prix, 0);
  const enAttente = items.filter(i => i.statut === "En cours de remboursement").reduce((s,i) => s+i.prix, 0);
  const recupere = items.filter(i => ["Remboursé","Revendu"].includes(i.statut)).reduce((s,i) => s+i.prix, 0);
  const bilanNet = totalDepense - recupere;
  const perdu = Math.max(bilanNet - enAttente, 0);

  const R = 54, C = 2 * Math.PI * R;
  const totalChart = Math.max(totalDepense, 1);
  const segG = (recupere/totalChart)*C;
  const segA = (enAttente/totalChart)*C;
  const segR = (perdu/totalChart)*C;

  const marques = [...new Set(items.map(i => i.marque).filter(Boolean))].sort();
  const paiements = [...new Set(items.map(i => i.paiement.split(" - ")[0]).filter(Boolean))].sort();

  const filtered = items
    .filter(i => {
      if (filtreFinance === "depense") return STATUTS_DEPENSES.includes(i.statut);
      if (filtreFinance === "attente") return i.statut === "En cours de remboursement";
      if (filtreFinance === "recupere") return ["Remboursé","Revendu"].includes(i.statut);
      return true;
    })
    .filter(i => filtreStatut === "Tous" || i.statut === filtreStatut)
    .filter(i => filtreMarque === "Tous" || i.marque === filtreMarque)
    .filter(i => filtrePaiement === "Tous" || i.paiement.startsWith(filtrePaiement))
    .filter(i => filtreCategorie === "Tous" || (i.categorie !== "" && i.categorie === filtreCategorie));

  const nbFiltresActifs = [filtreStatut!=="Tous", filtreMarque!=="Tous", filtrePaiement!=="Tous", filtreCategorie!=="Tous"].filter(Boolean).length;
  const resetFiltres = () => { setFiltreStatut("Tous"); setFiltreMarque("Tous"); setFiltrePaiement("Tous"); setFiltreCategorie("Tous"); };

  // ── Mettre à jour un champ depuis le drawer ──
  const updateItemField = (id: number, field: keyof Item, value: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    setDrawerItem(prev => prev ? { ...prev, [field]: value } : null);
    setEditingBadge(null);
  };

  // ── Inline editing handlers ──
  const startInlineEdit = (key: string, currentValue: string) => {
    setEditingDrawerKey(key);
    setEditValue(currentValue);
    setEditingBadge(null);
  };

  const commitInlineEdit = () => {
    if (editingDrawerKey && drawerItem) {
      updateItemField(drawerItem.id, editingDrawerKey as keyof Item, editValue);
    }
    setEditingDrawerKey(null);
    setEditValue("");
  };

  const cancelInlineEdit = () => {
    setEditingDrawerKey(null);
    setEditValue("");
  };

  // ── Insights ──
  const getInsight = (marque: string) => {
    const arts = items.filter(i => i.marque === marque && STATUTS_DEPENSES.includes(i.statut));
    if (!arts.length) return null;
    const gardes = arts.filter(i => i.statut === "Reçu et gardé").length;
    const pct = Math.round((gardes/arts.length)*100);
    const totalSpend = arts.reduce((s,i) => s+i.prix, 0);
    const totalRec = arts.filter(i => ["Remboursé","Revendu"].includes(i.statut)).reduce((s,i) => s+i.prix, 0);
    const statGroups: Record<string,number> = {};
    arts.forEach(i => { statGroups[i.statut] = (statGroups[i.statut]||0)+i.prix; });
    return { pct, totalSpend, totalRec, statGroups, count: arts.length };
  };

  const renderMiniPie = (statGroups: Record<string,number>, totalSpend: number) => {
    const cx=60, cy=60, r=50; let angle = -Math.PI/2;
    return (
      <svg width={120} height={120} viewBox="0 0 120 120">
        {Object.entries(statGroups).map(([status,value]) => {
          const sweep = (value/totalSpend)*2*Math.PI;
          const x1=cx+r*Math.cos(angle), y1=cy+r*Math.sin(angle);
          angle += sweep;
          const x2=cx+r*Math.cos(angle), y2=cy+r*Math.sin(angle);
          return <path key={status}
            d={`M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${sweep>Math.PI?1:0} 1 ${x2} ${y2}Z`}
            fill={STATUS_COLORS[status]||"#636366"} stroke="#1c1c1e" strokeWidth={1.5}/>;
        })}
      </svg>
    );
  };

  // ── Form ──
  const openAdd = () => { setForm(emptyForm()); setEditId(null); setError(""); setShowOptional(false); setShowForm(true); };
  const openEdit = (item: Item) => {
    let paiement=item.paiement, banque=item.banque;
    if (item.paiement.includes(" - ")) [paiement, banque] = item.paiement.split(" - ");
    setForm({...item, paiement, banque}); setEditId(item.id);
    setError(""); setShowOptional(true); setShowForm(true); setDrawerItem(null);
  };

  const handleSubmit = () => {
    const hasName = form.name.trim() !== "";
    const prixNum = parseFloat(String(form.prix));
    const hasPrix = !isNaN(prixNum) && prixNum > 0;
    if (!hasName && !hasPrix) { setError("Le nom et le prix sont requis."); return; }
    if (!hasName) { setError("Le nom est requis."); return; }
    if (!hasPrix) { setError("Le prix est requis."); return; }
    const paiementFinal = form.paiement === "Carte bancaire" && form.banque
      ? `Carte bancaire - ${form.banque}` : form.paiement;
    const itemData: Omit<Item,"id"> = { ...form, prix: prixNum, paiement: paiementFinal };
    if (editId !== null) {
      setItems(prev => prev.map(i => i.id === editId ? {...itemData, id:editId} : i));
    } else {
      setItems(prev => [...prev, {...itemData, id:nextId}]);
      setNextId(n => n+1);
    }
    setShowForm(false);
  };

  const deleteItem = (id: number) => { setItems(prev => prev.filter(i => i.id!==id)); setDrawerItem(null); };

  const inputStyle: React.CSSProperties = { width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #e5e7eb", fontSize:13, boxSizing:"border-box" };
  const labelStyle: React.CSSProperties = { fontSize:11, fontWeight:600, color:"#94a3b8", display:"block", marginBottom:4 };

  // ── Composant chip inline-editable ──
  const EditableChip = ({
    fieldKey, label, value, icon, inputType = "text", placeholder = ""
  }: {
    fieldKey: string; label: string; value: string;
    icon: React.ReactNode; inputType?: string; placeholder?: string;
  }) => {
    if (!value && editingDrawerKey !== fieldKey) return null;
    const isEditing = editingDrawerKey === fieldKey;

    return (
      <div
        onClick={() => !isEditing && startInlineEdit(fieldKey, value)}
        style={{ background: isEditing ? "#fff" : "#f8f7f5", borderRadius:10, padding:"8px 12px",
          cursor: isEditing ? "default" : "text",
          border: isEditing ? "1.5px solid #6366f1" : "1.5px solid transparent",
          transition:"border 0.15s", position:"relative" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          gap:4, color:"#94a3b8", marginBottom:4 }}>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
            {icon}
            <span style={{ fontSize:10, fontWeight:600 }}>{label.toUpperCase()}</span>
          </div>
          {isEditing && (
            <div style={{ display:"flex", gap:4 }}>
              <button onClick={e => { e.stopPropagation(); commitInlineEdit(); }}
                style={{ background:"#6366f1", border:"none", borderRadius:6, width:22, height:22,
                  display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <Check size={12} color="#fff"/>
              </button>
              <button onClick={e => { e.stopPropagation(); cancelInlineEdit(); }}
                style={{ background:"#f3f4f6", border:"none", borderRadius:6, width:22, height:22,
                  display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <X size={12} color="#6b7280"/>
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <input
            autoFocus
            type={inputType}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") commitInlineEdit();
              if (e.key === "Escape") cancelInlineEdit();
            }}
            placeholder={placeholder || value}
            onClick={e => e.stopPropagation()}
            style={{ width:"100%", background:"transparent", border:"none", outline:"none",
              fontSize:13, fontWeight:600, color:BG_DARK, padding:0, boxSizing:"border-box" }}/>
        ) : (
          <p style={{ fontSize:13, fontWeight:600, margin:0, color:BG_DARK }}>{value}</p>
        )}
      </div>
    );
  };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"#f8f7f5",
      fontFamily:"-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
      onClick={() => { setOpenFilter(null); setEditingBadge(null); }}>

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <div style={{ width:340, background:BG_DARK, color:"#fff", display:"flex",
        flexDirection:"column", overflow:"hidden", flexShrink:0 }}
        onClick={e => e.stopPropagation()}>

        <div style={{ padding:"24px 20px 12px", display:"flex", alignItems:"center", gap:8 }}>
          <ShoppingBag size={16} color="#6ee7b7"/>
          <span style={{ fontWeight:700, fontSize:14 }}>Wardrobe</span>
          <span style={{ marginLeft:"auto", color:"#48484a", fontSize:11 }}>{items.length} articles</span>
        </div>

        <div style={{ display:"flex", justifyContent:"center" }}>
          <svg width={120} height={120} viewBox="0 0 120 120">
            <g transform="rotate(-90 60 60)">
              <circle cx={60} cy={60} r={R} fill="none" stroke="#2c2c2e" strokeWidth={12}/>
              <circle cx={60} cy={60} r={R} fill="none" stroke="#6ee7b7" strokeWidth={12}
                strokeDasharray={`${segG} ${C-segG}`} strokeDashoffset={0}/>
              <circle cx={60} cy={60} r={R} fill="none" stroke="#fcd34d" strokeWidth={12}
                strokeDasharray={`${segA} ${C-segA}`} strokeDashoffset={-segG}/>
              <circle cx={60} cy={60} r={R} fill="none" stroke="#f87171" strokeWidth={12}
                strokeDasharray={`${segR} ${C-segR}`} strokeDashoffset={-(segG+segA)}/>
            </g>
            <text x={60} y={55} textAnchor="middle" fill="#fff" fontSize={18} fontWeight="800">
              {bilanNet>=0?"-":"+"}{Math.abs(bilanNet).toFixed(2)}€
            </text>
            <text x={60} y={70} textAnchor="middle" fill="#48484a" fontSize={9}>BILAN NET</text>
          </svg>
        </div>

        <div style={{ display:"flex", margin:"12px 16px 16px", background:"#2c2c2e", borderRadius:14, overflow:"hidden" }}>
          {([
            { key:"depense" as const, label:"Dépensé",   value:totalDepense, color:"#fff"    },
            { key:"attente" as const, label:"En attente", value:enAttente,   color:"#fcd34d" },
            { key:"recupere" as const,label:"Récupéré",  value:recupere,    color:"#6ee7b7" },
          ]).map((s,idx) => (
            <button key={s.key}
              onClick={() => setFiltreFinance(filtreFinance===s.key?"all":s.key)}
              style={{ flex:1, padding:"10px 6px", border:"none", cursor:"pointer", textAlign:"center",
                background: filtreFinance===s.key?"#3a3a3c":"transparent",
                borderLeft: idx>0?"1px solid #3a3a3c":"none" }}>
              <p style={{ color:"#636366", fontSize:9, margin:"0 0 3px", fontWeight:600, letterSpacing:"0.05em" }}>
                {s.label.toUpperCase()}
              </p>
              <p style={{ color:s.color, fontSize:12, fontWeight:700, margin:0 }}>
                {s.value.toFixed(2)}€
              </p>
            </button>
          ))}
        </div>

        <div style={{ height:1, background:"#2c2c2e", margin:"0 20px" }}/>

        <div style={{ padding:"14px 20px 8px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ color:"#636366", fontSize:10, letterSpacing:"0.08em", fontWeight:600 }}>INSIGHTS PAR MARQUE</span>
          {selectedMarqueInsight && (
            <button onClick={() => setSelectedMarqueInsight(null)}
              style={{ background:"none", border:"none", color:"#8e8e93", fontSize:11, cursor:"pointer" }}>
              ← retour
            </button>
          )}
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"0 14px 20px" }}>
          {!selectedMarqueInsight && (
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {marques.map(m => {
                const ins = getInsight(m);
                if (!ins) return null;
                return (
                  <button key={m} onClick={() => setSelectedMarqueInsight(m)}
                    style={{ background:"#2c2c2e", borderRadius:12, padding:"10px 12px",
                      border:"none", cursor:"pointer", textAlign:"left" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <p style={{ color:"#fff", fontSize:12, fontWeight:700, margin:0 }}>{m}</p>
                        <p style={{ color:"#636366", fontSize:10, margin:"2px 0 0" }}>{ins.count} art. · {ins.totalSpend.toFixed(2)}€</p>
                      </div>
                      <span style={{
                        background: ins.pct>=70?"#6ee7b722":ins.pct>=40?"#fcd34d22":"#f8717122",
                        color: ins.pct>=70?"#6ee7b7":ins.pct>=40?"#fcd34d":"#f87171",
                        fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>
                        {ins.pct}% gardé
                      </span>
                    </div>
                  </button>
                );
              })}
              {marques.length===0 && (
                <p style={{ color:"#48484a", fontSize:11, padding:"8px 4px" }}>
                  Ajoute des articles pour voir les insights
                </p>
              )}
            </div>
          )}

          {selectedMarqueInsight && (() => {
            const ins = getInsight(selectedMarqueInsight);
            if (!ins) return null;
            return (
              <div>
                <p style={{ color:"#fff", fontWeight:700, fontSize:14, margin:"0 0 4px" }}>{selectedMarqueInsight}</p>
                <p style={{ color:"#8e8e93", fontSize:12, margin:"0 0 14px" }}>
                  Tu gardes <strong style={{ color: ins.pct>=70?"#6ee7b7":ins.pct>=40?"#fcd34d":"#f87171" }}>{ins.pct}%</strong> de tes articles
                </p>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}>
                  {renderMiniPie(ins.statGroups, ins.totalSpend)}
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:12 }}>
                  {Object.entries(ins.statGroups).map(([s,v]) => (
                    <div key={s} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:6, height:6, borderRadius:3, background:STATUS_COLORS[s]||"#636366" }}/>
                        <span style={{ color:"#8e8e93", fontSize:11 }}>{s}</span>
                      </div>
                      <span style={{ color:"#aeaeb2", fontSize:11, fontWeight:600 }}>{v.toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:"#2c2c2e", borderRadius:10, padding:"10px 12px" }}>
                  {[
                    { label:"Dépensé",  value:`${ins.totalSpend.toFixed(2)}€`,              color:"#fff"    },
                    { label:"Récupéré", value:`${ins.totalRec.toFixed(2)}€`,                color:"#6ee7b7" },
                    { label:"Bilan",    value:`-${(ins.totalSpend-ins.totalRec).toFixed(2)}€`,
                      color:ins.totalSpend-ins.totalRec>0?"#f87171":"#6ee7b7", border:true },
                  ].map(r => (
                    <div key={r.label} style={{ display:"flex", justifyContent:"space-between",
                      marginTop:r.border?6:0, paddingTop:r.border?6:0,
                      borderTop:r.border?"1px solid #3a3a3c":"none", marginBottom:4 }}>
                      <span style={{ color:"#8e8e93", fontSize:11 }}>{r.label}</span>
                      <span style={{ color:r.color, fontSize:11, fontWeight:700 }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <div style={{ flex:1, overflowY:"auto", position:"relative", display:"flex", flexDirection:"column" }}
        onClick={e => e.stopPropagation()}>

        <div style={{ position:"sticky", top:0, zIndex:20, background:"#f8f7f5",
          borderBottom:"1px solid #e5e5e0", padding:"16px 24px 14px" }}>
          <div style={{ marginBottom:12 }}>
            <h2 style={{ fontWeight:700, fontSize:15, margin:0 }}>Mes articles</h2>
            <p style={{ color:"#94a3b8", fontSize:11, margin:"2px 0 0" }}>
              {filtered.length} article{filtered.length!==1?"s":""}
            </p>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
            <FilterDropdown
              label="Type d'article" value={filtreCategorie} options={CATEGORIES}
              onSelect={setFiltreCategorie} search={searchCat} onSearch={setSearchCat}
              isOpen={openFilter==="categorie"}
              onToggle={() => setOpenFilter(openFilter==="categorie"?null:"categorie")}/>
            <FilterDropdown
              label="Statut" value={filtreStatut} options={STATUTS}
              onSelect={setFiltreStatut} search={searchStat} onSearch={setSearchStat}
              isOpen={openFilter==="statut"}
              onToggle={() => setOpenFilter(openFilter==="statut"?null:"statut")}
              colorMap={STATUS_COLORS}/>
            <FilterDropdown
              label="Marque" value={filtreMarque} options={marques}
              onSelect={setFiltreMarque} search={searchMarq} onSearch={setSearchMarq}
              isOpen={openFilter==="marque"}
              onToggle={() => setOpenFilter(openFilter==="marque"?null:"marque")}/>
            <FilterDropdown
              label="Paiement" value={filtrePaiement} options={paiements}
              onSelect={setFiltrePaiement} search={searchPaie} onSearch={setSearchPaie}
              isOpen={openFilter==="paiement"}
              onToggle={() => setOpenFilter(openFilter==="paiement"?null:"paiement")}/>
            {nbFiltresActifs > 0 && (
              <button onClick={resetFiltres}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 14px",
                  borderRadius:100, border:"1px solid #fca5a5", background:"#fff5f5",
                  fontSize:12, fontWeight:500, cursor:"pointer", color:"#ef4444" }}>
                <X size={12}/> Réinitialiser ({nbFiltresActifs})
              </button>
            )}
          </div>
        </div>

        <div style={{ padding:20, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14,
          flex:1, alignContent:"start" }}>
          {filtered.map(item => (
            <div key={item.id} onClick={() => { setDrawerItem(item); setEditingDrawerKey(null); }}
              style={{ background:"#fff", borderRadius:18, overflow:"hidden", cursor:"pointer",
                boxShadow:"0 2px 10px rgba(0,0,0,0.06)", transition:"transform 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.transform="scale(1.03)")}
              onMouseLeave={e => (e.currentTarget.style.transform="scale(1)")}>
              <div style={{ height:160, position:"relative" }}>
                {item.photo ? (
                  <img src={item.photo} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                ) : (
                  <div style={{ width:"100%", height:"100%", background:"#f3f4f6",
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <ShoppingBag size={28} color="#d1d5db"/>
                  </div>
                )}
                {item.categorie && (
                  <div style={{ position:"absolute", top:8, left:8, background:"rgba(0,0,0,0.5)",
                    color:"#fff", fontSize:9, fontWeight:700, padding:"2px 7px", borderRadius:20,
                    backdropFilter:"blur(4px)" }}>{item.categorie}</div>
                )}
                <div style={{ position:"absolute", top:8, right:8, width:8, height:8, borderRadius:4,
                  background:STATUS_COLORS[item.statut]||"#94a3b8",
                  boxShadow:`0 0 6px ${STATUS_COLORS[item.statut]||"#94a3b8"}` }}/>
              </div>
              <div style={{ padding:"10px 12px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:4 }}>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontWeight:700, fontSize:13, margin:0, whiteSpace:"nowrap",
                      overflow:"hidden", textOverflow:"ellipsis" }}>{item.name}</p>
                    <p style={{ color:"#94a3b8", fontSize:10, margin:"1px 0 0", whiteSpace:"nowrap",
                      overflow:"hidden", textOverflow:"ellipsis" }}>{item.marque}</p>
                  </div>
                  <span style={{ fontWeight:700, fontSize:13, flexShrink:0 }}>
                    {item.prix > 0 ? `${item.prix.toFixed(2)}€` : "—"}
                  </span>
                </div>
                <span style={{ display:"inline-block", marginTop:7, padding:"2px 8px", borderRadius:20,
                  fontSize:9, fontWeight:700,
                  background:(STATUS_COLORS[item.statut]||"#94a3b8")+"22",
                  color:STATUS_COLORS[item.statut]||"#94a3b8" }}>{item.statut}</span>
              </div>
            </div>
          ))}
          {filtered.length===0 && (
            <div style={{ gridColumn:"1 / -1", display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center", padding:60, color:"#d1d5db" }}>
              <ShoppingBag size={32} style={{ opacity:0.3, marginBottom:10 }}/>
              <p style={{ fontSize:14 }}>Aucun article pour ces filtres</p>
            </div>
          )}
        </div>

        <button onClick={openAdd}
          style={{ position:"fixed", bottom:24, right:24, width:52, height:52, borderRadius:26,
            border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            background:"#fff", boxShadow:"0 4px 24px rgba(0,0,0,0.15)", zIndex:50 }}>
          <Plus size={22} color={BG_DARK}/>
        </button>
      </div>

      {/* ══════════════ DRAWER ══════════════ */}
      {drawerItem && (
        <div onClick={() => { setDrawerItem(null); setEditingBadge(null); cancelInlineEdit(); }}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:100,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"#fff", borderRadius:24, width:420, maxHeight:"90vh",
              overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>

            {drawerItem.photo && (
              <div style={{ height:260 }}>
                <img src={drawerItem.photo} alt={drawerItem.name}
                  style={{ width:"100%", height:"100%", objectFit:"cover",
                    borderRadius:"24px 24px 0 0", cursor:"zoom-in" }}
                  onClick={() => setLightboxPhoto(drawerItem.photo)}/>
              </div>
            )}

            <div style={{ padding:"20px 24px 24px" }}>
              {/* Nom + Prix */}
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"flex-start", marginBottom:4 }}>
                <div>
                  <h2 style={{ fontWeight:800, fontSize:20, margin:0 }}>{drawerItem.name}</h2>
                  <p style={{ color:"#94a3b8", fontSize:13, margin:"2px 0 0" }}>{drawerItem.marque}</p>
                </div>
                <span style={{ fontWeight:800, fontSize:20 }}>
                  {drawerItem.prix > 0 ? `${drawerItem.prix.toFixed(2)}€` : "—"}
                </span>
              </div>

              {/* Badges cliquables */}
              <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
                {/* Badge Statut */}
                <div style={{ position:"relative" }}>
                  <button
                    onClick={e => { e.stopPropagation(); setEditingBadge(editingBadge==="statut"?null:"statut"); cancelInlineEdit(); }}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px",
                      borderRadius:20, border:"none", cursor:"pointer",
                      background:(STATUS_COLORS[drawerItem.statut]||"#94a3b8")+"22",
                      color:STATUS_COLORS[drawerItem.statut]||"#94a3b8",
                      fontSize:12, fontWeight:700 }}>
                    {drawerItem.statut} <ChevronDown size={11}/>
                  </button>
                  {editingBadge==="statut" && (
                    <div onClick={e => e.stopPropagation()}
                      style={{ position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:50,
                        background:"#fff", borderRadius:12, minWidth:220,
                        boxShadow:"0 8px 24px rgba(0,0,0,0.12)", border:"1px solid #f0f0ee", overflow:"hidden" }}>
                      <div style={{ maxHeight:240, overflowY:"auto" }}>
                        {STATUTS.map(s => (
                          <button key={s}
                            onClick={() => updateItemField(drawerItem.id, "statut", s)}
                            style={{ width:"100%", textAlign:"left", padding:"9px 16px", border:"none",
                              background: drawerItem.statut===s?"#f8f7f5":"transparent",
                              fontSize:12, cursor:"pointer", fontWeight: drawerItem.statut===s?700:400,
                              display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ width:7, height:7, borderRadius:4,
                              background:STATUS_COLORS[s]||"#94a3b8", flexShrink:0 }}/>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Badge Catégorie */}
                <div style={{ position:"relative" }}>
                  <button
                    onClick={e => { e.stopPropagation(); setEditingBadge(editingBadge==="categorie"?null:"categorie"); cancelInlineEdit(); }}
                    style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px",
                      borderRadius:20, border:"none", cursor:"pointer",
                      background: drawerItem.categorie ? "#f3f4f6" : "#f9fafb",
                      color: drawerItem.categorie ? "#374151" : "#9ca3af",
                      fontSize:12, fontWeight: drawerItem.categorie ? 700 : 400 }}>
                    {drawerItem.categorie || "Catégorie..."} <ChevronDown size={11}/>
                  </button>
                  {editingBadge==="categorie" && (
                    <div onClick={e => e.stopPropagation()}
                      style={{ position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:50,
                        background:"#fff", borderRadius:12, minWidth:180,
                        boxShadow:"0 8px 24px rgba(0,0,0,0.12)", border:"1px solid #f0f0ee", overflow:"hidden" }}>
                      <div style={{ maxHeight:240, overflowY:"auto" }}>
                        <button onClick={() => updateItemField(drawerItem.id, "categorie", "")}
                          style={{ width:"100%", textAlign:"left", padding:"9px 16px", border:"none",
                            background:"transparent", fontSize:12, cursor:"pointer",
                            color:"#9ca3af", fontStyle:"italic" }}>
                          Sans catégorie
                        </button>
                        {CATEGORIES.map(c => (
                          <button key={c}
                            onClick={() => updateItemField(drawerItem.id, "categorie", c)}
                            style={{ width:"100%", textAlign:"left", padding:"9px 16px", border:"none",
                              background: drawerItem.categorie===c?"#f8f7f5":"transparent",
                              fontSize:12, cursor:"pointer", fontWeight: drawerItem.categorie===c?700:400,
                              color:"#374151" }}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Champs inline-editables : Taille | Couleur / Paiement | Date / Réf */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                <EditableChip fieldKey="taille" label="Taille" value={drawerItem.taille}
                  icon={<Tag size={13}/>} placeholder="M, L, 42..."/>
                <EditableChip fieldKey="couleur" label="Couleur" value={drawerItem.couleur}
                  icon={<Palette size={13}/>} placeholder="Blanc, Noir..."/>

                {/* Paiement — inline via badge dropdown */}
                {drawerItem.paiement && (
                  <div style={{ position:"relative" }}>
                    <div
                      onClick={() => {
                        const currentBanque = drawerItem.paiement.includes(" - ")
                          ? drawerItem.paiement.split(" - ")[1] : "";
                        setEditBanque(currentBanque);
                        setEditingBadge(editingBadge === "paiement" ? null : "paiement");
                        cancelInlineEdit();
                      }}
                      style={{ background: editingBadge==="paiement" ? "#fff" : "#f8f7f5",
                        borderRadius:10, padding:"8px 12px", cursor:"pointer",
                        border: editingBadge==="paiement" ? "1.5px solid #6366f1" : "1.5px solid transparent",
                        transition:"border 0.15s" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:4, color:"#94a3b8", marginBottom:2 }}>
                        <CreditCard size={13}/>
                        <span style={{ fontSize:10, fontWeight:600 }}>PAIEMENT</span>
                        <ChevronDown size={10} style={{ marginLeft:"auto",
                          transform: editingBadge==="paiement"?"rotate(180deg)":"none", transition:"0.2s" }}/>
                      </div>
                      <p style={{ fontSize:13, fontWeight:600, margin:0 }}>{drawerItem.paiement}</p>
                    </div>

                    {editingBadge==="paiement" && (
                      <div onClick={e => e.stopPropagation()}
                        style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:50,
                          background:"#fff", borderRadius:12, padding:"10px",
                          boxShadow:"0 8px 24px rgba(0,0,0,0.12)", border:"1px solid #f0f0ee" }}>

                        {/* Sélection type paiement */}
                        <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                          {PAIEMENTS.map(p => {
                            const currentType = drawerItem.paiement.split(" - ")[0];
                            const isSelected = currentType === p;
                            return (
                              <button key={p}
                                onClick={() => {
                                  if (p === "Espèces") {
                                    updateItemField(drawerItem.id, "paiement", "Espèces");
                                    updateItemField(drawerItem.id, "banque", "");
                                    setEditingBadge(null);
                                  } else {
                                    // Reste sur CB, attend la banque
                                    setItems(prev => prev.map(i => i.id === drawerItem.id ? {...i, paiement: `Carte bancaire${editBanque ? ` - ${editBanque}` : ""}`} : i));
                                    setDrawerItem(prev => prev ? {...prev, paiement: `Carte bancaire${editBanque ? ` - ${editBanque}` : ""}`} : null);
                                  }
                                }}
                                style={{ flex:1, padding:"7px", borderRadius:8, border:"none", cursor:"pointer",
                                  background: isSelected ? BG_DARK : "#f3f4f6",
                                  color: isSelected ? "#fff" : "#374151",
                                  fontSize:11, fontWeight:500 }}>
                                {p}
                              </button>
                            );
                          })}
                        </div>

                        {/* Champ banque si Carte bancaire */}
                        {drawerItem.paiement.startsWith("Carte bancaire") && (
                          <div style={{ display:"flex", gap:6 }}>
                            <input
                              autoFocus
                              value={editBanque}
                              onChange={e => setEditBanque(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Enter") {
                                  updateItemField(drawerItem.id, "paiement", `Carte bancaire${editBanque ? ` - ${editBanque}` : ""}`);
                                  setEditingBadge(null);
                                }
                                if (e.key === "Escape") setEditingBadge(null);
                              }}
                              placeholder="Revolut, BNP..."
                              style={{ flex:1, padding:"7px 10px", borderRadius:8, border:"1px solid #e5e7eb",
                                fontSize:12, outline:"none" }}/>
                            <button
                              onClick={() => {
                                updateItemField(drawerItem.id, "paiement", `Carte bancaire${editBanque ? ` - ${editBanque}` : ""}`);
                                setEditingBadge(null);
                              }}
                              style={{ background:"#6366f1", border:"none", borderRadius:8, padding:"7px 10px",
                                cursor:"pointer", display:"flex", alignItems:"center" }}>
                              <Check size={13} color="#fff"/>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <EditableChip fieldKey="date" label="Date" value={drawerItem.date}
                  icon={<Calendar size={13}/>} inputType="date"/>

                {/* Réf pleine largeur */}
                {(drawerItem.ref || editingDrawerKey === "ref") && (
                  <div style={{ gridColumn:"1 / -1" }}>
                    <EditableChip fieldKey="ref" label="Réf" value={drawerItem.ref}
                      icon={<Tag size={13}/>} placeholder="SKU..."/>
                  </div>
                )}
              </div>

              {/* Petit hint */}
              <p style={{ color:"#d1d5db", fontSize:10, margin:"0 0 14px", textAlign:"center" }}>
                Cliquez sur un champ pour le modifier directement
              </p>

              {/* Actions */}
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => openEdit(drawerItem)}
                  style={{ flex:1, padding:"10px", borderRadius:12, border:"none", cursor:"pointer",
                    background:BG_DARK, color:"#fff", fontWeight:600, fontSize:13,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <Pencil size={14}/> Modifier
                </button>
                {drawerItem.lien && (
                  <a href={drawerItem.lien} target="_blank" rel="noopener noreferrer"
                    style={{ flex:1, padding:"10px", borderRadius:12, border:"1px solid #e5e7eb",
                      background:"#fff", color:BG_DARK, fontWeight:600, fontSize:13,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      gap:6, textDecoration:"none" }}>
                    <ExternalLink size={14}/> Voir
                  </a>
                )}
                <button onClick={() => deleteItem(drawerItem.id)}
                  style={{ width:44, height:44, borderRadius:12, border:"1px solid #fee2e2",
                    background:"#fff", cursor:"pointer", display:"flex",
                    alignItems:"center", justifyContent:"center" }}>
                  <Trash2 size={16} color="#f87171"/>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ LIGHTBOX ══════════════ */}
      {lightboxPhoto && (
        <div onClick={() => setLightboxPhoto(null)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:200,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
          <img src={lightboxPhoto} alt=""
            style={{ maxWidth:"90vw", maxHeight:"90vh", objectFit:"contain", borderRadius:12 }}/>
          <button onClick={() => setLightboxPhoto(null)}
            style={{ position:"absolute", top:20, right:20, background:"rgba(255,255,255,0.1)",
              border:"none", borderRadius:20, width:36, height:36,
              display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <X size={18} color="#fff"/>
          </button>
        </div>
      )}

      {/* ══════════════ FORM ══════════════ */}
      {showForm && (
        <div onClick={() => setShowForm(false)}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:150,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:"#fff", borderRadius:24, width:480, maxHeight:"92vh",
              overflowY:"auto", padding:"28px 28px 24px", boxShadow:"0 20px 60px rgba(0,0,0,0.25)" }}>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontWeight:800, fontSize:18, margin:0 }}>
                {editId!==null?"Modifier l'article":"Ajouter un article"}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ background:"none", border:"none", cursor:"pointer" }}>
                <X size={20} color="#94a3b8"/>
              </button>
            </div>

            {error && (
              <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10,
                padding:"10px 14px", marginBottom:14 }}>
                <p style={{ color:"#dc2626", fontSize:13, margin:0 }}>{error}</p>
              </div>
            )}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:12 }}>
              <div style={{ gridColumn:"1 / -1" }}>
                <label style={labelStyle}>NOM *</label>
                <input value={form.name}
                  onChange={e => setForm(f => ({...f,name:e.target.value}))}
                  placeholder="Ex: AIRism Oversize Crewneck T-Shirt"
                  style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>MARQUE</label>
                <input value={form.marque}
                  onChange={e => setForm(f => ({...f,marque:e.target.value}))}
                  placeholder="Nike, Uniqlo..." style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>PRIX (€) *</label>
                <input type="number"
                  value={form.prix===0?"":form.prix}
                  onChange={e => setForm(f => ({...f,prix:e.target.value===""?0:parseFloat(e.target.value)||0}))}
                  placeholder="0.00" style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>DATE</label>
                <input type="date" value={form.date}
                  onChange={e => setForm(f => ({...f,date:e.target.value}))}
                  style={inputStyle}/>
              </div>
              <div style={{ gridColumn:"1 / 3" }}>
                <label style={labelStyle}>STATUT</label>
                <select value={form.statut}
                  onChange={e => setForm(f => ({...f,statut:e.target.value as Statut}))}
                  style={inputStyle}>
                  {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>PAIEMENT</label>
                <select value={form.paiement}
                  onChange={e => setForm(f => ({...f,paiement:e.target.value,banque:""}))}
                  style={inputStyle}>
                  <option value="">-- Choisir --</option>
                  {PAIEMENTS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {form.paiement==="Carte bancaire" && (
                <div style={{ gridColumn:"1 / -1" }}>
                  <label style={labelStyle}>BANQUE</label>
                  <input value={form.banque}
                    onChange={e => setForm(f => ({...f,banque:e.target.value}))}
                    placeholder="Revolut, BNP..." style={inputStyle}/>
                </div>
              )}
            </div>

            <button onClick={() => setShowOptional(!showOptional)}
              style={{ background:"none", border:"none", cursor:"pointer", color:"#6366f1",
                fontSize:12, fontWeight:600, padding:"4px 0", marginBottom:showOptional?12:0 }}>
              {showOptional?"▾ Masquer les champs optionnels":"▸ Ajouter des infos supplémentaires"}
            </button>

            {showOptional && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                <div>
                  <label style={labelStyle}>CATÉGORIE</label>
                  <select value={form.categorie}
                    onChange={e => setForm(f => ({...f,categorie:e.target.value}))}
                    style={inputStyle}>
                    <option value="">-- Choisir --</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>TAILLE</label>
                  <input value={form.taille}
                    onChange={e => setForm(f => ({...f,taille:e.target.value}))}
                    placeholder="M, L, 42..." style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>COULEUR</label>
                  <input value={form.couleur}
                    onChange={e => setForm(f => ({...f,couleur:e.target.value}))}
                    placeholder="Blanc, Noir..." style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>RÉFÉRENCE</label>
                  <input value={form.ref}
                    onChange={e => setForm(f => ({...f,ref:e.target.value}))}
                    placeholder="SKU..." style={inputStyle}/>
                </div>
                <div style={{ gridColumn:"1 / -1" }}>
                  <label style={labelStyle}>URL PHOTO</label>
                  <input value={form.photo}
                    onChange={e => setForm(f => ({...f,photo:e.target.value}))}
                    placeholder="https://..." style={inputStyle}/>
                </div>
                <div style={{ gridColumn:"1 / -1" }}>
                  <label style={labelStyle}>URL PRODUIT</label>
                  <input value={form.lien}
                    onChange={e => setForm(f => ({...f,lien:e.target.value}))}
                    placeholder="https://..." style={inputStyle}/>
                </div>
              </div>
            )}

            <div style={{ display:"flex", gap:10, marginTop:8 }}>
              <button onClick={() => setShowForm(false)}
                style={{ flex:1, padding:"12px", borderRadius:12, border:"1px solid #e5e7eb",
                  background:"#fff", fontSize:14, fontWeight:600, cursor:"pointer", color:"#6b7280" }}>
                Annuler
              </button>
              <button onClick={handleSubmit}
                style={{ flex:2, padding:"12px", borderRadius:12, border:"none",
                  background:BG_DARK, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                {editId!==null?"Enregistrer":"Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}