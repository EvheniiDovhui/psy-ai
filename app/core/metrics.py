import math

def tononi_complexity(distribution: dict) -> float:
    values = list(distribution.values())
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    return round(variance, 4)


def free_energy(distribution: dict) -> float:
    entropy = -sum(p * math.log(p + 1e-9) for p in distribution.values())
    return round(entropy, 4)