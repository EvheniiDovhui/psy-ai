from collections import Counter
from app.utils.text import preprocess
from app.lexicons.big_five import BIG_FIVE
from app.lexicons.maslow import MASLOW
from app.lexicons.schwartz import SCHWARTZ
from app.models.profile import PsychologicalProfile


def score(words: list[str], lexicon: dict) -> dict:
    counter = Counter(words)
    result = {}

    for trait, vocab in lexicon.items():
        result[trait] = sum(counter[w] for w in vocab)

    return result


def analyze_text(text: str) -> PsychologicalProfile:
    words = preprocess(text)

    big_five_scores = score(words, BIG_FIVE)
    maslow_scores = score(words, MASLOW)
    schwartz_scores = score(words, SCHWARTZ)

    return PsychologicalProfile(
        big_five=big_five_scores,
        maslow=maslow_scores,
        schwartz=schwartz_scores
    )