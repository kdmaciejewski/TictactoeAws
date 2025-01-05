import time
import boto3
import json

sqs = boto3.client('sqs')
admin_user = "admin"  # Replace with your logic for "admin" user

def lambda_handler(event, context):
    for record in event['Records']:
        # Extract message
        message_body = record['body']
        print(f"Processing message: {message_body}")

        # Check if the message contains a number
        if any(char.isdigit() for char in message_body):
            send_to_admin(message_body)
            return {"status": "success, sent to admin"}

    return {"status": "success"}

def send_to_admin(message):
    # Logic to send message to admin
    print(f"Sending message to admin: {message}")
