"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, KeyRound } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";

export function PasswordApp() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { tryPassword, loginError } = useGame();
  const { playSound } = useSound();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tryPassword(password)) {
      playSound("success");
    } else {
      playSound("error");
    }
  };

  return (
    <div className="h-full bg-[#f3f3f3] flex flex-col">
      {/* Header */}
      <div className="bg-[#0078d4] text-white p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Verification d&apos;identite</h2>
          <p className="text-white/80 text-sm">Entrez votre mot de passe pour confirmer votre identite</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <KeyRound className="w-8 h-8 text-[#0078d4]" />
              <div>
                <h3 className="font-medium text-gray-900">Mot de passe du compte</h3>
                <p className="text-sm text-gray-500">Utilisez les indices trouves dans vos fichiers</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe
                </label>
                <div 
                  className={`flex items-center border rounded-md overflow-hidden transition-all bg-white ${
                    loginError 
                      ? "border-red-500 animate-shake bg-red-50" 
                      : "border-gray-300 focus-within:border-[#0078d4] focus-within:ring-1 focus-within:ring-[#0078d4]"
                  }`}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Entrez le mot de passe..."
                    className="flex-1 px-4 py-3 outline-none bg-transparent text-gray-900 placeholder-gray-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-3 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginError && (
                  <p className="text-red-500 text-sm mt-2 animate-fade-in">
                    Mot de passe incorrect. Continuez a chercher des indices !
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0078d4] text-white rounded-md hover:bg-[#006cbd] transition-colors font-medium"
              >
                Verifier le mot de passe
              </button>
            </form>
          </div>

          {/* Hints section */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">Indices a chercher :</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>- Consultez vos emails et documents</li>
              <li>- Regardez les photos et leurs descriptions</li>
              <li>- Verifiez le calendrier et les evenements</li>
              <li>- N&apos;oubliez pas la corbeille...</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
