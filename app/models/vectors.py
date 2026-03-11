import numpy as np
 
class StateVector:
    def __init__(self, components, vector, label = ""):
        self.components = components # dict
        self.vector = vector
        self.label = label
 
class ExpertVector:
    def __init__(self, vector, label = "Expert"):
        self.vector = vector
        self.label = label

 
class TherapyResult:
    def __init__(self, name, before, after, effectiveness=0.0, component_delta=None):
        self.name = name  # str "Терапія A"
        self.before = before  # StateVector
        self.after = after  # StateVector
        self.effectiveness = effectiveness  # float ε
        self.component_delta = component_delta