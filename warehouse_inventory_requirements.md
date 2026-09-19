# Warehouse Inventory Management System

## 1. Project Overview

### 1.1 Objective

Build a simple, secure, and maintainable **Warehouse Inventory
Management System** where authenticated users can manage products,
warehouses, and stock.

The system must support role-based access control, inventory validation,
stock transfers, low-stock identification, and a responsive user
interface.

### 1.2 Primary Goals

-   Provide secure login and logout functionality.
-   Allow administrators to manage products and warehouses.
-   Allow warehouse staff to manage stock operations.
-   Maintain accurate inventory across multiple warehouses.
-   Prevent invalid stock operations and negative inventory.
-   Display low-stock products clearly.
-   Provide a responsive and user-friendly frontend.
-   Maintain clean separation between frontend, backend, and database
    responsibilities.

------------------------------------------------------------------------

## 2. Preferred Technology Stack

The implementation may use the following technologies:

  Layer             Preferred Technology
  ----------------- --------------------------------------------------------
  Frontend          React.js
  Backend           Node.js with Express.js
  Database          MongoDB
  Authentication    JWT
  API Style         REST API
  Styling           Tailwind CSS
  API Client        Axios
  Validation        Frontend and backend validation
  Version Control   Git

### 2.1 Recommended Implementation

For a simple and maintainable implementation:

-   Frontend: React.js with Vite
-   Backend: Node.js and Express.js
-   Database: MongoDB with Mongoose
-   Authentication: JWT stored using a secure HTTP-only cookie where
    applicable
-   Data Fetching: TanStack Query or a comparable server-state solution
-   Validation: A schema validation library such as Zod, Joi, or
    express-validator

The final technology selection can be adjusted based on project
constraints.

------------------------------------------------------------------------

## 3. User Roles and Permissions

The system must support two roles:

1.  Admin
2.  Warehouse Staff

### 3.1 Permission Matrix

  Capability               Admin   Warehouse Staff
  ---------------------- ------- -----------------
  Login                      Yes               Yes
  Logout                     Yes               Yes
  View dashboard             Yes               Yes
  View products              Yes               Yes
  Add products               Yes                No
  Update products            Yes                No
  Delete products            Yes                No
  Search products            Yes               Yes
  View warehouses            Yes               Yes
  Add warehouses             Yes                No
  Update warehouses          Yes                No
  Delete warehouses          Yes                No
  View inventory             Yes               Yes
  Add stock                  Yes               Yes
  Remove stock               Yes               Yes
  Transfer stock             Yes               Yes
  View low-stock items       Yes               Yes

### 3.2 Authorization Requirements

-   Authentication must be enforced on protected APIs.
-   Authorization must be enforced on the backend.
-   Frontend controls must hide or disable unauthorized actions for
    usability.
-   Frontend restrictions must not be treated as the primary security
    mechanism.
-   A user must not be able to perform an unauthorized action by
    manually calling an API.
-   Role values must be controlled and validated by the backend.

------------------------------------------------------------------------

## 4. Authentication and Login Flow

### 4.1 Login Requirements

Users must be able to log in using:

-   Email address
-   Password

The backend must:

1.  Validate the request payload.
2.  Find the user using the provided email.
3.  Verify the password securely.
4.  Reject invalid credentials with an appropriate error response.
5.  Generate an authentication token after successful authentication.
6.  Return the authenticated user information and session result.
7.  Allow the frontend to redirect the user to the dashboard.

### 4.2 Authentication Flow

``` text
User opens login page
        |
        v
User enters email and password
        |
        v
Frontend validates input
        |
        v
Frontend sends login request
        |
        v
Backend validates credentials
        |
        v
Password verification
        |
        v
JWT token generated
        |
        v
Authentication session established
        |
        v
User redirected to dashboard
```

### 4.3 JWT Requirements

The JWT should contain only necessary claims, such as:

-   User ID
-   Role
-   Issued-at timestamp
-   Expiration timestamp

Security requirements:

