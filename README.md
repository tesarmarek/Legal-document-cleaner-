# Legal Document Cleaner

Moderní nástroj pro čištění a transformaci právních dokumentů ve formátu HTML.
# Legal Document Cleaner

Moderní nástroj pro čištění a transformaci právních dokumentů ve formátu HTML. Aplikace umožňuje automatickou úpravu struktury dokumentu, transformaci nadpisů a zachování číslování odstavců.

## 🚀 Funkce

### 1. Transformace Nadpisů
- Automatická detekce úrovní nadpisů (h1-h6)
- Možnost změny úrovně nadpisů
- Zachování atributů a formátování při transformaci
- Podpora více výskytů stejného nadpisu

### 2. Správa Stylů
- Odstranění nepotřebných style tagů
- Čištění inline stylů
- Automatické přidání základních stylů pro číslování
- Zachování důležitých formátovacích vlastností

### 3. Číslování Odstavců
- Automatické zachování číslování v seznamech
- Podpora vnořených seznamů
- Zachování původního formátu číslování
- Možnost přidání vlastních stylů pro číslování

### 4. Analýza Dokumentu
- Automatická detekce struktury dokumentu
- Identifikace sekcí a podsekcí
- Generování metadat o dokumentu
- Podpora interaktivního JSON výstupu

## 🛠️ Technické Detaily

### Architektura
Aplikace je postavena na moderní architektuře s využitím:
- TypeScript pro typovou bezpečnost
- SOLID principů pro čistý kód
- Modulární struktury pro snadnou údržbu

### Hlavní Komponenty
1. **TransformationManager**
   - Koordinace celého procesu transformace
   - Správa metadat dokumentu
   - Generování struktury dokumentu

2. **StyleManager**
   - Správa CSS stylů
   - Odstraňování nepotřebných stylů
   - Přidávání základních stylů

3. **HeaderManager**
   - Správa nadpisů
   - Transformace úrovní nadpisů
   - Zachování atributů

4. **ListManager**
   - Správa seznamů
   - Zachování číslování
   - Podpora vnořených struktur

## 📦 Instalace

1. Naklonujte repozitář:
```bash
git clone https://github.com/tesarmarek/Legal-document-cleaner-.git
```

2. Nainstalujte závislosti:
```bash
npm install
```

3. Spusťte vývojový server:
```bash
npm run dev
```

## 💻 Použití

### Základní Použití
1. Načtěte HTML dokument
2. Vyberte požadované transformace
3. Klikněte na "Transformovat"
4. Stáhněte upravený dokument

### Pokročilé Funkce
- **Interaktivní JSON**: Získejte strukturovaná data o dokumentu
- **Vlastní Transformace**: Definujte vlastní pravidla pro transformaci
- **Hromadné Zpracování**: Zpracujte více dokumentů najednou

## 📝 Formát Metadat

```typescript
interface DocumentMetadata {
  originalContent: string;
  transformations: {
    styles: any[];
    headers: any[];
  };
  structure: {
    headers: HeaderInfo[];
    lists: ListInfo[];
  };
  documentStructure?: any;
}

interface HeaderInfo {
  level: number;
  text: string;
  customLevel?: number;
  element?: Element;
}

interface ListInfo {
  id: string;
  number: string;
  text: string;
}
```

## 🔧 Konfigurace

### Nastavení Transformací
```typescript
{
  "headers": [
    {
      "currentLevel": 1,
      "proposedLevel": 2,
      "text": "Název sekce"
    }
  ],
  "styles": {
    "removeInline": true,
    "preserveNumbering": true
  }
}
```
