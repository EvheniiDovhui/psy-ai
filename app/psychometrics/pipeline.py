from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.psychometrics.indicators import (
    IndicatorPattern,
    extract_indicators_from_answers,
    extract_indicators_from_text,
)
from app.psychometrics.rules import (
    BIG5_AGG_METHOD,
    BIG5_FACETS_BY_FACTOR,
    BIG5_FACTORS,
    BIG5_INDICATOR_TO_FACETS,
    MASLOW_INDICATOR_TO_LEVELS,
    MASLOW_LEVELS,
    SCHWARTZ_INDICATOR_TO_VALUES,
    SCHWARTZ_VALUES,
)
from app.psychometrics.scoring import agg_values, minmax_normalize_dict, score_targets_from_impacts
from app.psychometrics.types import (
    BigFiveResult,
    MaslowResult,
    PsychometricsResult,
    SchwartzResult,
)


@dataclass
class PsychometricsConfig:
    """
    Конфіг пайплайна:
    - indicator_patterns: кастомний набір правил витягу індикаторів
    - big5_agg_method: як агрегувати фасети в фактор
    - normalization_range: діапазон нормалізації (0..1 або 0..100)
    - schwartz_top_k: скільки топ-цінностей показувати
    """
    indicator_patterns: list[IndicatorPattern] | None = None
    big5_agg_method: str = BIG5_AGG_METHOD
    normalization_range: tuple[float, float] = (0.0, 1.0)
    schwartz_top_k: int = 3


def _aggregate_big5_facets_to_factors(facets_raw: dict[str, float], agg_method: str) -> dict[str, float]:
    """
    Агрегація фасет -> фактор:
    score(B_k) = agg({score(f_j)})
    """
    factors: dict[str, float] = {}
    for factor in BIG5_FACTORS:
        facet_ids = BIG5_FACETS_BY_FACTOR.get(factor, [])
        vals = [facets_raw.get(fid, 0.0) for fid in facet_ids]
        factors[factor] = agg_values(vals, method=agg_method)
    return factors


def run_psychometrics(
    *,
    text: str | None = None,
    answers: dict[str, Any] | None = None,
    config: PsychometricsConfig | None = None,
) -> PsychometricsResult:
    """
    Повний пайплайн:
      [Text/Answers]
          ↓
      [Indicators extraction + weights]
          ↓
      [Big Five / Maslow / Schwartz scoring + explain]
          ↓
      [Result object]
    """
    config = config or PsychometricsConfig()

    #1)витягуємо індикатори
    indicators = []
    if text:
        indicators.extend(extract_indicators_from_text(text, patterns=config.indicator_patterns))
    if answers:
        indicators.extend(extract_indicators_from_answers(answers))

    out_min, out_max = config.normalization_range

    #Big Five
    #2)рахуємо фасети: score(f_j) = Σ w_i * impact(i, f_j)
    facets_raw, big5_explain = score_targets_from_impacts(
        indicators,
        BIG5_INDICATOR_TO_FACETS,
        why_prefix="Big Five",
    )

    #3)агрегуємо фасети -> фактори
    factors_raw = _aggregate_big5_facets_to_factors(facets_raw, config.big5_agg_method)

    #4)нормалізуємо до спільної шкали (наприклад 0..1)
    facets_norm = minmax_normalize_dict(facets_raw, out_min=out_min, out_max=out_max)
    factors_norm = minmax_normalize_dict(factors_raw, out_min=out_min, out_max=out_max)

    big5 = BigFiveResult(
        facets_raw=facets_raw,
        factors_raw=factors_raw,
        facets_norm=facets_norm,
        factors_norm=factors_norm,
        explain=big5_explain,
    )

    #Maslow
    maslow_raw, maslow_explain = score_targets_from_impacts(
        indicators,
        MASLOW_INDICATOR_TO_LEVELS,
        why_prefix="Maslow",
    )

    #гарантуєм наявність усіх рівнів, навіть якщо 0
    maslow_raw_full = {lvl: maslow_raw.get(lvl, 0.0) for lvl in MASLOW_LEVELS}
    maslow_norm = minmax_normalize_dict(maslow_raw_full, out_min=out_min, out_max=out_max)

    #домінантн рівень(максимальний raw)
    dominant = max(maslow_raw_full.items(), key=lambda kv: kv[1])[0] if maslow_raw_full else None

    maslow = MaslowResult(
        levels_raw=maslow_raw_full,
        levels_norm=maslow_norm,
        dominant=dominant,
        explain=maslow_explain,
    )

    #Schwartz
    schwartz_raw, schwartz_explain = score_targets_from_impacts(
        indicators,
        SCHWARTZ_INDICATOR_TO_VALUES,
        why_prefix="Schwartz",
    )

    schwartz_raw_full = {v: schwartz_raw.get(v, 0.0) for v in SCHWARTZ_VALUES}
    schwartz_norm = minmax_normalize_dict(schwartz_raw_full, out_min=out_min, out_max=out_max)

    #top-k цінностей
    top_k = sorted(schwartz_norm.items(), key=lambda kv: kv[1], reverse=True)[: max(1, int(config.schwartz_top_k))]

    schwartz = SchwartzResult(
        values_raw=schwartz_raw_full,
        values_norm=schwartz_norm,
        top_k=top_k,
        explain=schwartz_explain,
    )

    return PsychometricsResult(
        big_five=big5,
        maslow=maslow,
        schwartz=schwartz,
        extracted_indicators=indicators,
        meta={
            "norm_range": config.normalization_range,
            "big5_agg": config.big5_agg_method,
        },
    )