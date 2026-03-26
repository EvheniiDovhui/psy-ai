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
                passwordHash INTEGER NOT NULL,
                age INTEGER NOT NULL
            )
        """)

        self.connecting.execute("""
            CREATE TABLE IF NOT EXISTS big_five (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                neuroticism INTEGER NOT NULL,
                openness INTEGER NOT NULL,
                conscientiousness INTEGER NOT NULL,
                extraversion INTEGER NOT NULL,
                agreeableness INTEGER NOT NULL
            )
        """)

        self.connecting.execute("""
            CREATE TABLE IF NOT EXISTS maslow (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                physiological INTEGER NOT NULL,
                safety INTEGER NOT NULL,
                love INTEGER NOT NULL,
                esteem INTEGER NOT NULL,
                self_actualization INTEGER NOT NULL
            )
        """)

        self.connecting.execute("""
            CREATE TABLE IF NOT EXISTS schwartz (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                power INTEGER NOT NULL,
                achievement INTEGER NOT NULL,
                hedonism INTEGER NOT NULL,
                security INTEGER NOT NULL,
                benevolence INTEGER NOT NULL,
                universalism INTEGER NOT NULL
            )
        """)

        self.connecting.execute("""
            CREATE TABLE IF NOT EXISTS tests
            (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id     INTEGER NOT NULL,
                big_five_id INTEGER,
                maslow_id   INTEGER,
                schwartz_id INTEGER,
                created_at  TEXT DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (big_five_id) REFERENCES big_five (id) ON DELETE SET NULL,
                FOREIGN KEY (maslow_id) REFERENCES maslow (id) ON DELETE SET NULL,
                FOREIGN KEY (schwartz_id) REFERENCES schwartz (id) ON DELETE SET NULL
            )
        """)

        self.connecting.commit()

    def close_connection(self):
        self.cursor.close()
        self.connecting.close()
