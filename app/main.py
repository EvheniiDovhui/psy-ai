# from app.core.analyzer import analyze_text
# from app.core.metrics import tononi_complexity, free_energy
#
# text = input("Введи текст: ")
#
# profile = analyze_text(text)
# data = profile.to_dict()
#
# print("\nПсихологічний профіль:")
# for k, v in data.items():
#     print(k, "=>", v)
#
# consciousness = tononi_complexity(data["big_five"])
# energy = free_energy(data["big_five"])
#
# print("\nМетрики:")
# print("Tononi complexity:", consciousness)
# print("Free energy:", energy)


import numpy as np
from app.core.vectorization.vector_builder import (
    build_state_vector,
    PROFILE_BEFORE,
    PROFILE_AFTER_A,
    PROFILE_AFTER_B,
    PROFILE_AFTER_C,
    EXPERT_VECTOR_VALUES,
)
from app.core.vectorization.error_metrics import error_report
from app.core.vectorization.therapy_analysis import compute_therapy_result, summarize_therapy
from app.core.vectorization.therapy_comparison import compare_therapies, best_therapy
from app.core.vectorization.visualizer import (
    plot_all_components,
    plot_full_vector,
    plot_therapy_comparison,
    plot_before_after,
)
from app.models.vectors import ExpertVector

# ── 1. Будуємо вектори ────────────────────────────────────────────────────
e_before  = build_state_vector(PROFILE_BEFORE,  label="before")
e_after_a = build_state_vector(PROFILE_AFTER_A, label="after_A")
e_after_b = build_state_vector(PROFILE_AFTER_B, label="after_B")
e_after_c = build_state_vector(PROFILE_AFTER_C, label="after_C")

e_expert = ExpertVector(vector=EXPERT_VECTOR_VALUES, label="expert")

# ── 2. Похибка: машинний vs еталон ───────────────────────────────────────
report = error_report(e_before, e_expert)

print("=== Похибка (до терапії vs еталон) ===")
print(f"  δ     = {report['absolute_error']}")
print(f"  δ_rel = {report['relative_error_pct']}%")
print(f"  Δeₖ   = {report['component_diff'].round(3)}")

# ── 3. Обраховуємо результати терапій ────────────────────────────────────
therapy_a = compute_therapy_result("Терапія A", e_before, e_after_a)
therapy_b = compute_therapy_result("Терапія B", e_before, e_after_b)
therapy_c = compute_therapy_result("Терапія C", e_before, e_after_c)

print("\n=== Ефективність терапій ===")
for therapy in [therapy_a, therapy_b, therapy_c]:
    summary = summarize_therapy(therapy)
    print(f"  {summary['therapy']}: ε = {summary['effectiveness_epsilon']}")

# ── 4. Порівняння терапій ─────────────────────────────────────────────────
results = [therapy_a, therapy_b, therapy_c]
e_target = ExpertVector(vector=EXPERT_VECTOR_VALUES, label="target")

ranked = compare_therapies(results, target=e_target)

print("\n=== Рейтинг терапій ===")
for r in ranked:
    print(f"  {r['therapy']}: ε={r['effectiveness_epsilon']},  cos={r['cosine_to_target']}")

winner = best_therapy(results, target=e_target)
print(f"\n  ✅ Найкраща терапія: {winner['therapy']}")

# ── 5. Візуалізація ─��─────────────────────────────────────────────────────
plot_all_components(e_before)
plot_full_vector(e_before)
plot_therapy_comparison(results)
plot_before_after(therapy_a)
plot_before_after(therapy_b)
plot_before_after(therapy_c)