#!/usr/bin/env python3
"""Check password hash format in database"""

import psycopg2

DB_CONFIG = {
    'host': 'localhost',
    'port': '5432',
    'database': 'assetdb',
    'user': 'user',
    'password': 'pass'
}

conn = psycopg2.connect(**DB_CONFIG)
cursor = conn.cursor()

cursor.execute("SELECT email, password FROM users WHERE email = 'john.doe@example.com'")
result = cursor.fetchone()

if result:
    print(f"Email: {result[0]}")
    print(f"Password Hash: {result[1]}")
    print(f"Hash Length: {len(result[1])}")
    print(f"Hash Prefix: {result[1][:7]}")
else:
    print("User not found!")

cursor.close()
conn.close()
