import React from 'react';

const MessagesPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Messages</h1>
        <p className="text-gray-400 mb-8">
          This is a placeholder page for messages. Feature coming soon!
        </p>
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <div className="text-gray-400">
            <svg
              className="mx-auto h-12 w-12 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="mt-4 text-lg">Messages feature is under development</p>
            <p className="mt-2 text-sm">
              Check back later for updates on this feature
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
