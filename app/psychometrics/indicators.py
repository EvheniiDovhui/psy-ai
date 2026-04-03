from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from app.psychometrics.types import Indicator


#токенайзер: слова UA/EN + апостроф
_WORD_RE = re.compile(r"[а-яА-ЯіІїЇєЄґҐa-zA-Z']+")


def _tokenize(text: str) -> list[str]:
    """Перетворюємо текст на список токенів (нижній регістр)."""
    return _WORD_RE.findall((text or "").lower())


def _contains_any(tokens: list[str], words: list[str]) -> int:
    """
    Повертає кількість слів зі списку words, які зустрілись у tokens.
    (Тут матч — exact token match; якщо треба стемінг/лематизація — додамо пізніше.)
    """
    s = set(tokens)
    return sum(1 for w in words if w in s)


@dataclass
class IndicatorPattern:
    """
    Опис правила пошуку індикатора.

    name          — назва індикатора
    weight        — базова вага (w_i)
    keywords      — список ключових слів (точний збіг токенів)
    phrases       — список фраз (пошук підрядка в lower_text)
    polarity      — полярність індикатора
    base_intensity— базова інтенсивність (0..1)
    """
    name: str
    weight: float = 1.0
    keywords: list[str] = field(default_factory=list)
    phrases: list[str] = field(default_factory=list)
    polarity: str = "neu"  # pos/neg/neu
    base_intensity: float = 1.0


#дефолтний набір патернів(можна розширювати)
DEFAULT_PATTERNS: list[IndicatorPattern] = [
    #соціальність/екстраверсія
    IndicatorPattern(
        name="social_activity_high",
        weight=1.2,
        keywords=["друзі", "люди", "компанія", "спілкування"],
        phrases=["люблю спілкування", "хочу спілкуватися"],
        polarity="pos",
        base_intensity=0.8,
    ),
    IndicatorPattern(
        name="social_avoidance",
        weight=1.3,
        keywords=["сам", "уникаю", "уникати", "ізоляція"],
        phrases=["не хочу людей", "уникаю людей", "не люблю компанії"],
        polarity="neg",
        base_intensity=0.8,
    ),
    #тривожність/нейротизм
    IndicatorPattern(
        name="anxiety",
        weight=1.5,
        keywords=["тривога", "страх", "паніка", "хвилююсь", "напруга"],
        phrases=["мені страшно", "я хвилююсь", "панічні атаки"],
        polarity="neg",
        base_intensity=0.9,
    ),
    #планування/сумлінність
    IndicatorPattern(
        name="planning",
        weight=1.1,
        keywords=["план", "планую", "відповідальність", "ціль", "дедлайн"],
        phrases=["я планую", "мені важлива дисципліна"],
        polarity="pos",
        base_intensity=0.8,
    ),
    IndicatorPattern(
        name="disorganization",
        weight=1.1,
        keywords=["хаос", "прокрастинація", "забуваю"],
        phrases=["нічого не встигаю", "постійно відкладаю"],
        polarity="neg",
        base_intensity=0.8,
    ),
    #відкритість досвіду
    IndicatorPattern(
        name="curiosity_growth",
        weight=1.0,
        keywords=["розвиток", "ідея", "сенс", "нове", "цікаво"],
        phrases=["хочу розвиватися", "шукаю сенс", "люблю нове"],
        polarity="pos",
        base_intensity=0.75,
    ),
    #доброзичливість/емпатія
    IndicatorPattern(
        name="empathy_help",
        weight=1.0,
        keywords=["допомога", "довіра", "повага", "підтримка", "доброта"],
        phrases=["хочу допомагати", "важлива підтримка"],
        polarity="pos",
        base_intensity=0.75,
    ),
    IndicatorPattern(
        name="conflict_irritation",
        weight=1.0,
        keywords=["злюсь", "дратує", "конфлікт"],
        phrases=["всі дратують", "я злюсь на людей"],
        polarity="neg",
        base_intensity=0.75,
    ),
    #Маслоу-орієнтовані
    IndicatorPattern(
        name="money_stress",
        weight=1.4,
        keywords=["гроші", "борги", "нестача"],
        phrases=["немає грошей", "боюсь за гроші"],
        polarity="neg",
        base_intensity=0.85,
    ),
    IndicatorPattern(
        name="sleep_fatigue",
        weight=1.2,
        keywords=["сон", "втома", "виснаження"],
        phrases=["не можу спати", "погано сплю", "немає сил"],
        polarity="neg",
        base_intensity=0.9,
    ),
    #Шварц-орієнтовані
    IndicatorPattern(
        name="power_control",
        weight=1.0,
        keywords=["влада", "контроль", "вплив"],
        phrases=["хочу контролювати", "мені важливий вплив"],
        polarity="pos",
        base_intensity=0.7,
    ),
    IndicatorPattern(
        name="justice_world",
        weight=1.0,
        keywords=["справедливість", "людство", "світ"],
        phrases=["важлива справедливість", "хочу змінити світ"],
        polarity="pos",
        base_intensity=0.7,
    ),
]


