import React, { useState } from "react";
import { X, Home, Briefcase, MapPin, Plus, Trash2, Check, Star, Navigation, Sparkles } from "lucide-react";
import { SavedPlace, PlaceType } from "../types";
import { savePlace, deletePlace } from "../lib/db";

interface SavedPlacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlaces: SavedPlace[];
  onPlacesUpdated: (places: SavedPlace[]) => void;
  onSelectAsOrigin: (place: SavedPlace) => void;
  onSelectAsDestination: (place: SavedPlace) => void;
  onShowToast: (msg: string) => void;
  currentGpsCoords?: { lat: number; lng: number } | null;
}

export default function SavedPlacesModal({
  isOpen,
  onClose,
  savedPlaces,
  onPlacesUpdated,
  onSelectAsOrigin,
  onSelectAsDestination,
  onShowToast,
  currentGpsCoords,
}: SavedPlacesModalProps) {
  if (!isOpen) return null;

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<PlaceType>("casa");
  const [customLabel, setCustomLabel] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [lat, setLat] = useState<number>(-19.9221);
  const [lng, setLng] = useState<number>(-43.9382);

  // Quick edit state for Casa or Trabalho
  const [editingType, setEditingType] = useState<PlaceType | null>(null);

  const getTypeIcon = (type: PlaceType) => {
    switch (type) {
      case "casa":
        return <Home className="w-4 h-4 text-emerald-400" />;
      case "trabalho":
        return <Briefcase className="w-4 h-4 text-cyan-400" />;
      default:
        return <MapPin className="w-4 h-4 text-amber-400" />;
    }
  };

  const handleSavePlaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      alert("Por favor, insira o endereço ou nome do local.");
      return;
    }

    let finalLabel = customLabel.trim();
    if (selectedType === "casa") finalLabel = "Casa";
    if (selectedType === "trabalho") finalLabel = "Trabalho";
    if (!finalLabel) finalLabel = address.split(",")[0];

    const updatedList = await savePlace({
      type: selectedType,
      label: finalLabel,
      address,
      lat,
      lng,
    });

    onPlacesUpdated(updatedList);
    onShowToast(`⭐ Local '${finalLabel}' salvo com sucesso!`);
    setIsAdding(false);
    setEditingType(null);
    setCustomLabel("");
    setAddress("");
  };

  const handleDelete = async (id: string, label: string) => {
    if (confirm(`Deseja remover '${label}' dos locais salvos?`)) {
      const updatedList = await deletePlace(id);
      onPlacesUpdated(updatedList);
      onShowToast(`🗑️ Local '${label}' removido.`);
    }
  };

  const fillWithCurrentGps = () => {
    if (currentGpsCoords) {
      setLat(currentGpsCoords.lat);
      setLng(currentGpsCoords.lng);
      setAddress(`Sua Posição GPS (${currentGpsCoords.lat.toFixed(4)}, ${currentGpsCoords.lng.toFixed(4)})`);
      onShowToast("📍 Coordenadas do seu GPS inseridas!");
    } else {
      alert("Sinal GPS indisponível no momento. Digite o endereço manualmente.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#090d16] border border-cyan-500/30 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative my-auto space-y-5 text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Star className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Locais Salvos (Casa, Trabalho e Favoritos)
              </h2>
              <p className="text-[11px] font-mono text-cyan-400/80 uppercase">
                Acesso em 1 Clique para Iniciar Trajetos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LIST OF SAVED PLACES */}
        {!isAdding && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedPlaces.map((place) => (
                <div
                  key={place.id}
                  className="bg-black/60 border border-white/10 hover:border-cyan-500/40 rounded-2xl p-4 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {getTypeIcon(place.type)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white font-sans flex items-center gap-1.5">
                          {place.label}
                          <span className="text-[9px] font-mono uppercase bg-white/10 px-1.5 py-0.2 rounded text-slate-300">
                            {place.type}
                          </span>
                        </h4>
                        <p className="text-[10.5px] text-slate-400 leading-tight line-clamp-2 mt-0.5 font-sans">
                          {place.address}
                        </p>
                      </div>
                    </div>
                    {place.type !== "casa" && place.type !== "trabalho" && (
                      <button
                        onClick={() => handleDelete(place.id, place.label)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Actions to set as Origin / Destination */}
                  <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/5 text-[10px] font-mono font-bold">
                    <button
                      onClick={() => {
                        onSelectAsOrigin(place);
                        onClose();
                      }}
                      className="py-1.5 px-2 bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 rounded-lg border border-white/5 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Navigation className="w-3 h-3 text-cyan-400" />
                      <span>PARTIDA</span>
                    </button>
                    <button
                      onClick={() => {
                        onSelectAsDestination(place);
                        onClose();
                      }}
                      className="py-1.5 px-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>DESTINO</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-cyan-400/50 rounded-2xl text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Adicionar Novo Local Favorito</span>
            </button>
          </div>
        )}

        {/* FORM TO ADD / EDIT PLACE */}
        {isAdding && (
          <form onSubmit={handleSavePlaceSubmit} className="space-y-4 bg-black/60 border border-white/10 p-4 rounded-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase font-mono text-slate-300">
                Cadastrar / Atualizar Local
              </span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Voltar
              </button>
            </div>

            {/* Type selector */}
            <div>
              <label className="text-[11px] text-slate-400 font-mono block mb-1.5">Tipo de Local</label>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("casa");
                    setCustomLabel("Casa");
                  }}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedType === "casa"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-zinc-900 border-white/10 text-slate-400"
                  }`}
                >
                  <Home className="w-3.5 h-3.5" /> Casa
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("trabalho");
                    setCustomLabel("Trabalho");
                  }}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedType === "trabalho"
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold"
                      : "bg-zinc-900 border-white/10 text-slate-400"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" /> Trabalho
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType("outro")}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedType === "outro"
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                      : "bg-zinc-900 border-white/10 text-slate-400"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" /> Outro
                </button>
              </div>
            </div>

            {selectedType === "outro" && (
              <div>
                <label className="text-[11px] text-slate-400 font-mono block mb-1">Nome Personalizado</label>
                <input
                  type="text"
                  placeholder="Ex: Faculdade, Mercado, Academia"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] text-slate-400 font-mono block">Endereço Completo</label>
                {currentGpsCoords && (
                  <button
                    type="button"
                    onClick={fillWithCurrentGps}
                    className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Usar Posição GPS Atual
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Ex: Avenida Afonso Pena 1500, Centro, Belo Horizonte - MG"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-zinc-800 text-slate-300 text-xs rounded-xl font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-extrabold text-xs rounded-xl shadow-md"
              >
                Salvar Local no Banco
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
