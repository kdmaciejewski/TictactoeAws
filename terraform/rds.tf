# RDS (PostgreSQL)

resource "aws_security_group" "rds_sg" {
  name   = "${local.example}-rds-sg"
  vpc_id = module.vpc.vpc_id

  #  ingress {
  #    from_port   = 5432
  #    to_port     = 5432
  #    protocol    = "tcp"
  #    description = "Allow Postgres traffic from ECS tasks"
  #    security_groups = [module.vpc.default_security_group_id] # Security group for ECS tasks
  #  }

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${local.example}-rds-sg"
  }
}

resource "aws_db_subnet_group" "app_subnet_group" {
  name       = "${local.example}-db-subnet-group"
  subnet_ids = module.vpc.public_subnets

  tags = {
    Name = "${local.example}-db-subnet-group"
  }
}

resource "aws_db_instance" "db" {
  allocated_storage      = 20
  engine                 = "postgres"
  instance_class         = "db.t3.micro"
  db_name                = "mydb"
  username               = "postgres"
  password               = "postgres"
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.app_subnet_group.name
  skip_final_snapshot    = true
  publicly_accessible    = true
}

output "db_host" {
  value     = nonsensitive(aws_db_instance.db.endpoint)
}

output "db_name" {
  value     = nonsensitive(aws_db_instance.db.db_name)
}

output "db_username" {
  value     = nonsensitive(aws_db_instance.db.username)
}

output "db_password" {
  value     = nonsensitive(aws_db_instance.db.password)
}

#resource "null_resource" "setup_db" {
#  depends_on = ["aws_db_instance.db"] #wait for the db to be ready
#  provisioner "local-exec" {
#    command = "psql -u ${aws_db_instance.db.username} -p${aws_db_instance.db.password} -h ${aws_db_instance.db.endpoint} < db_script.sql"
#  }
#}

#resource "null_resource" "setup_db" {
#  depends_on = [aws_db_instance.db] # Wait for the DB to be ready
#  provisioner "local-exec" {
#    command = <<EOT
#PGPASSWORD=${aws_db_instance.db.password} psql -h <ip/url-of-the-remote-server> -U <user-name> -d <database-name> < /path/to/your/local/file.sql
#EOT
#  }
#}

#resource "null_resource" "setup_db" {
#  depends_on = [aws_db_instance.db] # Wait for the DB to be ready
#
#  provisioner "local-exec" {
#    command = <<EOT
#set PGPASSWORD=${aws_db_instance.db.password}
#psql -h ${aws_db_instance.db.endpoint} -U ${aws_db_instance.db.username} -d ${aws_db_instance.db.db_name} -a -f db_script.sql
#EOT
#  }
#}

#resource "null_resource" "setup_db" {
#  depends_on = [aws_db_instance.db] # Wait for the DB to be ready
#  provisioner "local-exec" {
#    command = <<EOT
#psql -h ${aws_db_instance.db.endpoint} -U ${aws_db_instance.db.username} -d ${aws_db_instance.db.db_name} -a -f db_script.sql
#EOT
#  }
#}

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
