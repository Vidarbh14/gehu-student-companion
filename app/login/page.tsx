"use client";

import React from "react";
import { AuthModal } from "@/components/AuthModal";

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <AuthModal
        isOpen={true}
        canClose={false}
        onSuccess={() => {
          window.location.href = "/dashboard";
        }}
      />
    </div>
  );
}
