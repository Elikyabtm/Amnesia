"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  CheckCircle, 
  User, 
  Briefcase, 
  Calendar,
  Trophy,
  Lock,
  Eye,
  BookOpen
} from "lucide-react";
import { 
  allScenarios, 
  loadGameProgress, 
  type GameProgress,
  type CompletedScenario 
} from "@/lib/scenarios";

interface IdentityNotebookProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IdentityNotebook({ isOpen, onClose }: IdentityNotebookProps) {
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<CompletedScenario | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProgress(loadGameProgress());
    }
  }, [isOpen]);

  if (!isOpen || !progress) return null;

  const getScenario = (scenarioId: string) => 
    allScenarios.find((s) => s.id === scenarioId);

  const getEnding = (scenarioId: string, endingId: string) => {
    const scenario = getScenario(scenarioId);
    return scenario?.endings.find((e) => e.id === endingId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-amber-900/90 via-amber-800/90 to-amber-900/90 border border-amber-600/50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-amber-600/30 flex items-center justify-between bg-amber-950/50">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-amber-400" />
              <div>
                <h2 className="text-2xl font-bold text-amber-100">Carnet des Identités</h2>
                <p className="text-amber-400/70 text-sm">
                  {progress.completedScenarios.length} / {allScenarios.length} identités découvertes
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-amber-700/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-amber-200" />
            </button>
          </div>

          {/* Content */}
          <div className="flex h-[calc(85vh-100px)]">
            {/* List */}
            <div className="w-1/2 border-r border-amber-600/30 overflow-auto p-4 space-y-3">
              {progress.completedScenarios.length === 0 ? (
                <div className="text-center py-12 text-amber-400/60">
                  <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune identité découverte</p>
                  <p className="text-sm mt-2">Complétez des scénarios pour remplir votre carnet</p>
                </div>
              ) : (
                progress.completedScenarios.map((entry) => {
                  const scenario = getScenario(entry.scenarioId);
                  const isSelected = selectedEntry?.scenarioId === entry.scenarioId;
                  
                  return (
                    <motion.button
                      key={entry.scenarioId}
                      whileHover={{ x: 4 }}
                      onClick={() => setSelectedEntry(entry)}
                      className={`
                        w-full text-left p-4 rounded-xl border transition-all
                        ${isSelected 
                          ? "bg-amber-700/40 border-amber-500/50" 
                          : "bg-amber-800/20 border-amber-700/30 hover:bg-amber-800/30"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-600/30 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-amber-100 truncate">
                            {entry.characterName}
                          </h3>
                          <p className="text-amber-400/70 text-sm">{entry.profession}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-amber-400 text-sm">
                            <Eye className="w-3 h-3" />
                            <span>{entry.secretsFound}/{entry.totalSecrets}</span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}

              {/* Locked scenarios */}
              {allScenarios
                .filter((s) => !progress.completedScenarios.some((c) => c.scenarioId === s.id))
                .map((scenario) => (
                  <div
                    key={scenario.id}
                    className="w-full p-4 rounded-xl border border-amber-800/30 bg-black/20 opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-amber-600/50" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-amber-200/50">???</h3>
                        <p className="text-amber-400/30 text-sm">Identité inconnue</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Detail */}
            <div className="w-1/2 overflow-auto p-6">
              {selectedEntry ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Character info */}
                  <div className="text-center">
                    <div 
                      className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ 
                        backgroundColor: getScenario(selectedEntry.scenarioId)?.character.theme + "60"
                      }}
                    >
                      <User className="w-10 h-10 text-amber-100" />
                    </div>
                    <h3 className="text-2xl font-bold text-amber-100">
                      {selectedEntry.characterName}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-amber-400 mt-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{selectedEntry.profession}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-amber-800/30 rounded-xl p-4 text-center">
                      <Calendar className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                      <p className="text-amber-200 text-sm">Découvert le</p>
                      <p className="text-amber-100 font-semibold">
                        {formatDate(selectedEntry.completedAt)}
                      </p>
                    </div>
                    <div className="bg-amber-800/30 rounded-xl p-4 text-center">
                      <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                      <p className="text-amber-200 text-sm">Secrets trouvés</p>
                      <p className="text-amber-100 font-semibold">
                        {selectedEntry.secretsFound} / {selectedEntry.totalSecrets}
                      </p>
                    </div>
                  </div>

                  {/* Ending */}
                  {(() => {
                    const ending = getEnding(selectedEntry.scenarioId, selectedEntry.endingId);
                    return ending ? (
                      <div className="bg-amber-900/50 border border-amber-600/30 rounded-xl p-5">
                        <h4 className="font-semibold text-amber-200 mb-1">Fin obtenue</h4>
                        <p className="text-xl font-bold text-amber-100 mb-2">{ending.title}</p>
                        <p className="text-amber-300/80 text-sm italic">"{ending.subtitle}"</p>
                        <p className="text-amber-400/70 text-sm mt-3">{ending.description}</p>
                      </div>
                    ) : null;
                  })()}

                  {/* Dark secret teaser */}
                  {selectedEntry.secretsFound >= selectedEntry.totalSecrets && (
                    <div className="bg-red-900/30 border border-red-600/30 rounded-xl p-5">
                      <h4 className="font-semibold text-red-300 mb-2 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Le secret sombre
                      </h4>
                      <p className="text-red-200/80 text-sm">
                        {getScenario(selectedEntry.scenarioId)?.darkSecret}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center text-amber-400/50">
                  <div className="text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez une entrée</p>
                    <p className="text-sm mt-1">pour voir les détails</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
