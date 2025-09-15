# My Secret Base - A Personal Dashboard

**A central hub for your daily life, bringing together your schedule, tasks, and finances in one beautifully designed, private space.**

This project was born from a desire to create a personal, all-in-one dashboard to manage the essential parts of my daily life. It has evolved from a simple monolithic application into a more robust, scalable, and maintainable full-stack application.

---

## Features

- **Unified Dashboard:** A single view of your most important information: today's events, high-priority tasks, and a monthly financial summary.
- **Financial Tracker:** Log income and expenses, categorize transactions, and visualize your spending habits with an interactive chart.
- **To-Do List:** A powerful to-do list with drag-and-drop reordering and category management.
- **Calendar:** A full-featured calendar to manage your schedule and events.
- **Guest Login:** Allow users to try out the application without creating an account.
- **Secure Authentication:** JWT-based authentication to protect your data.

### Screenshots

| Dashboard | Financial Tracker |
| :---: | :---: |
| ![Dashboard Screenshot](https://i.imgur.com/example.png) | ![Financial Tracker Screenshot](https://i.imgur.com/example.png) |

| To-Do List | Calendar |
| :---: | :---: |
| ![To-Do List Screenshot](https://i.imgur.com/example.png) | ![Calendar Screenshot](https://i.imgur.com/example.png) |

---

## Tech Stack

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JSON Web Tokens (JWT)
- **Security:** Helmet, CORS, express-rate-limit

### Frontend

- **Library:** React
- **UI:** Material-UI
- **Styling:** CSS, Emotion
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Date Management:** Day.js

### Development

- **Package Manager:** npm
- **Server Auto-Reload:** nodemon

---

## Learning & Growth

This project has been a significant learning experience, particularly in the area of refactoring and application architecture.

### From Monolith to Modular

The initial version of the application was a single `server.js` file that handled everything from server setup to API logic. This quickly became difficult to manage and scale.

**The Challenge:** As new features were added, the `server.js` file grew to over 500 lines of code. It was difficult to find specific routes, and the code was tightly coupled, making it hard to debug and test.

**The Solution:** I undertook a major refactoring effort to move from a monolithic to a modular architecture. This involved:

1.  **Separating Concerns:** I created a `routes` directory to house the API logic for each feature (e.g., `todos.js`, `transactions.js`).
2.  **Database Abstraction:** The database connection logic was moved to a separate `db.js` file.
3.  **Middleware:** The authentication logic was extracted into a `middleware/auth.js` file.
4.  **Error Handling:** A centralized error handling middleware was implemented to reduce code duplication and provide consistent error responses.

This refactoring resulted in a much cleaner, more organized, and more maintainable codebase.

### Enhancing the User Experience

Early versions of the application had a very basic UI and lacked user feedback.

**The Challenge:** The UI was inconsistent across different features, and there was no visual feedback for actions like saving or deleting data. This resulted in a poor user experience.

**The Solution:** I decided to adopt Material-UI as the primary UI library to create a more consistent and modern look and feel. I also implemented the following improvements:

- **Snackbar Notifications:** Replaced browser `alert()`s with `Snackbar` notifications for a less intrusive user experience.
- **Loading Indicators:** Added loading spinners to provide visual feedback when data is being fetched from the server.
- **Empty States:** Designed "empty state" components to guide users when there is no data to display.

These changes significantly improved the overall user experience and made the application more intuitive and enjoyable to use.