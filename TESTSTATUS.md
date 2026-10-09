# Prüfstatus – 7. Oktober 2026

Tatsächlich ausgeführt unter Node.js 24.19.0 und npm 12.2.0:

- `npm ci --ignore-scripts --no-audit --no-fund`: erfolgreich.
- `npm test`: zwei Tests erfolgreich; Formatierung gültiger Dauerwerte und Ablehnung ungültiger Werte.
- `npm pack --dry-run --json`: erfolgreich; Paket enthält README, Lizenz, package.json und src/index.js, keine Test-/Workflowdateien.
- `npm publish --dry-run --ignore-scripts --json`: erfolgreich als lokaler Trockenlauf. Die CLI weist ausdrücklich auf fehlende Anmeldung hin; der Test behauptet keine Registry-Berechtigung.
- Workflow-YAML syntaktisch eingelesen; Testjob ohne OIDC-Recht, Publishjob nach Testjob und mit Environment/OIDC-Recht geprüft.

Nicht ausgeführt: GitHub-Workflow, Paketanlage, OIDC-Tokenaustausch, echter Upload, Staging/Freigabe, Prüfung einer real veröffentlichten Attestation. Dafür braucht es eigene Konten sowie einen eindeutigen Paket- und Repositorynamen.

Der erste Pack-Versuch aus dem übergeordneten Arbeitsverzeichnis mit `--prefix` fand keine package.json. Die Wiederholung aus dem Paketverzeichnis war erfolgreich. Alle README-Befehle sind aus dem Paketverzeichnis vorgesehen.

# Realer Durchlauf – 9. Oktober 2026

Paket `@fdeitelhoff/ix-trusted-publishing-demo-npm`, Repository https://github.com/fdeitelhoff/ix-trusted-publishing-demo-npm (öffentlich, Environment `npm` mit Pflicht-Reviewer).

| Punkt | Ergebnis |
|---|---|
| Lokale Prüfung | Node 24.21.0, npm 12.2.0 via `npx`: `npm ci`, `npm test` (2/2), `npm pack --dry-run`, `npm publish --dry-run` erfolgreich |
| 0.1.0 (manuell) | Node 24.21.0, npm 11.6.0, `npm login` + `npm publish`; Shasum `9f529e1fb06d6bd545b00822d225e743292998fb`; keine Provenance |
| Trust-Zuordnung | GitHub Actions, `fdeitelhoff` / `ix-trusted-publishing-demo-npm`, `npm-publish.yml`, Environment `npm`, direktes Publish erlaubt |
| Release-Tag | `v0.1.1`, Workflow-Commit `7610240932e4b933efee12b3b0c79ff45f5252ef` |
| Workflow-Lauf | https://github.com/fdeitelhoff/ix-trusted-publishing-demo-npm/actions/runs/37945821856 – Test 12 s, Publish 16 s nach Environment-Freigabe; CI-npm 12.2.0 |
| OIDC-Ergebnis | Erfolgreich: „Signed provenance statement with source and build information from GitHub Actions“, `+ …@0.1.1` |
| Paketseite | https://www.npmjs.com/package/@fdeitelhoff/ix-trusted-publishing-demo-npm |
| 0.1.1 | Shasum `a1d4fbe44c3531bdb384c9fe5ee4dc05f78f2267`, Attestation `https://slsa.dev/provenance/v1` |
| Provenance-Ergebnis | `npm audit signatures` (npm 12.2.0, leeres Verzeichnis): 1 verifizierte Registry-Signatur, 1 verifizierte Attestation; invalid 0, missing 0 |
| Provenance-Inhalt | Repository, Workflow `.github/workflows/npm-publish.yml` @ `refs/tags/v0.1.1`, Commit `7610240…` (= lokaler HEAD), Builder `github-hosted`, Run-ID wie oben |

Beobachtungen, die das README nicht nennt:

- Die Registry verarbeitet neue Versionen asynchron (`PUT 202`, „Your package is being processed“). 0.1.0 war nach ca. 30 s sichtbar, 0.1.1 nach ca. 135 s.
- Auch das direkte `npm publish` eines neuen Pakets hinterließ einen Platzhalter `0.0.0-stage` in der Versionsliste, nicht nur `npm stage publish`.
- Bei Authenticator-2FA braucht `npm publish` ohne interaktives Terminal (z. B. in einem Agenten) `--otp=<code>`, sonst Fehler `EOTP`.
- GitHub-Hinweis im Lauf: `ubuntu-latest` wechselt ab 19. Oktober 2026 auf Ubuntu 26.

Nicht ausgeführt: Migration (2FA + gesperrte Tokens), Negativtest mit abweichendem Environmentnamen, Staging-Variante.
