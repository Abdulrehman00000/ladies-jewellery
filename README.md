# Zara Jewels - Premium Ladies Jewelry E-Commerce Platform

A luxurious, fully animated, responsive e-commerce platform designed for **Zara Jewels**. This application features a premium Royal Emerald Green & Warm Gold aesthetic, category filtering, persistent shopping cart, secure checkout via **EasyPaisa (03183707098)**, administrative control panel, and an automated database seeder.

This project is prepared for deployment on GitHub at the repository: **[Abdulrehman00000/ladies-jewellery](https://github.com/Abdulrehman00000/ladies-jewellery)**.

---

## ✨ Features
1. **Storefront Home**: Interactive hero layout, value propositions, and dynamic typography (`Cinzel` & `Outfit`).
2. **Interactive Cart**: Slide-out drawer with LocalStorage caching, quantity increments/decrements, and animations.
3. **10 Jewelry Categories**: Instantly filter products by category (Necklaces, Rings, Chokers, Bridal Sets, Kundan Jewelry, etc.).
4. **15 Premium Products**: Pre-seeded with high-definition Unsplash images and authentic pricing structure.
5. **EasyPaisa Checkout (03183707098)**: Modal with click-to-copy account holder name and number, transaction ID (TID) validation, and checkout.
6. **Double Checkout Paths**:
   - **Database Order Logger**: Submits customer and TID verification straight to the MongoDB collection.
   - **WhatsApp Checkout Button**: Formats order summary (items list, total amount, name, address, TID) and launches WhatsApp chat for direct confirmation.
7. **Admin Dashboard (`/admin.html`)**:
   - Authorized key lock (`admin123` password) to view transactions.
   - Order management table (Date, Customer Info, Items, Amount, TID).
   - Real-time KPI stats (Total Revenue, Total Orders, Pending Approvals, Shipped/Completed).
   - Status updating dropdown (Pending, Approved, Shipped, Cancelled) linking directly to MongoDB updates.
   - Order deletion handler.

---

## 🛠️ Tech Stack
- **Frontend**: Single-Page responsive design, Vanilla HTML5/CSS3, Vanilla JavaScript, Google Fonts, FontAwesome Icons.
- **Backend**: Node.js & Express.js REST API.
- **Database**: MongoDB (using Mongoose schemas).

---

## 🚀 Setup & Local Deployment

### Prerequisites
- Make sure [Node.js](https://nodejs.org/) (v16+) is installed.
- Make sure [MongoDB Community Server](https://www.mongodb.com/try/download/community) is installed and running locally, or configure a MongoDB Atlas connection string.

### 1. Install Project Dependencies
Open your command terminal in the project folder and run:
```bash
npm install
```

### 2. Configure Environment Variables
A `.env` file has been created. If your MongoDB is running locally, the default configuration will work. If you are using a MongoDB Atlas cloud database, modify the `MONGODB_URI` inside the `.env` file:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/zarajewels
```

### 3. Launch Development Server
Start the Express server:
```bash
npm run dev
```
*Alternatively, run `npm start` if `nodemon` is not installed on your system.*

### 4. Access the Website
- **Storefront URL**: Open [http://localhost:3000](http://localhost:3000) in your web browser.
- **Admin Dashboard URL**: Open [http://localhost:3000/admin.html](http://localhost:3000/admin.html) (Access password: `admin123`).

*Note: The first time the server successfully connects to MongoDB, it will automatically seed the 15 products with high-definition images, categories, and prices into the database.*

---

## 📦 How to Upload / Push to GitHub

To upload this project to your GitHub repository `https://github.com/Abdulrehman00000/ladies-jewellery`, follow these commands in your terminal:

### 1. Install Git (If not already installed)
If Git is not installed on your computer, download and install it from [git-scm.com](https://git-scm.com/).

### 2. Run Git Initialization & Commits
```powershell
# Initialize local git repository
git init

# Add all files to staging (excluding node_modules and .env due to .gitignore)
git add .

# Create the initial commit
git commit -m "Initial commit: Zara Jewels Premium Full-Stack E-commerce website"

# Rename branch to main
git branch -M main

# Link local repository to your remote GitHub repository
git remote add origin https://github.com/Abdulrehman00000/ladies-jewellery.git

# Push code to GitHub
git push -u origin main
```
Once executed, go to `https://github.com/Abdulrehman00000/ladies-jewellery` to see your project live on GitHub!
