resource "aws_iam_policy" "dynamodb_irsa_policy" {
  name = "dynamodb-irsa-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ]
        Resource = aws_dynamodb_table.users.arn
      }
    ]
  })
}

resource "aws_iam_role" "dynamodb_irsa_role" {
  name = "dynamodb-irsa-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.eks.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"

        Condition = {
          StringEquals = {
            "${replace(aws_eks_cluster.eks_cluster.identity[0].oidc[0].issuer, "https://", "")}:sub" = "system:serviceaccount:customer-app:dynamodb-sa"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "dynamodb_irsa_attachment" {
  role       = aws_iam_role.dynamodb_irsa_role.name
  policy_arn = aws_iam_policy.dynamodb_irsa_policy.arn
}