-   Use a strong secret stored in environment variables.
-   Configure token expiration.
-   Do not hardcode secrets.
-   Do not store sensitive information inside the token.
-   Validate token signature and expiration on protected requests.
-   Return an appropriate response when the token is missing, invalid,
    or expired.

### 4.4 Protected Pages

Unauthenticated users must not access protected pages such as:

-   Dashboard
-   Products
-   Warehouses
-   Inventory
-   Low-stock views

Unauthenticated users should be redirected to the login page.

### 4.5 Logout

Logout must:

-   Invalidate or remove the authentication session according to the
    selected token strategy.
-   Clear the authentication cookie if cookies are used.
-   Clear frontend authentication state.
-   Redirect the user to the login page.
-   Prevent access to protected pages after logout.

### 4.6 Authentication API Endpoints

``` http
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/logout
```

------------------------------------------------------------------------

## 5. Functional Requirements

## 5.1 Product Management

### 5.1.1 Product Fields

Each product must contain:

  ------------------------------------------------------------------------
  Field            Type                          Required Validation
  ---------------- ---------------- --------------------- ----------------
  Name             String                             Yes Must not be
                                                          empty

  SKU              String                             Yes Must be unique

  Category         String                             Yes Must not be
                                                          empty

  Price            Number                             Yes Must be greater
                                                          than or equal to
                                                          zero

  Minimum Stock    Number                             Yes Must be greater
  Level                                                   than or equal to
                                                          zero
  ------------------------------------------------------------------------

The inventory quantity should be managed through the inventory module
rather than being independently duplicated as a mutable product field.

### 5.1.2 Create Product

Only Admin users can create products.

Requirements:

-   Provide a product creation form.
-   Validate all required fields.
-   Validate that the SKU is unique.
-   Reject negative price values.
-   Reject negative minimum stock values.
-   Return a clear success or error response.
-   Refresh or update the product list after successful creation.

Example endpoint:

``` http
POST /api/v1/products
```

Example request:

``` json
{
  "name": "Laptop",
  "sku": "LAP-001",
  "category": "Electronics",
  "price": 50000,
  "minimumStockLevel": 10
}
```

### 5.1.3 View Products

Authenticated users can view products.

Requirements:

-   Display products in a table or responsive card layout.
-   Show name, SKU, category, price, and minimum stock level.
-   Display appropriate empty states.
-   Support loading and error states.
-   Support pagination when the dataset becomes large.

Example endpoints:

``` http
GET /api/v1/products
GET /api/v1/products/:id
```

### 5.1.4 Search Products

Authenticated users can search products.

Requirements:

-   Search by product name and/or SKU.
-   Support case-insensitive matching.
-   Debounce search input on the frontend where appropriate.
-   Perform filtering on the backend for scalable datasets.
-   Display a clear message when no products match the search.

Example:

``` http
GET /api/v1/products?search=laptop
```

### 5.1.5 Update Product

Only Admin users can update products.

Requirements:

-   Allow updating supported product fields.
-   Validate all updated values.
-   Preserve SKU uniqueness.
-   Reject negative price and minimum stock values.
-   Return the updated product.
-   Display validation errors in the UI.

Example endpoint:

``` http
PATCH /api/v1/products/:id
```

### 5.1.6 Delete Product

Only Admin users can delete products.

Requirements:

-   Display a confirmation dialog before deletion.
-   Verify that the product exists.
-   Define a policy for products with existing inventory.
-   Do not create orphaned inventory records.
-   Prefer soft deletion if auditability and historical records are
    required.

Example endpoint:

``` http
DELETE /api/v1/products/:id
```

Recommended business rule:

-   A product with non-zero stock should not be permanently deleted
    unless the inventory is cleared or an approved archival strategy is
    implemented.

------------------------------------------------------------------------

## 5.2 Warehouse Management

### 5.2.1 Warehouse Fields

