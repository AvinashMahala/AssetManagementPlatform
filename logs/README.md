# 📁 Logs Directory

This directory contains all application logs for the Asset Management Platform.

## 📂 Structure

```
logs/
├── backend/          # Backend server logs (Node.js/Express)
│   ├── combined-YYYY-MM-DD.log      # All logs combined
│   ├── error-YYYY-MM-DD.log         # Error logs only
│   ├── warn-YYYY-MM-DD.log          # Warning logs
│   ├── info-YYYY-MM-DD.log          # Info logs
│   ├── http-YYYY-MM-DD.log          # HTTP request logs
│   ├── exceptions-YYYY-MM-DD.log    # Uncaught exceptions
│   └── rejections-YYYY-MM-DD.log    # Unhandled promise rejections
└── frontend/         # Frontend logs (stored in browser localStorage)
```

## 🔄 Log Rotation

- **Daily rotation**: New log files are created each day
- **Automatic compression**: Older logs are gzipped to save space
- **14-day retention**: Logs older than 14 days are automatically deleted
- **Max file size**: 20MB (rotates if exceeded before daily rotation)

## 📊 Log Format

**Console Output (Development):**
```
[2024-11-04 14:23:45] 🟢 INFO: User logged in
  📦 Metadata: {
    "userId": "123",
    "email": "user@example.com"
  }
```

**File Output (JSON for parsing):**
```json
{
  "timestamp": "2024-11-04 14:23:45",
  "level": "info",
  "message": "User logged in",
  "userId": "123",
  "email": "user@example.com"
}
```

## 🔍 Viewing Logs

### Live Tail
```bash
# All logs
tail -f logs/backend/combined-*.log

# Errors only
tail -f logs/backend/error-*.log

# With JSON formatting
tail -f logs/backend/combined-*.log | jq
```

### Search Logs
```bash
# Search for specific term
grep "payment" logs/backend/combined-*.log

# Search with context (3 lines before/after)
grep -C 3 "error" logs/backend/error-*.log

# Case-insensitive search
grep -i "user" logs/backend/combined-*.log
```

### Count Entries
```bash
# Count errors today
grep -c "error" logs/backend/error-$(date +%Y-%m-%d).log

# Count specific messages
grep -c "User logged in" logs/backend/info-*.log
```

## 🛡️ Security

- **Sensitive data**: Automatically redacted (passwords, tokens, API keys)
- **Access control**: Only server process and authorized users can read logs
- **No tracking**: Logs are stored locally and not sent to external services
- **Retention**: 14-day automatic cleanup to comply with data retention policies

## 📖 Documentation

For detailed information about the logging system:
- **Full Documentation**: `/docs/LOGGING_SYSTEM.md`
- **Quick Reference**: `/docs/LOGGING_QUICK_REFERENCE.md`

## ⚠️ Important Notes

1. **Never commit log files**: The `.gitignore` file ensures logs are not tracked by git
2. **Disk space**: Monitor disk usage as logs can grow large
3. **Production**: In production, consider log aggregation services (e.g., CloudWatch, Datadog)
4. **Performance**: Logging is async and has minimal performance impact

## 🚨 Troubleshooting

**Logs not appearing?**
- Check file permissions in this directory
- Verify the application has write access
- Check if the logging service is properly initialized

**Logs too large?**
- Logs automatically rotate at 20MB and are compressed
- Adjust retention period in logger configuration if needed

**Can't find specific logs?**
- Use the appropriate log file (error, info, etc.)
- Check the date in the filename
- Use grep or jq for searching

## 📞 Support

For issues with the logging system, refer to the documentation or contact the development team.
