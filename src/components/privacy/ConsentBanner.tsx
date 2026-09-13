"use client";

import { useEffect, useState } from "react";
import type { ConsentChoice, ConsentPurpose } from "@/platform/privacy/contracts";
import { readLocalConsent, writeLocalConsent } from "@/platform/privacy/storage";

const OPTIONAL: ConsentPurpose[] = ["preferences", "analytics", "marketing"];

type Choices = Record<ConsentPurpose, ConsentChoice>;

export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [manage, setManage] = useState(false);
  const [choices, setChoices] = useState<Choices | null>(null);

  useEffect(() => {
    const snapshot = readLocalConsent();
    setChoices(snapshot.choices);
    setOpen(snapshot.updatedAt === null);
  }, []);

  if (!open || !choices) return null;

  const save = (next: Choices) => {
    writeLocalConsent(next);
    setChoices(next);
    setOpen(false);
  };

  const acceptAll = () => save({
    essential: "accepted",
    preferences: "accepted",
    analytics: "accepted",
    marketing: "accepted",
  });

  const rejectOptional = () => save({
    essential: "accepted",
    preferences: "rejected",
    analytics: "rejected",
    marketing: "rejected",
  });

  return (
    <aside className="consent-shell" aria-label="Privacy and cookie choices">
      <div className="consent-panel">
        <div>
          <p className="consent-kicker">YOUR PRIVACY, YOUR CHOICE</p>
          <h2>{manage ? "Choose what Veyra can use" : "Veyra uses essential storage and optional technologies."}</h2>
          <p>
            Essential storage keeps Veyra secure and working. Optional preferences,
            analytics and marketing technologies stay off until you choose them.
          </p>
        </div>

        {manage && (
          <div className="consent-options">
            {OPTIONAL.map((purpose) => (
              <label key={purpose} className="consent-option">
                <span>
                  <strong>{purpose[0].toUpperCase() + purpose.slice(1)}</strong>
                  <small>{purpose === "analytics" ? "Helps us understand product usage." : purpose === "marketing" ? "Allows optional campaign communication and measurement." : "Remembers non-essential choices."}</small>
                </span>
                <input
                  type="checkbox"
                  checked={choices[purpose] === "accepted"}
                  onChange={(event) => setChoices((current) => current ? {
                    ...current,
                    [purpose]: event.target.checked ? "accepted" : "rejected",
                  } : current)}
                />
              </label>
            ))}
          </div>
        )}

        <div className="consent-actions">
          <button type="button" onClick={rejectOptional}>Reject optional</button>
          <button type="button" onClick={() => setManage((value) => !value)}>{manage ? "Close settings" : "Manage choices"}</button>
          {manage ? (
            <button type="button" className="consent-primary" onClick={() => save(choices)}>Save choices</button>
          ) : (
            <button type="button" className="consent-primary" onClick={acceptAll}>Accept all</button>
          )}
        </div>
        <p className="consent-links"><a href="/privacy">Privacy</a><span>·</span><a href="/cookies">Cookies</a></p>
      </div>
    </aside>
  );
}
