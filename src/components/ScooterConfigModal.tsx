import React, { useState } from "react";
import { X, Sliders, Cpu, User, Users, Battery, Zap, ShieldCheck, Check, Sparkles, AlertTriangle } from "lucide-react";
import { ScooterConfig } from "../types";
import { saveScooterConfig } from "../lib/db";

interface ScooterConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ScooterConfig;
  onSaveConfig: (updated: ScooterConfig) => void;
  onShowToast: (msg: string) => void;
}

export default function ScooterConfigModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onShowToast,
}: ScooterConfigModalProps) {
  if (!isOpen) return null;

  const [pilotWeight, setPilotWeight] = useState<number>(config.pilotWeightKg);
  const [hasPassenger, setHasPassenger] = useState<boolean>(config.hasPassenger);
  const [passengerWeight, setPassengerWeight] = useState<number>(config.passengerWeightKg);
  const [hasOver1000W, setHasOver1000W] = useState<boolean>(config.hasOver1000W);
  const [motorPowerW, setMotorPowerW] = useState<number>(config.motorPowerW);
  const [scooterModel, setScooterModel] = useState<string>(config.scooterModel);
  const [scooterWeight, setScooterWeight] = useState<number>(config.scooterWeightKg);
  const [batteryVoltage, setBatteryVoltage] = useState<number>(config.batteryVoltageV);
  const [batteryCapacity, setBatteryCapacity] = useState<number>(config.batteryCapacityAh);
  const [maxSpeed, setMaxSpeed] = useState<number>(config.maxSpeedKmh);
  const [manufacturerRange, setManufacturerRange] = useState<number>(config.manufacturerRangeKm);

  // Payload calculation
  const totalPayloadKg = pilotWeight + (hasPassenger ? passengerWeight : 0);
  const grandTotalKg = totalPayloadKg + scooterWeight;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ScooterConfig = {
      pilotWeightKg: pilotWeight,
      hasPassenger,
      passengerWeightKg: passengerWeight,
      hasOver1000W: motorPowerW > 1000 || hasOver1000W,
      motorPowerW,
      scooterModel,
      scooterWeightKg: scooterWeight,
      batteryVoltageV: batteryVoltage,
      batteryCapacityAh: batteryCapacity,
      maxSpeedKmh: maxSpeed,
      manufacturerRangeKm: manufacturerRange,
      maxTorqueNm: Math.round(motorPowerW * 0.055),
    };

    await saveScooterConfig(updated);
    onSaveConfig(updated);
    onShowToast("✅ Configurações e Ficha Técnica salvas no Banco de Dados!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative my-auto space-y-6 text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Ficha Técnica & Configurações da Scooter
              </h2>
              <p className="text-[11px] font-mono text-cyan-400/80 uppercase">
                Ajuste de Piloto, Passageiro, Motor e Bateria
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

        <form onSubmit={handleSave} className="space-y-6">
          {/* SECÇÃO 1: PESO E PASSAGEIRO */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" /> 1. Peso do Piloto & Passageiro
              </span>
              <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
                Carga Útil: {totalPayloadKg} kg
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Peso do Piloto */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium flex justify-between">
                  <span>Peso do Piloto (kg):</span>
                  <span className="font-mono text-cyan-400 font-bold">{pilotWeight} kg</span>
                </label>
                <input
                  type="range"
                  min="40"
                  max="160"
                  step="1"
                  value={pilotWeight}
                  onChange={(e) => setPilotWeight(Number(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                  <span>40 kg</span>
                  <span>100 kg</span>
                  <span>160 kg</span>
                </div>
              </div>

              {/* Toggle Passageiro */}
              <div className="space-y-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-200 font-bold flex items-center gap-2 cursor-pointer">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span>Possui Passageiro?</span>
                  </label>
                  <input
                    type="checkbox"
                    checked={hasPassenger}
                    onChange={(e) => setHasPassenger(e.target.checked)}
                    className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                  />
                </div>

                {hasPassenger && (
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <label className="text-[11px] text-slate-300 flex justify-between">
                      <span>Peso do Passageiro (kg):</span>
                      <span className="font-mono text-purple-300 font-bold">{passengerWeight} kg</span>
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="130"
                      step="1"
                      value={passengerWeight}
                      onChange={(e) => setPassengerWeight(Number(e.target.value))}
                      className="w-full accent-purple-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Total Payload Warning */}
            <div className="bg-cyan-950/30 border border-cyan-500/20 p-2.5 rounded-xl text-[11px] text-slate-300 flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Massa Total Combinada (Piloto + Passageiro + Scooter {scooterWeight}kg) = <strong className="text-white">{grandTotalKg} kg</strong>. O motor calibrará o consumo na subida automaticamente.
              </span>
            </div>
          </div>

          {/* SECÇÃO 2: MOTOR & ESPECIFICAÇÕES DE POTÊNCIA */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> 2. Motor & Potência
              </span>
              <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border ${
                motorPowerW > 1000 
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              }`}>
                {motorPowerW > 1000 ? "⚡ Scooter > 1000W (Alta Performance)" : "🔌 Scooter Padrão (< 1000W)"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 font-mono mb-1 block">Modelo da Scooter</label>
                <input
                  type="text"
                  value={scooterModel}
                  onChange={(e) => setScooterModel(e.target.value)}
                  placeholder="Ex: ScootWay Pro 1500W Ultra, Watts W5"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-sans"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-mono mb-1 block">Potência Nominal do Motor (Watts)</label>
                <select
                  value={motorPowerW}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMotorPowerW(val);
                    setHasOver1000W(val > 1000);
                  }}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value={500}>500 Watts (Leve / Xiaomi)</option>
                  <option value={800}>800 Watts (Padrão Urbano)</option>
                  <option value={1000}>1000 Watts (Urbano Forte)</option>
                  <option value={1200}>1200 Watts (Mais de 1000W)</option>
                  <option value={1500}>1500 Watts (Mais de 1000W - Torque Elevado)</option>
                  <option value={2000}>2000 Watts (Mais de 1000W - Dual Motor)</option>
                  <option value={3000}>3000 Watts (Super Potência - Acima de 1000W)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECÇÃO 3: BATERIA & DETALHES TÉCNICOS */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
                <Battery className="w-4 h-4 text-emerald-400" /> 3. Bateria & Desempenho
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div>
                <label className="text-[10px] text-slate-400 font-mono mb-1 block">Tensão (Volts)</label>
                <select
                  value={batteryVoltage}
                  onChange={(e) => setBatteryVoltage(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                >
                  <option value={48}>48 Volts</option>
                  <option value={60}>60 Volts</option>
                  <option value={72}>72 Volts</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono mb-1 block">Capacidade (Ah)</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={batteryCapacity}
                  onChange={(e) => setBatteryCapacity(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono mb-1 block">Vel. Máxima (km/h)</label>
                <input
                  type="number"
                  min="20"
                  max="110"
                  value={maxSpeed}
                  onChange={(e) => setMaxSpeed(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-mono mb-1 block">Peso Scooter (kg)</label>
                <input
                  type="number"
                  min="15"
                  max="90"
                  value={scooterWeight}
                  onChange={(e) => setScooterWeight(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              Salvar Ficha Técnica no Banco de Dados
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
