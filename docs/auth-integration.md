# Authentication Integration

This document outlines how the frontend authentication system has been connected to the backend authentication system in the Onusphere application.

## Architecture Overview

The authentication system follows these principles:

1. **JWT Token-based Authentication**: The backend generates JWT tokens that are stored on the frontend
2. **Protected Routes**: Dashboard and other protected areas require authentication
3. **Authenticated API Calls**: All API calls to protected endpoints include the authentication token

## Components Created/Modified

### Frontend

1. **Auth Service** (`/frontend/dashboard/lib/services/auth.ts`)
   - Handles login, signup, and token management
   - Manages local storage of authentication tokens

2. **Auth Context** (`/frontend/dashboard/lib/context/AuthContext.tsx`)
   - Provides authentication state across the application
   - Exposes authentication methods to components

3. **Protected Route Component** (`/frontend/dashboard/lib/components/ProtectedRoute.tsx`)
   - HOC that redirects unauthenticated users
   - Applied to dashboard routes

4. **API Utilities** (`/frontend/dashboard/lib/utils/api.ts`)
   - Authenticated request functions (GET, POST, PUT, DELETE)
   - Automatically includes the auth token in requests

5. **Login/Register Pages**
   - Connected to backend auth endpoints
   - Proper error handling and user feedback

6. **Auth Redirect Handler** (`/frontend/dashboard/lib/components/AuthRedirect.tsx`)
   - Handles token expiration
   - Automatically logs users out on 401 errors

7. **User Data Hook** (`/frontend/dashboard/lib/hooks/useUser.ts`)
   - Fetches and provides current user information

### Backend

1. **User Endpoint** (`/backend/routes/routes.py`)
   - Added `/me` endpoint to return current user info
   - Uses JWT token for user identification

2. **Auth Dependencies** (`/backend/utils/dependencies.py`)
   - Token verification middleware
   - User extraction from tokens

## Authentication Flow

1. User enters credentials on login page
2. Frontend sends credentials to backend `/login` endpoint
3. Backend verifies credentials and returns JWT token
4. Frontend stores token in local storage
5. Protected routes check for token presence
6. API requests include token in Authorization header
7. Backend validates token for protected endpoints

## Truck Loading Helper Integration

The Truck Loading Helper now uses authenticated API calls through the API client at:
- `/frontend/dashboard/lib/services/truck-loading-api.ts`

This ensures all data access is properly authenticated and tied to the user's session. The Truck Loading Helper application manages customers and their orders for truck loading purposes, including:

- Viewing and adding customers
- Managing orders within each customer
- Updating order status (pending, loaded, delivered)
- Processing orders via email (forwarded to orders@onusphere.com)

The authentication system ensures that only authorized users can access this functionality.

## Usage Example

```typescript
// In a component that needs auth state
import { useAuth } from '@/lib/context/AuthContext';
import { useUser } from '@/lib/hooks/useUser';

export default function MyComponent() {
  const { isAuthenticated, logout } = useAuth();
  const { user, loading } = useUser();
  
  // Use auth state and user data
}
```

## Testing Authentication

1. Login with valid credentials - you should be redirected to dashboard
2. Access protected routes - should only be possible when authenticated
3. Check user profile in header - should display current user's name
4. Logout - should clear token and redirect to login page
