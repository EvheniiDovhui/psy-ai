from __future__ import annotations

from app.psychometrics.types import Impact


#Big Five
#фактори: O - відкритість, C - сумлінність, E - екстраверсія, A - доброзичливість, N - нейротизм
BIG5_FACTORS = ["O", "C", "E", "A", "N"]

#фасети (підрівні) для кожного фактору
#формат id фасети: "<Factor>:<facet_id>"
BIG5_FACETS_BY_FACTOR: dict[str, list[str]] = {
    "O": ["O:curiosity", "O:imagination", "O:values"],
    "C": ["C:orderliness", "C:self_discipline", "C:achievement_striving"],
    "E": ["E:sociability", "E:assertiveness", "E:energy"],
    "A": ["A:empathy", "A:trust", "A:cooperation"],
    "N": ["N:anxiety", "N:irritability", "N:vulnerability"],
}

#мапінг індикатор -> список впливів на фасети
#"правила", які можна тестувати hard/soft наборами
BIG5_INDICATOR_TO_FACETS: dict[str, list[Impact]] = {
    "social_activity_high": [
        Impact("E:sociability", +1.0),
        Impact("E:energy", +0.6),
        Impact("A:cooperation", +0.2),
    ],
    "social_avoidance": [
        Impact("E:sociability", -1.0),
        Impact("E:energy", -0.4),
    ],
    "anxiety": [
        Impact("N:anxiety", +1.0),
        Impact("N:vulnerability", +0.6),
        Impact("E:energy", -0.2),
    ],
    "planning": [
        Impact("C:orderliness", +0.8),
        Impact("C:self_discipline", +0.7),
        Impact("C:achievement_striving", +0.4),
    ],
    "disorganization": [
        Impact("C:orderliness", -0.8),
        Impact("C:self_discipline", -0.7),
    ],
    "curiosity_growth": [
        Impact("O:curiosity", +0.8),
        Impact("O:imagination", +0.4),
        Impact("O:values", +0.2),
    ],
    "empathy_help": [
        Impact("A:empathy", +0.8),
        Impact("A:trust", +0.4),
        Impact("A:cooperation", +0.4),
    ],
    "conflict_irritation": [
        Impact("A:cooperation", -0.6),
        Impact("N:irritability", +0.7),
    ],
    #cинтетичні індикатори анкети можна також додати сюди ще:
    #"q:Q1": [Impact("E:sociability", +0.3)]
}

#метод агрегації фасет -> фактор:
#mean або median (можна буде ще розширити під weighted mean)
BIG5_AGG_METHOD: str = "mean"


#Maslow
#рівні Маслоу
MASLOW_LEVELS = ["physiological", "safety", "love", "esteem", "self_actualization"]

#мапінг індикатор -> вплив на рівні Маслоу.
#більший score = сильніша "активність/дефіцит/напруга" потреби
MASLOW_INDICATOR_TO_LEVELS: dict[str, list[Impact]] = {
    "sleep_fatigue": [
        Impact("physiological", +1.0),
    ],
    "money_stress": [
        Impact("safety", +1.0),
        Impact("esteem", -0.1),
    ],
    "social_activity_high": [
        Impact("love", +0.4),
        Impact("esteem", +0.2),
    ],
    "social_avoidance": [
        Impact("love", +0.6),
    ],
    "planning": [
        Impact("safety", +0.2),
        Impact("esteem", +0.3),
    ],
    "curiosity_growth": [
        Impact("self_actualization", +0.8),
    ],
    "anxiety": [
        Impact("safety", +0.6),
        Impact("physiological", +0.2),
    ],
    "empathy_help": [
        Impact("love", +0.3),
        Impact("self_actualization", +0.2),
    ],
}


#Schwartz
#мінімальний набір цінностей Шварца(можна розширити до повного набору)
SCHWARTZ_VALUES = [
    "power",
    "achievement",
    "hedonism",
    "security",
    "benevolence",
    "universalism",
]

#мапінг індикатор -> вплив на цінності
SCHWARTZ_INDICATOR_TO_VALUES: dict[str, list[Impact]] = {
    "power_control": [Impact("power", +1.0)],
    "planning": [Impact("security", +0.3), Impact("achievement", +0.4)],
    "money_stress": [Impact("security", +0.7)],
    "justice_world": [Impact("universalism", +1.0)],
    "empathy_help": [Impact("benevolence", +0.8), Impact("universalism", +0.2)],
    "social_activity_high": [Impact("hedonism", +0.2), Impact("benevolence", +0.1)],
}
