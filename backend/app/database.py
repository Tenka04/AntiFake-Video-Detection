import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'video_history.db')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id TEXT PRIMARY KEY,
            filename TEXT,
            date TEXT,
            status TEXT,
            result TEXT,
            confidence REAL
        )
    ''')
    conn.commit()
    conn.close()

def add_history(item_id, filename, date, status='processing', result=None, confidence=None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO history (id, filename, date, status, result, confidence)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (item_id, filename, date, status, result, confidence))
    conn.commit()
    conn.close()

def update_history(item_id, status, result=None, confidence=None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE history
        SET status = ?, result = ?, confidence = ?
        WHERE id = ?
    ''', (status, result, confidence, item_id))
    conn.commit()
    conn.close()

def get_history():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM history ORDER BY date DESC')
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

def get_stats():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) FROM history')
    analyzed = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM history WHERE result = "AI Generated"')
    ai_detected = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM history WHERE result = "Likely Authentic"')
    authentic = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM history WHERE status = "processing"')
    pending = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        "analyzed": analyzed,
        "aiDetected": ai_detected,
        "authentic": authentic,
        "pending": pending
    }
