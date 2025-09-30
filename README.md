<write_file>
<path>README.md</path>
# DigiStore - Digital Goods Marketplace

A modern, responsive digital goods marketplace built with React 19, Vite, and Tailwind CSS v4. This application provides a complete e-commerce solution for buying and selling digital products with admin management capabilities.

## 🚀 Quick Start

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DigitalGoodStorev2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📋 Features

### 🛍️ Customer Features
- **Product Browsing**: Modern grid layout with search functionality
- **Product Details**: Detailed product information with pricing
- **Shopping Cart**: Seamless cart management
- **Secure Checkout**: Multiple payment methods (bKash, Nagad)
- **Order Management**: View order history and digital keys
- **User Authentication**: Secure login and registration
- **Responsive Design**: Works perfectly on all devices

### ⚙️ Admin Features
- **Dashboard**: Comprehensive admin dashboard with analytics
- **Product Management**: Full CRUD operations for products
- **Order Management**: View and manage customer orders
- **User Management**: Manage user roles and permissions
- **Payment Management**: Configure payment methods and view transactions
- **Analytics**: Sales reports, user growth, and product performance
- **System Settings**: Configure application settings
- **Support Tickets**: Manage customer support requests

### 🎨 Design Features
- **Modern UI/UX**: Built with Tailwind CSS v4
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Micro-interactions and transitions
- **Dark/Light Mode**: Theme switching capability
- **Accessibility**: WCAG compliant design
- **Professional Layout**: Clean, modern interface

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
│   ├── Products.jsx    # Products listing page
│   └── Checkout.jsx    # Checkout process page
├── context/            # React context providers
│   ├── AuthContext.jsx # Authentication context
│   └── ProductContext.jsx # Product management context
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── api/                # API service modules
│   ├── apiBase.js      # Base API configuration
│   └── adminAPI.js     # Admin API functions
├── styles/             # CSS and styling files
├── assets/             # Static assets (images, icons)
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
└── index.css           # Global styles with Tailwind CSS
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:4002
VITE_APP_TITLE=DigiStore
VITE_APP_DESCRIPTION=Digital Goods Marketplace
```

### Tailwind CSS Configuration
The project uses Tailwind CSS v4 with custom configuration:

```javascript
// tailwind.config.js
export default defineConfig({
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
});
```

## 📱 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Static Hosting
The `dist` folder contains the production-ready application. You can deploy it to any static hosting service like:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

## 🔐 Authentication

### User Roles
- **Customer**: Can browse products, make purchases, view orders
- **Admin**: Full access to dashboard, product management, user management

### Login Flow
1. Navigate to `/login`
2. Enter email and password
3. Upon successful login, redirect based on user role:
   - Customers → `/customer`
   - Admins → `/admin`

### Registration Flow
1. Navigate to `/signup`
2. Fill in registration form
3. Upon successful registration, auto-login and redirect

## 🛍️ Shopping Flow

### Product Discovery
1. Browse products on homepage or `/products`
2. Use search functionality to find specific products
3. Click on product to view details

### Checkout Process
1. Click "Buy Now" on any product
2. Review order summary
3. Fill in payment information
4. Submit order
5. Receive confirmation and digital keys

### Order Management
1. Navigate to `/customer`
2. View order history
3. Copy digital keys for purchased products

## ⚙️ Admin Operations

### Product Management
1. Navigate to `/admin`
2. Go to "Products" tab
3. Add new products with the form
4. Edit existing products inline
5. Delete products with confirmation

### Order Management
1. Navigate to `/admin`
2. Go to "Orders" tab
3. View all customer orders
4. Update order status
5. Add digital keys to orders

### User Management
1. Navigate to `/admin`
2. Go to "Users" tab
3. View all registered users
4. Update user roles
5. Activate/deactivate user accounts

## 🎨 Styling Guide

### Color Palette
- **Primary**: Blue (#2563eb)
- **Secondary**: Purple (#7c3aed)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Danger**: Red (#ef4444)
- **Neutral**: Gray shades (#64748b, #f8fafc)

### Typography
- **Headings**: Inter, bold
- **Body**: Inter, regular
- **Code**: JetBrains Mono

### Components
- **Buttons**: Gradient backgrounds with hover effects
- **Cards**: White backgrounds with subtle shadows
- **Forms**: Modern input fields with icons
- **Navigation**: Sticky header with smooth transitions

## 🔧 Troubleshooting

### Common Issues

#### **White Screen on Checkout**
- **Cause**: Import statement error for `useLocation`
- **Solution**: Ensure `useLocation` is imported from `react-router-dom`
- **Fix**: 
  ```javascript
  import { useNavigate, useLocation } from "react-router-dom";
  ```

#### **Tailwind CSS Not Working**
- **Cause**: Incorrect Tailwind CSS v4 configuration
- **Solution**: Use `@import "tailwindcss";` in index.css
- **Fix**:
  ```css
  @import "tailwindcss";
  ```

#### **Build Errors**
- **Cause**: Missing dependencies or incorrect configuration
- **Solution**: 
  ```bash
  npm install
  npm run build
  ```

#### **API Connection Issues**
- **Cause**: Backend server not running or incorrect API URL
- **Solution**: 
  - Ensure backend server is running on port 4002
  - Check API_BASE_URL in environment variables

### Development Tips

1. **Hot Reload**: The development server supports hot reload for instant updates
2. **Console Logging**: Check browser console for errors and debugging information
3. **Network Tab**: Use browser dev tools to monitor API calls
4. **Responsive Testing**: Use browser dev tools to test different screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style Guidelines
- Use ESLint configuration provided
- Follow Prettier formatting
- Write meaningful commit messages
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team**: For the amazing React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Vite**: For the fast development tool
- **React Router**: For client-side routing
- **Heroicons**: For the beautiful icon set

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the troubleshooting section

---

**Built with ❤️ using React 19, Vite, and Tailwind CSS v4**
</content>
</write_file>