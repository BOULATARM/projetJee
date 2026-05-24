"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "fr" | "en";

const translations = {
  fr: {
    soc:            "Centre des Opérations de Sécurité",
    system:         "SYSTÈME",
    online:         "EN LIGNE",
    threatLevel:    "NIVEAU DE MENACE",
    threatScore:    "Score de Menace",
    reset:          "Réinitialiser",
    live:           "EN VIE",
    offline:        "HORS LIGNE",
    noAlerts:       "Aucune alerte active",
    alerts:         "Alertes",
    acknowledge:    "Acquitter",
    critical:       "CRITIQUE",
    high:           "ÉLEVÉ",
    medium:         "MOYEN",
    low:            "FAIBLE",
    dashboard:      "Tableau de Bord",
    network:        "Réseau 3D",
    simulation:     "Sim. d'Attaque",
    alertCenter:    "Centre d'Alertes",
    timeline:       "Chronologie",
    heatmap:        "Carte Thermique",
    mitre:          "MITRE ATT&CK",
    aiAnalyst:      "Analyste IA",
  },
  en: {
    soc:            "Security Operations Center",
    system:         "SYSTEM",
    online:         "ONLINE",
    threatLevel:    "THREAT LEVEL",
    threatScore:    "Threat Score",
    reset:          "Reset",
    live:           "LIVE",
    offline:        "OFFLINE",
    noAlerts:       "No active alerts",
    alerts:         "Alerts",
    acknowledge:    "Acknowledge",
    critical:       "CRITICAL",
    high:           "HIGH",
    medium:         "MEDIUM",
    low:            "LOW",
    dashboard:      "Dashboard",
    network:        "3D Network",
    simulation:     "Attack Sim",
    alertCenter:    "Alert Center",
    timeline:       "Timeline",
    heatmap:        "Heatmap",
    mitre:          "MITRE ATT&CK",
    aiAnalyst:      "AI Analyst",
  },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof translations["fr"];
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "fr",
  setLang: () => {},
  t: translations["fr"],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");
  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
