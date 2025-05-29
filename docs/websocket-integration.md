# WebSocket Integration Guide

## Overview

MockVerse backend provides real-time WebSocket functionality using Socket.IO for instant notifications about video analysis progress, interview updates, and system events.

## Key Features

- ✅ **Production-ready**: Redis adapter for horizontal scaling
- ✅ **Authentication**: JWT-based user authentication
- ✅ **User-specific rooms**: Users only receive their own events
- ✅ **Auto-reconnection**: Built-in connection recovery
- ✅ **Event constants**: Standardized event names
- ✅ **Error handling**: Robust error management

## Frontend Integration

### Installation

```bash
npm install socket.io-client
```

### Basic Setup

```javascript
import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:8080';
    
    this.socket = io(serverUrl, {
      auth: {
        token: token // JWT token from login
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from WebSocket:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚫 Connection error:', error.message);
    });

    this.socket.on('connected', (data) => {
      console.log('🎉 Welcome message:', data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

export default new WebSocketService();
```

### Video Analysis Events

```javascript
// Event constants (keep in sync with backend)
export const WEBSOCKET_EVENTS = {
  // Analysis events
  ANALYSIS_STARTED: "analysis:started",
  ANALYSIS_PROGRESS: "analysis:progress",
  ANALYSIS_COMPLETED: "analysis:completed",
  ANALYSIS_FAILED: "analysis:failed",
  
  // Interview events
  INTERVIEW_UPDATED: "interview:updated",
  INTERVIEW_DELETED: "interview:deleted",
  
  // Report events
  REPORT_GENERATED: "report:generated",
  REPORT_UPDATED: "report:updated",
  
  // System events
  SERVER_SHUTDOWN: "server:shutdown",
  MAINTENANCE_MODE: "maintenance:mode",
};

// Listen for video analysis events
class VideoAnalysisService {
  constructor(webSocketService) {
    this.ws = webSocketService;
    this.setupAnalysisListeners();
  }

  setupAnalysisListeners() {
    // Analysis started
    this.ws.socket.on(WEBSOCKET_EVENTS.ANALYSIS_STARTED, (data) => {
      console.log('📹 Analysis started:', data);
      this.handleAnalysisStarted(data);
    });

    // Analysis completed
    this.ws.socket.on(WEBSOCKET_EVENTS.ANALYSIS_COMPLETED, (data) => {
      console.log('✅ Analysis completed:', data);
      this.handleAnalysisCompleted(data);
    });

    // Analysis failed
    this.ws.socket.on(WEBSOCKET_EVENTS.ANALYSIS_FAILED, (data) => {
      console.error('❌ Analysis failed:', data);
      this.handleAnalysisFailed(data);
    });
  }

  handleAnalysisStarted(data) {
    // Update UI to show analysis in progress
    const { interviewId, message, status } = data;
    
    // Example: Update React state
    // setAnalysisStatus(interviewId, { status, message, timestamp: data.timestamp });
    
    // Example: Show toast notification
    // toast.info(`Video analysis started for interview ${interviewId}`);
  }

  handleAnalysisCompleted(data) {
    // Update UI to show completed analysis
    const { interviewId, analysis, status } = data;
    
    // Example: Update interview data in state
    // updateInterviewAnalysis(interviewId, analysis);
    
    // Example: Show success notification
    // toast.success('Video analysis completed! Check your interview report.');
    
    // Example: Refresh interview report
    // refreshInterviewReport(interviewId);
  }

  handleAnalysisFailed(data) {
    // Handle analysis failure
    const { interviewId, error, retryable } = data;
    
    // Example: Show error notification
    // toast.error(`Analysis failed: ${error}`);
    
    // Example: Show retry option if retryable
    // if (retryable) {
    //   showRetryOption(interviewId);
    // }
  }
}
```

### React Hook Example

```javascript
import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import webSocketService from '../services/websocket.service';
import { WEBSOCKET_EVENTS } from '../constants/websocket';

export const useWebSocket = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector(state => state.auth);
  const isConnected = webSocketService.isConnected;

  const connect = useCallback(() => {
    if (token && !isConnected) {
      webSocketService.connect(token);
    }
  }, [token, isConnected]);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!webSocketService.socket) return;

    const handleAnalysisStarted = (data) => {
      dispatch({ type: 'ANALYSIS_STARTED', payload: data });
    };

    const handleAnalysisCompleted = (data) => {
      dispatch({ type: 'ANALYSIS_COMPLETED', payload: data });
      // You might want to refetch interview data here
    };

    const handleAnalysisFailed = (data) => {
      dispatch({ type: 'ANALYSIS_FAILED', payload: data });
    };

    // Register listeners
    webSocketService.socket.on(WEBSOCKET_EVENTS.ANALYSIS_STARTED, handleAnalysisStarted);
    webSocketService.socket.on(WEBSOCKET_EVENTS.ANALYSIS_COMPLETED, handleAnalysisCompleted);
    webSocketService.socket.on(WEBSOCKET_EVENTS.ANALYSIS_FAILED, handleAnalysisFailed);

    // Cleanup
    return () => {
      if (webSocketService.socket) {
        webSocketService.socket.off(WEBSOCKET_EVENTS.ANALYSIS_STARTED, handleAnalysisStarted);
        webSocketService.socket.off(WEBSOCKET_EVENTS.ANALYSIS_COMPLETED, handleAnalysisCompleted);
        webSocketService.socket.off(WEBSOCKET_EVENTS.ANALYSIS_FAILED, handleAnalysisFailed);
      }
    };
  }, [dispatch]);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
  };
};
```

