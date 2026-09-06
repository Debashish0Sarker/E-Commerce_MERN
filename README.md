# 🛒 MERN E-Commerce Marketplace with AI Shopping Assistant

A modern, full-stack e-commerce marketplace built on the **MERN** stack (MongoDB, Express.js, React, Node.js) with Tailwind CSS, DaisyUI, and an intelligent **AI Shopping Assistant** powered by Google Gemini 2.5 Flash.

---

## ✨ Features

- 🤖 **AI Shopping Assistant (Chatbot)**:
  - Ask in natural language (e.g., *"Show me electronics under $100"*, *"Find brand new clothing with at least 2 in stock"*, *"Show the cheapest used cars"*).
  - Automatically recommends items and **sorts/filters the dashboard in real-time**.
  - Powered by Google Gemini (`gemini-2.5-flash`) with a smart built-in semantic parser fallback.
- 👥 **Role-Based Authentication & Mode Switching**:
  - Supports **Customer**, **Seller**, and **Admin** accounts with secure JWT authentication and password hashing.
  - Sellers can toggle between **"Customer Mode"** and **"Seller Mode"** on the fly right from the navbar.
- 📦 **Inventory & Stock Management**:
  - Sellers specify exact stock quantities when creating listings.
  - Interactive quantity selection on product details (`-` / `+`) bounded by available inventory.
  - **Auto-Removal**: When a product sells out (`stock <= 0`), it is automatically removed from the public marketplace and purged from shopping carts.
  - **Self-Purchase Prevention**: Sellers are protected from purchasing or carting their own listings.
- 🖼️ **Product Image Support**:
  - Upload image files (PNG, JPG, WebP) directly from your computer or paste online image URLs.
  - Live image previews with instant removal controls.
- 🛒 **Database-Synced Shopping Cart**:
  - Persistent cart stored in MongoDB for logged-in users (no cart data lost on refresh or device change).
  - Strict stock validation prevents users from adding more items than available in inventory.
- 💳 **Checkout & Payment Simulation**:
  - Modal checkout supporting **Credit/Debit Card** (with card validation) and **Pay on Delivery (COD)**.
- 🌓 **Theme Customization**:
  - Instant Light Mode / Dark Mode toggle saved to local storage.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, DaisyUI, Lucide React, React Router 7, Axios, React Hot Toast |
| **Backend** | Node.js (ES Modules), Express.js, Mongoose, JSON Web Tokens (JWT), Bcryptjs, `@google/genai` |
| **Database** | MongoDB (Local MongoDB Community Server / Compass or MongoDB Atlas) |
| **AI / LLM** | Google Gemini 2.5 Flash (`@google/genai`) + Built-in Semantic Parser Fallback |

---

## 📋 Prerequisites

Before running this project, ensure you have the following installed on your machine:

