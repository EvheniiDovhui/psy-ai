import numpy as np
from typing import Dict, Any, Optional
from app.models.profile import PsychologicalProfile
from app.models.vectors import StateVector
from app.utils.normalization import normalize_components

COMPONENT_ORDER = ["big_five", "maslow", "schwartz"]

# Порядок компонентів у векторах для консистентності
BIG_FIVE_ORDER = ["neuroticism", "extraversion", "openness", "agreeableness", "conscientiousness"]
MASLOW_ORDER = ["physiological", "safety", "love", "esteem", "self_actualization"]
SCHWARTZ_ORDER = ["power", "achievement", "hedonism", "security", "benevolence", "universalism", "self_direction", "stimulation", "conformity", "tradition"]

# Опціональний еталонний вектор психолога для порівняння
# Використовується для розрахунку відстані від експертного профілю
EXPERT_VECTOR_VALUES = np.array([
    0.2, 0.8, 0.7, 0.6, 0.9,        # big_five (5 компонентів)
    0.3, 0.5, 0.8, 0.7, 0.6,        # maslow (5 компонентів)
    0.1, 0.6, 0.5, 0.3, 0.9, 0.7, 0.4, 0.5, 0.6, 0.2,   # schwartz (10 компонентів)
], dtype=float)  # Всього 20 компонентів


# ── Функції ───────────────────────────────────────────────────────────────

def profile_to_components(profile: Dict[str, Any]) -> Dict[str, np.ndarray]:
    """
    Перетворює словник профілю на компоненти-вектори.

    Приймає:
        profile: Dict з ключами "big_five", "maslow", "schwartz"
                кожен містить скор-словник

    Повертає:
        Dict з компонентами: big_five (ℝ⁵), maslow (ℝ⁵), schwartz (ℝ¹⁰)
    """
    components = {}

    def get_safe_values(d: dict, keys: list, default=3.0) -> list:
        # Default is set to a neutral value (e.g., 3.0 out of 5)
        # in case AI returns text instead of numbers
        result = []
        for k in keys:
            v = d.get(k, default)
            try:
                result.append(float(v))
            except (ValueError, TypeError):
                result.append(default)
        return result

    # Обробка Big Five (5 компонентів)
    if "big_five" in profile and isinstance(profile["big_five"], dict):
        b5_dict = profile["big_five"]
        b5_values = get_safe_values(b5_dict, BIG_FIVE_ORDER)
        components["big_five"] = np.array(b5_values, dtype=float)

    # Обробка Маслоу (5 компонентів)
    if "maslow" in profile and isinstance(profile["maslow"], dict):
        maslow_dict = profile["maslow"]
        maslow_values = get_safe_values(maslow_dict, MASLOW_ORDER)
        components["maslow"] = np.array(maslow_values, dtype=float)

    # Обробка Шварца (10 компонентів)
    if "schwartz" in profile and isinstance(profile["schwartz"], dict):
        schwartz_dict = profile["schwartz"]
        schwartz_values = get_safe_values(schwartz_dict, SCHWARTZ_ORDER)
        components["schwartz"] = np.array(schwartz_values, dtype=float)

    return components


def build_state_vector(
    profile: Dict[str, Any],
    label: str = "",
    normalize: bool = True
) -> StateVector:
    """
    Будує state vector з психологічного профілю.

    Процес:
        1. Перетворює профіль на компоненти
        2. Нормалізує компоненти (якщо потрібно)
        3. Конкатенує у один вектор E ∈ ℝ²⁰

    Args:
        profile: Dict з даними психологічного профілю від AI-аналізатора
        label: Мітка для вектора (напр., "Сахс-Леві", "Первинне інтерв'ю")
        normalize: Чи нормалізувати компоненти

    Returns:
        StateVector з компонентами та конкатенованим вектором
    """
    components = profile_to_components(profile)

    if normalize:
        components = normalize_components(components)

    # Конкатенуємо компоненти у порядку: big_five + maslow + schwartz
    arrays = []
    for key in COMPONENT_ORDER:
        if key in components:
            arrays.append(components[key])

    if not arrays:
        # Якщо нема компонентів, повертаємо нульовий вектор
        vector = np.zeros(20, dtype=float)
    else:
        vector = np.concatenate(arrays)

    return StateVector(components=components, vector=vector, label=label)


def build_state_vector_from_profile(
    profile: PsychologicalProfile,
    label: str = "",
    normalize: bool = True
) -> StateVector:
    """
    Будує state vector зі старого типу PsychologicalProfile.

    Це функція сумісності для роботи з PsychologicalProfile об'єктами.
    """
    profile_dict = profile.to_dict()
    return build_state_vector(profile_dict, label, normalize)


