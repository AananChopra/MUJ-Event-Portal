# MUJ Events

Event registration system for MUJ. Built with Node.js, Express, Firebase (Firestore), and Bootstrap 5. Has dark mode, looks pretty clean, and works well.

## What it does

- Students can register for events
- Admins can create/manage events and see all registrations
- Firebase authentication (login/register)
- Dark mode toggle (saves your preference)
- Responsive design that works on mobile

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the server**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Open browser**
   Go to `http://localhost:3000`

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Frontend**: EJS templates + Bootstrap 5
- **Styling**: Custom CSS with dark mode support

## Features

- **Event Management**: Create, view, and delete events
- **Registration**: Students register with name and email
- **Admin Panel**: View all registrations in a table
- **Dark Mode**: Toggle between light/dark themes
- **Responsive**: Works on all screen sizes