Each warehouse must contain:

  Field      Type       Required Validation
  ---------- -------- ---------- ---------------------------------------
  Name       String          Yes Must not be empty
  Location   String          Yes Must not be empty
  Capacity   Number          Yes Must be greater than or equal to zero

### 5.2.2 Create Warehouse

Only Admin users can create warehouses.

Requirements:

-   Provide a warehouse creation form.
-   Validate required fields.
-   Validate capacity.
-   Reject empty names and locations.
-   Prevent duplicate warehouse names if this is a defined business
    rule.
-   Return a clear response after creation.

Example endpoint:

``` http
POST /api/v1/warehouses
```

Example request:

``` json
{
  "name": "Ahmedabad Warehouse",
  "location": "Ahmedabad",
  "capacity": 1000
}
```

### 5.2.3 View Warehouses

Authenticated users can view warehouses.

Requirements:

-   Display warehouse name, location, and capacity.
-   Display loading, empty, and error states.
-   Support responsive layouts.
-   Allow users to select warehouses during stock operations.

Example endpoints:

``` http
GET /api/v1/warehouses
GET /api/v1/warehouses/:id
```

### 5.2.4 Update Warehouse

Only Admin users can update warehouses.

Requirements:

-   Validate updated fields.
-   Prevent invalid capacity values.
-   Preserve warehouse references used by inventory records.
-   Display success and error feedback.

Example endpoint:

``` http
PATCH /api/v1/warehouses/:id
```

### 5.2.5 Delete Warehouse

Only Admin users can delete warehouses.

Requirements:

-   Ask for confirmation before deletion.
-   Verify that the warehouse exists.
-   Prevent deletion when stock is present unless an approved migration
    or archival process is followed.
-   Avoid orphaned inventory records.
-   Consider soft deletion for historical reporting.

Example endpoint:

``` http
DELETE /api/v1/warehouses/:id
```

------------------------------------------------------------------------

## 5.3 Inventory Management

### 5.3.1 Inventory Model

Inventory represents the quantity of a product stored in a specific
warehouse.

A recommended inventory record contains:

  Field          Description
  -------------- -----------------------------
  Product ID     Reference to the product
  Warehouse ID   Reference to the warehouse
  Quantity       Current available quantity
  Created At     Record creation timestamp
  Updated At     Last modification timestamp

The combination of `productId` and `warehouseId` should be unique.

Example:

``` json
{
  "productId": "product-object-id",
  "warehouseId": "warehouse-object-id",
  "quantity": 50
}
```

### 5.3.2 View Inventory

Authenticated users can view inventory.

Requirements:

-   Display product name and SKU.
-   Display warehouse name.
-   Display available quantity.
-   Display minimum stock level where useful.
-   Support filtering by product and warehouse.
-   Display low-stock indicators.
-   Provide clear empty, loading, and error states.

Example endpoint:

``` http
GET /api/v1/inventory
```

Possible filters:

``` http
GET /api/v1/inventory?productId=...
GET /api/v1/inventory?warehouseId=...
GET /api/v1/inventory?search=laptop
```

### 5.3.3 Add Stock

Admin and Warehouse Staff users can add stock.

Requirements:

-   Validate that the product exists.
-   Validate that the warehouse exists.
-   Validate that quantity is greater than zero.
-   Create an inventory record if one does not exist.
-   Increase existing inventory when a record already exists.
-   Validate warehouse capacity if capacity is defined as a hard limit.
-   Return the updated inventory record.

Example endpoint:

``` http
POST /api/v1/inventory/add
```

Example request:

``` json
{
  "productId": "product-object-id",
  "warehouseId": "warehouse-object-id",
  "quantity": 10
}
```

### 5.3.4 Remove Stock

Admin and Warehouse Staff users can remove stock.

Requirements:

-   Validate that the product exists.
-   Validate that the warehouse exists.
-   Validate that quantity is greater than zero.
-   Verify that sufficient stock is available.
-   Prevent inventory from becoming negative.
-   Update stock atomically.
-   Return a clear error when stock is insufficient.

Example endpoint:

