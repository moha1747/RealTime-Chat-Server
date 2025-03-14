import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { 
  join_channel, 
  leave_channel, 
  send_message, 
  user_typing,
  createChannel,
  listChannel
} from './websocket/handler.ts';
import { start } from 'repl';
import mongoose from 'mongoose';
import express from 'express';

const app = express()

// Setup WebSocket server
const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server });
  console.log('WebSocket server is running');

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);

        // Route the message to the appropriate handler based on the event type
        switch(data.event) {
          case 'join_channel':
            join_channel(data, ws);
            break;
          case 'leave_channel':
            leave_channel(data, ws);
            break;
          case 'send_message':
            send_message(data, ws);
            break;
          case 'user_typing':
            user_typing(data, ws);
            break;
          case 'create_channel':
            createChannel(data, ws);
            break;
          case 'list_channel':
            listChannel(data, ws);
            break;
          default:
            console.log(`Unknown event type: ${data.event}`);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      // Any cleanup needed will happen in the specific channel leave handlers
    });
  });

  return wss;
};

// In your startServer function:
const startServer = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/ChatApp");
    console.log("✅ Connected to mongoose");

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    // Create an HTTP server instead of directly calling app.listen
    const server = http.createServer(app);

    // Start the HTTP server
    server.listen(8081, () => {
      console.log("🚀 Server is running on port 8081");
    });

    // Setup WebSocket on the same server
    setupWebSocket(server);

  } catch (error) {
    console.log("❌ MongoDB connection error: ", error);
    process.exit(1);
  }
};

startServer()