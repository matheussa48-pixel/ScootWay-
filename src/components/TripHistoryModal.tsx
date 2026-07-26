import React, { useState } from "react";
import { X, History, MapPin, Navigation, Trash2, Download, Search, Battery, Zap, Users, ShieldCheck, Sparkles, Calendar, TrendingUp } from "lucide-react";
import { TripHistoryEntry } from "../types";
import { deleteTripHistory, clearTripHistory } from "../lib/db";

interface TripHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: TripHistoryEntry[];
  onHistoryUpdated: (updated: TripHistoryEntry[]) => void;
  onLoadTripToRoute: (trip: TripHistoryEntry) => void;
  onShowToast: (msg: string) => void;
}

export default function TripHistoryModal({
  isOpen,
  onClose,
  history,
  onHistoryUpdated,
  onLoadTripToRoute,
  onShowToast,
}: TripHistoryModalProps) {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredHistory = history.filter(
    (t) =>
      t.originName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.dateFormatted.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats calculation
  const totalKm = history.reduce((acc, t) => acc + (t.distanceKm || 0), 0);
  const totalTrips = history.length;
  const avgBattery = totalTrips > 0 ? Math.round(history.reduce((acc, t) => acc + (t.batteryUsedPercent || 0), 0) / totalTrips) : 0;

  const handleDelete = async (id: string) => {
    if (confirm("Deseja remover este trajeto do histórico?")) {
      const updated = await deleteTripHistory(id);
      onHistoryUpdated(updated);
      onShowToast("🗑️ Registro removido do banco de dados.");
    }
  };

  const handleClearAll = async () => {
    if (confirm("Tem certeza que deseja apagar todo o histórico do banco de dados?")) {
      const updated = await clearTripHistory();
      onHistoryUpdated(updated);
      onShowToast("🧹 Histórico do banco de dados limpo com sucesso!");
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ScootWay_Historico_Banco_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast("📥 Histórico exportado em arquivo JSON!");
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#090d16] border border-cyan-500/30 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative my-auto space-y-5 text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <History className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Banco de Dados de Histórico de Trajetos
              </h2>
              <p className="text-[11px] font-mono text-cyan-400/80 uppercase">
                {totalTrips} {totalTrips === 1 ? "Trajeto Registrado" : "Trajetos Registrados"} • Total: {totalKm.toFixed(1)} km
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

        {/* TOP METRICS SUMMARY */}
        <div className="grid grid-cols-3 gap-3 font-mono">
          <div className="bg-black/60 border border-white/10 p-3 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Quilometragem Total</span>
            <span className="text-base font-extrabold text-cyan-400">{totalKm.toFixed(1)} km</span>
          </div>
          <div className="bg-black/60 border border-white/10 p-3 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total de Viagens</span>
            <span className="text-base font-extrabold text-white">{totalTrips}</span>
          </div>
          <div className="bg-black/60 border border-white/10 p-3 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Média de Bateria</span>
            <span className="text-base font-extrabold text-emerald-400">{avgBattery}% / viagem</span>
          </div>
        </div>

        {/* SEARCH AND ACTIONS BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por data, partida ou destino..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {history.length > 0 && (
              <>
                <button
                  onClick={handleExportJSON}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Exportar JSON</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-300 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Limpar Tudo</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* HISTORY LIST */}
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredHistory.length === 0 ? (
            <div className="bg-black/40 border border-white/5 rounded-2xl p-8 text-center space-y-2">
              <History className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">Nenhum histórico encontrado no banco de dados.</p>
              <p className="text-[10.5px] text-slate-500 font-mono">
                Conclua simulações ou trajetos de navegação para registrar automaticamente os dados de telemetria!
              </p>
            </div>
          ) : (
            filteredHistory.map((trip) => (
              <div
                key={trip.id}
                className="bg-black/60 border border-white/10 hover:border-cyan-500/40 rounded-2xl p-4 transition-all space-y-3 text-left"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-white font-bold">{trip.dateFormatted}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold uppercase">
                      {trip.mode === "eco" ? "Modo Eco" : "Performance"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold">
                      ⚡ {trip.motorPowerW}W
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-sans">
                  <div className="flex items-start gap-2">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">PARTIDA</span>
                      <span className="text-slate-200 font-medium line-clamp-1">{trip.originName}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">DESTINO</span>
                      <span className="text-slate-200 font-medium line-clamp-1">{trip.destinationName}</span>
                    </div>
                  </div>
                </div>

                {/* Technical telemetry specs saved */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/5 p-2.5 rounded-xl text-[10.5px] font-mono text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[9px]">DISTÂNCIA</span>
                    <strong className="text-white">{trip.distanceKm.toFixed(1)} km</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">BATERIA GASTA</span>
                    <strong className="text-emerald-400">-{trip.batteryUsedPercent}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">INCLINAÇÃO MÁX</span>
                    <strong className="text-amber-400">{trip.maxGradientPercent}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px]">CARGA ÚTIL</span>
                    <strong className="text-purple-300">
                      {trip.totalWeightKg} kg {trip.passengerWeightKg > 0 ? "(+Passageiro)" : ""}
                    </strong>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleDelete(trip.id)}
                    className="text-[11px] font-mono text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Excluir Registro
                  </button>

                  <button
                    onClick={() => {
                      onLoadTripToRoute(trip);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Recarregar este Trajeto</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
