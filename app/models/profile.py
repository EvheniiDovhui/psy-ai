class PsychologicalProfile:
    def __init__(self, big_five: dict, maslow: dict, schwartz: dict):
        self.big_five = big_five
        self.maslow = maslow
        self.schwartz = schwartz

    def to_dict(self):
        return {
            "big_five": self.big_five,
            "maslow": self.maslow,
            "schwartz": self.schwartz
        }