def extract_indicators_from_text(
    text: str,
    patterns: list[IndicatorPattern] | None = None,
) -> list[Indicator]:
    """
    Витягує індикатори з тексту:
    - шукаємо ключові слова в токенах
    - шукаємо фрази як підрядок
    - рахуємо інтенсивність (проста сатурація від кількості збігів)
    """
    patterns = patterns or DEFAULT_PATTERNS
    tokens = _tokenize(text)
    lower_text = (text or "").lower()

    found: list[Indicator] = []
    for p in patterns:
        kw_hits = _contains_any(tokens, p.keywords) if p.keywords else 0
        phrase_hits = sum(1 for ph in p.phrases if ph in lower_text) if p.phrases else 0
        total_hits = kw_hits + phrase_hits

        if total_hits <= 0:
            continue

        #інтенсивність: базова + трошки за кожний додатковий збіг, але не більше 1.0
        intensity = min(1.0, p.base_intensity + 0.15 * (total_hits - 1))

        found.append(
            Indicator(
                name=p.name,
                weight=p.weight,
                polarity=p.polarity, #тип з Literal спрощено, але ок
                intensity=float(intensity),
                evidence={
                    "kw_hits": kw_hits,
                    "phrase_hits": phrase_hits,
                    "matched_keywords": [w for w in p.keywords if w in set(tokens)],
                    "matched_phrases": [ph for ph in p.phrases if ph in lower_text],
                },
            )
        )

    return found


def extract_indicators_from_answers(
    answers: dict[str, Any],
    *,
    likert_weight: float = 1.0,
) -> list[Indicator]:
    """
    Універсальний адаптер під відповіді анкети:
    - якщо значення str -> додаємо в текстовий "мікс" і проганяємо через text extractor
    - якщо значення числове -> створюємо синтетичний індикатор "q:<key>"
      (його потім можна замапити правилами у rules.py)
    """
    answers = answers or {}
    indicators: list[Indicator] = []

    #1)текстові поля анкети
    text_parts: list[str] = []
    for _, v in answers.items():
        if isinstance(v, str) and v.strip():
            text_parts.append(v.strip())
    if text_parts:
        indicators.extend(extract_indicators_from_text(" ".join(text_parts)))

    #2)числові поля (наприклад, шкала 1..5)
    for k, v in answers.items():
        if isinstance(v, (int, float)):
            #нормалізація: центр=3(для 1..5)
            dv = float(v) - 3.0
            if abs(dv) < 0.5:
                continue

            polarity = "pos" if dv > 0 else "neg"
            intensity = min(1.0, abs(dv) / 2.0) #0..1

            indicators.append(
                Indicator(
                    name=f"q:{k}",
                    weight=likert_weight,
                    polarity=polarity,
                    intensity=intensity,
                    evidence={"question": k, "value": v, "dv": dv},
                )
            )

    return indicators