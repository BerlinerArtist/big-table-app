import { useState } from "react";
import { cloudEnabled, signInWithMagicLink, supabase } from "../lib/supabase";
import { activateLicense, getLicense } from "../lib/license";

export default function Account({ loggedIn }: { loggedIn: boolean }) {
  const [licenseInput, setLicenseInput] = useState("");
  const [licenseMsg, setLicenseMsg] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [authMsg, setAuthMsg] = useState<string | null>(null);
  const license = getLicense();

  return (
    <section className="panel account">
      <div className="panel-lbl">Your Copy</div>
      {license ? (
        <p className="status ok">Full version active (key …{license.key.slice(-6)})</p>
      ) : (
        <>
          <div className="row">
            <div>
              <label>Gumroad license key</label>
              <input
                type="text"
                value={licenseInput}
                placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
                onChange={(e) => setLicenseInput(e.target.value)}
              />
            </div>
            <button
              className="primary"
              onClick={async () => {
                const r = await activateLicense(licenseInput);
                setLicenseMsg(r.message);
                if (r.ok) { setLicenseInput(""); window.dispatchEvent(new Event("tbt-unlocked")); }
              }}
            >
              Verify
            </button>
          </div>
          {licenseMsg && <p className="status warn">{licenseMsg}</p>}
        </>
      )}

      <div className="panel-lbl" style={{ marginTop: 22 }}>Cloud Sync</div>
      {!cloudEnabled ? (
        <p className="status">
          Local-only mode: everything is saved on this device — guest counts,
          notes, check-offs. Cloud sync switches on automatically once the
          Supabase keys are set (see README-SETUP.md).
        </p>
      ) : loggedIn ? (
        <div className="row">
          <p className="status ok" style={{ flex: 1 }}>
            Signed in — menus, notes and check-offs sync across your devices.
          </p>
          <button className="ghost" onClick={() => supabase?.auth.signOut()}>Sign out</button>
        </div>
      ) : (
        <>
          <div className="row">
            <div>
              <label>Email for magic link</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="primary" onClick={async () => setAuthMsg(await signInWithMagicLink(email))}>
              Send link
            </button>
          </div>
          <p className="status hint">
            We'll email you a one-time sign-in link — no password needed.
            Click the link on any device to unlock sync.
          </p>
          {authMsg && <p className="status">{authMsg}</p>}
        </>
      )}
    </section>
  );
}
