# Prüfstatus – 7. Oktober 2026

Tatsächlich ausgeführt unter Node.js 24.19.0 und npm 12.2.0:

- `npm ci --ignore-scripts --no-audit --no-fund`: erfolgreich.
- `npm test`: zwei Tests erfolgreich; Formatierung gültiger Dauerwerte und Ablehnung ungültiger Werte.
- `npm pack --dry-run --json`: erfolgreich; Paket enthält README, Lizenz, package.json und src/index.js, keine Test-/Workflowdateien.
- `npm publish --dry-run --ignore-scripts --json`: erfolgreich als lokaler Trockenlauf. Die CLI weist ausdrücklich auf fehlende Anmeldung hin; der Test behauptet keine Registry-Berechtigung.
- Workflow-YAML syntaktisch eingelesen; Testjob ohne OIDC-Recht, Publishjob nach Testjob und mit Environment/OIDC-Recht geprüft.

Nicht ausgeführt: GitHub-Workflow, Paketanlage, OIDC-Tokenaustausch, echter Upload, Staging/Freigabe, Prüfung einer real veröffentlichten Attestation. Dafür braucht es eigene Konten sowie einen eindeutigen Paket- und Repositorynamen.

Der erste Pack-Versuch aus dem übergeordneten Arbeitsverzeichnis mit `--prefix` fand keine package.json. Die Wiederholung aus dem Paketverzeichnis war erfolgreich. Alle README-Befehle sind aus dem Paketverzeichnis vorgesehen.
