# npm: Trusted Publishing ausprobieren

Stand: 7. Oktober 2026. Dieses Verzeichnis enthält ein eigenständiges, abhängigkeitloses npm-Paket. Kopieren Sie seinen Inhalt einschließlich `.github` in die Wurzel eines eigenen öffentlichen GitHub-Repositorys. Der Workflow setzt keine Monorepo-Pfade voraus.

## Lokal prüfen, ohne Veröffentlichung

Node.js 24.15 oder neuer aus der 24er-Reihe; die Demo verwendet in CI npm 12.2.0. Die allgemeinen Mindestversionen für npm Trusted Publishing sind niedriger (npm 11.5.1, Node 22.14), aber npm 12 verlangt eine neuere Node-Version.

```bash
npm install --global npm@12.2.0 --ignore-scripts
npm --version
npm ci --ignore-scripts
npm test
npm pack --dry-run
npm publish --dry-run --ignore-scripts
```

Die letzten beiden Befehle prüfen den Paketinhalt. Ein Dry Run bestätigt weder OIDC noch die Registry-Berechtigung. `npm whoami` eignet sich ebenfalls nicht als OIDC-Test.

## Namen anpassen und das Paket einmal anlegen

Ersetzen Sie `replace-me` durch Ihren eigenen npm-Scope, `REPLACE_OWNER` und `REPLACE_REPO` durch den tatsächlichen GitHub-Owner und Repositorynamen. npm- und GitHub-Benutzernamen müssen nicht identisch sein. Die URL muss zum GitHub-Repository passen; behalten Sie die Groß-/Kleinschreibung bei. Ein ungenutzter Paketname innerhalb Ihres eigenen Scopes vermeidet Namenskollisionen.

```bash
npm pkg set name="@IHR_NPM_NAME/trusted-publishing-demo"
npm pkg set repository.url="git+https://github.com/IHR_GITHUB_NAME/IHR_REPO.git"
npm install --package-lock-only --ignore-scripts
```

Für einen übersichtlichen ersten Versuch legen Sie Version 0.1.0 interaktiv an. Der nächste Befehl `npm publish` veröffentlicht tatsächlich ein öffentliches Paket:

```bash
npm login
npm publish --access public --ignore-scripts
```

Bestätigen Sie die Anmeldung beziehungsweise 2FA im angebotenen Browserablauf. Im CI-Workflow steht später kein gespeichertes npm-Token. npm verlangt zunächst ein existierendes Paket für die Trust-Zuordnung. Seit 2. Oktober 2026 ist alternativ eine erstmalige Anlage über `npm stage publish` mit lokaler Sitzung oder granularer Berechtigung möglich; siehe Zusatz unten.

## Trust-Zuordnung

Legen Sie in GitHub unter Settings → Environments das Environment `npm` an. Für den Versuch empfiehlt sich ein Freigabeschritt, soweit der Repository-/Kontotarif ihn anbietet. Die bloße Nennung `environment: npm` erzeugt noch keine Review-Regel.

In den npm-Paketeinstellungen tragen Sie unter Trusted publishing ein:

| Feld | Wert |
|---|---|
| Provider | GitHub Actions |
| Organization or user | tatsächlicher GitHub-Owner |
| Repository | Repositoryname ohne Owner |
| Workflow filename | `npm-publish.yml` |
| Environment name | `npm` |
| Allowed action | direktes `npm publish` explizit erlauben |

Neue Zuordnungen erlauben standardmäßig Staging. Die Hauptdemo braucht zusätzlich das direkte Veröffentlichungsrecht. Führen Sie innerhalb von 48 Stunden die erste erfolgreiche Veröffentlichung mit dieser Zuordnung aus. Nach Ablauf einer ungenutzten Zuordnung müssen Sie diese neu anlegen.

## Zweite Version via GitHub veröffentlichen

```bash
npm version 0.1.1 --no-git-tag-version
npm test
git add .
git commit -m "Configure npm trusted publishing demo"
git push origin main
git tag v0.1.1
git push origin v0.1.1
```

Erstellen und veröffentlichen Sie anschließend in GitHub ein Release für den vorhandenen Tag `v0.1.1`. Nur ein veröffentlichter Release startet den beigelegten Workflow; der Tag-Push allein reicht nicht. Prüfen Sie den Testjob und geben Sie anschließend das Environment frei, falls Sie Reviewer eingerichtet haben.

Der Testjob hat kein OIDC-Recht. Erst der Publishjob erhält `id-token: write`. Da die Demo keinen Build und keine Abhängigkeiten hat, packt der Publishjob direkt die Quelldatei. `--ignore-scripts` vermeidet dort Lifecycle-Hooks. Für echte Buildprojekte braucht es eine bewusste Übergabe der geprüften Artefakte; diesen Workflow dafür nicht unverändert übernehmen.

