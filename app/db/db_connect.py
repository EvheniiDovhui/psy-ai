import sqlite3

class DBConnect:
    def __init__(self):
        self.connecting = sqlite3.connect('psy-ai.sqlite3')
        self._create_tables()
        self.cursor = self.connecting.cursor()

    def _create_tables(self):  # створить файл app.db, якщо його нема
        self.connecting.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                passwordHash INTEGER NOT NULL
            )
        """)
        self.connecting.commit()

    def close_connection(self):
        self.cursor.close()
        self.connecting.close()
