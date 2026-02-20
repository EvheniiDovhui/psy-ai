from app.core.analyzer import analyze_text
from app.core.metrics import tononi_complexity, free_energy

text = input("Введи текст: ")

profile = analyze_text(text)
data = profile.to_dict()

print("\nПсихологічний профіль:")
for k, v in data.items():
    print(k, "=>", v)

consciousness = tononi_complexity(data["big_five"])
energy = free_energy(data["big_five"])

print("\nМетрики:")
print("Tononi complexity:", consciousness)
print("Free energy:", energy)