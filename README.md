# Backend Setup Instructions

## 1. Create a `.env` File
Create a `.env` file in the `backend` directory with the following content:
```
DATABASE_URL=postgres://username:password@host:port/database
PORT=5000
```
- Replace `username`, `password`, `host`, `port`, and `database` with your PostgreSQL credentials.

## 2. Start the Backend
Run the following commands to start the backend server:
```bash
cd backend
npm install
node server.js or npm start
```
The backend will start on `http://localhost:5000`.

## 3. Start the Frontend
Navigate to the `react-user-dashboard` directory and run:
```bash
cd react-user-dashboard
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`.

## 4. Database Table Creation
The backend automatically creates the `users` table and populates it with a default user if the table does not exist. The default user is:
- **Email**: `admin@example.com`
- **Password**: `admin123`

## 5. Sign-Up and Sign-In Instructions
### Sign-Up
1. Navigate to `http://localhost:5173/signup`.
2. Enter your email and password to create a new account.

### Sign-In
1. Navigate to `http://localhost:5173/login`.
2. Enter your email and password to log in.

If you encounter any issues, please check the backend logs for errors.



## 6. Axios and apiClient Usage

### apiClient
The `apiClient` is a pre-configured instance of Axios with a base URL (`http://localhost:5000`) and default headers like `Content-Type: application/json`. It simplifies making HTTP requests to the backend API.

### SignUp
To register a user, you can use:
```javascript
apiClient.post('/signup', { username, password });
```
This sends a POST request to the `/signup` endpoint with the user data.

### Login
To log in a user, you can use:
```javascript
apiClient.post('/login', { username, password });
```
This sends a POST request to the `/login` endpoint with the credentials.

Both operations return promises, allowing you to handle responses and errors using `.then()` and `.catch()` or `async/await`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```


