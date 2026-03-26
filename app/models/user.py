from app.db.db_connect import DBConnect
import sqlite3

class User:
    def __init__(self, username, password_hash, age):
        self.username = username
        self.password_hash = password_hash
        self.age = self.age

        self._save_data()

    def _save_data(self):
        conn = DBConnect()

        try:
            conn.cursor.execute("""
                INSERT INTO users (username, passwordHash, age)
                VALUES (?, ?, ?)
            """, (self.username, self.password_hash, self.age))

            conn.connecting.commit()

        except sqlite3.IntegrityError:
            self.username = None

        finally:
            conn.close_connection()

    def get_id(self):
        conn = DBConnect()

        conn.cursor.execute("""
            SELECT id FROM users WHERE username = ?
        """, (self.username,))

        id = conn.cursor.fetchone()
        conn.close_connection()

        return id[0]

    @classmethod
    def get_all_users(cls):
        conn = DBConnect()

        conn.cursor.execute("""
            SELECT * FROM users
        """)

        response = conn.cursor.fetchall()
        conn.close_connection()

        return response

    @classmethod
    def get_by_username(cls, username, password_hash):
        conn = DBConnect()

        try:
            conn.cursor.execute("""
                SELECT id FROM users 
                WHERE username = ? AND passwordHash = ?
            """, (username, password_hash))

            response = conn.cursor.fetchone()

            if response is None:
                return -1

            return response[0]

        finally:
            conn.close_connection()
