data "aws_iam_role" "lab_role" {
  name = "LabRole"
}

data "archive_file" "zip_the_node_code" {
  type        = "zip"
  source_dir  = "${path.module}/python/"
  output_path = "${path.module}/python/hello-python.zip"
}

resource "aws_lambda_function" "terraform_lambda_func" {
  filename      = "${path.module}/python/hello-python.zip"
  function_name = "Test_Lambda_Function"
  role          = data.aws_iam_role.lab_role.arn # Use the existing LabRole ARN
  handler       = "index.lambda_handler"
  runtime       = "python3.8"
}