# ShopSphere

ShopSphere is a full-stack e-commerce web application developed using the MERN stack. It provides a complete online shopping experience with secure user authentication, product management, shopping cart functionality, order processing, payment integration, and an admin dashboard. The project demonstrates modern full-stack development practices and follows a scalable architecture suitable for real-world applications.

## Features

### User Features

- User registration and login using JWT authentication
- Secure password hashing with bcrypt
- Browse and search products
- Filter products by category and price
- Product details page
- Shopping cart management
- Wishlist functionality
- Secure checkout process
- Razorpay payment integration
- Order history and order tracking
- User profile management

### Admin Features

- Dashboard with business statistics
- Product management (Create, Update, Delete)
- Category management
- Order management
- Inventory management
- User management

## Technology Stack

### Frontend

- React.js
- React Router
- Tailwind CSS
- Axios
- Context API
- Vite

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcrypt

### Payment Gateway

- Razorpay

### Cloud Services

- MongoDB Atlas
- Cloudinary

## Project Structure

```
ShopSphere
│
├── client
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── context
│   │   ├── services
│   │   ├── hooks
│   │   ├── assets
│   │   └── App.jsx
│
├── server
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── config
│   ├── utils
│   └── server.js
│
└── README.md
```

## Installation

Clone the repository.

```bash
git clone https://github.com/lokeshgoodboy123-prog/shopsphere.git

cd shopsphere
```

Install frontend dependencies.

```bash
cd client
npm install
```

Install backend dependencies.

```bash
cd ../server
npm install
```

## Environment Variables

Create a `.env` file inside the `server` directory and configure the following variables.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_razorpay_key

RAZORPAY_KEY_SECRET=your_razorpay_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name

CLOUDINARY_API_KEY=your_api_key

CLOUDINARY_API_SECRET=your_api_secret
```

## Running the Application

Start the backend server.

```bash
cd server
npm run dev
```

Start the frontend application.

```bash
cd client
npm run dev
```

## Core Modules

- Authentication
- Product Management
- Shopping Cart
- Wishlist
- Order Management
- Inventory Management
- Payment Processing
- Admin Dashboard
- User Profile Management

## Security

- JWT Authentication
- Password Hashing using bcrypt
- Protected API Routes
- Role-Based Authorization
- Environment Variable Configuration
- Input Validation

## API Modules

- Authentication API
- Product API
- Category API
- Cart API
- Wishlist API
- Order API
- Review API
- Payment API
- Admin API

## Future Enhancements

- Email notifications
- Coupon and discount system
- AI-powered product recommendations
- Sales analytics dashboard
- Invoice generation
- Multi-vendor marketplace support

## Developer

Lokesh

GitHub: https://github.com/lokeshgoodboy123-prog
