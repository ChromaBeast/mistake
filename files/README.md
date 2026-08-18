# Firebase Blog Automation Setup Script

A comprehensive Python script to set up and manage your Firebase Firestore database for the n8n car blog automation workflow.

## Prerequisites

1. **Python 3.7+** installed on your system
2. **Firebase Project** with Firestore enabled
3. **Service Account Key** from Firebase Console

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Get your Firebase Service Account key:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely

## Usage

### Initial Setup
Set up the database with sample data:
```bash
python firebase_blog_setup.py --service-account path/to/service-account.json --action setup
```

This will:
- Create 10 sample blog topics (pending status)
- Create 3 sample blogs (for context)
- Display database statistics

### View Database Statistics
```bash
python firebase_blog_setup.py --service-account path/to/service-account.json --action stats
```

### Add New Topics

#### Interactive Mode:
```bash
python firebase_blog_setup.py --service-account path/to/service-account.json --action add-topics
```

#### From JSON File:
```bash
python firebase_blog_setup.py --service-account blog-automation-86940-829f42d14c1c.json --action add-topics --topics-file sample_topics.json
```

### List Topics
```bash
# List all topics
python firebase_blog_setup.py --service-account path/to/service-account.json --action list-topics

# List only pending topics
python firebase_blog_setup.py --service-account path/to/service-account.json --action list-topics --status pending

# List completed topics
python firebase_blog_setup.py --service-account path/to/service-account.json --action list-topics --status completed
```

### List Recent Blogs
```bash
# List last 10 blogs (default)
python firebase_blog_setup.py --service-account path/to/service-account.json --action list-blogs

# List last 20 blogs
python firebase_blog_setup.py --service-account path/to/service-account.json --action list-blogs --limit 20
```

### Reset Topic Status
If a topic failed to process, reset it back to pending:
```bash
python firebase_blog_setup.py --service-account path/to/service-account.json --action reset-topic --topic-id TOPIC_ID_HERE
```

### Cleanup Old Blogs
Archive blogs older than 180 days (default):
```bash
python firebase_blog_setup.py --service-account path/to/service-account.json --action cleanup

# Archive blogs older than 90 days
python firebase_blog_setup.py --service-account path/to/service-account.json --action cleanup --days 90
```

### Export Data
Backup all data to JSON:
```bash
python firebase_blog_setup.py --service-account path/to/service-account.json --action export

# Export to specific file
python firebase_blog_setup.py --service-account path/to/service-account.json --action export --output backup_2024.json
```

## Command Reference

| Action | Description | Additional Options |
|--------|-------------|-------------------|
| `setup` | Initial database setup with sample data | - |
| `stats` | Show database statistics | - |
| `add-topics` | Add new topics | `--topics-file` (optional) |
| `list-topics` | List topics | `--status` (all/pending/completed) |
| `list-blogs` | List recent blogs | `--limit` (number) |
| `reset-topic` | Reset topic to pending | `--topic-id` (required) |
| `cleanup` | Archive old blogs | `--days` (threshold) |
| `export` | Export data to JSON | `--output` (filename) |

## Database Structure

### blogTopics Collection
```json
{
  "topic": "string",
  "status": "pending|in_progress|completed",
  "priority": 1-5,
  "keywords": ["array"],
  "createdAt": "timestamp",
  "processedAt": "timestamp",
  "blogId": "string"
}
```

### blogs Collection
```json
{
  "title": "string",
  "content": "string",
  "summary": "string",
  "status": "draft|published|archived",
  "author": "string",
  "category": "string",
  "tags": ["array"],
  "topicId": "string",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "views": "number",
  "seoMeta": {
    "description": "string",
    "keywords": ["array"]
  }
}
```

## Workflow Integration

After setting up the database with this script:

1. Import the n8n workflow JSON
2. Configure Firebase credentials in n8n
3. Configure Gemini API credentials
4. Test the workflow manually
5. Enable the daily schedule

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Permission denied | Check service account has Firestore read/write permissions |
| Module not found | Run `pip install -r requirements.txt` |
| Connection timeout | Check firewall settings and internet connection |
| Invalid credentials | Verify service account JSON file is correct |

## Best Practices

1. **Regular Backups**: Export data weekly using the export command
2. **Topic Management**: Add 10-15 new topics weekly to maintain fresh content
3. **Quality Control**: Review generated blogs periodically
4. **Cleanup**: Archive old blogs quarterly to maintain performance
5. **Priority System**: Use priority 5 for urgent/trending topics

## Security Notes

- Keep your service account JSON file secure
- Never commit the service account file to version control
- Use environment variables for production deployments
- Regularly rotate service account keys

## Support

For issues with:
- **This script**: Check the error messages and troubleshooting section
- **n8n workflow**: Verify credentials and node configurations
- **Firebase**: Check the Firebase Console for quotas and limits
- **Gemini API**: Verify API key and rate limits