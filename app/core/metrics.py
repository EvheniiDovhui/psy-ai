# app/core/metrics.py

def get_safe_score(data, key, default=3.0):
    """Безпечно витягує число зі словника, навіть якщо AI прислав вкладений об'єкт або рядок"""
    if not isinstance(data, dict):
        return default
        
    val = data.get(key, default)
    
    if isinstance(val, dict):
        return float(val.get('score', val.get('value', default)))
    try:
        return float(val)
    except (ValueError, TypeError):
        return float(default)

def tononi_complexity(b5: dict):
    n = get_safe_score(b5, 'neuroticism')
    e = get_safe_score(b5, 'extraversion')
    o = get_safe_score(b5, 'openness')
    a = get_safe_score(b5, 'agreeableness')
    c = get_safe_score(b5, 'conscientiousness')
    
    return round((n + e + o + a + c) / 5.0 * 0.65, 2)

def free_energy(b5: dict):
    n = get_safe_score(b5, 'neuroticism')
    c = get_safe_score(b5, 'conscientiousness')
    
    return round((n * 1.5) - (c * 0.8), 2)