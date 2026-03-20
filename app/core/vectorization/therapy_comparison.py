import numpy as np


def cosine_similarity(v1, v2):
    """
    cos θ = (v1 · v2) / (‖v1‖ × ‖v2‖)
    v1, v2: np.ndarray
    """
    n1 = np.linalg.norm(v1)
    n2 = np.linalg.norm(v2)

    if n1 == 0 or n2 == 0:
        return 0.0

    return float(np.dot(v1, v2) / (n1 * n2))


def compare_therapies(results, target=None):
    """
    Порівнює список TherapyResult за ε та cosine_to_target.
    Повертає список dict, відсортований від найбільшого ε.

    results: list[TherapyResult]
    target:  StateVector або None
    """
    comparison = []

    for result in results:
        entry = {
            "therapy":               result.name,
            "effectiveness_epsilon": result.effectiveness,
            "cosine_to_target":      None,
        }

        if target is not None:
            shift = result.after.vector - result.before.vector
            entry["cosine_to_target"] = round(
                cosine_similarity(shift, target.vector), 4
            )

        comparison.append(entry)

    comparison.sort(key=lambda x: x["effectiveness_epsilon"], reverse=True)
    return comparison


def best_therapy(results, target=None):
    """
    Повертає найкращу терапію:
    - якщо є target → за cosine_to_target
    - інакше        → за effectiveness_epsilon

    results: list[TherapyResult]
    target:  StateVector або None
    """
    ranked = compare_therapies(results, target)

    if target is not None:
        ranked.sort(key=lambda x: x["cosine_to_target"] or -1, reverse=True)

    return ranked[0]