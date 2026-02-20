import re

def preprocess(text: str) -> list[str]:
    text = text.lower()
    words = re.findall(r"\w+", text)
    return words