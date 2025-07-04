"use client";

import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

// import { BASEURL } from '@/utils/constants';
// import { useEffect, useState } from 'react';

// interface MeetingFormData {
//   title: string;
//   description: string;
//   maxParticipants: number;
// }

// interface MeetingResponse {
//   id: string;
//   title: string;
//   description: string;
//   creator_name: string;
//   created_at: string;
//   is_active: boolean;
//   max_participants: number;
//   join_url: string;
// }

// export default function CreateMeetingPage() {
//   const [formData, setFormData] = useState<MeetingFormData>({
//     title: '',
//     description: '',
//     maxParticipants: 10
//   });
//   const [errors, setErrors] = useState<Partial<MeetingFormData>>({});
//   const [isLoading, setIsLoading] = useState(false);
//   const [apiError, setApiError] = useState('');
//   const [createdMeeting, setCreatedMeeting] = useState<MeetingResponse | null>(null);

//   useEffect(() => {
//     setCreatedMeeting(null);
//   }, []);

//   const validateForm = (): boolean => {
//     const newErrors: Partial<MeetingFormData> = {};

//     if (!formData.title.trim()) {
//       newErrors.title = 'Meeting title is required';
//     }

//     // if (formData.maxParticipants < 2 || formData.maxParticipants > 100) {
//     //   newErrors.maxParticipants = 'Max participants must be between 2 and 100';
//     // }

//     // setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setApiError('');

//     if (!validateForm()) return;
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) throw new Error("Please login to create meeting");
//       setIsLoading(true);
//       const req = await fetch(`${BASEURL}/meetings`, {
//         method: "POST",
//         body: JSON.stringify({
//           title: formData.title,
//           description: formData.description,
//           max_participants: formData.maxParticipants
//         }),
//         headers: {
//           "Content-Type": "application/json",
//           "authorization": `Bearer ${token}`
//         }
//       });

