'use client';

import { useState, useEffect } from 'react';

interface DailyRecord {
  id: string;
  date: string;
  sales: number;
  expenses: number;
  profit: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Dashboard() {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sales, setSales] = useState('');
  const [expenses, setExpenses] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all records
  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/daily-records');
      if (!response.ok) throw new Error('Failed to fetch records');
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Add new record
  const addRecord = async () => {
    setError('');
    
    // Validation
    if (!date.trim()) {
      setError('Please select a date');
      return;
    }
    
    if (!sales.trim() || !expenses.trim()) {
      setError('Please enter both sales and expenses amounts');
      return;
    }

    const salesNum = parseFloat(sales);
    const expensesNum = parseFloat(expenses);

    if (isNaN(salesNum) || isNaN(expensesNum)) {
      setError('Please enter valid numbers for sales and expenses');
      return;
    }

    if (salesNum < 0 || expensesNum < 0) {
      setError('Sales and expenses must be positive numbers');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/daily-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: date,
          sales: salesNum,
          expenses: expensesNum,
          notes: notes.trim()
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to add record');
      }

      const newRecord = responseData;
      setRecords(prev => [newRecord, ...prev]);
      
      // Reset form
      setSales('');
      setExpenses('');
      setNotes('');
      setError('');
      
      // Show success message
      alert('Record added successfully!');
    } catch (error) {
      console.error('Error adding record:', error);
      setError(error instanceof Error ? error.message : 'Failed to add record. Please check your input and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete record
  const deleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      const response = await fetch(`/api/daily-records/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete record');

      setRecords(prev => prev.filter(record => record.id !== id));
      alert('Record deleted successfully!');
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Failed to delete record. Please try again.');
    }
  };

  // Calculate totals
  const totalSalesAmount = records.reduce((sum, record) => sum + record.sales, 0);
  const totalExpensesAmount = records.reduce((sum, record) => sum + record.expenses, 0);
  const totalProfit = totalSalesAmount - totalExpensesAmount;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-4">
            Shop Daily Tracker
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">Track your daily sales and expenses with ease</p>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-4 sm:p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm sm:text-base font-medium">Total Sales</p>
                <p className="text-white text-2xl sm:text-3xl font-bold">${totalSalesAmount.toFixed(2)}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <svg className="w-6 sm:w-8 h-6 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-400 to-rose-500 p-4 sm:p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm sm:text-base font-medium">Total Expenses</p>
                <p className="text-white text-2xl sm:text-3xl font-bold">${totalExpensesAmount.toFixed(2)}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <svg className="w-6 sm:w-8 h-6 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-br ${totalProfit >= 0 ? 'from-blue-400 to-indigo-500' : 'from-orange-400 to-red-500'} p-4 sm:p-6 rounded-2xl shadow-xl transform hover:scale-105 transition-transform duration-200`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm sm:text-base font-medium">Total Profit</p>
                <p className="text-white text-2xl sm:text-3xl font-bold">${totalProfit.toFixed(2)}</p>
              </div>
              <div className="bg-white/20 p-2 sm:p-3 rounded-full">
                <svg className="w-6 sm:w-8 h-6 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Add New Record Form */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
            <svg className="w-5 sm:w-6 h-5 sm:h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Daily Record
          </h2>
          
          {/* Error message display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-base bg-white text-gray-900 placeholder-gray-500"
                style={{ minHeight: '44px' }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Total Sales ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={sales}
                onChange={(e) => setSales(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 text-base bg-white text-gray-900 placeholder-gray-500"
                style={{ minHeight: '44px' }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Total Expenses ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 text-base bg-white text-gray-900 placeholder-gray-500"
                style={{ minHeight: '44px' }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-base bg-white text-gray-900 placeholder-gray-500"
                style={{ minHeight: '44px' }}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addRecord}
                disabled={!date || !sales || !expenses || isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-base"
                style={{ minHeight: '44px' }}
              >
                {isSubmitting ? 'Adding...' : 'Add Record'}
              </button>
            </div>
          </div>
        </div>

        {/* Daily Records Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
              <svg className="w-5 sm:w-6 h-5 sm:h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Daily Records
            </h2>
          </div>
          
          {records.length === 0 ? (
            <div className="p-8 sm:p-16 text-center">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 text-base sm:text-lg">No records yet. Add your first daily record above.</p>
            </div>
          ) : (
            <div>
              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 lg:px-8 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-4 lg:px-8 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sales</th>
                        <th className="px-4 lg:px-8 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expenses</th>
                        <th className="px-4 lg:px-8 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Profit</th>
                        <th className="px-4 lg:px-8 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Notes</th>
                        <th className="px-4 lg:px-8 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {records.map((record, index) => (
                        <tr key={record.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-200`}>
                          <td className="px-4 lg:px-8 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {new Date(record.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="px-4 lg:px-8 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                            ${record.sales.toFixed(2)}
                          </td>
                          <td className="px-4 lg:px-8 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                            ${record.expenses.toFixed(2)}
                          </td>
                          <td className={`px-4 lg:px-8 py-4 whitespace-nowrap text-sm font-bold ${record.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            ${record.profit.toFixed(2)}
                          </td>
                          <td className="px-4 lg:px-8 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {record.notes || '-'}
                          </td>
                          <td className="px-4 lg:px-8 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => deleteRecord(record.id)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden">
                <div className="divide-y divide-gray-200">
                  {records.map((record) => (
                    <div key={record.id} className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(record.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          {record.notes && (
                            <p className="text-xs text-gray-600 mt-1">{record.notes}</p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteRecord(record.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-gray-500">Sales</p>
                          <p className="text-sm font-bold text-green-600">${record.sales.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Expenses</p>
                          <p className="text-sm font-bold text-red-600">${record.expenses.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Profit</p>
                          <p className={`text-sm font-bold ${record.profit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                            ${record.profit.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}