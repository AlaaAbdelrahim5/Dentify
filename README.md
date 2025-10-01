# Dentify - Dental Practice Management System

A comprehensive dental clinic management system built with React.js and Tailwind CSS. This system provides role-based access for different types of users in a dental practice ecosystem.

## 🦷 Features

### For Patients
- **Account Registration**: Self-registration system for patients
- **Appointment Booking**: Schedule appointments with preferred dentists
- **Medical History**: View treatment history and records
- **X-ray Results**: Access to radiology results and images
- **Dashboard**: Personal dashboard with overview of appointments and health data

### For Dentists
- **Patient Management**: Comprehensive patient care tools
- **Appointment Scheduling**: Manage personal schedule and patient appointments
- **Treatment Planning**: Create and track treatment plans
- **X-ray Requests**: Submit radiology requests to imaging centers
- **Social Media Integration**: Display social media profiles for marketing

### For Clinic Management
- **Staff Management**: Add and manage secretaries and dentists
- **Clinic Operations**: Oversee overall clinic workflow
- **Working Hours**: Set and manage clinic operating hours
- **Multi-dentist Support**: Manage multiple dentists under one clinic

### For Secretaries
- **Appointment Management**: Handle appointment scheduling and confirmations
- **Patient Check-in**: Process patient arrivals and check-ins
- **Administrative Support**: Support clinic operations and coordination

### For Administrators
- **System Management**: Complete oversight of the entire system
- **Clinic Creation**: Create and manage multiple clinics
- **Dentist Management**: Add dentists and assign them to clinics
- **Radiology Centers**: Manage X-ray centers and integrations

### For Radiology Centers
- **Request Processing**: Handle X-ray requests from dentists
- **Result Upload**: Upload and share imaging results
- **Direct Communication**: Send results directly to dentists and patients

## 🚀 Technology Stack

- **Frontend**: React 19.1.0 with React Router DOM
- **Styling**: Tailwind CSS 4.1.11
- **Icons**: React Icons
- **Build Tool**: Vite 7.0.0
- **Package Manager**: npm

## 📁 Project Structure

```
client/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Logo.jsx
│   │   ├── Navbar.jsx
│   │   └── index.js
│   ├── pages/
│   │   ├── dashboard/
│   │   │   └── PatientDashboard.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   └── SignUp.jsx
│   ├── styles/
│   │   ├── App.css
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── eslint.config.js
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd dentify/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:5173`

## 🎨 Design System

### Color Palette
- **Primary Teal**: #14b8a6 (Primary brand color)
- **Primary Cyan**: #06b6d4 (Secondary brand color)
- **Success Green**: #10b981
- **Warning Orange**: #f59e0b
- **Danger Red**: #ef4444
- **Gray Variants**: Multiple shades for text and backgrounds

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800, 900

### Components
- **Responsive Design**: Mobile-first approach
- **Consistent Styling**: Reusable component library
- **Modern UI**: Clean, professional dental practice aesthetic
- **Accessibility**: Focus states and screen reader support

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured dashboard experience
- **Tablet**: Adapted layout with touch-friendly interfaces
- **Mobile**: Streamlined mobile experience with navigation menu

## 🔐 User Roles & Permissions

### Authentication System
- Role-based access control
- Secure login with user type selection
- Protected routes based on user permissions

### User Types
1. **Admin** - System-wide management
2. **Clinic** - Clinic operations management  
3. **Dentist** - Patient care and treatment
4. **Secretary** - Administrative support
5. **Patient** - Personal health management
6. **Radiology Center** - Imaging services

## 🚧 Current Status

This is the **frontend-only** version focusing on:
- ✅ User interface design and components
- ✅ Responsive layouts
- ✅ React Router navigation
- ✅ Modern component architecture
- ✅ Professional dental practice styling

### Upcoming Features (Backend Integration)
- Authentication and authorization
- Database integration
- API endpoints
- Real-time notifications
- File upload for X-ray images
- Email/SMS notifications
- Payment processing
- Reporting and analytics

## 🎯 Pages Overview

### Public Pages
- **Home**: Landing page with features overview
- **Login**: Multi-role authentication
- **Sign Up**: Patient registration form

### Dashboard Pages
- **Patient Dashboard**: Appointments, X-rays, medical history
- **Dentist Dashboard** (Coming Soon)
- **Clinic Dashboard** (Coming Soon)
- **Admin Dashboard** (Coming Soon)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email: [your-email@dentify.com]

## 🙏 Acknowledgments

- React.js community for excellent documentation
- Tailwind CSS for the utility-first CSS framework
- React Icons for comprehensive icon library
- Dental professionals who provided valuable feedback on user experience

---

**Built with ❤️ for dental professionals worldwide**