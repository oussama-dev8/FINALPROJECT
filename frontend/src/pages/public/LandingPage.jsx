import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/Button';
import Navbar from '@/components/navigation/Navbar';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <div className="relative h-screen max-h-[800px] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/assets/images/hero/diverse-students.jpg"
            alt="Diverse group of students learning together"
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40">
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="block">Empowering Diverse</span>
              <span className="block text-primary-400">Minds to Excel</span>
            </h1>
            <p className="mt-6 text-xl text-gray-200 max-w-lg">
              Join our inclusive learning community where students and educators from all backgrounds come together to share knowledge and grow.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/register" 
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
              >
                Start Learning
              </Link>
              <Link 
                to="/courses" 
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white hover:bg-opacity-10 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
              >
                Explore Courses
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>

      {/* Features Section - Redesigned */}
      <div id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left Column - Content */}
            <div className="mb-12 lg:mb-0">
              <span className="inline-block px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 rounded-full mb-4">
                Powerful Features
              </span>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Transform your learning experience
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Our platform combines cutting-edge technology with proven educational methods to deliver exceptional learning outcomes.
              </p>
              
              <div className="mt-10 space-y-8">
                {/* Feature 1 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Live Interactive Sessions</h3>
                    <p className="mt-2 text-base text-gray-600">
                      Engage in real-time with instructors and peers through high-quality video sessions and interactive discussions.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-1-1.7l-7-3.5a2 2 0 00-1.8 0l-7 3.5a2 2 0 00-1 1.7V19a2 2 0 002 2h9.5a2 2 0 002-2v-1.5" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Expert Instructors</h3>
                    <p className="mt-2 text-base text-gray-600">
                      Learn from industry-leading professionals who bring real-world experience into the virtual classroom.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500 text-white">
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Flexible Learning</h3>
                    <p className="mt-2 text-base text-gray-600">
                      Access course materials and sessions on your schedule, with options for both live and on-demand learning.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative mx-auto rounded-2xl overflow-hidden shadow-xl">
                <img
                  className="w-full h-auto"
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                  alt="Interactive learning dashboard"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-semibold">Interactive Learning Dashboard</h3>
                  <p className="mt-2 text-gray-200">Track your progress and stay organized with our intuitive dashboard.</p>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="hidden lg:block absolute -left-16 -bottom-16 w-32 h-32 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
              <div className="hidden lg:block absolute -right-16 -top-16 w-32 h-32 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section - Redesigned */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            {/* Left Column - Visual */}
            <div className="relative mb-12 lg:mb-0">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  className="w-full h-auto"
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                  alt="Diverse group of students collaborating"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-600/90 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-center">
                    <svg className="h-8 w-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-2 text-lg font-medium">4.9/5 from 1,200+ reviews</span>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="hidden lg:block absolute -left-12 -bottom-12 w-48 h-48 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
              <div className="hidden lg:block absolute -right-12 -top-12 w-48 h-48 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-50"></div>
            </div>

            {/* Right Column - Testimonials */}
            <div>
              <span className="inline-block px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-full mb-4">
                Student Testimonials
              </span>
              <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Loved by students worldwide
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Join thousands of satisfied students who have transformed their careers with our platform.
              </p>

              <div className="mt-12 space-y-8">
                {/* Testimonial 1 */}
                <div className="relative bg-gray-50 p-6 rounded-2xl">
                  <div className="absolute -top-4 -left-4 text-indigo-400">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 relative z-10">
                    "The interactive sessions are amazing! I've learned more in a few weeks here than I did in months of self-study. The instructors are knowledgeable and really care about student success."
                  </p>
                  <div className="mt-4 flex items-center">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src="/assets/images/testimonials/IMG-20250531-WA00001.jpg"
                      alt="Aymen Naci"
                    />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Aymen Naci</p>
                      <p className="text-sm text-gray-500">Control Engineering Student</p>
                    </div>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div className="relative bg-gray-50 p-6 rounded-2xl">
                  <div className="absolute -top-4 -left-4 text-indigo-400">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 relative z-10">
                    "As a working professional, the flexibility of this platform is invaluable. I can attend live sessions or watch recordings later. The quality of education is top-notch!"
                  </p>
                  <div className="mt-4 flex items-center">
                    <img
                      className="h-12 w-12 rounded-full object-cover"
                      src="/assets/images/testimonials/IMG_20250604_000325_828.jpg"
                      alt="Abdrraouf Benzerga"
                    />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Abdrraouf Benzerga</p>
                      <p className="text-sm text-gray-500">Computer Engineering Student</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:py-24 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gray-900 px-6 py-10 shadow-xl sm:px-12 sm:py-20">
            <div aria-hidden="true" className="absolute inset-0 -mt-72 sm:-mt-96">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-primary-600/20 to-transparent"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary-700/10 via-transparent to-transparent"></div>
            </div>
            <div className="relative">
              <div className="sm:text-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="block">Ready to transform your learning journey?</span>
                  <span className="block text-primary-300 mt-2">Start your free trial today.</span>
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
                  Join over 100,000 students from around the world who are already advancing their skills with our platform.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                  <Link to="/register" className="flex items-center justify-center rounded-md bg-white px-8 py-3 text-base font-medium text-primary-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Get Started for Free
                  </Link>
                  <Link to="/courses" className="flex items-center justify-center rounded-md border border-transparent bg-primary-500/20 px-8 py-3 text-base font-medium text-white hover:bg-primary-600/30 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-primary-700 transition-colors duration-200">
                    Browse Courses
                  </Link>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  No credit card required. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trusted By Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Trusted by Leading Institutions Worldwide
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Partnering with top educational institutions to deliver exceptional learning experiences
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {/* Harvard */}
            <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-1">HARVARD</div>
                <div className="text-xs text-gray-500">University</div>
              </div>
            </div>
            
            {/* MIT */}
            <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">MIT</div>
                <div className="text-xs text-gray-500">Cambridge, MA</div>
              </div>
            </div>
            
            {/* Oxford */}
            <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800 mb-1">OXFORD</div>
                <div className="text-xs text-gray-500">University</div>
              </div>
            </div>
            
            {/* Stanford */}
            <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">STANFORD</div>
                <div className="text-xs text-gray-500">University</div>
              </div>
            </div>
            
            {/* Cambridge */}
            <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800 mb-1">CAMBRIDGE</div>
                <div className="text-xs text-gray-500">University</div>
              </div>
            </div>
            
            {/* ETH Zurich */}
            <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">ETH</div>
                <div className="text-xs text-gray-500">Zürich</div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500">And 50+ other leading educational institutions worldwide</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center space-x-2">
                <img className="h-8 w-auto" src="/favicon.svg" alt="Darsy" />
                <span className="text-2xl font-bold text-white">Darsy</span>
              </div>
              <p className="text-gray-300 text-base">
                Empowering the next generation of learners with accessible, high-quality education.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Platform</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link to="/courses" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Courses</Link>
                    </li>
                    <li>
                      <Link to="/tutors" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Tutors</Link>
                    </li>
                    <li>
                      <Link to="/live-sessions" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Live Sessions</Link>
                    </li>
                    <li>
                      <Link to="/pricing" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Pricing</Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Support</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link to="/help" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Help Center</Link>
                    </li>
                    <li>
                      <Link to="/faq" className="text-base text-gray-400 hover:text-white transition-colors duration-200">FAQ</Link>
                    </li>
                    <li>
                      <Link to="/contact" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Contact Us</Link>
                    </li>
                    <li>
                      <Link to="/community" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Community</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link to="/about" className="text-base text-gray-400 hover:text-white transition-colors duration-200">About</Link>
                    </li>
                    <li>
                      <Link to="/blog" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Blog</Link>
                    </li>
                    <li>
                      <Link to="/careers" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Careers</Link>
                    </li>
                    <li>
                      <Link to="/press" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Press</Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Legal</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link to="/privacy" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Privacy</Link>
                    </li>
                    <li>
                      <Link to="/terms" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Terms</Link>
                    </li>
                    <li>
                      <Link to="/cookies" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Cookie Policy</Link>
                    </li>
                    <li>
                      <Link to="/licenses" className="text-base text-gray-400 hover:text-white transition-colors duration-200">Licenses</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 border-t border-gray-800 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; {new Date().getFullYear()} Darsy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
