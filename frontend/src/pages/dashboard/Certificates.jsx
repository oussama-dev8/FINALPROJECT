import React from 'react';
import Button from '@/components/ui/Button';

// Default classroom image from Unsplash
const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80";

function Certificates() {
  // Mock data - replace with API calls later
  const certificates = [
    {
      id: 1,
      course: 'JavaScript Fundamentals',
      issueDate: '2025-03-15',
      instructor: 'John Doe',
      credential: 'CERT-JS-123',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465e2477?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 2,
      course: 'React Basics',
      issueDate: '2025-02-20',
      instructor: 'Jane Smith',
      credential: 'CERT-REACT-456',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold text-white mb-6">My Certificates</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div key={cert.id} className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-200">
            <div className="relative">
              <img
                src={cert.thumbnail || DEFAULT_THUMBNAIL}
                alt={cert.course}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_THUMBNAIL;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end">
                <div className="p-4 text-white w-full">
                  <h3 className="text-lg font-semibold">{cert.course}</h3>
                  <p className="text-sm text-gray-300">Instructor: {cert.instructor}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Issue Date:</span>
                  <span className="text-gray-200 font-medium">{new Date(cert.issueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Credential ID:</span>
                  <span className="text-gray-200 font-mono text-xs">{cert.credential}</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="primary" className="flex-1">
                  Download
                </Button>
                <Button variant="outline" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500">
                  Share
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {certificates.length === 0 && (
        <div className="text-center py-16 px-4 rounded-xl border-2 border-dashed border-gray-700 bg-gray-800/50">
          <div className="text-gray-500 mb-4">
            <svg className="mx-auto h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-200 mb-2">No certificates yet</h3>
          <p className="text-gray-400 max-w-md mx-auto">Complete courses to earn certificates that showcase your achievements</p>
          <div className="mt-6">
            <Button variant="primary" onClick={() => navigate('/dashboard/courses')}>
              Browse Courses
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Certificates;
