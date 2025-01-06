data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

data "archive_file" "zip_the_node_code" {
  type        = "zip"
  source_dir  = "${path.module}/lambda/"
  output_path = "${path.module}/lambda/message-processor.zip"
}

resource "aws_lambda_function" "message_processor" {
  filename                       = "${path.module}/lambda/message-processor.zip"
  function_name                  = "MessageProcessor"
  role                           = data.aws_iam_role.lab_role.arn
  handler                        = "index.lambda_handler"
  runtime                        = "python3.8"
  reserved_concurrent_executions = 2 # Limit to 2 concurrent instances

  environment {
    variables = {
      SQS_QUEUE_URL = aws_sqs_queue.message_queue.id
      DB_HOST     = aws_db_instance.db.endpoint
      DB_USER     = aws_db_instance.db.username
      DB_PASSWORD = aws_db_instance.db.password
      DB_NAME     = aws_db_instance.db.db_name
    }
  }

  depends_on = [aws_sqs_queue.message_queue]
}

# Attach the Lambda to the SQS queue
resource "aws_lambda_event_source_mapping" "sqs_event" {
  batch_size       = 1 # Ensure only one message is processed at a time
  event_source_arn = aws_sqs_queue.message_queue.arn
  function_name    = aws_lambda_function.message_processor.arn
}