# Bezpečnost

Klódo-Metr běží **výhradně lokálně** na tvém počítači. Tady je přesně, co dělá a co nedělá.

## Co skript dělá

- Spustí `npx ccusage` (open-source nástroj) a přečte tvoje **lokální** transcripty z `~/.claude/projects`.
- Spočítá spotřebu tokenů a vygeneruje HTML soubor `~/klodo-metr.html`.
- Otevře ten soubor v prohlížeči.

## Co skript NEDĚLÁ

- **Neodesílá žádná data** nikam na internet. Žádná telemetrie, žádný upload, žádné volání našich serverů.
- Sdílecí kartička **neobsahuje názvy projektů** (kvůli ochraně jmen klientů) - jen tvoje agregované skóre (tokeny, rank, statistiky).
- Nečte nic mimo `~/.claude/projects` a neupravuje žádné tvoje soubory.

## Odchozí síť

Jediné síťové aktivity při spuštění: stažení `ccusage` přes `npx` (z npm) a stažení samotného skriptu z tohoto repa. Nic jiného.

## Kdo může měnit skript

Do repa mohou zapisovat pouze členové týmu Vibecoding Akademie s právem push. Větev `main` je **chráněná** - změny jdou přes pull request. Kdokoliv jiný může nanejvýš poslat PR, který musíme schválit; sám v repu nic nezmění.

## Ověř si to sám

Repo je public - než skript spustíš, můžeš si celý `klodo-metr.js` přečíst. Je to jeden samostatný soubor bez závislostí.

## Nahlášení problému

Našel jsi bezpečnostní problém? Otevři issue v tomto repu nebo napiš týmu Vibecoding Akademie.
