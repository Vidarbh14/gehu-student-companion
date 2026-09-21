"use client";

import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "./CommandPalette";
import { ImportModal } from "./ImportModal";

export const ClientShell: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

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
    </div>
  );
};
