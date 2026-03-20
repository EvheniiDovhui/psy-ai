import numpy as np
import matplotlib.pyplot as plt

ALL_LABELS = [
    "neuroticism", "openness", "conscientiousness", "extraversion", "agreeableness",
    "physiological", "safety", "love", "esteem", "self_actualization",
    "power", "achievement", "hedonism", "security", "benevolence", "universalism",
]

COMPONENT_LABELS = {
    "big_five":  ["neuroticism", "openness", "conscientiousness", "extraversion", "agreeableness"],
    "maslow":    ["physiological", "safety", "love", "esteem", "self_actualization"],
    "schwartz":  ["power", "achievement", "hedonism", "security", "benevolence", "universalism"],
}

COLORS = {
    "big_five": "steelblue",
    "maslow":   "seagreen",
    "schwartz": "tomato",
}


def plot_all_components(state):
    """
    Окремі гістограми E₁ (Big5) | E₂ (Maslow) | E₃ (Schwartz).
    state: StateVector
    """
    keys = list(state.components.keys())
    fig, axes = plt.subplots(1, len(keys), figsize=(5 * len(keys), 5))
    fig.suptitle(f"Компоненти вектора: {state.label or 'стан'}", fontsize=14)

    for ax, key in zip(axes, keys):
        values = state.components[key]
        labels = COMPONENT_LABELS.get(key, [f"e{i}" for i in range(len(values))])
        color  = COLORS.get(key, "gray")

        ax.bar(labels, values, color=color)
        ax.set_title(key.replace("_", " ").title())
        ax.set_ylim(0, 1)
        ax.set_xticklabels(labels, rotation=45, ha="right")

    plt.tight_layout()
    plt.show()


def plot_full_vector(state):
    """
    Загальна гістограма E ∈ ℝ¹⁶.
    state: StateVector
    """
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.bar(ALL_LABELS, state.vector, color="slateblue")
    ax.set_title(f"Загальний вектор E ∈ ℝ{len(state.vector)}: {state.label or 'стан'}")
    ax.set_ylim(0, 1)
    ax.set_xticklabels(ALL_LABELS, rotation=45, ha="right")
    plt.tight_layout()
    plt.show()


def plot_therapy_comparison(results):
    """
    Стовпчаста діаграма ε по всіх терапіях.
    results: list[TherapyResult]
    """
    names    = [r.name for r in results]
    epsilons = [r.effectiveness for r in results]

    fig, ax = plt.subplots(figsize=(7, 4))
    bars = ax.bar(names, epsilons, color="coral")
    ax.bar_label(bars, fmt="%.3f")
    ax.set_ylabel("ε = ‖E_after − E_before‖")
    ax.set_title("Порівняння ефективності терапій")
    plt.tight_layout()
    plt.show()


def plot_before_after(result):
    """
    Накладені гістограми до/після однієї терапії.
    result: TherapyResult
    """
    x     = np.arange(len(ALL_LABELS))
    width = 0.35

    fig, ax = plt.subplots(figsize=(13, 5))
    ax.bar(x - width / 2, result.before.vector, width,
           label="До терапії",    color="steelblue")
    ax.bar(x + width / 2, result.after.vector,  width,
           label="Після терапії", color="seagreen")

    ax.set_xticks(x)
    ax.set_xticklabels(ALL_LABELS, rotation=45, ha="right")
    ax.set_title(f"До / Після: {result.name}")
    ax.legend()
    plt.tight_layout()
    plt.show()