Die Action-Major-Tags `@v7` machen das Beispiel lesbar. Für einen produktiven Veröffentlichungsworkflow fixieren Sie Actions auf geprüfte vollständige Commit-SHAs und aktualisieren diese kontrolliert. Ein Major-Tag kann sich verschieben.

## Provenance prüfen

npm erzeugt für dieses öffentliche Paket aus dem öffentlichen GitHub-Repository standardmäßig Provenance. Auf der Paketversionsseite prüfen Sie Repository, Workflow und Commit. Anschließend in einem separaten leeren Verzeichnis:

```bash
npm init -y
npm install --ignore-scripts @IHR_NPM_NAME/trusted-publishing-demo@0.1.1
npm audit signatures
npm audit signatures --json --include-attestations
```

Die Ausgabe unterscheidet Registry-Signaturen von attestierten Paketen. Ein erfolgreicher Signaturcheck allein erzwingt keine Provenance für jede Abhängigkeit. Ein fehlender Herkunftsnachweis ist auch nicht gleichbedeutend mit einer manipulierten Signatur. Die Demo hat keine Installationsskripte; `--ignore-scripts` bleibt für diesen Konsumententest absichtlich aktiv.

## Migration abschließen

Nach dem erfolgreichen OIDC-Lauf können Sie in npm den Paketzugriff auf 2FA plus gesperrte traditionelle Tokens stellen und die alten Publish-Tokens widerrufen. Trusted Publishing allein entfernt bestehende Tokens nicht. Private Abhängigkeiten benötigen bei der Installation gegebenenfalls weiterhin eine eigene Leseberechtigung.

## Zusatz: Staging statt direkter Freigabe

Ersetzen Sie im selben Workflow ausschließlich die Veröffentlichungszeile:

```yaml
- name: Stage via OIDC
  run: npm stage publish --access public --ignore-scripts
```

Entfernen Sie in der zugehörigen npm-Trust-Zuordnung das direkte Publishrecht. Die CI lädt dann eine Version in die Warteschlange. Ein Maintainer prüft sie anschließend angemeldet lokal oder auf npmjs.com und genehmigt sie mit 2FA:

```bash
npm stage list @IHR_NPM_NAME/trusted-publishing-demo
npm stage view STAGE_ID
npm stage download STAGE_ID
npm stage approve STAGE_ID
```

`STAGE_ID` ersetzen Sie durch die tatsächliche Kennung. Die Freigabe veröffentlicht das Paket. Das OIDC-Token des Workflows kann die menschliche Genehmigung nicht ersetzen. Bei einem zuvor nicht existierenden Paket legt ein erster lokaler Stage-Aufruf einen öffentlich sichtbaren Platzhalter `0.0.0-stage` an; der eigentliche Inhalt bleibt bis zur Freigabe in der Warteschlange. Danach lässt sich auch die Trust-Zuordnung einrichten. Dieser Bootstrap ist also nicht vollständig tokenlos, wenn statt einer interaktiven Sitzung ein granularer Token zum Einsatz kommt.

## Versuchsauswertung

Festhalten: Node-/npm-Version, Workflow-Commit, Release-Tag, Paketseite, OIDC-Ergebnis, Provenance-Ergebnis. Für einen Fehlversuch nur in der Demo-Zuordnung den Environmentnamen absichtlich abweichend setzen und eine weitere, unveröffentlichte Paketversion verwenden. Erwartung: Ablehnung. Keine bestehenden Produktionseinstellungen dafür verändern.

Die lokale Prüfung dieser Dateien bestätigt Paketfunktion und Packbarkeit. Ein realer Upload, der Registry-Tokenaustausch und die anschließende Provenance-Verifikation erfordern Ihren eigenen Registry- und GitHub-Kontext; sie fanden bei der Erstellung nicht statt.

Quellen: https://docs.npmjs.com/trusted-publishers/ · https://docs.npmjs.com/generating-provenance-statements/ · https://docs.npmjs.com/cli/v11/commands/npm-audit/ · https://docs.npmjs.com/staged-publishing/ · https://github.blog/changelog/2026-10-02-npm-staged-publishing-now-supports-creating-new-packages/ · https://github.blog/changelog/2026-10-02-unvalidated-npm-trusted-publishing-configurations-now-expire/ · https://github.com/npm/cli/blob/latest/package.json · https://github.com/actions/checkout · https://github.com/actions/setup-node
