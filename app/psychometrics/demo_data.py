from __future__ import annotations

from app.psychometrics.types import HardCase, SoftCase, SoftExpectation, SoftInterval


HARDCASES: list[HardCase] = [
    HardCase(
        case_id="hard_1_social_extraversion",
        input_text="Я люблю спілкування, друзі та люди мене заряджають. Мені цікаво нове і розвиток.",
        expected_big5_factors={
            #нормалізую пізніше, але для демонстрації зберігаємо приблизні цілі в 0..1
            "E": 1.0,
            "O": 0.8,
        },
        expected_maslow={
            "love": 0.6,
            "self_actualization": 0.7,
        },
        expected_schwartz={
            "benevolence": 0.4,
        },
        tolerance=0.25,
    )
]

SOFTCASES: list[SoftCase] = [
    SoftCase(
        case_id="soft_1_anxiety_safety",
        input_text="Останнім часом сильна тривога, страх, погано сплю, постійна напруга. Боюсь за гроші.",
        expected_big5_factors=SoftExpectation(
            topk_any_of=["N"],
        ),
        expected_maslow=SoftExpectation(
            topk_any_of=["safety", "physiological"],
        ),
        expected_schwartz=SoftExpectation(
            intervals={
                "security": SoftInterval(0.4, 1.0),
            }
        ),
        case_weight=1.0,
        confidence=0.8,
    )
]