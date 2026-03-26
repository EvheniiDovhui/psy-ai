from __future__ import annotations

import math
from dataclasses import dataclass
from statistics import mean, median

from app.psychometrics.types import ExplainItem, Indicator, ModelExplain


def agg_values(values: list[float], method: str = "mean") -> float:
    """
    Агрегація списку значень:
    - mean (середнє)
    - median (медіана)
    """
    if not values:
        return 0.0
    if method == "mean":
        return float(mean(values))
    if method == "median":
        return float(median(values))
    raise ValueError(f"Unknown agg method: {method}")


def minmax_normalize_dict(d: dict[str, float], out_min: float = 0.0, out_max: float = 1.0) -> dict[str, float]:
    """
    Min-max нормалізація словника значень на заданий діапазон (out_min..out_max).
    ВАЖЛИВО: нормалізація робиться *всередині* цього dict (тобто відносно min/max у ньому).
    """
    if not d:
        return {}
    vals = list(d.values())
    vmin, vmax = min(vals), max(vals)

    if math.isclose(vmin, vmax):
        #якщо всі значення однакові — повертаємо out_min(або можна 0.5)
        return {k: float(out_min) for k in d.keys()}

    scale = (out_max - out_min) / (vmax - vmin)
    return {k: out_min + (v - vmin) * scale for k, v in d.items()}


@dataclass
class ScoreOutput:
    """
    Заготовка, якщо захочеш використовувати єдину структуру (зараз не обов'язково).
    """
    raw: dict[str, float]
    norm: dict[str, float]
    explain: ModelExplain


def score_targets_from_impacts(
    indicators: list[Indicator],
    indicator_to_impacts: dict[str, list],
    *,
    why_prefix: str,
) -> tuple[dict[str, float], ModelExplain]:
    """
    Основна формула:
      score(target) = Σ (w_i * impact(i, target))

    Паралельно збираємо explainability:
    - які правила спрацювали
    - який внесок кожного індикатора
    """
    totals: dict[str, float] = {}
    explain = ModelExplain(indicators=indicators[:], contributions=[], why=[])

    for ind in indicators:
        impacts = indicator_to_impacts.get(ind.name, [])
        if not impacts:
            continue

        for imp in impacts:
            target = imp.target
            impact_val = float(imp.value)

            #внесок індикатора у ціль
            contrib = ind.effective_weight * impact_val

            totals[target] = totals.get(target, 0.0) + contrib
            explain.contributions.append(
                ExplainItem(
                    target=target,
                    indicator=ind.name,
                    w_i=float(ind.effective_weight),
                    impact=impact_val,
                    contribution=contrib,
                    evidence=ind.evidence,
                )
            )

    #топ-5 правил за абсолютним внеском
    if explain.contributions:
        top = sorted(explain.contributions, key=lambda x: abs(x.contribution), reverse=True)[:5]
        explain.why.append(f"{why_prefix}: топ правил за |внеском|:")
        for t in top:
            sign = "+" if t.contribution >= 0 else "-"
            explain.why.append(
                f"  {t.target}: {sign}{abs(t.contribution):.3f} від {t.indicator} "
                f"(w={t.w_i:.2f}, impact={t.impact:+.2f})"
            )
    else:
        explain.why.append(f"{why_prefix}: жодне правило не спрацювало (нема мапінгу для індикаторів)")

    return totals, explain