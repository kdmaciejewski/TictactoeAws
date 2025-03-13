import time
import boto3
import psycopg2
import os
import json

# SQS klient
sqs = boto3.client('sqs')

# Dane do połączenia z RDS
DB_HOST = os.environ['DB_HOST']
DB_USER = os.environ['DB_USER']
DB_PASSWORD = os.environ['DB_PASSWORD']
DB_NAME = os.environ['DB_NAME']

admin_user = "admin"  # Replace with your logic for "admin" user


def lambda_handler(event, context):
    conn = connect_to_db()
    cursor = conn.cursor()

    try:
        for record in event['Records']:
            # Odczytaj wiadomość
            message_body = record['body']
            print(f"Processing message: {message_body}")

            # Sprawdź, czy wiadomość zawiera liczbę
            if any(char.isdigit() for char in message_body):
                send_to_admin(message_body)

            # Zapisz wiadomość w bazie
            save_message_to_db(cursor, message_body)

        # Zatwierdź transakcje w bazie
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        print(f"Error: {e}")
        return {"status": "error", "details": str(e)}
    finally:
        cursor.close()
        conn.close()


def send_to_admin(message):
    # Logika wysyłania wiadomości do admina
    print(f"Sending message to admin: {message}")


def save_message_to_db(cursor, message):
    # Zapisz wiadomość w tabeli "messages"
    query = "INSERT INTO messages (text) VALUES (%s)"
    cursor.execute(query, (message,))


def connect_to_db():
    # Połącz się z bazą RDS
    return psycopg2.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        dbname=DB_NAME
    )

# def lambda_handler(event, context):
#     for record in event['Records']:
#         # Extract message
#         message_body = record['body']
#         print(f"Processing message: {message_body}")
#
#         # Check if the message contains a number
#         if any(char.isdigit() for char in message_body):
#             send_to_admin(message_body)
#             return {"status": "success, sent to admin"}
#
#     return {"status": "success"}
#
# def send_to_admin(message):
#     # Logic to send message to admin
#     print(f"Sending message to admin: {message}")
