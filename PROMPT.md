# Návod: pusť si Klódo-Metr přes Claude Code

Nemusíš nic programovat. Claude jen **stáhne hotový skript a spustí ho** - takže je to rychlé a **levné na tokeny** (žádné generování kódu). Skript sám vytáhne tvoje data, vytvoří přehled + Souboj klódů (design a logo Vibecoding Akademie) a **rovnou otevře prohlížeč**.

## Vlož tenhle prompt do Claude Code

```
Stáhni skript z https://raw.githubusercontent.com/Royal-Fox/klodo-metr/main/klodo-metr.js
do aktuální složky a spusť ho příkazem `node klodo-metr.js`. NIC neprogramuj ani neupravuj -
skript je hotový. Sám si přes ccusage vytáhne moje lokální data z ~/.claude/projects,
vygeneruje ~/klodo-metr.html a otevře ho v prohlížeči. Data nikam neodesílej, vše běží lokálně.
```

## Nebo rovnou v terminálu (bez Claude)

```bash
curl -fsSL https://raw.githubusercontent.com/Royal-Fox/klodo-metr/main/klodo-metr.js -o klodo-metr.js && node klodo-metr.js
```

## Co potřebuješ

- **Node.js** (máš, když používáš Claude Code)
- připojení k internetu (kvůli `ccusage` přes `npx`)

To je vše - žádné další soubory, skript je jeden samostatný soubor. Vše běží jen na tvém počítači, nic se nikam neodesílá.

## Jak se pochlubit

V záložce **🍆 Souboj klódů** klikni dole na **„Sdílet jako fotku (kartičku)"** - kartička se zkopíruje do schránky a stačí ji vložit do komentářů v komunitě Vibecoding Akademie. Kdo má většího klóda? 😏
