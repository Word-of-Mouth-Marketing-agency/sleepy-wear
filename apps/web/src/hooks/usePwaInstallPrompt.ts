"use client";

import { useCallback, useEffect, useState } from "react";
import { canUseServiceWorker, isBrowser, isIosDevice, isStandaloneMode } from "@/lib/pwa";

type BeforeInstallPromptChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<BeforeInstallPromptChoice>;
  prompt: () => Promise<void>;
}

export function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (!isBrowser()) return;

    setIsInstalled(isStandaloneMode());
    setIsIos(isIosDevice());
    setIsSupported(canUseServiceWorker());

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt || isInstalled) {
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferredPrompt(null);

      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        return true;
      }

      return false;
    } catch {
      setDeferredPrompt(null);
      return false;
    }
  }, [deferredPrompt, isInstalled]);

  return {
    canInstall: Boolean(deferredPrompt && !isInstalled),
    isInstalled,
    isIos,
    isSupported,
    installApp,
  };
}
