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

    if type(data['password_hash']) != int:
        return jsonify({'message': ' password hash must be int'}), 400

    user = User(data['username'], data['password_hash'])

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
#
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