def compute_distance_to_expert(vector: np.ndarray) -> float:
    """
    Розраховує Евклідову відстань від профілю до експертного вектора.

    Це може бути використано для оцінки "здоровості" профілю або
    результативності терапії.

    Args:
        vector: State vector з профілем (ℝ²⁰)

    Returns:
        float: Евклідова відстань
    """
    if len(vector) != len(EXPERT_VECTOR_VALUES):
        raise ValueError(f"Вектор повинен мати розмір {len(EXPERT_VECTOR_VALUES)}, отримано {len(vector)}")

    return float(np.linalg.norm(vector - EXPERT_VECTOR_VALUES))


def compare_vectors(vector1: np.ndarray, vector2: np.ndarray) -> Dict[str, Any]:
    """
    Порівнює два state vectors (напр., ДО та ПІСЛЯ терапії).

    Args:
        vector1: Перший вектор (ℝ²⁰)
        vector2: Другий вектор (ℝ²⁰)

    Returns:
        Dict з метриками порівняння:
            - distance: Евклідова відстань між векторами
            - angle: Косинус кута між векторами (для подібності)
            - magnitude_change: Зміна величини вектора (енергія)
    """
    if len(vector1) != len(vector2) or len(vector1) != 20:
        raise ValueError("Вектори повинні мати розмір 20")

    # Евклідова відстань
    distance = float(np.linalg.norm(vector1 - vector2))

    # Косинус подібності
    norm1 = np.linalg.norm(vector1)
    norm2 = np.linalg.norm(vector2)

    if norm1 > 0 and norm2 > 0:
        cosine_similarity = float(np.dot(vector1, vector2) / (norm1 * norm2))
    else:
        cosine_similarity = 0.0

    # Зміна величини
    magnitude_change = float(norm2 - norm1)

    return {
        "distance": distance,
        "cosine_similarity": cosine_similarity,
        "magnitude_change": magnitude_change
    }


# ── Допоміжні функції для роботи з API ───────────────────────────────

def extract_profile_from_sachs_response(api_response: Dict[str, Any]) -> Dict[str, Any]:
    """
    Екстрактує профіль з відповіді /api/analyze-sachs.

    Args:
        api_response: Повна відповідь від API (містить 'metrics' та 'profile')

    Returns:
        Dict з профілем для build_state_vector()
    """
    profile = api_response.get("profile", {})
    return {
        "big_five": profile.get("big_five", {}),
        "maslow": profile.get("maslow", {}),
        "schwartz": profile.get("schwartz", {}),
        "conclusion": profile.get("conclusion", "")
    }


def extract_profile_from_interview_response(api_response: Dict[str, Any]) -> Dict[str, Any]:
    """
    Екстрактує профіль з відповіді /api/analyze-interview.

    Для інтерв'ю повертаємо only scores, якщо доступні.

    Args:
        api_response: Повна відповідь від API

    Returns:
        Dict з даними для побудови вектора або None
    """
    data = api_response.get("data", {})

    # Інтерв'ю зазвичай не повертає психологічні профілі,
    # а інші метрики (scores, markers, clinical_summary)
    if "scores" in data:
        return {
            "scores": data.get("scores", {}),
            "core_request": data.get("core_request", ""),
            "markers": data.get("markers", []),
            "clinical_summary": data.get("clinical_summary", "")
        }
    return None


def build_comparative_vectors(
    profile_before: Dict[str, Any],
    profile_after: Dict[str, Any],
    normalize: bool = True
) -> Dict[str, Any]:
    """
    Будує два вектора для порівняння ДО та ПІСЛЯ терапії.

    Args:
        profile_before: Профіль ДО терапії
        profile_after: Профіль ПІСЛЯ терапії
        normalize: Чи нормалізувати

    Returns:
        Dict з векторами та метриками порівняння
    """
    vector_before = build_state_vector(profile_before, label="ДО", normalize=normalize)
    vector_after = build_state_vector(profile_after, label="ПІСЛЯ", normalize=normalize)

    metrics = compare_vectors(vector_before.vector, vector_after.vector)

    return {
        "vector_before": vector_before,
        "vector_after": vector_after,
        "metrics": metrics,
        "distance_before_to_expert": compute_distance_to_expert(vector_before.vector),
        "distance_after_to_expert": compute_distance_to_expert(vector_after.vector)
    }
