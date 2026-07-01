Write-Host "Creating backup..."

Compress-Archive -Path .\app\* -DestinationPath backup.zip -Force

Write-Host "Uploading backup to Amazon S3..."

aws s3 cp backup.zip s3://payment-service87654321/

Write-Host "Backup completed successfully."