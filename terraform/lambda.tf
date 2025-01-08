data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

data "archive_file" "zip_the_node_code" {
  type        = "zip"
  source_dir  = "${path.module}/node/"
  output_path = "${path.module}/node/lambda_function.zip"
}

resource "aws_lambda_function" "message_processor" {
  filename                       = "${path.module}/node/lambda_function.zip"
  function_name                  = "MessageProcessor"
  role                           = data.aws_iam_role.lab_role.arn
  handler                        = "index.handler"
  runtime                        = "nodejs16.x"
  reserved_concurrent_executions = 2 # Limit to 2 concurrent instances

  vpc_config {
    subnet_ids          = module.vpc.private_subnets  # Subnets where RDS is accessible
    security_group_ids  = [aws_security_group.rds_sg.id]  # Security groups with access to RDS
  }

  environment {
    variables = {
      SQS_QUEUE_URL = aws_sqs_queue.message_queue.id
      DATABASE_URL2 = "postgres://postgres:postgres@terraform-20250107091227017500000005.c16ejl6j0lwa.us-east-1.rds.amazonaws.com:5432/mydb"
#      DB_HOST       = aws_db_instance.db.endpoint
#      DB_USER       = aws_db_instance.db.username
#      DB_PASSWORD   = aws_db_instance.db.password
#      DB_NAME       = aws_db_instance.db.db_name
    }
  }

  #żeby aktualizować kod jeśli index.py się zmieni
  source_code_hash = filebase64sha256("${path.module}/node/index.js")
  depends_on = [aws_sqs_queue.message_queue]
}

# Attach the Lambda to the SQS queue
resource "aws_lambda_event_source_mapping" "sqs_event" {
  batch_size       = 1 # Ensure only one message is processed at a time
  enabled          = true #Set it to Enabled so that it immediately starts sending events to Lambda
  event_source_arn = aws_sqs_queue.message_queue.arn
  function_name    = aws_lambda_function.message_processor.arn
}