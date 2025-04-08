#konfiguracja pliku env dla frontendu
resource "local_file" "env_file_frontend" {
  content = <<EOT
VITE_APP_PUBLIC_DNS=http://${module.alb.lb_dns_name}
VITE_APP_SERVER=http://${module.alb_backend.lb_dns_name}
EOT

  filename = "../client/.env"
}


#frontend poprawić nazwy żeby były z dopiskiem frontend
module "ecr" {
  depends_on = [local_file.env_file_frontend]
  source  = "terraform-aws-modules/ecr/aws"
  version = "~> 1.6.0"

  repository_force_delete     = true
  repository_name             = local.example
  repository_lifecycle_policy = jsonencode({
    rules = [
      {
        action       = { type = "expire" }
        description  = "Delete all images except a handful of the newest images"
        rulePriority = 1
        selection    = {
          countNumber = 3
          countType   = "imageCountMoreThan"
          tagStatus   = "any"
        }
      }
    ]
  })
}

# * Build our Image locally with the appropriate name so that we can push
# * our Image to our Repository in AWS. Also, give it a random image tag.
resource "docker_image" "this" {
  name = format("%v:%v", module.ecr.repository_url, formatdate("YYYY-MM-DD'T'hh-mm-ss", timestamp()))

  build { context = "../client/" }
  # Path to our local Dockerfile
}

# * Push our container image to our ECR.
resource "docker_registry_image" "this" {
  keep_remotely = true # Do not delete old images when a new image is pushed
  name          = docker_image.this.name
}
#amazon load balancer
module "alb" {
  source  = "terraform-aws-modules/alb/aws"
  version = "~> 8.4.0"

  load_balancer_type = "application"
  security_groups    = [module.vpc.default_security_group_id]
  subnets            = module.vpc.public_subnets
  vpc_id             = module.vpc.vpc_id

  security_group_rules = {
    ingress_all_http = {
      type        = "ingress"
      from_port   = 80
      to_port     = 80
      protocol    = "TCP"
      description = "Permit incoming HTTP requests from the internet"
      cidr_blocks = ["0.0.0.0/0"]
    }
    egress_all = {
      type        = "egress"
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      description = "Permit all outgoing requests to the internet"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  http_tcp_listeners = [
    {
      # * Setup a listener on port 80 and forward all HTTP
      # * traffic to target_groups[0] defined below which
      # * will eventually point to our "Hello World" app.
      port               = 80
      protocol           = "HTTP"
      target_group_index = 0
    }
  ]

  target_groups = [
    {
      backend_port     = local.container_port
      backend_protocol = "HTTP"
      target_type      = "ip"
    }
  ]
}
module "ecs" {
  source  = "terraform-aws-modules/ecs/aws"
  version = "~> 4.1.3"

  cluster_name = local.example

  # * Allocate 20% capacity to FARGATE and then split
  # * the remaining 80% capacity 50/50 between FARGATE
  # * and FARGATE_SPOT.
  fargate_capacity_providers = {
    FARGATE = {
      default_capacity_provider_strategy = {
        base   = 20
        weight = 50
      }
    }
    FARGATE_SPOT = {
      default_capacity_provider_strategy = {
        weight = 50
      }
    }
  }
}

resource "aws_ecs_task_definition" "this" {
  container_definitions = jsonencode([
    {
      environment : [
        { name = "NODE_ENV", value = "production" }
      ],
      essential    = true,
      image        = docker_registry_image.this.name,
      name         = local.container_name,
      portMappings = [{ containerPort = local.container_port }],
    }
  ])
  cpu                      = 256
  execution_role_arn       = data.aws_iam_role.ecs_task_execution_role.arn
  family                   = "family-of-${local.example}-tasks"
  memory                   = 512
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
}

resource "aws_ecs_service" "this" {
 cluster = module.ecs.cluster_id
 desired_count = 1
 launch_type = "FARGATE"
 name = "${local.example}-service"
 task_definition = aws_ecs_task_definition.this.arn

 lifecycle {
  ignore_changes = [desired_count] # Allow external changes to happen without Terraform conflicts, particularly around auto-scaling.
 }

 load_balancer {
  container_name = local.container_name
  container_port = local.container_port
  target_group_arn = module.alb.target_group_arns[0]
 }

 network_configuration {
  security_groups = [module.vpc.default_security_group_id]
  subnets = module.vpc.private_subnets
 }
}


# * Output the URL of our Application Load Balancer so that we can connect to
# * our application running inside ECS once it is up and running.
output "frontend_url" { value = "http://${module.alb.lb_dns_name}" }