``` http
POST /api/v1/inventory/remove
```

Example request:

``` json
{
  "productId": "product-object-id",
  "warehouseId": "warehouse-object-id",
  "quantity": 5
}
```

### 5.3.5 Transfer Stock

Admin and Warehouse Staff users can transfer stock between warehouses.

Requirements:

-   Validate the product.
-   Validate the source warehouse.
-   Validate the destination warehouse.
-   Ensure source and destination warehouses are different.
-   Validate that quantity is greater than zero.
-   Verify sufficient stock in the source warehouse.
-   Decrease stock in the source warehouse.
-   Increase stock in the destination warehouse.
-   Execute both updates atomically.
-   Roll back the operation if any part fails.

Example endpoint:

``` http
POST /api/v1/inventory/transfer
```

Example request:

``` json
{
  "productId": "product-object-id",
  "sourceWarehouseId": "source-warehouse-object-id",
  "destinationWarehouseId": "destination-warehouse-object-id",
  "quantity": 10
}
```

### 5.3.6 Transaction Requirements

Stock transfers must use a database transaction when supported by the
selected database.

For MongoDB:

-   Use a session and transaction.
-   Decrease source inventory.
-   Increase destination inventory.
-   Commit only when both operations succeed.
-   Abort or roll back when an operation fails.

For PostgreSQL:

-   Use a database transaction.
-   Lock or safely update affected inventory rows.
-   Commit both changes together.

### 5.3.7 Concurrency Requirements

Inventory updates must be safe when multiple users perform operations
simultaneously.

Requirements:

-   Use atomic conditional updates for stock removal.
-   Do not rely only on a read-then-write check.
-   Prevent race conditions that could produce negative inventory.
-   Return a conflict or validation response when stock changes between
    validation and update.
-   Ensure inventory consistency under concurrent requests.

------------------------------------------------------------------------

## 5.4 Inventory Validation Rules

The following rules are mandatory:

1.  Stock quantity cannot become negative.
2.  Remove quantity must be greater than zero.
3.  Transfer quantity must be greater than zero.
4.  Add quantity must be greater than zero.
5.  A user cannot remove more stock than is available.
6.  A user cannot transfer more stock than is available.
7.  Source and destination warehouses must be different.
8.  Product must exist before stock is added, removed, or transferred.
9.  Warehouse must exist before stock is added, removed, or transferred.
10. Product and warehouse references must be valid.
11. Inventory quantity must be numeric and valid.
12. Backend validation must be applied even if frontend validation
    exists.

Example validation errors:

``` json
{
  "success": false,
  "message": "Insufficient stock available"
}
```

``` json
{
  "success": false,
  "message": "Source and destination warehouses must be different"
}
```

------------------------------------------------------------------------

## 5.5 Low-Stock Management

### 5.5.1 Low-Stock Definition

A product is considered low-stock when its current stock is below its
minimum stock level.

Recommended calculation:

``` text
Total Product Stock = Sum of the product quantity across all warehouses

If Total Product Stock < Minimum Stock Level:
    Product is low-stock
```

Example:

``` text
Product: Laptop
Minimum Stock Level: 20

Warehouse A: 5
Warehouse B: 7
Warehouse C: 3

Total Stock: 15

15 < 20
Result: Low-stock product
```

The final behavior should be confirmed if minimum stock is intended to
be warehouse-specific instead of product-wide.

### 5.5.2 Low-Stock Requirements

-   Identify low-stock products.
-   Display low-stock products clearly.
-   Show current total stock.
-   Show minimum stock level.
-   Display low-stock status using a badge, alert, or highlighted row.
-   Make low-stock information available on the dashboard or inventory
    page.
-   Ensure the calculation is performed using current inventory data.

Example endpoint:

``` http
GET /api/v1/inventory/low-stock
```

------------------------------------------------------------------------

## 6. Dashboard Requirements

The dashboard must provide a summarized view of the system.

### 6.1 Dashboard Metrics

Recommended summary cards:

