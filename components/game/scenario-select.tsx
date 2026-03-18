"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  CheckCircle, 
  User, 
  Briefcase, 
  Star,
  ChevronRight,
  Trophy,
  Book
} from "lucide-react";
import { 
  allScenarios, 
  loadGameProgress, 
  type Scenario, 
  type GameProgress 
} from "@/lib/scenarios";

interface ScenarioSelectProps {
  onSelectScenario: (scenarioId: string) => void;
  onOpenNotebook: () => void;
}

export function ScenarioSelect({ onSelectScenario, onOpenNotebook }: ScenarioSelectProps) {
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    setProgress(loadGameProgress());
  }, []);

  if (!progress) return null;

  const isUnlocked = (scenarioId: string) => 
    progress.unlockedScenarios.includes(scenarioId);
  
  const isCompleted = (scenarioId: string) => 
    progress.completedScenarios.some((c) => c.scenarioId === scenarioId);

  const getCompletionData = (scenarioId: string) =>
    progress.completedScenarios.find((c) => c.scenarioId === scenarioId);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "facile": return "text-green-400";
      case "moyen": return "text-yellow-400";
      case "difficile": return "text-orange-400";
      case "expert": return "text-red-400";
      default: return "text-white/60";
    }
  };

  const getDifficultyStars = (difficulty: string) => {
    switch (difficulty) {
      case "facile": return 1;
      case "moyen": return 2;
      case "difficile": return 3;
      case "expert": return 4;
      default: return 1;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">AMNESIA</h1>
            <p className="text-white/60 mt-1">Choisissez votre identité à découvrir</p>
          </div>
          
          <button
            onClick={onOpenNotebook}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400 hover:bg-amber-500/30 transition-colors"
          >
            <Book className="w-5 h-5" />
            <span>Carnet des identités</span>
            {progress.completedScenarios.length > 0 && (
              <span className="bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                {progress.completedScenarios.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Scenarios Grid */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allScenarios.map((scenario) => {
              const unlocked = isUnlocked(scenario.id);
              const completed = isCompleted(scenario.id);
              const completionData = getCompletionData(scenario.id);
              const isHovered = hoveredId === scenario.id;
              const isSelected = selectedScenario?.id === scenario.id;

              return (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={unlocked ? { scale: 1.02 } : {}}
                  onHoverStart={() => setHoveredId(scenario.id)}
                  onHoverEnd={() => setHoveredId(null)}
                  onClick={() => {
                    if (unlocked) {
                      setSelectedScenario(isSelected ? null : scenario);
                    }
                  }}
                  className={`
                    relative p-5 rounded-xl border transition-all cursor-pointer
                    ${unlocked 
                      ? isSelected
                        ? "bg-white/10 border-white/40 shadow-lg shadow-white/5"
                        : "bg-white/5 border-white/10 hover:border-white/30"
                      : "bg-black/20 border-white/5 cursor-not-allowed opacity-60"
                    }
                  `}
                  style={unlocked ? { 
                    borderColor: isSelected || isHovered ? scenario.character.theme : undefined 
                  } : {}}
                >
                  {/* Lock overlay */}
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                      <Lock className="w-8 h-8 text-white/40" />
                    </div>
                  )}

                  {/* Completed badge */}
                  {completed && (
                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl"
                      style={{ backgroundColor: scenario.character.theme + "40" }}
                    >
                      <User className="w-7 h-7 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">
                        {unlocked ? scenario.character.name : "???"}
                      </h3>
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Briefcase className="w-4 h-4" />
                        <span>{unlocked ? scenario.character.profession : "Verrouillé"}</span>
                      </div>
                      
                      {/* Difficulty */}
                      <div className="flex items-center gap-1 mt-2">
                        {Array.from({ length: getDifficultyStars(scenario.character.difficulty) }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${getDifficultyColor(scenario.character.difficulty)} fill-current`} 
                          />
                        ))}
                        <span className={`text-xs ml-1 ${getDifficultyColor(scenario.character.difficulty)}`}>
                          {scenario.character.difficulty}
                        </span>
                      </div>

                      {/* Completion stats */}
                      {completionData && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-green-400">
                          <Trophy className="w-3 h-3" />
                          <span>{completionData.secretsFound}/{completionData.totalSecrets} secrets</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description on hover/select */}
                  <AnimatePresence>
                    {(isHovered || isSelected) && unlocked && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-white/60 text-sm mt-4 leading-relaxed"
                      >
                        {scenario.character.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Selected scenario panel */}
      <AnimatePresence>
        {selectedScenario && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="border-t border-white/10 bg-slate-900/95 backdrop-blur-lg p-6"
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: selectedScenario.character.theme }}
                >
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {selectedScenario.character.name}
                  </h2>
                  <p className="text-white/60">{selectedScenario.character.profession}</p>
                </div>
              </div>

              <button
                onClick={() => onSelectScenario(selectedScenario.id)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-white/90 transition-colors"
              >
                <span>Commencer</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
