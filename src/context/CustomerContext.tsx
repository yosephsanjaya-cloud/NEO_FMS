import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerProfileRecord, CustomerTransactionRecord } from '../types/fms';
import { INITIAL_CUSTOMER_PROFILES } from '../data/mockCustomerProfiles';

const CUSTOMER_STORAGE_KEY = 'NEO_FMS_CUSTOMER_PROFILES_V1_22';
const LEGACY_STORAGE_KEY = 'NEO_FMS_CUSTOMER_PROFILES_V1_21';

interface CustomerContextType {
  customers: CustomerProfileRecord[];
  selectedCustomer: CustomerProfileRecord | null;
  setSelectedCustomer: (cust: CustomerProfileRecord | null) => void;
  getCustomerByCif: (cif: string) => CustomerProfileRecord | undefined;
  getCustomerById: (id: string) => CustomerProfileRecord | undefined;
  updateCustomer: (updatedCust: CustomerProfileRecord) => void;
  addTransactionToCustomer: (cif: string, transaction: CustomerTransactionRecord) => void;
  resetCustomerProfiles: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<CustomerProfileRecord[]>(() => {
    try {
      const stored = sessionStorage.getItem(CUSTOMER_STORAGE_KEY) || sessionStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse customer profiles from sessionStorage', e);
    }
    return INITIAL_CUSTOMER_PROFILES;
  });

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfileRecord | null>(null);

  // Sync back to sessionStorage on change
  useEffect(() => {
    try {
      sessionStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to persist customer profiles to sessionStorage', e);
    }
  }, [customers]);

  // Keep selectedCustomer updated if its underlying customer record changes
  useEffect(() => {
    if (selectedCustomer) {
      const found = customers.find(c => c.cif === selectedCustomer.cif || c.id === selectedCustomer.id);
      if (found && JSON.stringify(found) !== JSON.stringify(selectedCustomer)) {
        setSelectedCustomer(found);
      }
    }
  }, [customers, selectedCustomer]);

  const getCustomerByCif = (cif: string) => {
    return customers.find(c => c.cif.toLowerCase() === cif.toLowerCase());
  };

  const getCustomerById = (id: string) => {
    return customers.find(c => c.id.toLowerCase() === id.toLowerCase());
  };

  const updateCustomer = (updatedCust: CustomerProfileRecord) => {
    setCustomers(prev => prev.map(c => c.id === updatedCust.id ? updatedCust : c));
    if (selectedCustomer?.id === updatedCust.id) {
      setSelectedCustomer(updatedCust);
    }
  };

  const addTransactionToCustomer = (cif: string, transaction: CustomerTransactionRecord) => {
    setCustomers(prev => prev.map(cust => {
      if (cust.cif.toLowerCase() === cif.toLowerCase()) {
        const updatedTransactions = [transaction, ...(cust.transactionHistory || [])];
        return {
          ...cust,
          transactionHistory: updatedTransactions
        };
      }
      return cust;
    }));
  };

  const resetCustomerProfiles = () => {
    sessionStorage.removeItem(CUSTOMER_STORAGE_KEY);
    setCustomers(INITIAL_CUSTOMER_PROFILES);
  };

  return (
    <CustomerContext.Provider
      value={{
        customers,
        selectedCustomer,
        setSelectedCustomer,
        getCustomerByCif,
        getCustomerById,
        updateCustomer,
        addTransactionToCustomer,
        resetCustomerProfiles
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
