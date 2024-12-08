# Frontend EC2
resource "aws_instance" "frontend_instance" {
  ami             = "ami-0866a3c8686eaeeba"
  instance_type   = "t2.micro"
  subnet_id       = aws_subnet.app_subnet.id
  vpc_security_group_ids = [aws_security_group.frontback-sg.id]
  key_name        = "vockey"
  tags = {
    Name = "Frontend"
  }
  user_data = "${file("update_env_client.sh")}"
#  user_data = file("update_env_client.sh")
#  user_data = base64encode(templatefile("./update_env_client.sh.tpl", local.vars))
}

## Local variables to pass to the template
#locals {
#  depends_on = [aws_instance.frontend_instance, aws_instance.backend_instance]
#  vars = {
#    frontend_ip = aws_instance.frontend_instance.public_ip
#    backend_ip  = aws_instance.backend_instance.public_ip
#  }
#}
#
#resource "null_resource" "update_env" {
#  depends_on = [aws_instance.frontend_instance, aws_instance.backend_instance]
#
#  provisioner "local-exec" {
#    command = <<EOT
#      echo '${templatefile("${path.module}/update_env_client.sh.tpl", local.vars)}' > ./update_env_client.sh
#      chmod +x ./update_env_client.sh
#      ./update_env_client.sh
#    EOT
#  }
#}