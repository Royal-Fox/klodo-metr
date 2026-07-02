# Klódo-Metr - návod pro Claude Code

Nemusíš nic programovat. Claude jen **stáhne hotový skript a spustí ho** - je to rychlé a **levné na tokeny** (žádné generování kódu). Skript sám vytáhne tvoje data, vytvoří přehled + Souboj klódů (design a logo Vibecoding Akademie) a **rovnou otevře prohlížeč**.

---

## ✅ Mini prompt (stačí zkopírovat do Claude Code)

```
Stáhni a řiď se přesně instrukcemi z https://raw.githubusercontent.com/vibecoding-akademie/klodo-metr/main/PROMPT.md
```

Claude si tenhle soubor stáhne, přečte kroky níže, spustí skript a otevře prohlížeč. Výsledek má **identický design a funkce** jako u nás (jen s tvými daty).

---

## Co má Claude udělat (kroky v tomto souboru)

1. Stáhni skript do aktuální složky:
   `curl -fsSL https://raw.githubusercontent.com/vibecoding-akademie/klodo-metr/main/klodo-metr.js -o klodo-metr.js`
2. Spusť ho: `node klodo-metr.js`
3. Skript sám přes `ccusage` vytáhne lokální data z `~/.claude/projects`, vygeneruje `~/klodo-metr.html` a otevře ho v prohlížeči.
4. NIC neprogramuj ani neupravuj - skript je hotový. Data nikam neodesílej, vše běží lokálně.

## Nebo rovnou v terminálu (bez Claude)

```bash
curl -fsSL https://raw.githubusercontent.com/vibecoding-akademie/klodo-metr/main/klodo-metr.js -o klodo-metr.js && node klodo-metr.js
```

## Co potřebuješ

- **Node.js** (máš, když používáš Claude Code)
- připojení k internetu (kvůli `ccusage` přes `npx`)

Žádné další soubory - skript je jeden samostatný soubor.

## Jak se pochlubit

V záložce **🍆 Souboj klódů** klikni dole na **„Sdílet jako fotku (kartičku)"** - kartička se zkopíruje do schránky a stačí ji vložit do komentářů v komunitě Vibecoding Akademie. Kdo má většího klóda? 😏
