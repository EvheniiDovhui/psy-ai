import re

def preprocess(text: str) -> list[str]:
    text = text.lower()
    words = re.findall(r"[а-яА-ЯіІїЇєЄґҐa-zA-Z]+", text)
    return words