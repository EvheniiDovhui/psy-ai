from app.core.analyzer import analyze_text
from app.core.metrics import tononi_complexity, free_energy

from flask import Flask, request, jsonify
from app.models.user import User

app = Flask(__name__)

@app.route('/user', methods=['POST'])
def create_user():
    data = request.get_json()

    data_keys = list(data.keys())
    if 'username' not in data_keys:
        return jsonify({'message': 'username must be provided'}), 400
    if 'password_hash' not in data_keys:
        return jsonify({'message': 'password must be provided'}), 400
    if 'age' not in data_keys:
        return jsonify({'message': 'age must be provided'}), 400

    if type(data['password_hash']) != int:
        return jsonify({'message': ' password hash must be int'}), 400

    user = User(data['username'], data['password_hash'], data['age'])

    if user.username is None:
        return jsonify({'message': 'username must be unic'}), 400

    return jsonify({'id': user.get_id()}), 201

@app.route('/user', methods=['GET'])
def get_user():
    username = request.args.get('username')
    password_hash = request.args.get('password_hash', type=int)

    if username is None or password_hash is None:
        return jsonify({'message': 'username and password hash must be provided'}), 400

    user_id = User.get_by_username(username, password_hash)
    return jsonify({'user_id': user_id}), 200 if user_id != -1 else 404

if __name__ == '__main__':
    app.run(debug=True)

# @app.post("/api/analyze-sachs")
# async def analyze_sachs_test(data: SachsTestPayload):
#     try:
#         # 1. Склеюємо текст тесту
#         combined_text = ""
#         for category, sentences in data.results.items():
#             for item in sentences:
#                 if item.answer.strip():
#                     combined_text += f"{item.prompt} {item.answer}. "
#
#         if not combined_text.strip():
#             raise HTTPException(status_code=400, detail="Тест порожній")
#
#         print(f"🔮 Запуск AI-аналізу через Gemini для: {data.testName}...")
#
#         # 2. 🚀 ВИКЛИКАЄМО GEMINI АНАЛІЗАТОР
#         # Тепер ми отримуємо об'єкт, у якому Є поле 'conclusion'
#         profile_data = analyze_text_with_gemini(combined_text)
#
#         if not profile_data:
#             raise HTTPException(status_code=500, detail="AI аналізатор повернув порожній результат")
#
#         # 3. Рахуємо твої математичні метрики
#         b5 = profile_data.get("big_five", {})
#         consciousness = tononi_complexity(b5)
#         energy = free_energy(b5)
#
#         # 4. Відправляємо ПОВНИЙ об'єкт (з conclusion) на фронтенд
#         return {
#             "status": "success",
#             "metrics": {
#                 "tononi_complexity": consciousness,
#                 "free_energy": energy
#             },
#             "profile": profile_data
#         }
#
#     except Exception as e:
#         print(f"❌ Критична помилка бекенду: {e}")
#         raise HTTPException(status_code=500, detail=str(e))
#
#     from app.core.ai_analyzer import analyze_interview_with_gemini
#
#
# class InterviewPayload(BaseModel):
#     text: str
#
#
# @app.post("/api/analyze-interview")
# async def analyze_interview(data: InterviewPayload):
#     try:
#         if not data.text or len(data.text) < 20:
#             raise HTTPException(status_code=400, detail="Текст занадто короткий для аналізу")
#
#         result = analyze_interview_with_gemini(data.text)
#         if not result:
#             raise HTTPException(status_code=500, detail="AI Analysis failed")
#
#         return {"status": "success", "data": result}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
#
#
# if name == "main":
#     uvicorn.run("app.api:app", host="0.0.0.0", port=8000, reload=True)

# text = input("Введи текст: ")
#
# profile = analyze_text(text)
# data = profile.to_dict()
#
# print("\nПсихологічний профіль:")
# for k, v in data.items():
#     print(k, "=>", v)
#
# consciousness = tononi_complexity(data["big_five"])
# energy = free_energy(data["big_five"])
#
# print("\nМетрики:")
# print("Tononi complexity:", consciousness)
# print("Free energy:", energy)