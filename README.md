# Construction Compliance Platform - Backend

This is the backend API for the Construction Compliance Platform, a SaaS solution that verifies building compliance with country regulations using algorithmic validation.

## Technology Stack

- **Backend:** Node.js + TypeScript + MongoDB
- **Email Verification:** Mailgun
- **Authentication:** JWT-based authentication
- **Payment System:** Stripe Integration

## Project Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Stripe Account
- Mailgun Account

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/construction-compliance
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

5. Create necessary directories:

```bash
mkdir -p data uploads
```

6. Place the `countries.json` file in the `data` directory

### Running the Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Running the Production Server

```bash
npm start
```

### Seeding the Database

To seed the database with sample data:

```bash
npm run seed
```

To remove all data:

```bash
npm run seed:delete
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/forgot-password` - Send password reset email
- `PUT /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/update-details` - Update user details
- `PUT /api/auth/update-password` - Update password
- `PUT /api/auth/update-email` - Update email
- `DELETE /api/auth/delete-account` - Delete account

### Project Endpoints

- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/:id` - Get a single project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `PUT /api/projects/:id/image` - Upload a project image
- `POST /api/projects/:id/share` - Share a project
- `DELETE /api/projects/:id/share/:userId` - Remove shared access

### Building Type Endpoints

- `GET /api/projects/:projectId/building-types` - Get all building types for a project
- `POST /api/projects/:projectId/building-types` - Create a new building type
- `GET /api/building-types/:id` - Get a single building type
- `PUT /api/building-types/:id` - Update a building type
- `DELETE /api/building-types/:id` - Delete a building type

### Space Endpoints

- `GET /api/building-types/:buildingTypeId/spaces` - Get all spaces for a building type
- `POST /api/building-types/:buildingTypeId/spaces` - Create a new space
- `GET /api/spaces/:id` - Get a single space
- `PUT /api/spaces/:id` - Update a space
- `DELETE /api/spaces/:id` - Delete a space

### Element Endpoints

- `GET /api/spaces/:spaceId/elements` - Get all elements for a space
- `POST /api/spaces/:spaceId/elements` - Create a new element
- `GET /api/elements/:id` - Get a single element
- `PUT /api/elements/:id` - Update an element
- `DELETE /api/elements/:id` - Delete an element
- `POST /api/elements/:id/compliance-check` - Run compliance check for an element

### Subscription Endpoints

- `GET /api/subscriptions/me` - Get current user's subscription
- `POST /api/subscriptions/checkout` - Create a checkout session
- `GET /api/subscriptions/success` - Handle successful subscription
- `DELETE /api/subscriptions/cancel` - Cancel subscription

### Admin Endpoints

- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get a single user
- `PUT /api/admin/users/:id/status` - Activate/deactivate user
- `DELETE /api/admin/users/:id` - Delete a user
- `GET /api/admin/projects` - Get all projects
- `GET /api/admin/projects/:id` - Get project details
- `GET /api/admin/logs` - Get system logs
- `GET /api/admin/subscriptions` - Get subscription stats

### City Endpoints

- `GET /api/cities/search` - Search cities
- `GET /api/cities/:name` - Get city details

## Project Structure

```
backend/
├── data/                 # Data files like countries.json
├── dist/                 # Compiled JavaScript files
├── src/                  # Source code
│   ├── config/           # Configuration files
│   ├── controllers/      # Request controllers
│   ├── middleware/       # Middleware functions
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── uploads/              # Uploaded files
├── .env                  # Environment variables
├── package.json          # Project dependencies
└── tsconfig.json         # TypeScript configuration
```

## Error Handling

The API uses conventional HTTP response codes to indicate the success or failure of requests:

- 2xx: Success
- 4xx: Client error
- 5xx: Server error

Each error response follows this format:

```json
{
  "success": false,
  "message": "Error message"
}
```

## License

This project is proprietary and confidential.
