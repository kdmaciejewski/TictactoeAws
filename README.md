# Multiplayer Game AWS Infrastructure

This project showcases a complete cloud infrastructure setup for a multiplayer game, designed and deployed using **Terraform** and **Docker** on **AWS**.

## Overview

Core AWS services were used to handle authentication, messaging, compute, and storage needs. The setup includes:

- **AWS Fargate**: Serverless compute for containerized backend services
- **AWS Lambda**: Event-driven function execution for serverless logic
- **Amazon Cognito**: User authentication and authorization
- **Amazon SQS**: Message queuing for asynchronous processing
- **Amazon RDS**: Relational database for persistent storage
- **Amazon CloudWatch**: Centralized logging and monitoring
- **AWS CloudTrail**: Governance, compliance, and operational auditing

## Technologies Used

- **Terraform** – Infrastructure as Code (IaC) to define and provision resources
- **Docker** – Containerization for consistent and portable deployment
- **AWS** – Cloud provider hosting the infrastructure