//       const res = await req.json();
//       if (!req.ok) throw new Error(res. detail || "Somrthing went wrong");
//       console.log("[RESPONSE]: ", res);
//     } catch (error) {
//       setApiError(error instanceof Error ? error.message : 'Failed to create meeting');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ 
//       ...prev, 
//       [name]: name === 'maxParticipants' ? parseInt(value) || 0 : value 
//     }));
//     if (errors[name as keyof MeetingFormData]) {
//       setErrors(prev => ({ ...prev, [name]: undefined }));
//     }
//   };

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text).then(() => {
//       // You could add a toast notification here
//       console.log('Copied to clipboard:', text);
//     });
//   };

//   const startMeeting = () => {
//     if (createdMeeting) {
//       // In a real app, this would navigate to the meeting room
//       window.open(`${window.location.origin}${createdMeeting.join_url}`, '_blank');
//     }
//   };

//   const goToDashboard = () => {
//     // In a real app, this would navigate to dashboard
//     window.location.href = '/dashboard';
//   };

//   if (createdMeeting) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-2xl mx-auto">
//           <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
//             <div className="text-center mb-8">
//               <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
//                 <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>
//               <h2 className="text-3xl font-bold text-gray-900 mb-2">Meeting Created Successfully!</h2>
//               <p className="text-gray-600">Your meeting is ready to go. Share the details below with participants.</p>
//             </div>

//             <div className="space-y-6">
//               <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Details</h3>
//                 <div className="space-y-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
//                     <p className="text-gray-900 font-medium">{createdMeeting.title}</p>
//                   </div>
//                   {createdMeeting.description && (
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                       <p className="text-gray-900">{createdMeeting.description}</p>
//                     </div>
//                   )}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
//                     <p className="text-gray-900">{createdMeeting.max_participants}</p>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Link</h3>
//                 <div className="flex items-center space-x-3">
//                   <div className="flex-1 bg-white rounded-lg border border-gray-300 px-4 py-3">
//                     <p className="text-sm font-mono text-gray-900 break-all">
//                       {`${window.location.origin}${createdMeeting.join_url}`}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => copyToClipboard(`${window.location.origin}${createdMeeting.join_url}`)}
//                     className="flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition-colors"
//                     title="Copy link"
//                   >
//                     <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>

//               <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting ID</h3>
//                 <div className="flex items-center space-x-3">
//                   <div className="flex-1 bg-white rounded-lg border border-yellow-300 px-4 py-3">
//                     <p className="text-sm font-mono text-gray-900 break-all">
//                       {createdMeeting.id}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => copyToClipboard(createdMeeting.id)}
//                     className="flex items-center justify-center px-4 py-3 bg-yellow-100 hover:bg-yellow-200 rounded-lg border border-yellow-300 transition-colors"
//                     title="Copy meeting ID"
//                   >
//                     <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>

//               <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Meeting Features</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="flex items-center space-x-3">
//                     <div className="flex-shrink-0">
//                       <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                         <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                       </div>
//                     </div>
//                     <span className="text-sm font-medium text-gray-700">HD Video & Audio</span>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <div className="flex-shrink-0">
//                       <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                         <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                       </div>
//                     </div>
//                     <span className="text-sm font-medium text-gray-700">Screen Sharing</span>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <div className="flex-shrink-0">
//                       <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                         <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                       </div>
//                     </div>
//                     <span className="text-sm font-medium text-gray-700">Real-time Chat</span>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <div className="flex-shrink-0">
//                       <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                         <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                       </div>
//                     </div>
//                     <span className="text-sm font-medium text-gray-700">Secure Connection</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-col sm:flex-row gap-4">
//                 <button
//                   onClick={startMeeting}
//                   className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
//                 >
//                   <div className="flex items-center justify-center space-x-2">
//                     <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                     </svg>
//                     <span>Start Meeting</span>
//                   </div>
//                 </button>
//                 <button
//                   onClick={goToDashboard}
//                   className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-4 px-6 rounded-xl border border-gray-300 transition-colors"
//                 >
//                   Back to Dashboard
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-2xl mx-auto">
//         <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
//           <div className="text-center mb-8">
//             <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
//               <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//               </svg>
//             </div>
//             <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
//               Create New Meeting
//             </h2>
//             <p className="text-gray-600">Set up your video conference in just a few steps</p>
//           </div>

//           <div className="space-y-6">
//             {apiError && (
//               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
//                 {apiError}
//               </div>
//             )}

//             <div className="space-y-6">
//               <div>
//                 <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
//                   Meeting Title *
//                 </label>
//                 <input
//                   id="title"
//                   name="title"
//                   type="text"
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                   placeholder="Enter meeting title (e.g., Team Standup, Client Review)"
//                   value={formData.title}
//                   onChange={handleChange}
//                 />
//                 {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
//               </div>

//               <div>
//                 <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
//                   Meeting Description
//                 </label>
//                 <textarea
//                   id="description"
//                   name="description"
//                   rows={4}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
//                   placeholder="Optional: Add meeting agenda, goals, or any relevant details..."
//                   value={formData.description}
//                   onChange={handleChange}
//                 />
//               </div>

//               <div>
//                 <label htmlFor="maxParticipants" className="block text-sm font-semibold text-gray-700 mb-2">
//                   Maximum Participants
//                 </label>
//                 <div className="relative">
//                   <input
//                     id="maxParticipants"
//                     name="maxParticipants"
//                     type="number"
//                     min="2"
//                     max="100"
//                     required
//                     className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                     placeholder="10"
//                     value={formData.maxParticipants}
//                     onChange={handleChange}
//                   />
//                   <div className="absolute inset-y-0 right-0 flex items-center pr-4">
//                     <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//                     </svg>
//                   </div>
//                 </div>
//                 <p className="mt-2 text-sm text-gray-500">Set between 2 and 100 participants</p>
//                 {errors.maxParticipants && (
//                   <p className="mt-2 text-sm text-red-600">{errors.maxParticipants}</p>
//                 )}
//               </div>

//               <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Meeting Features</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="flex items-center space-x-3">
//                     <div className="flex-shrink-0">
//                       <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                         <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                       </div>
//                     </div>
//                     <span className="text-sm font-medium text-gray-700">HD Video & Audio</span>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <div className="flex-shrink-0">
//                       <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                         <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                       </div>
//                     </div>
//                     <span className="text-sm font-medium text-gray-700">Screen Sharing</span>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <div className="flex-shrink-0">
//                       <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                         <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                       </div>
//                     </div>
//                     <span className="text-sm font-medium text-gray-700">Real-time Chat</span>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <div className="flex-shrink-0">
//                       <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
//                         <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                       </div>
//                     </div>
//                     <span className="text-sm font-medium text-gray-700">Secure Connection</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
//               <button
//                 type="button"
//                 onClick={goToDashboard}
//                 className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-xl border border-gray-300 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 onClick={handleSubmit}
//                 className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//               >
//                 {isLoading ? (
//                   <div className="flex items-center justify-center space-x-2">
//                     <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     <span>Creating Meeting...</span>
//                   </div>
//                 ) : (
//                   <div className="flex items-center justify-center space-x-2">
//                     <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                     </svg>
//                     <span>Create Meeting</span>
//                   </div>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

const CreateMeetingPage = () => {
  const [meetingId, setMeetingId] = useState("");
  const router = useRouter();

  const joinMeeting = () => {
    if (!meetingId.trim()) return;
    router.push(`/${meetingId}`)
  }
  
  return (
    <div className="w-[350px] mx-auto flex justify-center items-center h-fit p-4 bg-white gap-2 flex-col">
      <Input
        placeholder="Enter meeting ID"
        value={meetingId}
        onChange={(e) => setMeetingId(e.target.value)}
      />

      <Button
        onClick={joinMeeting}
        disabled={!meetingId.trim()}
        className="w-full"
      >
        Join meeting
      </Button>
    </div>
  )
}
export default CreateMeetingPage;