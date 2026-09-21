"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "./CommandPalette";
import { ImportModal } from "./ImportModal";
import { AuthModal } from "./AuthModal";

import { apiFetch } from "@/lib/apiClient";

export const ClientShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user already authenticated in localStorage
    const localToken =
      typeof window !== "undefined"
        ? localStorage.getItem("gehu_student_session")
        : null;

    apiFetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAuthModalOpen(false);
          if (data.token) {
            localStorage.setItem("gehu_student_session", data.token);
          }
        } else {
          // If we have localToken, give it a chance, else open login modal
          if (!localToken) {
            setIsAuthenticated(false);
            const isPrivacyPage = pathname === "/privacy";
            if (!isPrivacyPage) {
              setAuthModalOpen(true);
            }
          }
        }
      })
      .catch(() => {
        if (!localToken) {
          setIsAuthenticated(false);
        }
      });
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar onOpenSearch={() => setCommandPaletteOpen(true)} />

      <main className="flex-1 pb-20 lg:pb-12">{children}</main>

      <MobileNav onOpenMore={() => setCommandPaletteOpen(true)} />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={() => window.location.reload()}
      />

      <AuthModal
        isOpen={authModalOpen}
        canClose={pathname === "/"}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          setIsAuthenticated(true);
          window.location.reload();
        }}
      />
    </div>
  );
};
