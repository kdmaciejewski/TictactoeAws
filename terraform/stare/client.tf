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
#  user_data = "${file("update_env_client.sh")}"
#  user_data = file("update_env_client.sh")
#  user_data = base64encode(templatefile("./update_env_client.sh.tpl", local.vars))
}


#resource "null_resource" "setup_env" {
#  depends_on = [aws_instance.frontend_instance]
#  provisioner "file" {
#    # Path to the script on your local Windows machine
#    source      = "update_env_client.sh"
#    # Destination path on the EC2 instance
#    destination = "/home/ubuntu/setup_env.sh"
#  }
#
#  provisioner "remote-exec" {
#
#    # Commands to make the script executable and run it
#    inline = [
#      "chmod +x /home/ubuntu/setup_env.sh",
#      "/home/ubuntu/setup_env.sh"
#    ]
#
#    # SSH connection configuration
#    connection {
#      type        = "ssh"
#      host        = aws_instance.frontend_instance.public_ip
#      user        = "ubuntu"                     # Default user for Ubuntu instances
#      private_key = file("C:/Users/krzys/Desktop/Chmurki.pem")   # Path to your private SSH key
#    }
#  }
#}



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