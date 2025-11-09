First Start:-

1) # Remove old data and restart fresh
docker-compose down -v
docker-compose up -d main-db files-db

-- In your app startup
CREATE DATABASE IF NOT EXISTS asset_platform_main;
CREATE DATABASE IF NOT EXISTS asset_platform_files;

