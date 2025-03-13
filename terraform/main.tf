// ./main.tf
terraform {
  required_version = "~> 1.3"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.56"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

locals {
  container_name         = "frontend"
  container_port         = 3000 # ! Must be same EXPORE port from our Dockerfile
  container_name_backend = "backend"
  container_port_backend = 3001
  example                = "app-example"
}

provider "aws" {
  region = "us-east-1" # Feel free to change this

  default_tags {
    tags = { example = local.example }
  }
}

# * Give Docker permission to pusher Docker images to AWS
data "aws_caller_identity" "this" {}
data "aws_ecr_authorization_token" "this" {}
data "aws_region" "this" {}
locals {
  ecr_address = format("%v.dkr.ecr.%v.amazonaws.com", data.aws_caller_identity.this.account_id, data.aws_region.this.name)
}
provider "docker" {
  registry_auth {
    address  = local.ecr_address
    password = data.aws_ecr_authorization_token.this.password
    username = data.aws_ecr_authorization_token.this.user_name
  }
}

data "aws_availability_zones" "available" { state = "available" }

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 3.19.0"

  azs                  = slice(data.aws_availability_zones.available.names, 0, 2)
  # Span subnetworks across 2 avalibility zones
  cidr                 = "10.0.0.0/16"
  create_igw           = true # Expose public subnetworks to the Internet
  enable_nat_gateway   = true # Hide private subnetworks behind NAT Gateway
  private_subnets      = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets       = ["10.0.101.0/24", "10.0.102.0/24"]
  single_nat_gateway   = true
  enable_dns_support   = true
  enable_dns_hostnames = true
}

#coś do health check wcześniej tego nie było
#na backendzie dodałęm endpoint /health który zwraca 200
#resource "aws_lb_target_group" "backend" {
#  name        = "${local.example}-backend-tg"
#  port        = 3001  #port backendowego tasku
#  protocol    = "HTTP"
#  target_type = "ip"
#  vpc_id      = module.vpc.vpc_id
#
#  health_check {
#    path                = "/health"
#    interval            = 30
#    timeout             = 5
#    healthy_threshold   = 3
#    unhealthy_threshold = 3
#    matcher             = "200"
#  }
#}


#LAAAAAAAAAAABROOOOOLLLEEEEE
data "aws_iam_role" "ecs_task_execution_role" { name = "LabRole" }

## Create permission to allow lambda to attach API gateway
#resource "aws_lambda_permission" "apigw_permission" {
#  statement_id  = "AllowAPIGatewayInvoke"
#  action        = "lambda:InvokeFunction"
#  function_name = aws_lambda_function.is-odd.function_name
#  principal     = "apigateway.amazonaws.com"
#
#  source_arn = "${aws_apigatewayv2_api.is_odd_api.execution_arn}/*/*"
#}