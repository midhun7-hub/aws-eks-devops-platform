Write-Host "Downloading backup from Amazon S3..."

aws s3 cp s3://payment-service87654321/backup.zip .

Write-Host "Extracting backup..."

Expand-Archive .\backup.zip -DestinationPath .\restored -Force

Write-Host "Restore completed successfully."