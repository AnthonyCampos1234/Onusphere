# Truck Loading Helper - Frontend/Backend Integration

This document outlines the current state of the Truck Loading Helper tool and what backend components need to be implemented to make it fully functional.

## Overview

The Truck Loading Helper is a tool for managing customers and their orders for truck loading purposes. The frontend is already built with React and TypeScript and uses an email-based workflow for adding new orders where users forward emails to orders@onusphere.com.

### Backend Components (Needed)

The backend uses FastAPI with MongoDB (via mongoengine) and already has authentication infrastructure in place.

## Required Backend Implementation

### 1. Model Enhancements

Existing models need to be enhanced:

- **Customer Model**: Add location, contact info, and reference to owner account
- **Order Model**: Add status (pending/loaded/delivered), priority, and loading instructions
- **Item Model**: Add name, weight, and fragility properties

### 2. API Endpoints

Create a dedicated router `/backend/routes/truck_loading.py` with these endpoints:

```
# Customer Endpoints
GET    /api/truck-loading/customers
GET    /api/truck-loading/customers/{id}
POST   /api/truck-loading/customers
PUT    /api/truck-loading/customers/{id}
// you just mock delete them by using a boolean so they cant see it but its still in the database
DELETE /api/truck-loading/customers/{id}

# Order Endpoints
GET    /api/truck-loading/orders
GET    /api/truck-loading/customers/{customer_id}/orders
GET    /api/truck-loading/orders/{id}
POST   /api/truck-loading/orders
PUT    /api/truck-loading/orders/{id}
PUT    /api/truck-loading/orders/{id}/status
// you just mock delete them by using a boolean so they cant see it but its still in the database
DELETE /api/truck-loading/orders/{id}

# Email Processing
POST   /api/truck-loading/email-processor/webhook
GET    /api/truck-loading/email-processor/status/{process_id}

# Loading Plan Generation
POST   /api/truck-loading/orders/{id}/generate-loading-plan
```

### 3. Email Processing System

Create a system to:
- Receive emails forwarded to orders@onusphere.com
- Require users to add the customer ID in the subject line of the forwarded email (format: "[CUSTOMER_ID] Original Subject") to associate orders with customers even when the sender's email isn't registered with the account
- Extract customer and order information
- Create orders in the database
- Generate loading instructions
