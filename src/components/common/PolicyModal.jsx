import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useRules } from "../../contexts/RulesContext";
import Modal from "./Modal";

export function usePolicyModal() {
  const [activePolicyKey, setActivePolicyKey] = useState(null);
  const { getPolicy } = useRules();

  const openPolicy = useCallback((type) => {
    setActivePolicyKey(type);
  }, []);

  const closePolicy = useCallback(() => {
    setActivePolicyKey(null);
  }, []);

  const activePolicy = activePolicyKey ? getPolicy(activePolicyKey) : null;

  useEffect(() => {
    const handler = (e) => openPolicy(e.detail);
    window.addEventListener("open-policy", handler);
    return () => window.removeEventListener("open-policy", handler);
  }, [openPolicy]);

  return { activePolicyKey, activePolicy, openPolicy, closePolicy };
}

export function openPolicyGlobal(type) {
  window.dispatchEvent(new CustomEvent("open-policy", { detail: type }));
}

export default function PolicyModal({ activePolicyKey, activePolicy, onClose }) {
  const { loading } = useRules();
  const isOpen = Boolean(activePolicyKey);
  const hasPolicyContent = Boolean(activePolicy?.html?.trim());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-3xl"
      bodyClassName="p-0"
      showClose={false}
    >
      {hasPolicyContent ? (
        <div className="flex h-full w-full flex-col overflow-hidden bg-white p-0">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-neutral-100 bg-neutral-50/60 px-4 py-3 sm:px-5 sm:py-4">
            <div className="min-w-0">
              <div className="text-lg font-semibold text-secondary-900">{activePolicy.title}</div>
              <div className="mt-1 text-sm text-secondary-500">{activePolicy.subtitle}</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-4 text-sm leading-relaxed text-secondary-600 sm:px-5 sm:py-5">
            <div className="policy-rich-content" dangerouslySetInnerHTML={{ __html: activePolicy.html }} />
          </div>
        </div>
      ) : loading ? (
        <div className="flex h-full w-full flex-col overflow-hidden bg-white p-0">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-neutral-100 bg-neutral-50/60 px-4 py-3 sm:px-5 sm:py-4">
            <div className="min-w-0 animate-pulse space-y-2">
              <div className="h-5 w-40 rounded bg-neutral-200" />
              <div className="h-4 w-56 rounded bg-neutral-100" />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-secondary-500 transition-all hover:border-neutral-200 hover:bg-white hover:text-secondary-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="custom-scrollbar flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 9 }).map((_, idx) => (
                <div key={idx} className="h-4 rounded bg-neutral-100" style={{ width: `${96 - (idx % 3) * 12}%` }} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 py-8 text-sm text-secondary-500">
          Policy not found.
        </div>
      )}
    </Modal>
  );
}
