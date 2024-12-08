# Backend EC2
resource "aws_instance" "backend_instance" {
  ami           = "ami-0866a3c8686eaeeba"
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.app_subnet.id
  vpc_security_group_ids = [aws_security_group.frontback-sg.id]
  key_name      = "vockey"
  tags = {
    Name = "Backend"
  }
  user_data = file("update_env_server.sh")
}
