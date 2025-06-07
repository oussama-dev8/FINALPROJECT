import React from 'react';
import { useParams } from 'react-router-dom';
import { VideoRoom } from '../components/Video/VideoRoom';
import { mockLessons, mockCourses } from '../data/mockData';

export function VideoRoomPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  
  const lesson = mockLessons.find(l => l.id === lessonId);
  const course = lesson ? mockCourses.find(c => c.id === lesson.courseId) : null;

  if (!lesson || !course) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Session Not Found</h2>
          <p className="text-gray-300">The requested video session could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <VideoRoom
      roomId={`darsy_room_${lesson.id}`}
      courseTitle={course.title}
      lessonTitle={lesson.title}
    />
  );
}