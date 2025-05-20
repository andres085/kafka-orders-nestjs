# Kafka Orders Microservices System

This project demonstrates a microservices architecture using NestJS and Kafka for event-driven communication. The system consists of three separate services that work together to process orders.

## System Architecture

The system is built as a NestJS monorepo with three applications:

1. **Producer** - Accepts HTTP requests to create orders and publishes them to Kafka
2. **Consumer** - Subscribes to Kafka topics and processes incoming order messages
3. **Orders API** - Stores orders in memory and provides REST endpoints to query orders and statistics

### Flow of Data

1. Client sends a POST request to the Producer service to create an order
2. Producer publishes the order as a message to the Kafka "orders-topic"
3. Consumer listens to the "orders-topic" and processes incoming messages
4. Consumer forwards processed orders to the Orders API
5. Orders API stores the order in memory and updates order statistics
6. Client can query orders and statistics through the Orders API endpoints

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Docker and Docker Compose (for Kafka)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd kafka-orders-monorepo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start Kafka using Docker Compose

Start the Kafka services:

```bash
docker compose up -d
```

### 4. Start all microservices

```bash
# Start all services in development mode
npm run start:all

# Or start each service individually
npm run start:dev:producer
npm run start:dev:consumer
npm run start:dev:orders-api
```

The services will be available at:

- Producer: http://localhost:3001
- Orders API: http://localhost:3003
- Consumer: (No HTTP endpoint, runs as a Kafka consumer)
- Kafka UI: http://localhost:8080 (for monitoring Kafka)

## Service Endpoints

### Producer Service (port 3001)

| Method | Endpoint | Description                             |
| ------ | -------- | --------------------------------------- |
| POST   | /orders  | Create a new order and send it to Kafka |

#### Example: Create a new order

```bash
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "products": [
      { "id": "prod-1", "name": "Product 1", "price": 19.99, "quantity": 2 }
    ],
    "totalAmount": 39.98
  }'
```

### Orders API (port 3003)

| Method | Endpoint      | Description                     |
| ------ | ------------- | ------------------------------- |
| GET    | /orders       | Retrieve all orders             |
| GET    | /orders/:id   | Retrieve a specific order by ID |
| GET    | /orders/stats | Get order statistics            |
| PATCH  | /orders/:id   | Update an existing order        |
| DELETE | /orders/:id   | Delete an order                 |

#### Example: Get all orders

```bash
curl -X GET http://localhost:3003/orders
```

#### Example: Get order statistics

```bash
curl -X GET http://localhost:3003/orders/stats
```

#### Example: Update an order

```bash
curl -X PATCH http://localhost:3003/orders/order-1234567890 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped"
  }'
```

#### Example: Delete an order

```bash
curl -X DELETE http://localhost:3003/orders/order-1234567890
```

## Testing the Complete Flow

1. Create an order through the Producer:

```bash
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "products": [
      { "id": "prod-1", "name": "Product 1", "price": 19.99, "quantity": 2 }
    ],
    "totalAmount": 39.98
  }'
```

2. Check that the Consumer processed the message (check console logs)

3. Verify the order was stored in the Orders API:

```bash
curl -X GET http://localhost:3003/orders
```

4. Check the updated order statistics:

```bash
curl -X GET http://localhost:3003/orders/stats
```

## Monitoring Kafka

You can monitor Kafka topics, messages, and consumers using the Kafka UI available at http://localhost:8080.

## Development

### Adding a New Microservice

```bash
# Generate a new app in the monorepo
nest generate app new-service
```

### Project Structure

```
kafka-orders-monorepo/
├── apps/
│   ├── producer/
│   │   └── src/
│   │       ├── kafka/
│   │       ├── orders/
│   │       ├── main.ts
│   │       └── producer.module.ts
│   ├── consumer/
│   │   └── src/
│   │       ├── orders-consumer/
│   │       ├── http-client/
│   │       ├── main.ts
│   │       └── consumer.module.ts
│   └── orders-api/
│       └── src/
│           ├── orders/
│           ├── main.ts
│           └── orders-api.module.ts
├── docker-compose.yml
├── nest-cli.json
├── package.json
└── README.md
```

## Understanding the Message Patterns

### Event-based (Fire and Forget)

The current implementation uses the event-based pattern with `emit()`:

```typescript
await kafkaService.emit('orders-topic', order);
```

The producer sends a message and doesn't wait for a response.

### Request-Response

If you need a response from the consumer, you can use the `send()` method instead:

```typescript
const response = await kafkaService.send('orders-topic', order);
```

For this to work, the consumer must return a value and the producer must subscribe to response topics:

```typescript
// Producer setup
async onModuleInit() {
  this.kafkaClient.subscribeToResponseOf('orders-topic');
  await this.kafkaClient.connect();
}

// Consumer handler
@MessagePattern('orders-topic')
handleOrderCreated(data) {
  // Process order
  return { success: true, orderId: data.id };
}
```

## Shutting Down

To stop all services:

```bash
# Stop NestJS applications
Ctrl+C (if running in terminal)

# Stop Kafka and related services
docker-compose down
```
