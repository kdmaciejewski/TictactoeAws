resource "aws_sqs_queue" "message_queue" {
  name                       = "MessageQueue"
  delay_seconds              = 5  #opóźnienie w przetwarzaniu wiadomości
  visibility_timeout_seconds = 30
  max_message_size           = 2048
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 4
  sqs_managed_sse_enabled = true # sse - server side encryption
}

output "sqs_url" {
  value = aws_sqs_queue.message_queue.url
}
#data "aws_iam_policy_document" "sh_sqs_policy" {
#  statement {
#    sid    = "shsqsstatement"
#    effect = "Allow"
#
#    principals {
#      type        = "AWS"
#      identifiers = ["*"]
#    }
#
#    actions = [
#      "sqs:SendMessage",
#      "sqs:ReceiveMessage"
#    ]
#    resources = [
#      aws_sqs_queue.message_queue.arn
#    ]
#  }
#}
#
#resource "aws_sqs_queue_policy" "message_queue_policy" {
#  queue_url = aws_sqs_queue.message_queue.id
#  policy    = data.aws_iam_policy_document.sh_sqs_policy.json
#}