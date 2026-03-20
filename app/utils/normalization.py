import numpy as np

def normalize_minmax(arr):
    """Min-max нормалізація: переводить значення у [0, 1]."""
    min_val = arr.min()
    max_val = arr.max()

    if max_val - min_val == 0:
        return np.zeros_like(arr, dtype=float)

    return (arr - min_val) / (max_val - min_val)


def normalize_components(components):
    """
    Нормалізує кожен компонентний масив окремо.
    components: dict {str: np.ndarray}
    """
    result = {}
    for key, arr in components.items():
        result[key] = normalize_minmax(arr)
    return result