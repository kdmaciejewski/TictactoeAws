#konfiguracja pliku env dla backendu
#resource "local_file" "env_file" {
#  depends_on = [aws_db_instance.db]
#  content    = <<EOT
#DATABASE_URL=${format(
#    "postgres://%s:%s@%s/%s",
#    aws_db_instance.db.username,
#    aws_db_instance.db.password,
#    aws_db_instance.db.endpoint,
#    aws_db_instance.db.db_name
#)}
#SQS_QUEUE_URL=${aws_sqs_queue.message_queue.url}
#EOT
#
#  filename = "../server/.env"
#}

#resource "local_file" "env_file" {
#  depends_on = [aws_db_instance.db]
#  content    = <<EOT
#DATABASE_URL2=postgres://postgres:postgres@terraform-20250106100043579500000005.c16ejl6j0lwa.us-east-1.rds.amazonaws.com:5432/mydb
#EOT
#
#  filename = "../server/.env"
#}

resource "local_file" "env_file" {
  depends_on = [aws_db_instance.db]
  content    = <<EOT
DATABASE_URL2=postgres://postgres:postgres@terraform-20250107091227017500000005.c16ejl6j0lwa.us-east-1.rds.amazonaws.com:5432/mydb
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/825252643450/MessageQueue
EOT

  filename = "../server/.env"
}


# Add ECR Repository for Backend
module "ecr_backend" {
  depends_on = [local_file.env_file]
  source     = "terraform-aws-modules/ecr/aws"
  version    = "~> 1.6.0"

  repository_force_delete     = true
  repository_name             = "${local.example}-backend"
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

# Docker Image for Backend
resource "docker_image" "backend" {
  depends_on = [local_file.env_file]
  name       = format("%v:%v", module.ecr_backend.repository_url, formatdate("YYYY-MM-DD'T'hh-mm-ss", timestamp()))

  build { context = "../server/" }
  # Path to backend Dockerfile
}

resource "docker_registry_image" "backend" {
  depends_on = [local_file.env_file]

  keep_remotely = true
  name          = docker_image.backend.name
}

# Add Backend Target Group
#ALB rozdziela ruch przychodzący (HTTP/HTTPS) pomiędzy instancje, kontenery lub zadania w celu
#skalowalności i wysokiej dostępności. Obsługuje routing na podstawie ścieżek

module "alb_backend" {
  depends_on = [local_file.env_file]

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

#  target_groups = [
#    {
#      backend_port     = local.container_port_backend
#      backend_protocol = "HTTP"
#      target_type      = "ip"
#    }
#  ]

  target_groups = [
    {
      backend_port     = 3001
      backend_protocol = "HTTP"
      target_type      = "ip"
      health_check     = {
        path                = "/health"
        interval            = 45
        timeout             = 5
        healthy_threshold   = 3
        unhealthy_threshold = 3
        matcher             = "200"
      }
    }
  ]

#  target_groups = [
#    {
#      backend_port     = 3001
#      backend_protocol = "HTTP"
#      target_type      = "ip"
#      health_check     = {
#        path                = "/health"
#        interval            = 45
#        timeout             = 5
#        healthy_threshold   = 3
#        unhealthy_threshold = 3
#        matcher             = "200"
#      }
#    }
#  ]

  #dodane
  #  http_tcp_listeners = [
  #    {
  #      port               = 80
  #      protocol           = "HTTP"
  #      target_group_index = 0
  #    }
  #  ]
}

#Elastic Container Service
#ECS zarządza uruchamianiem i skalowaniem kontenerów Docker. Tworzy zadania (tasks),
#które działają na klastrach (Fargate lub EC2) i obsługuje sieci, logi oraz zasoby dla kontenerów.
module "ecs_backend" {
  depends_on = [local_file.env_file]

  source  = "terraform-aws-modules/ecs/aws"
  version = "~> 4.1.3"

  #app-example-backend
  cluster_name = "${local.example}-backend"

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


#
#resource "aws_cloudwatch_log_group" "backend_logs" {
#  name              = "/logiBackendowe"
#  retention_in_days = 7
#}



# przekazuje outputy rds
resource "aws_ecs_task_definition" "backend" {
  #tu chyba powinno być coś w stylu: a te logi są tworzone w złym miejscu może
  #depends_on = [aws_cloudwatch_log_group.backend_logs]
  depends_on            = [local_file.env_file]
  container_definitions = jsonencode([
    {
      environment : [
        { name = "NODE_ENV", value = "production" },
        { name = "DB_HOST", value = aws_db_instance.db.endpoint },
        { name = "DB_NAME", value = aws_db_instance.db.db_name },
        { name = "DB_USER", value = aws_db_instance.db.username },
        { name = "DB_PASSWORD", value = aws_db_instance.db.password },
        {
          name = "DATABASE_URL", value = format(
          "postgres://%s:%s@%s:%d/%s",
          aws_db_instance.db.username,
          aws_db_instance.db.password,
          aws_db_instance.db.endpoint,
          5432, # Default PostgreSQL port
          aws_db_instance.db.db_name
        )
        }
      ],
      essential    = true,
      image        = docker_registry_image.backend.name,
      name         = local.container_name_backend,
      portMappings = [{ containerPort = local.container_port_backend }]
      #      logConfiguration = {
      #        logDriver = "awslogs"
      #        options   = {
      #          #          awslogs-group         = "/ecs/${local.example}-backend"
      #          awslogs-group         = "/logiBackendowe"
      #      awslogs-group         = aws_cloudwatch_log_group.backend_logs.name
      #          awslogs-region        = "us-east-1"
      #          awslogs-stream-prefix = "ecs"
      #        }
      #      }
    }
  ])
  cpu                      = 256
  execution_role_arn       = data.aws_iam_role.ecs_task_execution_role.arn
  family                   = "family-of-${local.example}-backend-tasks"
  memory                   = 512
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]

}

#resource "aws_iam_role_policy" "ecs_task_logging" {
#  role   = "LabRole"
#  policy = jsonencode({
#    Version   = "2012-10-17",
#    Statement = [
#      {
#        Effect = "Allow",
#        Action = [
#          "logs:CreateLogStream",
#          "logs:PutLogEvents"
#        ],
#        Resource = "arn:aws:logs:us-east-1:*:log-group:/ecs/*"
#      }
#    ]
#  })
#}

# ECS Service for Backend
# osobny desired_count dla backendowego serwisu ecs
resource "aws_ecs_service" "backend" {
  depends_on      = [module.alb_backend, local_file.env_file]
  cluster         = module.ecs_backend.cluster_id
  desired_count   = 1
  launch_type     = "FARGATE"
  name            = "${local.example}-backend-service"
  task_definition = aws_ecs_task_definition.backend.arn

  lifecycle {
    ignore_changes = [desired_count]
  }

  load_balancer {
    container_name   = local.container_name_backend
    container_port   = local.container_port_backend
    target_group_arn = module.alb_backend.target_group_arns[0]
  }

  network_configuration {
    security_groups = [module.vpc.default_security_group_id]
    subnets         = module.vpc.private_subnets
  }
}


# Output Backend URL
output "backend_url" {
  value = "http://${module.alb_backend.lb_dns_name}"
}

output "rds_url" {
  value = nonsensitive(format(
    "postgres://%s:%s@%s/%s",
    aws_db_instance.db.username,
    aws_db_instance.db.password,
    aws_db_instance.db.endpoint,
    aws_db_instance.db.db_name
  ))
}
output "rds_endpoint" {
  value = nonsensitive(aws_db_instance.db.endpoint)
}
