# 🍆 Klódo-Metr

**Kdo má většího klóda?** Interaktivní přehled tvojí spotřeby v Claude Code + soutěžní "Souboj klódů". Vygeneruje se lokálně z tvých transcriptů - **nic neopustí tvůj počítač**.

## 🚀 Nejrychlejší start (zkopíruj do AI a je hotovo)

Vezmi tenhle mini prompt a vlož ho do Claude Code (nebo jiné AI s přístupem k terminálu). Vše se udělá samo - stáhne se skript, vytáhnou se tvoje data a otevře se prohlížeč s výsledkem:

```
Stáhni a řiď se přesně instrukcemi z https://raw.githubusercontent.com/vibecoding-akademie/klodo-metr/main/PROMPT.md
```

Levné na tokeny - AI nic neprogramuje, jen stáhne a spustí hotový skript.

## Spuštění (ručně)

Jeden příkaz (macOS / Linux / Windows s `curl`):

```bash
curl -fsSL https://raw.githubusercontent.com/vibecoding-akademie/klodo-metr/main/klodo-metr.js -o klodo-metr.js && node klodo-metr.js
```

Nebo si stáhni `klodo-metr.js` a spusť:

```bash
node klodo-metr.js
```

Potřebuješ jen **Node.js** (máš ho, když používáš Claude Code) a připojení k internetu (kvůli `ccusage` přes `npx`). Skript vytvoří `~/klodo-metr.html` a otevře ho v prohlížeči.

## Co to dělá a proč je to bezpečné

- Přečte tvoje **lokální** transcripty `~/.claude/projects` a spočítá spotřebu tokenů přes [`ccusage`](https://github.com/ryoppippi/ccusage).
- **Vše běží jen na tvém počítači, nic se nikam neodesílá.**
- Sdílecí kartička **neobsahuje názvy projektů** (kvůli ochraně jmen klientů).
- Cena je **ekvivalent API cen**, ne reálná platba na předplatném.

Podrobnosti v [SECURITY.md](SECURITY.md).

## Dvě záložky

- **🍆 Souboj klódů** - "Klódo-Metr" (délka = tokeny ÷ 100M), ranky, achievementy, žebříček projektů a tlačítko **Sdílet jako fotku (kartičku)**, které zkopíruje brandovanou kartičku do schránky. Hoď ji do komentářů v komunitě Vibecoding Akademie.
- **📊 Přehled** - filtry (měsíc/projekt/model), graf v čase, tabulka. Detailní rozpad spotřeby.

## Aktualizace

Skript je jeden soubor. Kdykoliv ho v tomhle repu vylepšíme, stačí lidem pustit znovu ten samý příkaz - stáhnou si nejnovější verzi.

---

Vytvořila [Vibecoding Akademie](https://vibecoding-akademie.cz)
