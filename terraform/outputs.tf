output "frontend_public_ip" {
  value = aws_instance.frontend_instance.public_ip
  sensitive = true
}

output "backend_public_ip" {
  value = aws_instance.backend_instance.public_ip
  sensitive = true
}

output "rds_endpoint" {
  value = aws_db_instance.db.endpoint
  sensitive = true
}
