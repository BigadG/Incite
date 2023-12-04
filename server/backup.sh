# server/backup.sh

# MongoDB credentials and database name
USER="your_username"
PASS="your_password"
DB_NAME="InciteDB"

# Backup directory
BACKUPS_DIR="/path/to/your/backups/directory"
DATE=`date +%Y%m%d%H%M`

# Backup command
mongodump --db $DB_NAME --username $USER --password $PASS --out $BACKUPS_DIR/$DATE

# To automate this process, you can set up a cron job
