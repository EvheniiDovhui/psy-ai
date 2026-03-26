from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Literal


#полярність індикатора: позитивний/негативний/нейтральний
Polarity=Literal["pos", "neg", "neu"]
#тип вхідних даних для індикатора: текст або відповіді
InputKind=Literal["text", "answers"]


@dataclass(frozen=True)
class Indicator:
    """
    Індикатор (ознака), витягнутий з тексту/відповідей.

    name       — канонічний id індикатора
    weight     — вага w_i (наскільки індикатор "сильний")
    polarity   — полярність (pos/neg/neu)
    intensity  — інтенсивність 0..1 (дозволяє приглушити/підсилити внесок)
    evidence   — докази (які слова/фрази спрацювали, скільки збігів тощо)
    """
    name:str
    weight:float=1.0
    polarity:Polarity="neu"
    intensity:float=1.0
    evidence:dict[str, Any]=field(default_factory=dict)

    @property
    def effective_weight(self) -> float:
        #"ефективна вага": w_i * intensity
        #якщо не підійде, то можна змінити логіку за потреби
        return float(self.weight) * float(self.intensity)


@dataclass(frozen=True)
class Impact:
    """
    Коефіцієнт impact(i, target):
    - target: назва цілі (фасета/фактор/потреба/цінність)
    - value: величина впливу (може бути + або -)
    """
    target: str
    value: float


@dataclass
class ExplainItem:
    """
    Один внесок індикатора в ціль (для explainability):
    contribution = w_i * impact
    """
    target: str
    indicator: str
    w_i: float
    impact: float
    contribution: float
    evidence: dict[str, Any] = field(default_factory=dict)


@dataclass
class ModelExplain:
    """
    Пояснення по конкретній моделі (Big Five / Maslow / Schwartz):
    - indicators: які індикатори були знайдені
    - contributions: деталізація внесків у кожну ціль
    - why: короткі "людські" пояснення на рівні правил
    """
    indicators: list[Indicator] = field(default_factory=list)
    contributions: list[ExplainItem] = field(default_factory=list)
    why: list[str] = field(default_factory=list)


@dataclass
class BigFiveResult:
    #сирові бали
    facets_raw: dict[str, float]
    factors_raw: dict[str, float]
    #нормалізовані
    facets_norm: dict[str, float]
    factors_norm: dict[str, float]
    explain: ModelExplain


@dataclass
class MaslowResult:
    levels_raw: dict[str, float]
    levels_norm: dict[str, float]

    dominant: str | None
    explain: ModelExplain


@dataclass
class SchwartzResult:
    values_raw: dict[str, float]
    values_norm: dict[str, float]
    #цінності у нормалізованій шкалі
    top_k: list[tuple[str, float]]
    explain: ModelExplain


@dataclass
class PsychometricsResult:
    """
    Загальний результат пайплайна:
    - Big Five
    - Maslow
    - Schwartz
    + сирі індикатори (для аудиту)
    """
    big_five: BigFiveResult
    maslow: MaslowResult
    schwartz: SchwartzResult

    extracted_indicators: list[Indicator] = field(default_factory=list)
    meta: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class HardCase:
    """
    Hard case — контрольний приклад з "правильними" очікуваннями.
    Тут можна задавати очікувані фактори/фасети/потреби/цінності.
    """
    case_id: str
    input_text: str | None = None
    input_answers: dict[str, Any] | None = None

    expected_big5_factors: dict[str, float] | None = None
    expected_big5_facets: dict[str, float] | None = None
    expected_maslow: dict[str, float] | None = None
    expected_schwartz: dict[str, float] | None = None

    tolerance: float = 1e-6


@dataclass(frozen=True)
class SoftInterval:
    #інтервал для soft-перевірки(сіра зона)
    lo: float
    hi: float


@dataclass(frozen=True)
class SoftExpectation:
    """
    Soft expectation:
    - intervals: часткові очікування у вигляді інтервалів
    - topk_any_of: допускаємо, що топ-1/топ-k може бути одним з варіантів
    """
    intervals: dict[str, SoftInterval] = field(default_factory=dict)
    topk_any_of: list[str] = field(default_factory=list)


@dataclass(frozen=True)
class SoftCase:
    """
    Soft case — приклад з допусками/ймовірностями.
    case_weight * confidence = реальна вага кейса у метриці.
    """
    case_id: str
    input_text: str | None = None
    input_answers: dict[str, Any] | None = None

    expected_big5_factors: SoftExpectation | None = None
    expected_maslow: SoftExpectation | None = None
    expected_schwartz: SoftExpectation | None = None

    case_weight: float = 1.0
    confidence: float = 1.0


@dataclass
class EvalReport:
    #агрегований звіт оцінки якості
    hard: dict[str, Any] = field(default_factory=dict)
    soft: dict[str, Any] = field(default_factory=dict)