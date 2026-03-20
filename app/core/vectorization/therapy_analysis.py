import numpy as np
from app.models.vectors import TherapyResult

ALL_COMPONENT_NAMES = [
    "neuroticism", "openness", "conscientiousness", "extraversion", "agreeableness",
    "physiological", "safety", "love", "esteem", "self_actualization",
    "power", "achievement", "hedonism", "security", "benevolence", "universalism",
]


def compute_therapy_result(name, before, after):
    """
    Обраховує ефективність терапії.
    ε = ‖E_after − E_before‖
    Δeₖ = eₖ_after − eₖ_before

    name:   str
    before: StateVector
    after:  StateVector
    """
    diff = after.vector - before.vector
    effectiveness = float(np.linalg.norm(diff))

    return TherapyResult(
        name=name,
        before=before,
        after=after,
        effectiveness=round(effectiveness, 4),
        component_delta=diff,
    )


def summarize_therapy(result):
    """
    Повертає читабельний dict зі зміною по кожній з 16 осей.
    result: TherapyResult
    """
    changes = {}
    for name, delta in zip(ALL_COMPONENT_NAMES, result.component_delta.tolist()):
        changes[name] = round(delta, 4)

    return {
        "therapy":               result.name,
        "effectiveness_epsilon": result.effectiveness,
        "component_changes":     changes,
    }