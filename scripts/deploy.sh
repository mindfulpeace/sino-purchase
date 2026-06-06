#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APP_DIR="$PROJECT_DIR/apps/sino-purchase-v2"

source "$APP_DIR/.env"

cd "$APP_DIR/dist"

if [ ! -f index.html ]; then
  echo "Error: dist/index.html not found. Run 'npm run build' first."
  exit 1
fi

echo "Uploading dist/ to ftp://$FTP_HOST$REMOTE_DIR ..."
lftp -e "set ftp:ssl-allow true; set ssl:verify-certificate false; mirror --reverse --delete --verbose . $REMOTE_DIR; quit" \
  -u "$FTP_USER:$FTP_PASS" "ftp://$FTP_HOST"
echo "Deploy complete."
