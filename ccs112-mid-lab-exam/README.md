# E-Commerce-System

## Objective: Create a full-stack eCommerce system using React for the frontend and Laravel for the backend. The system will include product management, checkout monitoring system, and a customer-facing storefront.
Requirements
1. Backend (Laravel)
  - Product Management API
    - Create, Read, Update, Delete (CRUD) operations for products
    - Fields: name, description, price, stock, image
    - Validation rules that item cannot be deleted once already in ordered list
  - Employee Checkout Monitoring API
    - List of all checkout transactions
    - View details of a checkout
    - Filter checkouts by date
  - Customer Orders API
    - Add items to cart
    - Checkout process (store order details)
    - Search for products
    - Validations rule that item cannot be added to cart if stock is empty.
  - Authentication
    - Employees: Access product management and checkout monitoring
    - Customers: Access the store and purchase products

2. Frontend (React)
  - Admin Panel (Employee)
    - Manage products (CRUD)
    - View and monitor checkout transactions
  - Customer Storefront
    - View product catalog
    - Serch for products
    - Add items to cart
    - Checkout process
    - View order summary
    - User Registration.
    - Validations rule that customers cannot add items to cart or check out if not registered.
    - UI/UX Considerations
    - Use Bootstrap for styling
    - Implement animation transitions where necessary (e.g., modal pop-ups)
    - Responsive design
