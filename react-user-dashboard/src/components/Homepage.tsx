import React from 'react';

const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-500 text-white p-4">
        <h1 className="text-xl font-bold">Homepage</h1>
      </header>
      <main className="p-4">
        <p>Welcome to the homepage!</p>
        <p>Here you can view your profile and explore other features.</p>
        <nav>
          <ul>
            <li><a href="/profile" className="text-blue-500 hover:underline">View Profile</a></li>
          </ul>
        </nav>
      </main>
    </div>
  );
};

export default Homepage;
