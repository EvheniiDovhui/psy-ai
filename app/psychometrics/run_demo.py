from __future__ import annotations

import json

from app.psychometrics.demo_data import HARDCASES, SOFTCASES
from app.psychometrics.evaluation import evaluate
from app.psychometrics.pipeline import run_psychometrics


def main() -> None:
    text = "Я хвилююсь і відчуваю тривогу. Але хочу розвитку і сенсу, планую цілі."
    result = run_psychometrics(text=text)

    print("=== PsychometricsResult ===")
    print(json.dumps({
        "big5": result.big_five.factors_norm,
        "maslow": result.maslow.levels_norm,
        "schwartz": result.schwartz.values_norm,
        "indicators": [i.name for i in result.extracted_indicators],
        "why_big5": result.big_five.explain.why,
    }, ensure_ascii=False, indent=2))

    print("\n=== Evaluation ===")
    rep = evaluate(hardcases=HARDCASES, softcases=SOFTCASES)
    print(json.dumps({"hard": rep.hard, "soft": rep.soft}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()