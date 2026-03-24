"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, KeyRound, User, Shield, Crown } from "lucide-react";
import { useGame } from "@/lib/game-context";
import { useSound } from "@/hooks/use-sound";
import { cn } from "@/lib/utils";

export function PasswordApp() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [lastResult, setLastResult] = useState<"wrong" | "guest" | "admin" | null>(null);
  const { tryPassword, loginError, accountLevel, closeWindow, windows } = useGame();
  const { playSound } = useSound();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = tryPassword(password);
    setLastResult(result);
    
    if (result === "admin") {
      playSound("success");
    } else if (result === "guest") {
      playSound("notification");
      // Close the password window after a delay
      setTimeout(() => {
        const passwordWindow = windows.find(w => w.app === "password");
        if (passwordWindow) {
          closeWindow(passwordWindow.id);
        }
      }, 2000);
    } else {
      playSound("error");
    }
  };

  return (
    <div className="h-full bg-[#f3f3f3] flex flex-col">
      {/* Header */}
      <div className={cn(
        "text-white p-6 flex items-center gap-4 transition-colors",
        accountLevel === "guest" ? "bg-amber-600" : "bg-[#0078d4]"
      )}>
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          {accountLevel === "guest" ? <User className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            {accountLevel === "guest" ? "Compte Invité Actif" : "Vérification d'identité"}
          </h2>
          <p className="text-white/80 text-sm">
            {accountLevel === "guest" 
              ? "Accès limité - Entrez le mot de passe administrateur pour un accès complet"
              : "Entrez votre mot de passe pour confirmer votre identité"}
          </p>
        </div>
      </div>

      {/* Account status indicator */}
      {accountLevel !== "locked" && (
        <div className={cn(
          "flex items-center gap-2 px-6 py-3 border-b",
          accountLevel === "guest" 
            ? "bg-amber-50 border-amber-200" 
            : "bg-emerald-50 border-emerald-200"
        )}>
          {accountLevel === "guest" ? (
            <>
              <Shield className="w-5 h-5 text-amber-600" />
              <span className="text-sm text-amber-800">
                Mode Invité : Certains fichiers et dossiers sont verrouillés
              </span>
            </>
          ) : (
            <>
              <Crown className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-emerald-800">
                Mode Administrateur : Accès complet
              </span>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          {/* Success message for guest */}
          {lastResult === "guest" && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg animate-fade-in">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-amber-600" />
                <div>
                  <h3 className="font-medium text-amber-900">Connexion Invité réussie !</h3>
                  <p className="text-sm text-amber-700">
                    Vous avez maintenant un accès limité. Pour un accès complet, 
                    trouvez le mot de passe administrateur.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <KeyRound className="w-8 h-8 text-[#0078d4]" />
              <div>
                <h3 className="font-medium text-gray-900">
                  {accountLevel === "guest" ? "Mot de passe Administrateur" : "Mot de passe du compte"}
                </h3>
                <p className="text-sm text-gray-500">
                  {accountLevel === "guest" 
                    ? "Le mot de passe admin est plus complexe..."
                    : "Utilisez les indices trouvés dans vos fichiers"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe {accountLevel === "guest" && "(Admin)"}
                </label>
                <div 
                  className={cn(
                    "flex items-center border rounded-md overflow-hidden transition-all bg-white",
                    loginError 
                      ? "border-red-500 animate-shake bg-red-50" 
                      : "border-gray-300 focus-within:border-[#0078d4] focus-within:ring-1 focus-within:ring-[#0078d4]"
                  )}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={accountLevel === "guest" ? "Mot de passe administrateur..." : "Entrez le mot de passe..."}
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
                    Mot de passe incorrect. Continuez à chercher des indices !
                  </p>
                )}
              </div>

              <button
                type="submit"
                className={cn(
                  "w-full py-3 text-white rounded-md transition-colors font-medium",
                  accountLevel === "guest"
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-[#0078d4] hover:bg-[#006cbd]"
                )}
              >
                {accountLevel === "guest" ? "Passer en mode Admin" : "Vérifier le mot de passe"}
              </button>
            </form>
          </div>

          {/* Hints section */}
          <div className={cn(
            "mt-6 p-4 border rounded-lg",
            accountLevel === "guest" 
              ? "bg-red-50 border-red-200"
              : "bg-amber-50 border-amber-200"
          )}>
            <h4 className={cn(
              "font-medium mb-2",
              accountLevel === "guest" ? "text-red-800" : "text-amber-800"
            )}>
              {accountLevel === "guest" ? "Indices pour le mode Admin :" : "Indices à chercher :"}
            </h4>
            <ul className={cn(
              "text-sm space-y-1",
              accountLevel === "guest" ? "text-red-700" : "text-amber-700"
            )}>
              {accountLevel === "guest" ? (
                <>
                  <li>- Le format est plus complexe que l&apos;ancien</li>
                  <li>- Cherchez dans la corbeille des indices</li>
                  <li>- Les mémos vocaux peuvent contenir des informations</li>
                  <li>- Initiales + dates + symboles...</li>
                </>
              ) : (
                <>
                  <li>- Consultez vos emails et documents</li>
                  <li>- Regardez les photos et leurs descriptions</li>
                  <li>- L&apos;ancien mot de passe était simple : Bourg + date</li>
                  <li>- N&apos;oubliez pas la corbeille...</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
