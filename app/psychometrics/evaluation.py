from __future__ import annotations

import math
from dataclasses import asdict

from app.psychometrics.pipeline import PsychometricsConfig, run_psychometrics
from app.psychometrics.types import (
    EvalReport,
    HardCase,
    SoftCase,
    SoftExpectation,
)


def _euclidean_error(y: dict[str, float], yhat: dict[str, float], keys: list[str]) -> float:
    """
    Евклідова помилка:
      error = sqrt( Σ (y_k - yhat_k)^2 )
    """
    s = 0.0
    for k in keys:
        s += (float(y.get(k, 0.0)) - float(yhat.get(k, 0.0))) ** 2
    return float(math.sqrt(s))


def eval_hardcases(
    cases: list[HardCase],
    *,
    config: PsychometricsConfig | None = None,
    use_normalized: bool = True,
) -> dict:
    """
    Оцінка на hard-наборі:
    - для кожного кейса рахуємо векторну помилку по компонентах
    - агрегуємо середню помилку по набору
    """
    config = config or PsychometricsConfig()
    per_case = []
    errors = {"big5_factors": [], "big5_facets": [], "maslow": [], "schwartz": []}

    for c in cases:
        r = run_psychometrics(text=c.input_text, answers=c.input_answers, config=config)

        #можна порівнювати raw або norm
        big5_f = r.big_five.factors_norm if use_normalized else r.big_five.factors_raw
        big5_fac = r.big_five.facets_norm if use_normalized else r.big_five.facets_raw
        maslow = r.maslow.levels_norm if use_normalized else r.maslow.levels_raw
        sch = r.schwartz.values_norm if use_normalized else r.schwartz.values_raw

        row = {"case_id": c.case_id}

        if c.expected_big5_factors is not None:
            keys = sorted(set(c.expected_big5_factors.keys()) | set(big5_f.keys()))
            err = _euclidean_error(c.expected_big5_factors, big5_f, keys)
            errors["big5_factors"].append(err)
            row["big5_factors_error"] = err

        if c.expected_big5_facets is not None:
            keys = sorted(set(c.expected_big5_facets.keys()) | set(big5_fac.keys()))
            err = _euclidean_error(c.expected_big5_facets, big5_fac, keys)
            errors["big5_facets"].append(err)
            row["big5_facets_error"] = err

        if c.expected_maslow is not None:
            keys = sorted(set(c.expected_maslow.keys()) | set(maslow.keys()))
            err = _euclidean_error(c.expected_maslow, maslow, keys)
            errors["maslow"].append(err)
            row["maslow_error"] = err

        if c.expected_schwartz is not None:
            keys = sorted(set(c.expected_schwartz.keys()) | set(sch.keys()))
            err = _euclidean_error(c.expected_schwartz, sch, keys)
            errors["schwartz"].append(err)
            row["schwartz_error"] = err

        row["prediction"] = {
            "big5_factors": big5_f,
            "maslow": maslow,
            "schwartz": sch,
        }
        row["indicators"] = [asdict(i) for i in r.extracted_indicators]
        per_case.append(row)

    def avg(xs: list[float]) -> float | None:
        return sum(xs) / len(xs) if xs else None

    return {
        "use_normalized": use_normalized,
        "n_cases": len(cases),
        "avg_errors": {k: avg(v) for k, v in errors.items()},
        "per_case": per_case,
    }


def _pass_intervals(expected: SoftExpectation, predicted: dict[str, float]) -> bool:
    """
    Перевірка: чи всі значення, які задані інтервалами, попали в інтервал.
    """
    for k, interval in expected.intervals.items():
        v = float(predicted.get(k, 0.0))
        if not (interval.lo <= v <= interval.hi):
            return False
    return True


def _pass_topk_any_of(expected: SoftExpectation, predicted: dict[str, float], k: int = 1) -> bool:
    """
    Перевірка: чи входить хоч один з expected.topk_any_of у top-k predicted.
    """
    if not expected.topk_any_of:
        return True
    ranked = sorted(predicted.items(), key=lambda kv: kv[1], reverse=True)
    top = [name for name, _ in ranked[: max(1, k)]]
    return any(x in top for x in expected.topk_any_of)


def eval_softcases(
    cases: list[SoftCase],
    *,
    config: PsychometricsConfig | None = None,
    use_normalized: bool = True,
    topk_k: int = 1,
) -> dict:
    """
    Оцінка на soft-наборі:
      score_soft = Σ weight(c) * pass(c)  /  Σ weight(c)
    де weight(c)=case_weight*confidence, pass(c) ∈ {0,1}
    """
    config = config or PsychometricsConfig()

    total = 0.0
    passed = 0.0
    per_case = []

    for c in cases:
        r = run_psychometrics(text=c.input_text, answers=c.input_answers, config=config)

        big5_f = r.big_five.factors_norm if use_normalized else r.big_five.factors_raw
        maslow = r.maslow.levels_norm if use_normalized else r.maslow.levels_raw
        sch = r.schwartz.values_norm if use_normalized else r.schwartz.values_raw

        case_w = float(c.case_weight) * float(c.confidence)
        total += case_w

        ok = True
        checks = {}

        if c.expected_big5_factors is not None:
            exp = c.expected_big5_factors
            ok_i = _pass_intervals(exp, big5_f) and _pass_topk_any_of(exp, big5_f, k=topk_k)
            ok = ok and ok_i
            checks["big5_factors"] = ok_i

        if c.expected_maslow is not None:
            exp = c.expected_maslow
            ok_i = _pass_intervals(exp, maslow) and _pass_topk_any_of(exp, maslow, k=topk_k)
            ok = ok and ok_i
            checks["maslow"] = ok_i

        if c.expected_schwartz is not None:
            exp = c.expected_schwartz
            ok_i = _pass_intervals(exp, sch) and _pass_topk_any_of(exp, sch, k=topk_k)
            ok = ok and ok_i
            checks["schwartz"] = ok_i

        if ok:
            passed += case_w

        per_case.append(
            {
                "case_id": c.case_id,
                "weight": case_w,
                "pass": ok,
                "checks": checks,
                "prediction": {
                    "big5_factors": big5_f,
                    "maslow": maslow,
                    "schwartz": sch,
                },
            }
        )

    score_soft = (passed / total) if total > 0 else None

    return {
        "use_normalized": use_normalized,
        "topk_k": topk_k,
        "n_cases": len(cases),
        "score_soft": score_soft,
        "passed_weight": passed,
        "total_weight": total,
        "per_case": per_case,
    }


def evaluate(
    *,
    hardcases: list[HardCase] | None = None,
    softcases: list[SoftCase] | None = None,
    config: PsychometricsConfig | None = None,
) -> EvalReport:
    """
    Загальний метод оцінки: повертає звіт по hard + soft (якщо передані).
    """
    rep = EvalReport()
    if hardcases:
        rep.hard = eval_hardcases(hardcases, config=config, use_normalized=True)
    if softcases:
        rep.soft = eval_softcases(softcases, config=config, use_normalized=True, topk_k=1)
    return rep