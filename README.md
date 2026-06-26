# 💈 Barbershop Management System

A web-based barbershop management system developed to streamline barbershop operations, including service management, capster management, transaction recording, and analytics dashboard.

## 📌 Project Overview

This project was built to help barbershop owners manage daily operations more efficiently.  
The system provides features for managing services, capsters, customer transactions, and sales analytics in one dashboard.

In this project, I contributed as:

- Backend Developer
- Quality Assurance Tester
- API Testing Engineer

---

## ✨ Main Features

### Authentication
- User Login
- User Registration
- Session Management

### Dashboard Analytics
- Total Revenue
- Total Transactions
- Active Capsters
- Daily Customers
- Capster Performance

### Capster Management
- Add capster
- Edit capster
- Delete capster
- Filter active/inactive capster

### Service Management
- Add service
- Update service
- Delete service
- View service list

### Transaction Management
- Create transaction
- Calculate total payment
- Payment validation
- Transaction history

---

## 🛠 Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- PHP (Native PHP / REST API)

### Database
- MySQL

### Tools
- Postman
- Git
- GitHub
- XAMPP / Laragon

---

## 🗂 Project Structure

```bash
barbershop-management-system/
│
├── api_capster.php
├── api_dashboard.php
├── api_layanan.php
├── api_transaksi.php
├── koneksi.php
├── index.html
├── login.html
├── register.html
├── script.js
├── style.css
└── db_update.sql
```

---

## 🔌 API Endpoints

### Dashboard API
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api_dashboard.php?action=stats` | GET | Get dashboard statistics |
| `/api_dashboard.php?action=history` | GET | Get transaction history |
| `/api_dashboard.php?action=performa_capster` | GET | Get capster performance |

### Capster API
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api_capster.php?action=list` | GET | Get capster list |
| `/api_capster.php?action=add` | POST | Add capster |
| `/api_capster.php?action=edit` | PUT | Update capster |
| `/api_capster.php?action=delete` | DELETE | Delete capster |

### Service API
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api_layanan.php` | GET | Get services |
| `/api_layanan.php` | POST | Add service |
| `/api_layanan.php` | PUT | Update service |
| `/api_layanan.php` | DELETE | Delete service |

---

## 🧪 API Testing (Postman)

Manual API testing was performed using Postman to validate:
- Response status
- JSON structure
- Error handling
- Input validation
- API reliability

### Testing Summary
- Total Test Cases: **11**
- Passed: **8**
- Failed: **3**
- Bugs Found: **Multiple validation bugs**

### Example Test Cases
- Dashboard statistics retrieval
- Capster status validation
- Service CRUD testing
- Invalid request handling

---

## 📈 Achievements

- Developed **6+ REST API endpoints**
- Created **11 API test cases**
- Detected multiple bugs during API validation
- Improved backend reliability through testing

---

## 🚀 Installation

### 1. Clone Repository
```bash
git clone https://github.com/muhammadmuharrikimadudin-cell/barbershop-management-system.git
```

### 2. Import Database
Import:

```sql
db_update.sql
```

into MySQL using phpMyAdmin.

### 3. Configure Database
Edit `koneksi.php`

```php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "barbershop";
```

### 4. Run Project
Using XAMPP / Laragon:

```bash
http://localhost/barber
```

---

## 📸 Screenshots

- Login Page
- Dashboard
- Capster Management
- Service Management
- Transaction Page
- Postman API Testing

---

## 👨‍💻 Author

**Muhammad Muharrik Imaduddin**  
D4 Software Engineering Technology (TRPL)  
Politeknik Indonusa Surakarta  

GitHub:  
https://github.com/muhammadmuharrikimadudin-cell