-   Total products
-   Total warehouses
-   Total stock quantity
-   Number of low-stock products

### 6.2 Dashboard Components

-   Summary cards
-   Low-stock product table
-   Recent inventory activity, if implemented
-   Quick links to inventory and management pages
-   Role-appropriate actions

### 6.3 Dashboard API

``` http
GET /api/v1/dashboard/summary
```

Example response:

``` json
{
  "success": true,
  "data": {
    "totalProducts": 120,
    "totalWarehouses": 5,
    "totalStockQuantity": 4500,
    "lowStockProducts": 8
  }
}
```

------------------------------------------------------------------------

## 7. Frontend Requirements

The frontend must be responsive, user-friendly, and role-aware.

## 7.1 Required Pages

### Login Page

Requirements:

-   Email input
-   Password input
-   Client-side validation
-   Login button
-   Loading state during submission
-   Error message for invalid credentials
-   Redirect to dashboard after successful login

### Dashboard Page

Requirements:

-   Product summary
-   Warehouse summary
-   Total stock summary
-   Low-stock summary
-   Low-stock table or widget
-   Responsive layout

### Product Management Page

Requirements:

-   Product list
-   Search input
-   Add product action for Admin
-   Edit action for Admin
-   Delete action for Admin
-   Loading state
-   Empty state
-   Error state
-   Validation feedback
-   Confirmation before deletion

### Warehouse Management Page

Requirements:

-   Warehouse list
-   Add warehouse action for Admin
-   Edit action for Admin
-   Delete action for Admin
-   Warehouse details
-   Loading state
-   Empty state
-   Error state
-   Form validation
-   Confirmation before deletion

### Inventory Page

Requirements:

-   Inventory table
-   Product filter
-   Warehouse filter
-   Add stock action
-   Remove stock action
-   Transfer stock action
-   Current stock quantity
-   Low-stock indicator
-   Validation feedback
-   Loading and error states

------------------------------------------------------------------------

## 7.2 Frontend Role-Based UI

The frontend must show only actions allowed for the current role.

Examples:

### Admin

-   Can see product create, edit, and delete buttons.
-   Can see warehouse create, edit, and delete buttons.
-   Can manage inventory.

### Warehouse Staff

-   Can view products and warehouses.
-   Can see add, remove, and transfer stock actions.
-   Must not see product or warehouse management actions.

Important:

-   Hiding buttons is not sufficient security.
-   All permissions must also be enforced by backend middleware.

------------------------------------------------------------------------

## 7.3 Frontend State Requirements

The application must handle:

### Loading States

-   Initial page loading
-   API request loading
-   Form submission loading
-   Inventory operation loading

### Validation States

-   Required fields
-   Invalid numeric values
-   Negative values
-   Invalid transfer quantity
-   Same source and destination warehouse
-   Insufficient stock

### Error States

-   Network failure
-   Unauthorized request
-   Forbidden request
-   Resource not found
-   Validation failure
-   Server error
-   Database failure

### Empty States

-   No products available
-   No warehouses available
-   No inventory available
-   No low-stock products
-   No search results

### Success States

-   Product created successfully
-   Product updated successfully
-   Product deleted successfully
-   Warehouse created successfully
-   Stock added successfully
-   Stock removed successfully
-   Stock transferred successfully

------------------------------------------------------------------------

## 7.4 Responsive UI Requirements

The UI must work across:

-   Desktop
-   Tablet
-   Mobile

Recommended considerations:

-   Responsive sidebar or navigation
-   Responsive tables or card-based layouts
-   Mobile-friendly forms
-   Accessible buttons and inputs
-   Clear spacing and visual hierarchy
-   Readable validation messages
-   Avoid horizontal overflow where possible

------------------------------------------------------------------------

## 8. Backend Architecture Requirements

The backend should follow a modular, feature-based architecture.

Recommended structure:

