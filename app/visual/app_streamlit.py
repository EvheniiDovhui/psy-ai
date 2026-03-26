from __future__ import annotations

import pandas as pd
import streamlit as st

from app.psychometrics.pipeline import PsychometricsConfig, run_psychometrics


def _bar_chart(title: str, d: dict[str, float]) -> None:
    """Допоміжна функція: намалювати бар-чарт зі словника."""
    st.subheader(title)
    if not d:
        st.info("Немає даних")
        return

    df = (
        pd.DataFrame({"name": list(d.keys()), "value": list(d.values())})
        .sort_values("value", ascending=False)
        .set_index("name")
    )
    st.bar_chart(df)


def main() -> None:
    #базові налаштування сторінки
    st.set_page_config(page_title="Psychometrics Scripter", layout="wide")
    st.title("Psychometrics Scripter (rule-based)")

    #сайдбар з налаштуваннями
    with st.sidebar:
        st.header("Налаштування")
        top_k = st.slider("Schwartz top-k", min_value=1, max_value=10, value=3)
        agg = st.selectbox("Агрегація Big5 (фасети → фактор)", options=["mean", "median"], index=0)
        out_min = st.number_input("Нормалізація: min", value=0.0)
        out_max = st.number_input("Нормалізація: max", value=1.0)

    config = PsychometricsConfig(
        schwartz_top_k=top_k,
        big5_agg_method=agg,
        normalization_range=(float(out_min), float(out_max)),
    )

    #поле вводу тексту
    text = st.text_area(
        "Вхідний текст (UA/EN):",
        height=180,
        value="Я люблю спілкування і друзів, але інколи тривога. Хочу розвитку і планую цілі.",
    )

    if st.button("Запустити аналіз", type="primary"):
        #запуск пайплайн
        r = run_psychometrics(text=text, config=config)

        #3 колонки результатів: Big Five / Maslow / Schwartz
        col1, col2, col3 = st.columns(3)

        with col1:
            _bar_chart("Big Five фактори (norm)", r.big_five.factors_norm)
            st.caption("Raw:")
            st.json(r.big_five.factors_raw)

        with col2:
            _bar_chart("Maslow рівні (norm)", r.maslow.levels_norm)
            st.write(f"Домінантний рівень: `{r.maslow.dominant}`")
            st.caption("Raw:")
            st.json(r.maslow.levels_raw)

        with col3:
            _bar_chart("Schwartz цінності (norm)", r.schwartz.values_norm)
            st.write("Top-k:")
            st.json(r.schwartz.top_k)
            st.caption("Raw:")
            st.json(r.schwartz.values_raw)

        st.divider()

        #індикатори, які спрацювали
        st.header("Індикатори (що спрацювало)")
        st.json(
            [
                {"name": i.name, "w": i.weight, "intensity": i.intensity, "polarity": i.polarity, "evidence": i.evidence}
                for i in r.extracted_indicators
            ]
        )

        st.divider()

        #explainability
        st.header("Explainability (внески правил)")
        tabs = st.tabs(["Big Five", "Maslow", "Schwartz"])

        for tab, ex in zip(tabs, [r.big_five.explain, r.maslow.explain, r.schwartz.explain]):
            with tab:
                st.subheader("Чому так?")
                st.code("\n".join(ex.why))

                if ex.contributions:
                    df = pd.DataFrame(
                        [
                            {
                                "target": c.target,
                                "indicator": c.indicator,
                                "w_i": c.w_i,
                                "impact": c.impact,
                                "contribution": c.contribution,
                            }
                            for c in ex.contributions
                        ]
                    ).sort_values("contribution", ascending=False)

                    st.dataframe(df, use_container_width=True)
                else:
                    st.info("Немає внесків (жоден мапінг не спрацював)")


if __name__ == "__main__":
    main()