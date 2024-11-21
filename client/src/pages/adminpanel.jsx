import React from 'react';
import { useSelector } from 'react-redux';
import isAdmin from '../utils/isAdmin';

const Dashboard = () => {
  const user = useSelector((state) => state.user);

  if (!isAdmin(user.role)) {
    return <div className="text-center text-red-600 font-bold py-10">Access Denied: Admins Only</div>;
  }

  return (
    <section className="bg-white">
      <div className="container mx-auto p-3">
        {/* Right for Content */}
        <div className="bg-white min-h-[75vh] p-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            {/** Stat Cards */}
            {['Total Cameras', 'Total Box', 'Today Summary', 'Live Projects'].map((title, index) => (
              <div key={index} className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-600 text-sm font-semibold">{title.toUpperCase()}</h3>
                  <span
                    className={`p-2 rounded-full ${
                      ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500'][index]
                    } text-white text-sm`}
                  >
                    $
                  </span>
                </div>
                <h2 className="mt-2 text-3xl font-bold">79352</h2>
                <p className="text-sm text-gray-500">55539</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Sales Data */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-gray-600 text-lg font-semibold mb-4">Monthly Sales Data Comparison</h3>
              {/* Placeholder for Chart */}
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">[Bar Chart Here]</span>
              </div>
            </div>

            {/* Votes Distribution */}
            <div className="bg-white shadow rounded-lg p-4">
              <h3 className="text-gray-600 text-lg font-semibold mb-4">Votes Distribution</h3>
              {/* Placeholder for Pie Chart */}
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">[Pie Chart Here]</span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">Green: 38.71%</p>
                <p className="text-sm text-gray-600">Purple: 61.29%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