``` text
backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── products/
│   │   ├── warehouses/
│   │   ├── inventory/
│   │   └── dashboard/
│   ├── middleware/
│   ├── common/
│   └── database/
├── tests/
├── .env
├── .gitignore
└── package.json
```

### 8.1 Backend Separation of Concerns

-   Routes: Define endpoints and connect middleware/controllers.
-   Controllers: Handle HTTP requests and responses.
-   Services: Contain business logic.
-   Models: Define database schemas and persistence rules.
-   Validation: Validate request payloads and parameters.
-   Middleware: Handle authentication, authorization, validation, and
    errors.
-   Common utilities: Provide reusable helpers and shared error classes.

### 8.2 Business Logic Rules

Business rules should primarily be implemented in backend services.

Examples:

-   SKU uniqueness
-   Stock availability
-   Stock transfer consistency
-   Role permissions
-   Warehouse capacity
-   Low-stock calculation

The frontend may provide early validation for user experience, but the
backend remains the source of truth.

------------------------------------------------------------------------

## 9. Suggested API Structure

All APIs should use a versioned prefix:

``` text
/api/v1
```

### Authentication

``` http
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/logout
```

### Products

``` http
GET    /api/v1/products
GET    /api/v1/products/:id
POST   /api/v1/products
PATCH  /api/v1/products/:id
DELETE /api/v1/products/:id
```

### Warehouses

``` http
GET    /api/v1/warehouses
GET    /api/v1/warehouses/:id
POST   /api/v1/warehouses
PATCH  /api/v1/warehouses/:id
DELETE /api/v1/warehouses/:id
```

### Inventory

``` http
GET  /api/v1/inventory
POST /api/v1/inventory/add
POST /api/v1/inventory/remove
POST /api/v1/inventory/transfer
GET  /api/v1/inventory/low-stock
```

### Dashboard

``` http
GET /api/v1/dashboard/summary
```

------------------------------------------------------------------------

## 10. Data Model Requirements

## 10.1 User

Suggested fields:

``` text
id
name
email
passwordHash
role
createdAt
updatedAt
```

Rules:

-   Email must be unique.
-   Password must be stored as a secure hash.
-   Role must be one of the supported roles.
-   Password hashes must never be returned in API responses.

## 10.2 Product

Suggested fields:

``` text
id
name
sku
category
price
minimumStockLevel
createdAt
updatedAt
```

Rules:

-   SKU must be unique.
-   Price cannot be negative.
-   Minimum stock level cannot be negative.
-   Required text fields must not be empty.

## 10.3 Warehouse

Suggested fields:

``` text
id
name
location
capacity
createdAt
updatedAt
```

Rules:

-   Name is required.
-   Location is required.
-   Capacity cannot be negative.
-   Warehouse references must remain valid.

## 10.4 Inventory

Suggested fields:

``` text
id
productId
warehouseId
quantity
createdAt
updatedAt
```

Rules:

-   Quantity cannot be negative.
-   Product and warehouse references must exist.
-   The product-warehouse combination must be unique.
-   Stock updates must be atomic where necessary.

## 10.5 Optional Inventory Transaction Log

For improved traceability, the system may include an inventory
transaction log:

``` text
id
userId
productId
sourceWarehouseId
destinationWarehouseId
type
quantity
createdAt
```

Possible transaction types:

``` text
ADD
REMOVE
TRANSFER
```

This is optional for the initial implementation but recommended for
auditability.

------------------------------------------------------------------------

## 11. Validation and Error Handling

### 11.1 Validation Layers

Validation should be performed at multiple levels:

1.  Frontend validation for immediate user feedback.
2.  Backend request validation for API safety.
3.  Database constraints for data integrity.
4.  Business logic validation for domain rules.

### 11.2 Standard Response Format

Successful response:

``` json
{
  "success": true,
  "message": "Product created successfully",
  "data": {}
}
```

Error response:

``` json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```

