# Shadow Normies

**Pixel intelligence for 10,000 on-chain faces.**

Shadow Normies is a deep analytics engine for the [Normies](https://normies.art) collection. It combines an offline index of all 10,000 bitmaps with **17+ live API endpoints** from [api.normies.art](https://api.normies.art) — delivering morphology profiling, trait-genome decoding, Canvas XOR evolution scans, shadow twin discovery, and wallet phylogeny.

Built for the [Normies Hackathon](https://www.normies.art).

---

## Try it in 10 seconds

| Step | Action |
|------|--------|
| 1 | Open the demo → enter **`42`** (pristine) or **`117`** (Canvas-customized) |
| 2 | See **DNA Fingerprint** — uniqueness, archetype, allele entropy |
| 3 | Scroll to **Canvas Evolution Scan** — original vs composited, XOR integrity |
| 4 | View **Trait Binary (bytes8)** — raw on-chain allele indices |
| 5 | Compare **Phenotype Twins** vs **Genotype Siblings** vs **Doppelgängers** |
| 6 | Paste a wallet → **Wallet DNA** with genetic diversity + canvas investment |

No wallet required. No API key.

---

## API coverage

Shadow Normies uses more Normies API surface than any other community tool.

### Per token lookup (live)

| Endpoint | Used for |
|----------|----------|
| `GET /normie/:id/traits` | Decoded 8-category genome |
| `GET /normie/:id/traits/binary` | Raw bytes8 hex + allele entropy |
| `GET /normie/:id/metadata` | Name, V4 renderer attributes |
| `GET /normie/:id/pixels` | Composited 1600-bit bitmap |
| `GET /normie/:id/original/pixels` | Pre-Canvas bitmap |
| `GET /normie/:id/canvas/pixels` | XOR transform layer |
| `GET /normie/:id/canvas/diff` | Added/removed pixel coordinates |
| `GET /normie/:id/canvas/info` | Level, AP, customized, delegate |
| `GET /normie/:id/image.png` | Composited render |
| `GET /normie/:id/original/image.png` | Original render (Canvas compare) |
| `GET /normie/:id/owner` | Holder link (+ burn detection via 404) |
| `GET /history/normie/:id/versions` | Transform version timeline |
| `GET /history/normie/:id/version/:v/image.svg` | Historical version preview |
| `GET /history/burned/:id/image.svg` | Burned token memorial |

### Wallet and global (live)

| Endpoint | Used for |
|----------|----------|
| `GET /holders/:address` | Wallet collection analysis |
| `GET /history/stats` | Global on-chain pulse |
| `GET /canvas/status` | Canvas contract status (active/paused) |

### Offline index (build script)

| Endpoint | Used for |
|----------|----------|
| `GET /normie/:id/pixels` | Hamming twin search across 10k |
| `GET /normie/:id/traits` | Collection-wide rarity tables |

---

## Algorithm engine (9 modules)

```text
src/lib/
├── hamming.ts       # 1600-bit popcount distance, top-K nearest neighbors
├── morphology.ts    # Density, symmetry, entropy, centroid, quadrant balance
├── genome.ts        # Trait Jaccard, genotype siblings, rarity entropy
├── genetic.ts       # Composite distance, doppelgängers, wallet diversity
├── shadow.ts        # Bitwise inverse twin + complementarity
├── pixels.ts        # XOR chain verify: original XOR canvas = composited
├── trait-binary.ts  # bytes8 allele parsing + fingerprint
├── canvas-scan.ts   # Canvas evolution, phenotype drift, edit magnitude
├── archetype.ts     # Phenotype classification rules
└── analysis.ts      # Orchestrates full NormieDnaReport
```

### Composite genetic distance

```text
D = 0.45 * pixel_hamming + 0.35 * trait_jaccard + 0.20 * morphology_distance
```

### Uniqueness index (with live Canvas data)

```text
U = 40% nearest_neighbor_gap
  + 25% morphology_anomaly
  + 15% trait_rarity_entropy
  + 12% phenotype_drift       (from /canvas/diff + /versions)
  +  8% canvas_evolution_score (from transform history)
```

### Canvas evolution scan

```text
edit_magnitude     = hamming(original, composited) / 1600
xor_layer_density  = on_bits(canvas_layer) / 1600
phenotype_drift    = edit * 0.6 + xor_density * 0.2 + cumulative_edits * 0.4
xor_integrity      = verify(original XOR canvas_layer === composited)
evolution_score    = versions * 15 + cumulative_edits * 2 + pixels_added * 1.5
spatial_spread     = bounding box of /canvas/diff coordinates
```

### Shadow complementarity

```text
affinity = inverse_match * (1 - genetic_distance_to_shadow)
```

### Doppelgänger detection

```text
pixel_similarity > 75%  AND  trait_jaccard < 50%
```

---

## Why this wins

| Crowded (49+ tools) | Shadow Normies (unique) |
|---------------------|-------------------------|
| Games, remixers, 3D | **17+ API endpoints** in one tool |
| Single image display | **Canvas XOR integrity verification** |
| Basic rarity | **bytes8 allele decoding** from chain |
| Visual explorers | **Multi-signal genetic distance** |
| Partial Canvas tools | **Evolution timeline + phenotype drift score** |
| — | **Shadow twin** inverse-bitmap search at 10k scale |

### Demo tips for judges

- **`#42`** — pristine bitmap, full DNA report
- **`#117`** — Canvas-customized with version history + XOR scan
- **`#177`** — burned token memorial via `/history/burned/`

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     Shadow Normies SPA                       │
├─────────────────────────────────────────────────────────────┤
│  NormiePage                                                  │
│  ├─ DNA Fingerprint (offline index + live canvas)           │
│  ├─ Canvas Evolution Scan (live canvas endpoints)           │
│  ├─ Trait Binary bytes8 table                               │
│  ├─ Shadow Twin + Genetic Matches                           │
│  └─ Burn memorial (if 404 on /owner)                        │
├─────────────────────────────────────────────────────────────┤
│  Offline index: 10k x 200-byte pixels + trait JSON          │
│  Live API: per-token lookup + wallet + global stats         │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick start

```bash
git clone https://github.com/RituKumari998/Shadow-Normies.git
cd shadow-normies
npm install
npm run build-index:stub   # ~7 min for 200 normies (dev)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and try `#42` or `#117`.

### Full 10k index (~3 hours, one-time)

```bash
npm run build-index
npm run build
npm run preview
```

### Deploy

```bash
npm run build
# deploy dist/ to Vercel, Cloudflare Pages, or any static host
```


## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Vite + React 19 + TypeScript |
| Styling | Tailwind CSS v4, Normies palette `#48494b` / `#e3e5e4` |
| Fonts | Inter + IBM Plex Mono |
| Data | Offline binary index + live Normies API |
| Deploy | Vercel |

---

## Project structure

```text
shadow_normies/
├── scripts/build-index.mjs      # Rate-limit-aware 10k indexer
├── public/data/                 # normies-pixels.bin + traits JSON
├── src/lib/                     # 9 algorithm modules
├── src/components/
│   ├── CanvasScanPanel.tsx      # Canvas evolution UI
│   ├── TraitBinaryPanel.tsx     # bytes8 allele table
│   ├── DnaFingerprint.tsx       # Composite score dashboard
│   └── GeneticMatches.tsx       # Twins / siblings / doppelgangers
├── src/pages/                   # Home, NormiePage, WalletPage
├── llms.txt                     # Normies API reference
└── vercel.json
```

---

## License

MIT
# Shadow-Normies
