import numpy as np


def absolute_error(machine, expert):
    """
    δ = ‖E_machine − E_expert‖
    machine: StateVector
    expert:  ExpertVector
    """
    return float(np.linalg.norm(machine.vector - expert.vector))


def relative_error(machine, expert):
    """
    δ_rel = (δ / ‖E_expert‖) × 100%
    """
    norm_expert = np.linalg.norm(expert.vector)

    if norm_expert == 0:
        return float("inf")

    delta = absolute_error(machine, expert)
    return round((delta / norm_expert) * 100, 2)


def error_report(machine, expert):
    """
    Зведений звіт похибок.
    Повертає dict з абсолютною, відносною похибкою та різницею по компонентах.
    """
    delta = absolute_error(machine, expert)
    delta_rel = relative_error(machine, expert)
    component_diff = machine.vector - expert.vector

    return {
        "absolute_error":     round(delta, 4),
        "relative_error_pct": delta_rel,
        "component_diff":     component_diff,
    }