### 11.3 HTTP Status Codes

  Status   Use Case
  -------- ---------------------------------
  200      Successful request
  201      Resource created
  400      Invalid request
  401      Unauthenticated
  403      Unauthorized for the role
  404      Resource not found
  409      Conflict, such as duplicate SKU
  422      Business validation failure
  500      Unexpected server error

The exact status-code policy should be applied consistently across the
API.

------------------------------------------------------------------------

## 12. Security Requirements

-   Hash passwords using a secure password-hashing algorithm.
-   Store secrets in environment variables.
-   Validate and sanitize user input.
-   Enforce authentication on protected routes.
-   Enforce role-based authorization on the backend.
-   Use secure cookie settings if cookies are used.
-   Configure CORS appropriately.
-   Do not expose passwords or password hashes.
-   Avoid returning sensitive internal error details in production.
-   Validate object IDs and request parameters.
-   Apply rate limiting to authentication endpoints where appropriate.
-   Use HTTPS in production.
-   Keep dependencies updated.

------------------------------------------------------------------------

## 13. Non-Functional Requirements

### 13.1 Maintainability

-   Use feature-based modular architecture.
-   Keep controllers thin.
-   Keep business logic in services.
-   Reuse shared UI components.
-   Use meaningful naming conventions.
-   Avoid duplicated validation and API logic.
-   Maintain clear README documentation.

### 13.2 Scalability

-   Use pagination for large lists.
-   Add appropriate database indexes.
-   Use server-side filtering and search.
-   Avoid unnecessary database queries.
-   Use atomic updates for inventory operations.
-   Keep modules loosely coupled.
-   Use transactions for multi-step stock transfers.

### 13.3 Reliability

-   Handle API failures gracefully.
-   Provide consistent error responses.
-   Prevent negative stock.
-   Protect against concurrent update issues.
-   Ensure transfer operations are atomic.
-   Add automated tests for critical business logic.

### 13.4 Performance

-   Use indexed fields for frequent queries.
-   Avoid returning unnecessary fields.
-   Use pagination.
-   Debounce search requests.
-   Cache suitable read-heavy queries if needed.
-   Avoid repeated fetching of unchanged data.

------------------------------------------------------------------------

## 14. Testing Requirements

### 14.1 Authentication Tests

-   Valid login succeeds.
-   Invalid email fails.
-   Invalid password fails.
-   Missing token is rejected.
-   Expired token is rejected.
-   Unauthorized roles cannot access restricted endpoints.
-   Logout clears the session.

### 14.2 Product Tests

-   Admin can create a product.
-   Staff cannot create a product.
-   Duplicate SKU is rejected.
-   Negative price is rejected.
-   Negative minimum stock level is rejected.
-   Admin can update a product.
-   Admin can delete a product.
-   Search returns matching products.

### 14.3 Warehouse Tests

-   Admin can create a warehouse.
-   Staff cannot create a warehouse.
-   Required fields are validated.
-   Negative capacity is rejected.
-   Admin can update a warehouse.
-   Warehouse deletion follows inventory constraints.

### 14.4 Inventory Tests

-   Valid stock addition succeeds.
-   Zero or negative quantity is rejected.
-   Valid stock removal succeeds.
-   Removing more than available stock fails.
-   Stock never becomes negative.
-   Valid transfer succeeds.
-   Transfer between identical warehouses fails.
-   Transfer with zero quantity fails.
-   Transfer with insufficient stock fails.
-   Failed transfer does not partially update inventory.
-   Concurrent stock operations preserve consistency.

### 14.5 Frontend Tests

-   Protected routes redirect unauthenticated users.
-   Role-specific actions are displayed correctly.
-   Forms show validation errors.
-   Loading states appear during API calls.
-   Error states are displayed correctly.
-   Successful actions update the UI.
-   Responsive layouts work across supported screen sizes.

------------------------------------------------------------------------

## 15. Recommended Development Phases

### Phase 1: Project Setup

-   Initialize frontend and backend.
-   Configure environment variables.
-   Configure database connection.
-   Configure linting and formatting.
-   Create base folder structure.
-   Add health-check endpoint.

