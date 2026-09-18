"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { CloudCheck, DeviceMobile } from "@phosphor-icons/react";

import { ArrowUpRight } from "@/components/icons";
import { useSubmitForm } from "@/hooks/useSubmitForm";
import type { FormField } from "@/types";
import SignaturePad from "./SignaturePad";

type ResponseValue = string | boolean;

export default function VisitorForm({
  schema,
  qrToken,
  orgName,
}: {
  schema: FormField[];
  qrToken: string;
  orgName: string;
}) {
  const [formData, setFormData] = useState<Record<string, ResponseValue>>({});
  const [signature, setSignature] = useState("");
  const { submitForm, status } = useSubmitForm(qrToken);

  const setValue = (id: string, value: ResponseValue) => setFormData((prev) => ({ ...prev, [id]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await submitForm(formData, signature);
  };

  if (status === "saved_offline") {
    return (
      <StatusScreen
        icon={<DeviceMobile size={40} weight="bold" className="text-ink-soft" />}
        title="Enregistré sur cet appareil"
        message={`Tes informations seront transmises à ${orgName} dès le retour du réseau.`}
      />
    );
  }
  if (status === "synced") {
    return (
      <StatusScreen
        icon={<CloudCheck size={40} weight="bold" className="text-success-text" />}
        title="Transmission réussie"
        message={`Bienvenue chez ${orgName}.`}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6 p-6">
      <header className="mb-2">
        <h1 className="text-2xl font-bold text-ink">{orgName}</h1>
        <p className="text-sm text-ink-soft">Merci de remplir ce registre d&apos;accès</p>
      </header>

      {schema.map((field) => {
        const requiredMark = field.required && <span className="text-error-text">*</span>;

        if (field.type === "checkbox") {
          return (
            <label key={field.id} className="flex items-start gap-2.5 text-sm text-ink">
              <input
                type="checkbox"
                required={field.required}
                className="mt-0.5 h-4 w-4 accent-cta"
                onChange={(e) => setValue(field.id, e.target.checked)}
              />
              <span>
                {field.label} {requiredMark}
              </span>
            </label>
          );
        }

        return (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink">
              {field.label} {requiredMark}
            </label>

            {field.type === "select" ? (
              <select
                required={field.required}
                className="rounded-lg border border-border bg-surface p-3 text-ink outline-none transition focus:border-ink"
                onChange={(e) => setValue(field.id, e.target.value)}
              >
                <option value="">Sélectionne une option</option>
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : field.type === "signature" ? (
              <SignaturePad onSave={setSignature} />
            ) : (
              <input
                type={
                  field.type === "phone"
                    ? "tel"
                    : field.type === "email"
                      ? "email"
                      : field.type === "number"
                        ? "number"
                        : field.type === "date"
                          ? "date"
                          : "text"
                }
                inputMode={field.type === "number" ? "numeric" : field.type === "phone" ? "tel" : undefined}
                required={field.required}
                className="rounded-lg border border-border bg-surface p-3 text-ink outline-none transition focus:border-ink"
                onChange={(e) => setValue(field.id, e.target.value)}
              />
            )}
          </div>
        );
      })}

      <button
        type="submit"
        disabled={status === "saving"}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-cta py-3.5 font-medium text-cta-ink transition duration-200 ease-quiet hover:-translate-y-0.5 hover:bg-cta-hover active:scale-[0.98] disabled:opacity-50"
      >
        {status === "saving" ? "Enregistrement..." : (
          <>
            Valider mon entrée <ArrowUpRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}

function StatusScreen({ icon, title, message }: { icon: ReactNode; title: string; message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      {icon}
      <h2 className="text-2xl font-bold text-ink">{title}</h2>
      <p className="text-ink-soft">{message}</p>
    </div>
  );
}
