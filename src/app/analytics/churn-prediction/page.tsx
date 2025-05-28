"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/firebase/auth-context';
import { ProtectedRoute } from '@/components/protected-route';

// Churn prediction interface
interface ChurnPrediction {
  id: string;
  customerId: string;
  willChurn: boolean;
  probability: number;
  confidence: 'high' | 'medium' | 'low';
  topFactors: Array<{
    feature: string;
    importance: number;
    direction: 'positive' | 'negative';
  }>;
  recommendedActions?: string[];
  createdAt: string;
}

// Customer interface
interface Customer {
  id: string;
  name: string;
  email: string;
  subscription?: {
    tier: string;
    status: string;
  };
}

export default function ChurnPredictionPage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();
  const [prediction, setPrediction] = useState<ChurnPrediction | null>(null);
  const [highRiskCustomers, setHighRiskCustomers] = useState<Array<ChurnPrediction & { customer?: Customer }>>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin when component mounts
  useEffect(() => {
    if (!loading && user) {
      // In a real app, this would check the user's role in the database
      // For demo purposes, we'll assume the logged-in user is an admin
      setIsAdmin(true);
      
      // If admin, fetch high risk customers
      if (isAdmin) {
        fetchHighRiskCustomers();
      } else {
        // For regular users, fetch their own prediction
        fetchChurnPrediction(user.uid);
        setSelectedCustomerId(user.uid);
      }
    }
  }, [user, loading]);

  // Fetch churn prediction for a customer
  const fetchChurnPrediction = async (customerId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/ai/churn-prediction?customerId=${customerId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch churn prediction');
      }
      
      const data = await response.json();
      setPrediction(data.prediction);
      setSelectedCustomerId(customerId);
    } catch (error) {
      console.error('Error fetching churn prediction:', error);
      setError('Failed to load churn prediction. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch high risk customers (admin only)
  const fetchHighRiskCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, this would be an API call to get high risk customers
      // For demo purposes, we'll generate sample data
      const sampleCustomers = [
        {
          id: '1',
          name: 'Acme Corporation',
          email: 'contact@acme.com',
          subscription: {
            tier: 'professional',
            status: 'active',
          },
        },
        {
          id: '2',
          name: 'Globex Industries',
          email: 'info@globex.com',
          subscription: {
            tier: 'enterprise',
            status: 'active',
          },
        },
        {
          id: '3',
          name: 'Initech LLC',
          email: 'support@initech.com',
          subscription: {
            tier: 'basic',
            status: 'active',
          },
        },
      ];
      
      const samplePredictions = [
        {
          id: 'pred1',
          customerId: '1',
          willChurn: true,
          probability: 0.85,
          confidence: 'high' as const,
          topFactors: [
            {
              feature: 'Support Tickets Count',
              importance: 0.4,
              direction: 'positive' as const,
            },
            {
              feature: 'Login Frequency Per Month',
              importance: 0.3,
              direction: 'positive' as const,
            },
            {
              feature: 'Feature Usage Percent',
              importance: 0.2,
              direction: 'positive' as const,
            },
          ],
          recommendedActions: [
            'Proactively reach out to address ongoing issues',
            'Schedule a product training session',
            'Offer a temporary discount on renewal',
          ],
          createdAt: new Date().toISOString(),
          customer: sampleCustomers[0],
        },
        {
          id: 'pred2',
          customerId: '2',
          willChurn: true,
          probability: 0.72,
          confidence: 'medium' as const,
          topFactors: [
            {
              feature: 'Payment Delays',
              importance: 0.5,
              direction: 'positive' as const,
            },
            {
              feature: 'Average Response Time',
              importance: 0.3,
              direction: 'positive' as const,
            },
          ],
          recommendedActions: [
            'Offer a more flexible payment schedule',
            'Prioritize support tickets from this customer',
            'Schedule a customer success check-in call',
          ],
          createdAt: new Date().toISOString(),
          customer: sampleCustomers[1],
        },
        {
          id: 'pred3',
          customerId: '3',
          willChurn: true,
          probability: 0.68,
          confidence: 'medium' as const,
          topFactors: [
            {
              feature: 'Feature Usage Percent',
              importance: 0.4,
              direction: 'positive' as const,
            },
            {
              feature: 'Subscription Length Months',
              importance: 0.3,
              direction: 'positive' as const,
            },
          ],
          recommendedActions: [
            'Schedule a product training session',
            'Offer loyalty discount or premium features',
            'Schedule a customer success check-in call',
          ],
          createdAt: new Date().toISOString(),
          customer: sampleCustomers[2],
        },
      ];
      
      setHighRiskCustomers(samplePredictions);
      
      // If no customer is selected yet, select the first one
      if (!selectedCustomerId && samplePredictions.length > 0) {
        setSelectedCustomerId(samplePredictions[0].customerId);
        setPrediction(samplePredictions[0]);
      }
    } catch (error) {
      console.error('Error fetching high risk customers:', error);
      setError('Failed to load high risk customers. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a new prediction
  const generateNewPrediction = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const response = await fetch('/api/ai/churn-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedCustomerId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate churn prediction');
      }
      
      const data = await response.json();
      setPrediction(data.prediction);
      
      // Update the prediction in the high risk customers list if it exists
      if (isAdmin) {
        setHighRiskCustomers(prevCustomers => 
          prevCustomers.map(customer => 
            customer.customerId === selectedCustomerId 
              ? { ...customer, ...data.prediction }
              : customer
          )
        );
      }
    } catch (error) {
      console.error('Error generating churn prediction:', error);
      setError('Failed to generate churn prediction. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle customer selection change
  const handleCustomerChange = (customerId: string) => {
    if (isAdmin) {
      const selectedCustomer = highRiskCustomers.find(
        customer => customer.customerId === customerId
      );
      
      if (selectedCustomer) {
        setPrediction(selectedCustomer);
        setSelectedCustomerId(customerId);
      }
    } else {
      fetchChurnPrediction(customerId);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get confidence level color
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  // Get factor direction icon and color
  const getFactorDirectionStyle = (direction: string) => {
    if (direction === 'positive') {
      return {
        icon: '↑',
        color: 'text-red-500',
      };
    } else {
      return {
        icon: '↓',
        color: 'text-green-500',
      };
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Customer Churn Prediction</h1>
        <p className="text-gray-600 mb-6">
          Use machine learning to predict which customers are at risk of churning and take proactive measures to retain them.
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {isAdmin && (
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">High Risk Customers</h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : highRiskCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Subscription
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Churn Probability
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Prediction Date
                      </th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {highRiskCustomers.map((customer) => (
                      <tr
                        key={customer.customerId}
                        className={`hover:bg-gray-50 ${
                          selectedCustomerId === customer.customerId ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="py-2 px-4 border-b border-gray-200">
                          <div className="font-medium text-gray-900">{customer.customer?.name}</div>
                          <div className="text-gray-500 text-sm">{customer.customer?.email}</div>
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200">
                          {customer.customer?.subscription ? (
                            <div>
                              <span className="capitalize">{customer.customer.subscription.tier}</span>
                              <span className="text-xs ml-2 px-2 py-1 rounded-full bg-green-100 text-green-800">
                                {customer.customer.subscription.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500">No subscription</span>
                          )}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-red-500 h-2.5 rounded-full"
                                style={{ width: `${customer.probability * 100}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {Math.round(customer.probability * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200">
                          <span className={`capitalize ${getConfidenceColor(customer.confidence)}`}>
                            {customer.confidence}
                          </span>
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200 text-sm text-gray-500">
                          {formatDate(customer.createdAt)}
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200 text-right">
                          <button
                            onClick={() => handleCustomerChange(customer.customerId)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No high risk customers found.</p>
            )}
          </div>
        )}
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {isAdmin ? 'Customer Churn Details' : 'Your Churn Prediction'}
            </h2>
            <button
              onClick={generateNewPrediction}
              disabled={isGenerating || !selectedCustomerId}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate New Prediction'}
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : prediction ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Churn Probability</h3>
                    <div className="flex items-center mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full ${
                            prediction.willChurn ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${prediction.probability * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">0%</span>
                      <span className="text-lg font-bold">
                        {Math.round(prediction.probability * 100)}%
                      </span>
                      <span className="text-sm text-gray-500">100%</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Prediction Result</h3>
                    <div className="flex items-center">
                      <div
                        className={`text-white px-3 py-1 rounded-full ${
                          prediction.willChurn ? 'bg-red-500' : 'bg-green-500'
                        }`}
                      >
                        {prediction.willChurn ? 'Likely to Churn' : 'Not Likely to Churn'}
                      </div>
                      <span className={`ml-2 ${getConfidenceColor(prediction.confidence)}`}>
                        ({prediction.confidence} confidence)
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Prediction Date</h3>
                    <p className="text-gray-700">
                      {formatDate(prediction.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Key Factors</h3>
                  <div className="space-y-3">
                    {prediction.topFactors.map((factor, index) => {
                      const { icon, color } = getFactorDirectionStyle(factor.direction);
                      return (
                        <div key={index} className="flex items-center">
                          <div className="w-1/2">
                            <span className="text-gray-700">{factor.feature}</span>
                          </div>
                          <div className="w-1/4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${factor.importance * 100}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-1/4 pl-2">
                            <span className={`font-medium ${color}`}>
                              {icon} {factor.direction === 'positive' ? 'Increases' : 'Decreases'} risk
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {prediction.recommendedActions && prediction.recommendedActions.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Recommended Actions</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {prediction.recommendedActions.map((action, index) => (
                      <li key={index} className="text-gray-700">{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500">
                {selectedCustomerId
                  ? 'No prediction available. Generate a new prediction to see results.'
                  : 'Select a customer to view their churn prediction.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
