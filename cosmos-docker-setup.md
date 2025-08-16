# Azure Cosmos DB Emulator in Docker

## Docker Command Used

```bash
docker run -d --name cosmos-emulator \
  -p 8081:8081 \
  -p 10251:10251 \
  -p 10252:10252 \
  -p 10253:10253 \
  -p 10254:10254 \
  -e AZURE_COSMOS_EMULATOR_PARTITION_COUNT=10 \
  -e AZURE_COSMOS_EMULATOR_ENABLE_DATA_PERSISTENCE=true \
  mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator:latest
```

## Container Details

- **Container Name**: `cosmos-emulator`
- **Image**: `mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator:latest`
- **Status**: ✅ Running with 11/11 partitions started

## Connection Information

### Web UI Access
- **URL**: https://localhost:8081/_explorer/index.html
- **Note**: You may need to accept the self-signed certificate

### Connection String
```
AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
```

### Primary Key
```
C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==
```

## Port Mappings

- **8081**: Data Explorer and REST API
- **10251**: SQL API
- **10252**: MongoDB API
- **10253**: Table API  
- **10254**: Cassandra API

## Environment Variables

- `AZURE_COSMOS_EMULATOR_PARTITION_COUNT=10`: Sets the number of partitions
- `AZURE_COSMOS_EMULATOR_ENABLE_DATA_PERSISTENCE=true`: Enables data persistence

## Useful Docker Commands

```bash
# Check container status
docker ps | grep cosmos

# View logs
docker logs cosmos-emulator

# Stop the container
docker stop cosmos-emulator

# Start the container (if stopped)
docker start cosmos-emulator

# Remove the container
docker rm cosmos-emulator

# Get container IP
docker inspect cosmos-emulator | grep IPAddress
```

## Development Notes

- The emulator uses a self-signed certificate for HTTPS
- Data persists between container restarts due to the persistence flag
- All Azure Cosmos DB APIs are supported (SQL, MongoDB, Table, Cassandra)
- Perfect for local development and testing

## Next Steps

1. Access the Data Explorer at https://localhost:8081/_explorer/index.html
2. Create databases and containers
3. Use the connection string in your applications
4. Test your Cosmos DB integration locally
