
Prose:
Because of (A) the constant increase in strength per pound of new metallic alloys, (B) the constant increase in horsepower per each pound and cubic inch of aircraft engines, and (C) the ever-increasing performance per pounds and cubic inches of new chemistries and electronics, in general we have the capability, which can be fully realized within ten years, of producing and sustaining a higher standard of living for all humanity than that ever heretofore experienced or dreamt of by any.

---

| Bucky's phrase | Modern metric | Unit |
|---|---|---|
| strength per pound (alloys) | Specific strength | kN·m/kg |
| horsepower per pound + cubic inch (engines) | Power-to-weight ratio | kW/kg |
| performance per pound + cubic inch (electronics) | Transistor density | transistors/mm² |

That's the direct translation. No interpretation layered on — each row is just Bucky's exact phrase mapped to what engineers and physicists actually measure and call it today.

---

| # | Bucky's phrase | Metric | Unit | Fidelity to phrase | Data availability |
|---|---|---|---|---|---|
| A | Strength per pound (alloys) | Specific strength | kN·m/kg | Exact | Good |
| B | Horsepower per pound (aircraft engines) | Power-to-weight ratio | kW/kg | Exact | Good |
| B | Horsepower per cubic inch (aircraft engines) | Power density | kW/L | Exact | Good |
| C | Performance per pound (electronics) | Compute density | FLOPS/kg | Close | Patchy pre-1990s |
| C | Performance per cubic inch (electronics) | Compute density (volume) | FLOPS/L | Close | Patchy pre-1990s |
| C | Performance per pound (chemistries) | Energy density (mass) | Wh/kg | Close | Good |
| C | Performance per cubic inch (chemistries) | Energy density (volume) | Wh/L | Close | Good |
| C | *(proxy, not literal)* | Transistor density | transistors/mm² | Proxy | Excellent |
| C | *(proxy, not literal)* | Compute efficiency | FLOPS/watt | Proxy | Moderate |

---

Fair. Writing it now.

| # | Bucky's phrase | Metric | Unit | Fidelity to phrase | Data availability | Notes |
|---|---|---|---|---|---|---|
| A | Strength per pound (alloys) | Specific strength | kN·m/kg | Exact | Good | Direct translation; tensile strength ÷ density; clean data ~1900 onward |
| B | Horsepower per pound (aircraft engines) | Power-to-weight ratio | kW/kg | Exact | Good | Primary metric; weight is the binding constraint in aircraft (fighting gravity) |
| B | Horsepower per cubic inch (aircraft engines) | Power density | kW/L | Exact | Good | Secondary to kW/kg; tracks closely with it; packaging constraint |
| C | Performance per pound (chemistries) | Energy density (mass) | Wh/kg | Close | Good | Bucky almost certainly meant stored energy per unit weight — fuels, batteries, explosives; data runs from coal through lithium-ion |
| C | Performance per cubic inch (chemistries) | Energy density (volume) | Wh/L | Close | Good | Volume analog of above; secondary |
| C | Performance per pound (electronics) | Compute efficiency | FLOPS/watt | Interpretive | Moderate | Weight and volume became negligible as constraints almost immediately; power remained scarce; FLOPS/watt is what engineers actually optimized and what behaves like Bucky's intuition even though the unit doesn't match his words |
| C | Performance per cubic inch (electronics) | Compute density (volume) | FLOPS/L | Close | Patchy pre-1990s | Literal reading of "per cubic inch" but not the operative constraint in electronics |
| C | Performance per pound (electronics) | Compute density (mass) | FLOPS/kg | Close | Patchy pre-1990s | Literal reading of "per pound" but not the operative constraint in electronics |
| C | *(proxy)* | Transistor density | transistors/mm² | Proxy | Excellent | Miniaturization proxy; excellent data continuity but doesn't capture "performance" directly |
| C | *(proxy)* | Compute efficiency | FLOPS/watt | Proxy | Moderate | Listed originally as proxy; now elevated to top choice for electronics — same metric, reframed |

**Editorial note (not a row):** The C clause — "performance per pounds and cubic inches of new chemistries and electronics" — is a single vague gesture covering two distinct sub-domains. The six C rows are an editorial expansion, not a direct read of Bucky. He was pointing at a general principle of miniaturization and densification, not enumerating metrics. The table is more specific than the source in C. A and B are exact; C is interpretive but defensible.

---

Three rows. Here's my reasoning then the table.

**A:** one metric, no tension.
**B:** one metric, no tension.
**C:** two metrics, not one — because chemistries and electronics are genuinely different physical domains with different binding constraints. Collapsing them loses something Bucky actually named separately. But within each, one metric is enough.

| # | Bucky's phrase | Top metric | Unit | Why this one |
|---|---|---|---|---|
| A | Strength per pound (alloys) | Specific strength | kN·m/kg | Exact translation; the operative constraint in materials engineering |
| B | Horsepower per pound (aircraft engines) | Power-to-weight ratio | kW/kg | Exact translation; weight is the binding constraint in aircraft |
| C | Performance per pound (chemistries) | Energy density | Wh/kg | Bucky was pointing at stored energy per unit weight — fuels, batteries, explosives; this is what that domain actually delivered |
| C | Performance per pound (electronics) | Compute efficiency | FLOPS/watt | Weight/volume stopped being the real constraint almost immediately; power was; this is what engineers optimized and what behaves like Bucky's intuition |

Four rows, not three. Splitting C is the minimum honest move.

---

"Pareto optimal" fits — you want a table where no column is redundant and no useful dimension is missing. Here it is:

| # | Bucky's exact words | Direct / literal metric | Unit | Best-use metric | Unit | Why best-use wins | Delta |
|---|---|---|---|---|---|---|---|
| A | "strength per pound of new metallic alloys" | Specific strength | kN·m/kg | Specific strength | kN·m/kg | Exact match — no gap | 100% |
| B | "horsepower per each pound and cubic inch of aircraft engines" | Power-to-weight ratio | kW/kg | Power-to-weight ratio | kW/kg | Exact match — cubic inch (power density) tracks so closely it adds nothing | 95% |
| C₁ | "performance per pounds and cubic inches of new chemistries" | Energy density (mass) | Wh/kg | Energy density (mass) | Wh/kg | Chemistries = stored energy; this is exactly what that domain delivered | 90% |
| C₂ | "performance per pounds and cubic inches of new electronics" | Compute density (mass) | FLOPS/kg | Compute efficiency | FLOPS/watt | Weight/volume stopped being the binding constraint almost immediately; power was — FLOPS/watt is what engineers actually chased and what behaves like Bucky's intuition | 55% |


C₂ is the only real problem row. The 55% delta is the honest acknowledgment that his words and his meaning diverged — electronics miniaturized so fast that weight became irrelevant before it could be the operative constraint, and Bucky was writing in 1969 when that transition was already underway but not yet obvious to articulate cleanly.

Everything else is either exact or close enough that the gap is methodological noise.

---