1. **[Node.js](https://nodejs.org/)** (v18.x or higher recommended)
2. **[npm](https://www.npmjs.com/)** (bundled with Node.js)
3. **[MongoDB](https://www.mongodb.com/try/download/community)** (Community Server installed locally or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster)
4. **[Git](https://git-scm.com/)**

---

## 🚀 Step-by-Step Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Debashish0Sarker/E-Commerce_MERN.git
cd E-Commerce_MERN
```

---

### 2. Configure Environment Variables
Inside the `backend/` directory, create a `.env` file (you can copy the provided `.env.example`):

```bash
# On Windows (PowerShell)
Copy-Item backend/.env.example backend/.env

# On Linux / macOS
cp backend/.env.example backend/.env
```

Open `backend/.env` and adjust the values if needed:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/E-commerce
JWT_SECRET=your_super_secret_jwt_key_here
ADMIN_SECRET_CODE=B97DC694A65988062674EC184AC44550

# (Optional) Google Gemini API Key for AI Chatbot
# Get a free key from https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note**: Even if you don't provide a `GEMINI_API_KEY`, the AI chatbot will still function using its built-in rule-based semantic parser!

---

### 3. Start MongoDB
Ensure your MongoDB service is running locally:

- **Windows**:
  - Open **Services** (`services.msc`) and ensure **MongoDB Server** is running.
  - Or open **MongoDB Compass** and connect to `mongodb://localhost:27017`.
- **macOS / Linux**:
  ```bash
  sudo systemctl start mongod
  # or on macOS via Homebrew:
  brew services start mongodb-community
  ```

---

### 4. Install & Run the Backend Server
Open a terminal in the project root:

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server with nodemon
npm run dev
```

The backend server should start on **`http://localhost:5000`**:
```text
JWT_SECRET loaded: YES ✅
ADMIN_SECRET_CODE loaded: YES ✅
GEMINI_API_KEY loaded: YES ✅ (or using smart fallback)
Server is running on port 5000
Connected to MongoDB successfully!
```

---

### 5. Install & Run the Frontend Client
Open a **new terminal window** in the project root:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend will start on **`http://localhost:5173`**:
```text
  VITE v8.0.3  ready in 350 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

### 6. Open the App in Your Browser
Visit **`http://localhost:5173`** in your browser!

---

## 🧭 How to Test & Use the App

### 1. Register Accounts
- **Customer Account**: Click **Sign In** $\rightarrow$ **Sign Up**, fill in your details, and leave the role as `Customer`.
- **Seller Account**: Register with role set to `Seller`. Once registered, a **"Create Product"** button and a mode switch button (`Customer mode` $\leftrightarrow$ `Seller mode`) will appear in your top navbar.
- **Admin Account**: Register with role `Admin` and enter the `ADMIN_SECRET_CODE` configured in your `.env`.

### 2. List a Product (Seller)
1. Switch to **Seller Mode** in the navbar.
2. Click **Create Product** (`/create`).
3. Fill in product title, price, quantity/stock, condition (`New` or `Used`), and description.
4. **Add an image**: click **Browse** to upload an image from your device or paste an online image link.
5. Click **Publish Product Listing**.

### 3. Shopping & Checkout (Customer)
1. Browse listings on the public homepage. Use the search bar, category pills, or condition filters.
2. Click any product to open the **Product Details Page** (`/product/:id`).
3. Select your desired quantity with `-` and `+`.
4. Click **Buy Now** to purchase immediately via modal, or **Add to Cart** to review items in `/cart`.
5. Complete checkout using either **Credit Card** or **Cash on Delivery**.

### 4. Try the AI Shopping Assistant
1. Click the floating **Sparkles (AI)** icon at the bottom-right corner of the dashboard.
2. Type queries like:
   - *"Show me electronics under $100"*
   - *"Find brand new clothes with at least 2 in stock"*
   - *"What are the cheapest products?"*
3. Watch the chatbot recommend products and **automatically apply the matching filters and sort orders to the dashboard**!

---

## 📂 Project Structure

```text
E-Commerce_MERN/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration, login, profile, mode switch
│   │   │   ├── productController.js  # Product CRUD, stock management & direct buy
│   │   │   ├── cartController.js     # Database-backed cart operations & checkout
│   │   │   └── aiController.js       # AI Shopping Assistant (Gemini & Semantic fallback)
│   │   ├── middleware/
│   │   │   └── authMiddleware.js     # JWT verification & role authorization
│   │   ├── models/
│   │   │   ├── User.js               # User schema with cart array
│   │   │   └── Product.js            # Product schema with stock, image & seller ref
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth
│   │   │   ├── productRoutes.js      # /api/products
│   │   │   ├── cartRoutes.js         # /api/cart
│   │   │   └── aiRoutes.js           # /api/ai
│   │   └── server.js                 # Express app initialization
│   ├── .env.example                  # Environment variable template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Top navigation, cart badge, user badge, theme toggle
│   │   │   └── AIChatbot.jsx         # Floating AI Shopping Assistant widget
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # User state, JWT auth, seller mode switching
│   │   │   ├── CartContext.jsx       # Cart state synced with MongoDB
│   │   │   └── ThemeContext.jsx      # Light / Dark theme persistence
│   │   ├── lib/
│   │   │   └── axios.js              # Configured Axios instance with JWT interceptor
│   │   ├── pages/
│   │   │   ├── homepage.jsx          # Marketplace dashboard, filters & search
│   │   │   ├── SeeProduct.jsx        # Product details, quantity selector, checkout modal
│   │   │   ├── CartPage.jsx          # Shopping cart overview & checkout
│   │   │   ├── CreateProductPage.jsx # Product creation form with image upload
│   │   │   ├── LoginPage.jsx         # User login
│   │   │   ├── RegisterPage.jsx      # User registration with roles
│   │   │   └── ForgotPasswordPage.jsx
│   │   ├── App.jsx                   # Route configuration
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore                        # Git ignore configuration
└── README.md                         # Project documentation
```

---

## 📡 API Endpoints Overview

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new customer, seller, or admin | Public |
| `POST` | `/api/auth/login` | Log in and receive JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private |
| `PUT` | `/api/auth/switch-mode` | Toggle seller between customer & seller mode | Private (Seller) |

### Products (`/api/products`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Get all active products with stock > 0 | Public |
| `GET` | `/api/products/:id` | Get specific product details with seller info | Public |
| `POST` | `/api/products/upload` | Create product with stock and image | Private (Seller) |
| `POST` | `/api/products/:id/buy`| Buy product directly, deduct stock | Private (Customer) |

### Cart (`/api/cart`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Get current user's cart from database | Private |
| `POST` | `/api/cart/add` | Add product with quantity to cart | Private |
| `PUT` | `/api/cart/update` | Update item quantity in cart | Private |
| `DELETE`| `/api/cart/remove/:productId`| Remove item from cart | Private |
| `DELETE`| `/api/cart/clear` | Clear all items in cart | Private |
| `POST` | `/api/cart/checkout` | Checkout cart, deduct inventory | Private |

### AI Shopping Assistant (`/api/ai`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/chat` | Natural language product search, filter extraction & advice | Public |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Debashish0Sarker/E-Commerce_MERN/issues).

---
