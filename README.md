<<<<<<< HEAD
Of course. Here is the `readme.md` for the "皆の秘密基地" (Everyone's Secret Base) project.

-----

# **皆の秘密基地 (Everyone's Secret Base)**

This is a web application designed to comprehensively manage your life. It's not just a simple task manager; it's a tool to visualize and organize your life's goals, daily schedule, and finances all in one place. A unique feature is the **"Survival Confirmation"** function, which automatically sends an email to check on your well-being if you haven't accessed the app for a certain period.

## **✨ Features**

  * **User Management**: Securely manage your data with account registration and login functionalities.
  * **Life ToDo List**: This is the core feature. It allows you to list and manage your life goals and things you want to accomplish. You can categorize your ToDos and intuitively reorder them using drag-and-drop.
  * **Schedule Management**: A calendar feature to register, edit, and delete your appointments.
  * **Household Finances**: Keep track of your income and expenses, allowing you to see your monthly balance at a glance. You can also manage expense categories.
  * **Survival Confirmation**: A unique feature that sends an automatic email to your registered address if the application is not accessed for a set period, checking on your safety.

## **🛠️ Technology Stack**

  * **Frontend**: React
  * **Backend**: Node.js
  * **Database**: PostgreSQL
  * **Authentication**: JWT (JSON Web Tokens)
  * **Key Libraries**:
      * `@hello-pangea/dnd` for drag-and-drop functionality in the ToDo list.
      * `node-cron` for scheduling the survival confirmation check.
      * `nodemailer` for sending emails.

## **🚀 Getting Started**

### **Prerequisites**

Make sure you have the following installed:

  * Node.js
  * PostgreSQL
  * npm (or yarn)

### **Installation**

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/minna-no-himitsukichi.git
    cd minna-no-himitsukichi
    ```

2.  **Install backend dependencies:**

    ```bash
    # Navigate to the server directory
    cd server
    npm install
    ```

3.  **Install frontend dependencies:**

    ```bash
    # Navigate to the client directory
    cd ../client
    npm install
    ```

4.  **Set up the database:**

      * Create a new PostgreSQL database.
      * Execute the table creation SQL statements found in the database schema to set up the `users`, `todos`, `events`, `transactions`, and `categories` tables.

5.  **Configure environment variables:**

      * Create a `.env` file in the `server` directory and add your database connection details and JWT secret.
      * Create a `.env` file in the `client` directory to configure the backend API endpoint if necessary.

6.  **Run the application:**

      * **Start the backend server:** In the `server` directory, run `npm start`.
      * **Start the frontend development server:** In the `client` directory, run `npm start`.

## **📈 Project Status**

**Phase 1: Initial Version Development (Completed)**

  * **User Management**: Account registration and login are fully functional.
  * **Life ToDo List**: Full CRUD (Create, Read, Update, Delete) functionality is implemented, including category selection and drag-and-drop reordering.
  * **Schedule Management**: Full CRUD functionality for calendar events is complete.
  * **Household Finances**: Full CRUD functionality for transactions is complete, including category management.
  * **Survival Confirmation**: The backend logic for detecting inactive users and sending emails is implemented.

The project has successfully completed the development of all core features for its initial version. The next phase will involve UI/UX improvements, testing, and potential deployment.
=======
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
>>>>>>> origin/client
