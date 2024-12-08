provider "aws" {
  region = "us-east-1"
}

# VPC
resource "aws_vpc" "app_vpc" {
  cidr_block = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "AppVPC"
  }
}

resource "aws_subnet" "app_subnet" {
  vpc_id                  = aws_vpc.app_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true

  tags = {
    Name = "EC2SubnetGroup"
  }
}
#aws wymaga żeby RDS działał przynajmniej w w co najmniej dwóch strefach dostępności
#aby umożliwić replikację danych i automatyczne przełączanie w przypadku awarii
resource "aws_subnet" "app_subnet_a" {
  vpc_id                  = aws_vpc.app_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "app_subnet_b" {
  vpc_id                  = aws_vpc.app_vpc.id
  cidr_block              = "10.0.3.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true
}

resource "aws_db_subnet_group" "app_subnet_group" {
  name       = "app-db-subnet-group"
  subnet_ids = [aws_subnet.app_subnet_a.id, aws_subnet.app_subnet_b.id]

  tags = {
    Name = "AppDBSubnetGroup"
  }
}

resource "aws_internet_gateway" "app_gw" {
  vpc_id = aws_vpc.app_vpc.id
}

resource "aws_route_table" "public_routes" {
  vpc_id = aws_vpc.app_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.app_gw.id
  }
}

resource "aws_route_table_association" "subnet_routes" {
  subnet_id      = aws_subnet.app_subnet.id
  route_table_id = aws_route_table.public_routes.id
}

#czy dodanie tego mogłoby coś zmienić?
#resource "aws_route_table_association" "public_routes_association_a" {
#  subnet_id      = aws_subnet.app_subnet_a.id
#  route_table_id = aws_route_table.public_routes.id
#}
#
#resource "aws_route_table_association" "public_routes_association_b" {
#  subnet_id      = aws_subnet.app_subnet_b.id
#  route_table_id = aws_route_table.public_routes.id
#}