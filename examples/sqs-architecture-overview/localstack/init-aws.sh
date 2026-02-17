#!/bin/bash
awslocal sqs create-queue \
  --queue-name orders-queue \
  --attributes '{"VisibilityTimeout":"5"}'
echo "Created queue: orders-queue (visibility timeout: 5s)"