### Vue.js Composition API Example

```javascript
import { ref, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';

export function useWebSocket() {
  const socket = ref(null);
  const isConnected = ref(false);

  const connect = (token) => {
    const serverUrl = process.env.VUE_APP_SERVER_URL || 'http://localhost:8080';
    
    socket.value = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.value.on('connect', () => {
      isConnected.value = true;
    });

    socket.value.on('disconnect', () => {
      isConnected.value = false;
    });

    // Analysis events
    socket.value.on('analysis:started', (data) => {
      console.log('Analysis started:', data);
      // Handle analysis started
    });

    socket.value.on('analysis:completed', (data) => {
      console.log('Analysis completed:', data);
      // Handle analysis completed
    });

    socket.value.on('analysis:failed', (data) => {
      console.error('Analysis failed:', data);
      // Handle analysis failed
    });
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    }
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  };
}
```

## Event Payloads

### Analysis Started Event
```javascript
{
  interviewId: "64a7b8c9d1e2f3g4h5i6j7k8",
  message: "Video analysis has started",
  status: "processing",
  timestamp: "2024-01-15T10:30:00.000Z",
  server: "production"
}
```

### Analysis Completed Event
```javascript
{
  interviewId: "64a7b8c9d1e2f3g4h5i6j7k8",
  message: "Video analysis completed successfully",
  status: "completed",
  analysis: {
    summary: "The candidate demonstrated strong technical skills...",
    analyzedAt: "2024-01-15T10:35:00.000Z",
    fileSize: 15728640
  },
  timestamp: "2024-01-15T10:35:00.000Z",
  server: "production"
}
```

### Analysis Failed Event
```javascript
{
  interviewId: "64a7b8c9d1e2f3g4h5i6j7k8",
  message: "Video analysis failed",
  status: "failed",
  error: "Video processing timeout",
  retryable: true,
  failedAt: "2024-01-15T10:35:00.000Z",
  timestamp: "2024-01-15T10:35:00.000Z",
  server: "production"
}
```

## Testing

### Testing Endpoints

The backend provides testing endpoints for development:

```javascript
// Test sending a message to a specific user
POST /api/v1/websocket/test/emit-to-user
{
  "userId": "64a7b8c9d1e2f3g4h5i6j7k8",
  "event": "test:message",
  "message": "Hello from backend!"
}

// Test video analysis events
POST /api/v1/websocket/test/analysis-events/64a7b8c9d1e2f3g4h5i6j7k8
{
  "interviewId": "64a7b8c9d1e2f3g4h5i6j7k8"
}

// Get WebSocket statistics
GET /api/v1/websocket/stats

// Check if user is connected
GET /api/v1/websocket/user/64a7b8c9d1e2f3g4h5i6j7k8/status
```

### Test Client

```html
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Test Client</title>
    <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
</head>
<body>
    <div id="messages"></div>
    <script>
        const token = 'YOUR_JWT_TOKEN_HERE';
        
        const socket = io('http://localhost:8080', {
            auth: { token }
        });

        socket.on('connect', () => {
            console.log('Connected!');
            document.getElementById('messages').innerHTML += '<p>✅ Connected</p>';
        });

        socket.on('analysis:started', (data) => {
            console.log('Analysis started:', data);
            document.getElementById('messages').innerHTML += 
                `<p>📹 Analysis started for ${data.interviewId}</p>`;
        });

        socket.on('analysis:completed', (data) => {
            console.log('Analysis completed:', data);
            document.getElementById('messages').innerHTML += 
                `<p>✅ Analysis completed for ${data.interviewId}</p>`;
        });

        socket.on('analysis:failed', (data) => {
            console.log('Analysis failed:', data);
            document.getElementById('messages').innerHTML += 
                `<p>❌ Analysis failed for ${data.interviewId}: ${data.error}</p>`;
        });
    </script>
</body>
</html>
```

## Best Practices

### 1. Connection Management
- Connect when user logs in
- Disconnect when user logs out
- Handle reconnection automatically
- Monitor connection status

### 2. Error Handling
- Always handle connection errors
- Implement retry logic for failed operations
- Show meaningful error messages to users

### 3. Performance
- Only listen for events you need
- Remove event listeners when components unmount
- Use debouncing for rapid events

### 4. Security
- Always send JWT token for authentication
- Validate tokens on the server side
- Users only receive their own events

### 5. User Experience
- Show connection status in UI
- Display real-time progress updates
- Provide clear feedback for all events
- Handle offline scenarios gracefully

## Deployment Considerations

### Environment Variables
```bash
# WebSocket Configuration
CORS_ORIGIN=https://your-frontend-domain.com
ACCESS_TOKEN_SECRET=your-jwt-secret

# Redis Configuration (for scaling)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

### Load Balancer Configuration
When using multiple server instances, ensure your load balancer supports WebSocket connections:

```nginx
# Nginx configuration for WebSocket
upstream backend {
    server server1:8080;
    server server2:8080;
}

server {
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check if server is running and CORS settings
2. **Authentication Failed**: Verify JWT token is valid and not expired
3. **Events Not Received**: Ensure user is in correct room and event names match
4. **Disconnections**: Check network stability and Redis connection

### Debug Mode

Enable Socket.IO debug mode in development:

```javascript
localStorage.debug = 'socket.io-client:socket';
```

This will show detailed connection logs in the browser console. 