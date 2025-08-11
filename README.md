# SDC Client

This is the frontend React application for the SDC project.  
It is built with [Vite](https://vitejs.dev/), [React](https://react.dev/), and
[TypeScript](https://www.typescriptlang.org/).

---

## Folder Structure

client/ │ ├── .env # Environment variables ├── package.json # Project
dependencies and scripts ├── tsconfig.json # TypeScript configuration ├──
vite.config.ts # Vite configuration ├── netlify.toml # Netlify deployment config
│ ├── app/ # Main application source code │ ├── app.css # Global styles │ ├──
root.tsx # Root React component │ ├── routes.ts # Route definitions │ ├──
components/ # Reusable UI components │ ├── context/ # React context providers │
├── hooks/ # Custom React hooks │ ├── lib/ # Utility libraries │ ├── routes/ #
Route-specific components/pages │ ├── services/ # API and other service logic │
├── actionTypeConfig.ts │ ├── eventTypeConfig.ts │ ├── rolesConfig.ts │ ├──
statusConfig.ts │ └── ... │ ├── public/ # Static assets │ ├── favicon.ico │ ├──
sdc-logo.png │ ├── sdc-scenery.jpg │ ├── sample-audio-1.wav │ ├──
sample-audio-2.wav │ ├── sample-audio-3.wav │ └── ... │ ├── .react-router/ #
React Router build artifacts/types │ └── types/ │ └── ... │ └── ...

---

## Getting Started

### 1. _Install dependencies_

bash npm install

### 2. _Run the development server_

bash npm run dev

The app will be available at [http://localhost:5173](http://localhost:5173)
(default Vite port).

### 3. _Build for production_

bash npm run build

### 4. _Preview production build_

bash npm run preview

---

## Configuration

- _Environment variables:_  
  Set up your .env file for API endpoints and other secrets.

- _Routing:_  
  Routes are defined in app/routes.ts and react-router.config.ts.

- _Styling:_  
  Global styles are in app/app.css.  
  Uses [Tailwind CSS](https://tailwindcss.com/) via @apply and custom
  properties.

---

## Key Features

- _Admin Dashboard:_  
  Analytics, statistics, and management tools for users, exhibits, audio, QR
  codes, and more.

- _User Pages:_  
  User statistics, favorites, and activity logs.

- _Reusable Components:_  
  Cards, charts, tables, forms, and more in app/components.

- _API Services:_  
  API logic in app/services.

- _Localization:_  
  Language and status configs in app/languageConfig.ts and app/statusConfig.ts.

---

## Deployment

- _Netlify:_  
  Configured via netlify.toml for easy deployment.

---

## Contributing

1. Fork the repo
2. Create your feature branch (git checkout -b feature/my-feature)
3. Commit your changes
4. Push to the branch
5. Open a pull request

---

## License

This project is for educational use at Singapore Polytechnic.

---

## Credits

- Built by Group 3-1 for DBSP-CA2
- Uses [React](https://react.dev/), [Vite](https://vitejs.dev/),
  [Tailwind CSS](https://tailwindcss.com/), [Recharts](https://recharts.org/),
  [Lucide Icons](https://lucide.dev/), and more.

---
