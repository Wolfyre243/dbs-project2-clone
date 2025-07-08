import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-500 text-white p-4">
        <h1 className="text-xl font-bold">Dashboard</h1>
      </header>
      <div className="flex">
        {window.innerWidth >= 640 ? (
          <aside className="w-64 bg-gray-200 p-4">
            <nav>
              <ul>
                <li><a href="/dashboard" className="block py-2 px-4 hover:bg-gray-300">Dashboard</a></li>
                <li><a href="/dashboard/manage-users" className="block py-2 px-4 hover:bg-gray-300">Manage Users</a></li>
              </ul>
            </nav>
          </aside>
        ) : (
          <div className="bg-gray-200 p-4">
            <button
              id="hamburger-menu"
              className="block py-2 px-4 bg-blue-500 text-white rounded"
              onClick={() => {
                const menu = document.getElementById('mobile-menu');
                if (menu) {
                  menu.classList.toggle('hidden');
                }
              }}
            >
              Menu
            </button>
            <div id="mobile-menu" className="hidden">
              <ul>
                <li><a href="/dashboard" className="block py-2 px-4 hover:bg-gray-300">Dashboard</a></li>
                <li><a href="/dashboard/manage-users" className="block py-2 px-4 hover:bg-gray-300">Manage Users</a></li>
              </ul>
            </div>
          </div>
        )}
        <main className="flex-1 p-4">
          <p>Welcome to your dashboard!</p>
          <p>Here you can manage your account and view your data.</p>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
