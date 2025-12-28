# Scan & Bill: Smart Self-Checkout System

Scan & Bill is a modern, web-based self-checkout application designed to streamline the shopping experience. It features unique item tracking, an intuitive monochrome interface, and real-time inventory management.

## 🚀 Features

- **Monochrome Aesthetic**: A clean, high-contrast black and white UI for a professional, minimalist look.
- **Unique Item Tracking (Serial Numbers)**: Every physical unit is tracked individually. Selling one unit marks only that specific item as SOLD while the rest of the stock remains available.
- **Product Discovery**: 
  - **Search Bar**: Quickly find products by name or category.
  - **Grid View**: A responsive, 2-column grid for easy browsing.
- **Real-time Feedback**: Instant notifications (Toasts) when adding or removing items from the basket.
- **Transaction History**: An activity dashboard to view past orders, including customer details (Name, Mobile) and itemized lists.
- **Mass Inventory**: Pre-seeded with 60+ unique units across 10 diverse product categories.

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.2
- **Database**: MongoDB (Spring Data MongoDB)
- **Architecture**: RESTful API
- **Language**: Java 17

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Vanilla CSS (Monochrome Design System)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **API Client**: Axios

## 📦 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MongoDB running on `localhost:27017`

### Backend Setup
1. Navigate to the `backend/` directory.
2. Run the application:
   ```bash
   mvn spring-boot:run
   ```
   *The database will auto-seed with 60+ items on first run.*

### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the application at `http://localhost:5173`.

## 📖 How to Use

1. **Browse**: Open the **Scan** tab. Use the search bar or grid to find a product.
2. **Select Unit**: Click a product to see available unique **Serial Numbers**. Pick one to add to your basket.
3. **Review**: Check the **Cart** tab to see your selections. You can remove specific units here.
4. **Pay**: Go to the **Pay** tab, enter your details (Name & Mobile), and finalize the purchase.
5. **View History**: Check the **Activity** tab to see your transaction confirmed in the history log.

---

Built with ❤️ by **Prem Singh Sengar** and **Antigravity**
