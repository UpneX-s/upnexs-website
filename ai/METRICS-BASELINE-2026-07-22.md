# GA4 Baseline — Pre-CRO Fix
**Date range:** Jul 15–21, 2026
**Captured:** 2026-07-22 (day of ship)

## Raw Numbers

| Event | Count | Notes |
|---|---|---|
| Users | 158 | +236% WoW — Google Ads working |
| Scroll (any) | 47 | 30% of users scroll at all |
| scroll_depth | 12 | 7.6% reach deep content |
| cta_click | 5 | 3.2% CTA click rate |
| calendly_opened | 12 | 7.6% opened Calendly widget |
| calendly_link_click | 5 | 3.2% clicked through Calendly |
| form_start | 1 | 0.6% form start — biggest leak |
| booking_completed | 0 | 0% (implied) |

## Conversion Funnel

```
158 → landed
 47 → scrolled (30%)
 12 → deep content (7.6%)
  5 → CTA click (3.2%)
 12 → Calendly opened (7.6%)
  5 → Calendly clicked through (3.2%)
  1 → form started (0.6%)
  0 → booking completed (0%)
```

## Diagnoses

1. **Hero fails 70% of users** — halo effect + Life Force 8 gap
2. **CTA clicks at 3.2%** — 3 competing CTAs on hub = paralysis; messaging weak
3. **Calendly 58% abandon** — 12 opened, only 5 clicked through; widget friction
4. **form_start = 1** — form buried below 700px Calendly widget; impossible to find

## Changes Shipped 2026-07-22

- New H1 headlines across all 6 pages (loss framing + Life Force 8)
- "What's Included" section added to all 6 pages (Labor Illusion)
- "Cost of Doing Nothing" section added to all 6 pages (Loss Aversion)
- Hub: 3 CTAs → 2 CTAs
- Form restructure: 6 required fields → 3 fields, shown BEFORE Calendly widget
- 6th-grade reading level pass on hero copy

## Measurement Plan

- **Post-change window:** Jul 22–28 (first 7 days, may have noise from change itself)
- **Primary comparison:** Aug 5–11 vs Jul 15–21 (14 days post-ship)
- **Target metrics:**
  - scroll (any): 30% → 45%+
  - cta_click: 3.2% → 6%+
  - form_start: 0.6% → 5%+
  - booking_completed: 0 → 2+

## Audit Score Before/After

| Page | Before | Target |
|---|---|---|
| /ai/ hub | 28/50 🔴 | 45+/50 |
| /ai/automation/ | 30/50 🔴 | 45+/50 |
| /ai/tenant-communication/ | 31/50 🟡 | 45+/50 |
| /ai/maintenance/ | 32/50 🟡 | 45+/50 |
| /ai/staffing/ | 35/50 🟡 | 45+/50 |
| /ai/leasing/ | 37/50 🟢 | 47+/50 |
| **Average** | **32/50** | **46+/50** |

## /clients/ Page — Added 2026-07-22

**URL:** `https://upnexs.com/clients/`  
**Commit:** `f1a25af`  
**Purpose:** Client-facing pitch page for discovery call demos

### New GA4 Events
| Event | When it fires |
|---|---|
| `roi_calculator_used` | First slider input per session |
| `roi_result_seen` | Scroll past ROI result panel (50% threshold) |
| `roi_calculator_cta_click` | Click "Book a call" CTA from inside calculator |

### Standard Events Also Active
All existing events fire: `page_view`, `scroll_depth`, `cta_click`, `calendly_link_click`, `booking_completed`

### Baseline (no data yet — page shipped today)
- Expected traffic: direct share only (no ads, no SEO ranking yet)
- Primary use: Hari shares URL on discovery calls
- Target: visitor sees ROI calculator, fires `roi_result_seen`, books via Calendly
