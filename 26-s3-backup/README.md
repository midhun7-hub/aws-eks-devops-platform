# Exercise 26 – S3 Backup Solution

## Objective

Implement a simple backup and restore strategy using **Amazon S3** to protect application files and configuration files.

---

# Architecture

```
Application Files
        │
        ▼
Create ZIP Backup
        │
        ▼
Upload to Amazon S3
        │
        ▼
Backup Stored Safely
        │
        ▼
Disaster Occurs
        │
        ▼
Download Backup
        │
        ▼
Extract Files
        │
        ▼
Application Restored
```

---

# Project Structure

```
26-s3-backup/
│
├── app/
│   ├── app.js
│   ├── config.json
│   └── README.md
│
├── backup.ps1
├── restore.ps1
├── backup.zip
└── README.md
```

---

# Backup Process

## Step 1 – Create Backup

Compress the application files into a ZIP archive.

```powershell
Compress-Archive -Path .\app\* -DestinationPath backup.zip -Force
```

---

## Step 2 – Upload Backup to Amazon S3

```powershell
aws s3 cp backup.zip s3://payment-service87654321/
```

Expected Output

```
upload: .\backup.zip to s3://payment-service87654321/backup.zip
```

---

## Step 3 – Verify Backup

```powershell
aws s3 ls s3://payment-service87654321/
```

Expected Output

```
backup.zip
```

---

# Disaster Simulation

Delete the local application files.

```powershell
Remove-Item .\app -Recurse -Force

Remove-Item .\backup.zip -Force
```

Verify that the files have been removed.

```powershell
dir
```

---

# Restore Process

## Step 1 – Download Backup

```powershell
aws s3 cp s3://payment-service87654321/backup.zip .
```

Expected Output

```
download: s3://payment-service87654321/backup.zip to .\backup.zip
```

---

## Step 2 – Extract Backup

```powershell
Expand-Archive .\backup.zip -DestinationPath .\restored -Force
```

---

## Step 3 – Verify Restored Files

```powershell
dir .\restored
```

Expected

```
app.js

config.json

README.md
```

---

## Step 4 – Verify Application File

```powershell
Get-Content .\restored\app.js
```

Expected Output

```javascript
console.log("Payment Service Started");
```

---

# Automation Scripts

## backup.ps1

Creates a ZIP archive of the application files and uploads it to Amazon S3.

## restore.ps1

Downloads the latest backup from Amazon S3 and restores the application files.

---

# Backup Strategy

| Item | Value |
|------|-------|
| Backup Target | Amazon S3 |
| Backup Type | ZIP Archive |
| Files Backed Up | Application Files, Configuration Files |
| Backup Frequency | Daily |
| Retention | 30 Days |
| Storage | Amazon S3 |
| Encryption | Server-Side Encryption (SSE-S3) |
| Restore Time | Few Minutes |

---

# Recovery Procedure

1. Download the latest backup from Amazon S3.
2. Extract the ZIP archive.
3. Verify application files.
4. Restart the application if required.
5. Perform application health checks.

---

# AWS Services Used

- Amazon S3
- AWS CLI

---

# Commands Used

```powershell
Compress-Archive -Path .\app\* -DestinationPath backup.zip -Force

aws s3 cp backup.zip s3://payment-service87654321/

aws s3 ls s3://payment-service87654321/

Remove-Item .\app -Recurse -Force

Remove-Item .\backup.zip -Force

aws s3 cp s3://payment-service87654321/backup.zip .

Expand-Archive .\backup.zip -DestinationPath .\restored -Force

Get-Content .\restored\app.js
```

---

# Screenshots

- S3 Bucket Created
- Backup Uploaded to S3
- S3 Bucket Contents
- Local Application Deleted
- Backup Downloaded from S3
- Restored Files
- Application Successfully Restored

---

# Conclusion

A backup and disaster recovery solution was implemented using **Amazon S3**. Application files and configuration files were compressed into a ZIP archive, uploaded to S3, and later restored after simulating data loss. The exercise demonstrates a simple, reliable backup workflow and a successful recovery process using AWS storage services.