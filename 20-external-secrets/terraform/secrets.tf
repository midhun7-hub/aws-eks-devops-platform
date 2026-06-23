resource "aws_secretsmanager_secret" "app_secret" {
  name = "my-app-secret"
}

resource "aws_secretsmanager_secret_version" "app_secret_version" {
  secret_id = aws_secretsmanager_secret.app_secret.id

  secret_string = jsonencode({
    DB_USERNAME = "admin"
    DB_PASSWORD = "password123"
    JWT_SECRET  = "super-secret-jwt"
  })
}