### Phase 2: Authentication

-   Create User model.
-   Implement password hashing.
-   Implement login.
-   Implement JWT authentication.
-   Implement logout.
-   Implement authentication middleware.
-   Implement role middleware.
-   Protect frontend routes.

### Phase 3: Product Management

-   Create Product model.
-   Implement product CRUD APIs.
-   Add validation.
-   Add SKU uniqueness.
-   Build product management UI.
-   Add search functionality.

### Phase 4: Warehouse Management

-   Create Warehouse model.
-   Implement warehouse CRUD APIs.
-   Add validation.
-   Build warehouse management UI.
-   Add deletion constraints.

### Phase 5: Inventory Management

-   Create Inventory model.
-   Add inventory viewing.
-   Implement add stock.
-   Implement remove stock.
-   Implement transfer stock.
-   Add atomic updates.
-   Add transactions.
-   Add concurrency protection.

### Phase 6: Low Stock and Dashboard

-   Implement low-stock calculation.
-   Implement dashboard summary API.
-   Build dashboard cards.
-   Build low-stock table.
-   Add visual low-stock indicators.

### Phase 7: Quality and Deployment

-   Add unit and integration tests.
-   Test role permissions.
-   Test edge cases.
-   Improve error handling.
-   Optimize database queries.
-   Configure production environment.
-   Deploy frontend and backend.
-   Document setup and deployment steps.

------------------------------------------------------------------------

## 16. Acceptance Criteria

The project will be considered complete when:

### Authentication

-   Users can log in using email and password.
-   Valid users are redirected to the dashboard.
-   Unauthenticated users cannot access protected pages.
-   Users can log out.
-   Role-based access is enforced on the backend.

### Products

-   Admin can create, view, update, and delete products.
-   Staff can view and search products.
-   SKU is unique.
-   Price and minimum stock values cannot be negative.
-   Validation errors are displayed clearly.

### Warehouses

-   Admin can create, view, update, and delete warehouses.
-   Staff can view warehouses.
-   Required fields are validated.
-   Capacity cannot be negative.
-   Deletion does not create invalid inventory references.

### Inventory

-   Users can view stock by product and warehouse.
-   Authorized users can add stock.
-   Authorized users can remove stock.
-   Authorized users can transfer stock.
-   Stock cannot become negative.
-   Users cannot remove or transfer more stock than available.
-   Transfer quantity must be greater than zero.
-   Source and destination warehouses must be different.
-   Transfers are atomic and consistent.

### Low Stock

-   The system identifies low-stock products.
-   Low-stock products are visible on the dashboard or inventory page.
-   Current stock and minimum stock levels are displayed clearly.

### Frontend

-   All required pages are implemented.
-   Loading, validation, empty, success, and error states are handled.
-   UI is responsive.
-   Role-specific actions are displayed correctly.
-   Forms are user-friendly and accessible.

------------------------------------------------------------------------

## 17. Suggested Deliverables

The final project should include:

1.  Frontend source code.
2.  Backend source code.
3.  Database schemas or migrations.
4.  API documentation.
5.  Environment variable example file.
6.  README with local setup instructions.
7.  Authentication and authorization implementation.
8.  Product management functionality.
9.  Warehouse management functionality.
10. Inventory management functionality.
11. Low-stock dashboard or inventory view.
12. Automated tests for critical business logic.
13. Deployment instructions, if deployment is required.

------------------------------------------------------------------------

## 18. Final Engineering Principles

The implementation should prioritize:

-   Correctness over unnecessary complexity.
-   Backend-enforced security.
-   Consistent inventory data.
-   Clear separation of concerns.
-   Reusable frontend components.
-   Atomic stock operations.
-   Meaningful validation and error messages.
-   Maintainable and readable code.
-   Practical scalability.
-   Test coverage for critical business rules.

The initial version should remain simple enough to understand while
providing a strong foundation for future features such as inventory
audit logs, notifications, reporting, warehouse-specific thresholds, and
advanced analytics.
