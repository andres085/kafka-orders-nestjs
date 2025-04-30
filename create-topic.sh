#!/bin/bash

# Configuration variables
KAFKA_HOST="kafka:9092"
KAFKA_BIN="/opt/bitnami/kafka/bin"

# Define topics to create
declare -A TOPICS
TOPICS=(
  ["orders-topic"]="partitions=1,replication=1"
)

# Enable verbose mode for debugging
set -x

echo "Script starting. Attempting to connect to Kafka at $KAFKA_HOST"

# Test network connectivity
echo "Testing network connectivity to Kafka broker..."
ping -c 2 kafka || echo "Cannot ping Kafka host - this might be normal in some Docker setups"

# Function to check if Kafka is ready
check_kafka() {
  echo "Checking if Kafka is ready..."
  $KAFKA_BIN/kafka-topics.sh --bootstrap-server $KAFKA_HOST --list --command-config /tmp/client.properties
  return $?
}

# Create client properties file with longer timeout
cat > /tmp/client.properties << EOF
request.timeout.ms=10000
retry.backoff.ms=500
EOF

# Wait for Kafka to be ready
wait_for_kafka() {
  local max_attempts=60
  local attempt=1
  
  while ! check_kafka; do
    if [ $attempt -ge $max_attempts ]; then
      echo "Max attempts reached. Kafka is not available."
      exit 1
    fi
    
    echo "Waiting for Kafka to be ready... (Attempt $attempt/$max_attempts)"
    attempt=$((attempt + 1))
    sleep 10
  done
  
  echo "Kafka is ready!"
}

# Create topics if they don't exist
create_topics() {
  # Check if topics already exist
  echo "Checking for existing topics..."
  $KAFKA_BIN/kafka-topics.sh --bootstrap-server $KAFKA_HOST --list
  
  # Process each topic in the TOPICS array
  for topic in "${!TOPICS[@]}"; do
    # Parse the configuration string
    config="${TOPICS[$topic]}"
    partitions=$(echo $config | sed -E 's/.*partitions=([0-9]+).*/\1/')
    replication=$(echo $config | sed -E 's/.*replication=([0-9]+).*/\1/')
    
    echo "Checking if topic '$topic' already exists..."
    if $KAFKA_BIN/kafka-topics.sh --bootstrap-server $KAFKA_HOST --list | grep -q "^$topic$"; then
      echo "Topic '$topic' already exists."
    else
      echo "Creating topic '$topic'..."
      $KAFKA_BIN/kafka-topics.sh --bootstrap-server $KAFKA_HOST --create \
        --topic "$topic" \
        --partitions "$partitions" \
        --replication-factor "$replication"
      
      if [ $? -eq 0 ]; then
        echo "Topic '$topic' created successfully."
      else
        echo "Failed to create topic '$topic'."
        # Continue with other topics instead of exiting
        # exit 1
      fi
    fi
  done
}

# Main execution
echo "Starting Kafka topic creation script..."
wait_for_kafka
create_topics
echo "Topic creation process completed."

# Disable verbose mode
set +x

# Sleep to give Kafka time to fully initialize topics
echo "Waiting 10 seconds for topics to fully initialize..."
sleep 10

# Exit with success code
exit 0