# RDS (PostgreSQL)
resource "aws_db_instance" "db" {
  allocated_storage    = 20
  engine               = "postgres"
  instance_class       = "db.t3.micro"
  db_name              = "mydb"
  username             = "postgres"
  password             = "postgres"
  vpc_security_group_ids = [aws_security_group.rds-sg.id]
  db_subnet_group_name    = aws_db_subnet_group.app_subnet_group.name
  skip_final_snapshot  = true
  publicly_accessible  = true
}


#resource "null_resource" "db_setup" {
#  provisioner "local-exec" {
#    command = "psql -h ${aws_db_instance.db.endpoint} -p 5432 -U postgres -d mydb -f \"db_script.sql\""
#
#    environment = {
#      PGPASSWORD = "postgres"
#    }
#    interpreter = ["bash", "-c"]
#  }
#}



output "db_host" {
  value = aws_db_instance.db.endpoint
  sensitive = true
}

output "db_name" {
  value = aws_db_instance.db.db_name
  sensitive = true
}

output "db_username" {
  value = aws_db_instance.db.username
  sensitive = true
}

output "db_password" {
  value = aws_db_instance.db.password
  sensitive = true
}
