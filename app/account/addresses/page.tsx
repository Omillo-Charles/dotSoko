"use client";

import React, { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { 
  MapPin, 
  Plus, 
  Home, 
  Briefcase, 
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

// Mock data to demonstrate the UI until API Integration
const MOCK_ADDRESSES = [
  {
    id: "1",
    type: "home",
    name: "John Doe",
    phone: "+254 712 345 678",
    city: "Nairobi",
    street: "Kilimani, Argwings Kodhek Rd",
    isDefault: true
  },
  {
    id: "2",
    type: "work",
    name: "John Doe",
    phone: "+254 712 345 678",
    city: "Nairobi",
    street: "Westlands, Waiyaki Way",
    isDefault: false
  }
];

const SavedAddresses = () => {
  const { user } = useUser();
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
    setActiveDropdown(null);
  };

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
    setActiveDropdown(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Saved Addresses</h1>
            <p className="text-muted-foreground font-medium text-sm mt-1">Manage where your goods get delivered</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-black rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/25 lg:self-start"
        >
          <Plus className="w-5 h-5" />
          Add Address
        </button>
      </div>

      {/* Address List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.length === 0 ? (
          <div className="col-span-full py-16 text-center space-y-4 bg-background/40 backdrop-blur-md rounded-[2.5rem] border border-white/5">
            <div className="w-20 h-20 bg-muted/40 rounded-full flex items-center justify-center mx-auto opacity-50 ring-4 ring-white/5">
              <MapPin className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No addresses found</h3>
            <p className="text-muted-foreground font-medium max-w-sm mx-auto">You haven't added any delivery locations yet. Add one to speed up your checkout.</p>
          </div>
        ) : (
          addresses.map((address) => (
            <div 
              key={address.id}
              className={`relative p-6 rounded-[2rem] border transition-all duration-300 ${
                address.isDefault 
                  ? "bg-primary/5 border-primary/30 shadow-[0_10px_30px_rgba(var(--primary),0.1)]" 
                  : "bg-background/60 backdrop-blur-3xl border-border shadow-lg hover:border-primary/20 hover:shadow-primary/5"
              }`}
            >
              {address.isDefault && (
                <div className="absolute top-0 right-0 p-1.5 px-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-bl-2xl rounded-tr-[1.9rem] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Default
                </div>
              )}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    address.type === 'home' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'
                  }`}>
                    {address.type === 'home' ? <Home className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-black text-foreground text-lg uppercase tracking-tight">
                      {address.type}
                    </h3>
                  </div>
                </div>

                {/* Dropdown Menu */}
                <div className="relative">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === address.id ? null : address.id)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {activeDropdown === address.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border shadow-2xl rounded-2xl overflow-hidden z-10 animate-in fade-in slide-in-from-top-2">
                      <div className="p-2 space-y-1">
                        {!address.isDefault && (
                          <button 
                            onClick={() => handleSetDefault(address.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Set as Default
                          </button>
                        )}
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-foreground hover:bg-muted rounded-xl transition-colors">
                          <Edit2 className="w-4 h-4" />
                          Edit Address
                        </button>
                        <button 
                          onClick={() => handleDelete(address.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <p className="font-bold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  {address.name}
                </p>
                <p className="text-muted-foreground font-medium text-sm flex items-center gap-2">
                   Phone: <span className="text-foreground">{address.phone}</span>
                </p>
                <div className="pt-4 border-t border-border/50 mt-4 space-y-1">
                  <p className="text-foreground font-medium">{address.street}</p>
                  <p className="text-muted-foreground font-medium text-sm">{address.city}, Kenya</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Address Modal Placeholder */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="bg-background border border-border p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl animate-in zoom-in-95">
            <h2 className="text-2xl font-black text-foreground mb-6">Add New Address</h2>
            <p className="text-muted-foreground mb-8">This is where the address form would go (Name, City, Street, Phone).</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-muted font-bold text-foreground rounded-2xl hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-primary font-bold text-primary-foreground rounded-2xl shadow-lg hover:shadow-primary/30 transition-all"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper icon component since it wasn't imported from lucide-react in this snippet
const User = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default SavedAddresses;
