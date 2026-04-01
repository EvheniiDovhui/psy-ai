import math

def tononi_complexity(distribution: dict) -> float:
    values = []
    for x in distribution.values():
        try:
            values.append(float(x))
        except (ValueError, TypeError):
            pass

    if not values:
        return 0.0

    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    return round(variance, 4)


def free_energy(distribution: dict) -> float:
    entropy = 0.0
    for p in distribution.values():
        try:
            val = float(p)
            if val < 0: val = 0.0
            entropy += -val * math.log(val + 1e-9)
        except (ValueError, TypeError):
            pass

    return round(entropy, 4)