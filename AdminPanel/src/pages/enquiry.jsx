import React, { useState, useEffect } from 'react';
import { Mail, Phone, User, Calendar, MessageSquare } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://ongc-q48j.vercel.app/api';

const Enquiry = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  useEffect(() => {
    loadEnquiries();
  }, []);

  const loadEnquiries = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('admin-token');
      const res = await fetch(`${API}/contact/admin/enquiries`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to load enquiries');
      const data = await res.json();
      setEnquiries(data.contacts || []);
    } catch (err) {
      console.error('Error loading enquiries:', err);
      alert('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (enquiry) => {
    setSelectedEnquiry(enquiry);
  };

  const closeDetails = () => {
    setSelectedEnquiry(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Contact Enquiries</h1>
          <p className="text-sm text-slate-600 mt-1">
            Total Enquiries: {enquiries.length}
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-sm text-slate-600">
            Loading enquiries...
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y">
                <thead>
                  <tr className="bg-white">
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-900 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {enquiries.map((enquiry) => (
                    <tr key={enquiry._id} className="bg-white hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{enquiry.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{enquiry.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {enquiry.subject ? (
                          <span className="max-w-xs truncate block">{enquiry.subject}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatDate(enquiry.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button 
                          onClick={() => openDetails(enquiry)} 
                          className="text-sky-700 hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {enquiries.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-500">
                  No enquiries yet
                </div>
              )}
            </div>

            {/* Mobile list */}
            <div className="md:hidden space-y-4">
              {enquiries.map((enquiry) => (
                <div key={enquiry._id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800">{enquiry.name}</div>
                      <div className="text-xs text-slate-500">{enquiry.email}</div>
                    </div>
                    <button 
                      onClick={() => openDetails(enquiry)} 
                      className="text-sky-700 text-sm hover:underline"
                    >
                      View
                    </button>
                  </div>
                  {enquiry.subject && (
                    <div className="text-sm text-slate-600 mb-2 truncate">{enquiry.subject}</div>
                  )}
                  <div className="text-xs text-slate-500">{formatDate(enquiry.createdAt)}</div>
                </div>
              ))}

              {enquiries.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center text-sm text-slate-500">
                  No enquiries yet
                </div>
              )}
            </div>
          </>
        )}

        {/* Details Modal */}
        {selectedEnquiry && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 cursor-pointer" onClick={closeDetails} />

            <div className="relative z-50 w-full max-w-2xl bg-white rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Enquiry Details</h2>
                <button 
                  onClick={closeDetails} 
                  className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="text-xs text-slate-500">Name</div>
                    <div className="text-sm font-medium text-slate-900">{selectedEnquiry.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="text-xs text-slate-500">Email</div>
                    <div className="text-sm font-medium text-slate-900">{selectedEnquiry.email}</div>
                  </div>
                </div>

                {selectedEnquiry.user?.mobile && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-slate-400" />
                    <div>
                      <div className="text-xs text-slate-500">Mobile</div>
                      <div className="text-sm font-medium text-slate-900">{selectedEnquiry.user.mobile}</div>
                    </div>
                  </div>
                )}

                {selectedEnquiry.user?.employeeId && (
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-slate-400" />
                    <div>
                      <div className="text-xs text-slate-500">Employee ID</div>
                      <div className="text-sm font-medium text-slate-900">{selectedEnquiry.user.employeeId}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <div>
                    <div className="text-xs text-slate-500">Submitted On</div>
                    <div className="text-sm font-medium text-slate-900">{formatDate(selectedEnquiry.createdAt)}</div>
                  </div>
                </div>

                {selectedEnquiry.subject && (
                  <div className="pt-4 border-t">
                    <div className="text-xs text-slate-500 mb-1">Subject</div>
                    <div className="text-sm font-medium text-slate-900">{selectedEnquiry.subject}</div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-slate-400 mt-1" />
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 mb-2">Message</div>
                      <div className="text-sm text-slate-800 bg-slate-50 p-4 rounded-lg whitespace-pre-wrap">
                        {selectedEnquiry.message}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeDetails}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Enquiry;
