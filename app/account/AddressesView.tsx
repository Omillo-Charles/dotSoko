"use client";

import React, { useState } from "react";
import { useAddresses, Address } from "@/hooks/useAddresses";
import { 
  Plus, 
  Home, 
  Briefcase, 
  MoreHorizontal,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  User as UserIcon,
  Globe,
  Loader2,
  Phone,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { AddressModal } from "@/components/modals/AddressModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";

export const AddressesView = () => {
  const { 
    addresses, 
    isLoading, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress 
  } = useAddresses();
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [addressToDeleteId, setAddressToDeleteId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setModalMode("create");
    setEditingAddress(null);
    setShowModal(true);
  };

  const handleOpenEdit = (address: Address) => {
    setModalMode("edit");
    setEditingAddress(address);
    setShowModal(true);
    setActiveDropdown(null);
  };

  const handleModalSubmit = async (data: any) => {
    if (modalMode === "create") {
      await addAddress.mutateAsync(data);
    } else if (editingAddress) {
      await updateAddress.mutateAsync({ 
        addressId: editingAddress.id, 
        data 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-black text-xs tracking-widest uppercase">Loading addresses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <Link 
            href="/account?view=overview" 
            className="p-4  backdrop-blur-3xl rounded-2xl transition-all text-muted-foreground  border border-border shadow-sm group"
          >
            <ArrowLeft className="w-6 h-6 transition-transform" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none">My Addresses</h1>
            <p className="text-muted-foreground font-medium text-lg">Manage your delivery addresses.</p>
          </div>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-4 bg-primary text-primary-foreground px-12 py-5 rounded-[2rem] font-black text-xs tracking-widest   transition-all shadow-2xl shadow-primary/40 "
        >
          <Plus className="w-5 h-5" />
          Add address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addresses.length === 0 ? (
          <div className="col-span-full py-24 text-center space-y-6 bg-background/20 backdrop-blur-3xl rounded-[3rem] border border-dashed border-border group transition-all">
            <div className="space-y-2">
               <h3 className="text-2xl font-bold text-foreground tracking-tight">No addresses from you</h3>
               <p className="text-muted-foreground font-medium text-sm">Add a new address to enable shopping.</p>
            </div>
            <button 
              onClick={handleOpenCreate}
              className="px-8 py-3.5 bg-foreground text-background rounded-full font-bold text-xs tracking-widest   transition-all shadow-xl"
            >
              Add Address
            </button>
          </div>
        ) : (
          addresses.map((address) => (
            <div 
              key={address.id}
              className={`relative p-8 rounded-[3rem] border transition-all duration-300 flex flex-col justify-between h-full bg-background/40 backdrop-blur-3xl border-border   group/card ${
                address.isDefault ? "ring-2 ring-primary/20 bg-primary/5" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-border shadow-inner ${
                    address.type === 'home' ? 'bg-blue-500/10 text-blue-500' : 
                    address.type === 'work' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-purple-500/10 text-purple-500'
                  }`}>
                    {address.type === 'home' ? <Home className="w-5 h-5" /> : 
                     address.type === 'work' ? <Briefcase className="w-5 h-5" /> :
                     <Globe className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg capitalize">{address.type}</h3>
                    {address.isDefault && (
                      <span className="text-[10px] font-black tracking-widest text-primary uppercase">Primary</span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <button 
                    onClick={() => setActiveDropdown(activeDropdown === address.id ? null : address.id)}
                    className="p-2 text-muted-foreground  transition-colors rounded-xl "
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>

                  {activeDropdown === address.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border shadow-2xl rounded-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-2 space-y-1">
                        {!address.isDefault && (
                          <button 
                            onClick={() => {
                              setDefaultAddress.mutate(address.id);
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-4 py-3 text-xs font-bold text-foreground   rounded-xl transition-all"
                          >
                            Set as Primary
                          </button>
                        )}
                        <button 
                          onClick={() => handleOpenEdit(address)}
                          className="w-full text-left px-4 py-3 text-xs font-bold text-foreground  rounded-xl transition-all"
                        >
                          Edit Details
                        </button>
                        <button 
                          onClick={() => {
                            setAddressToDeleteId(address.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-3 text-xs font-bold text-red-500  rounded-xl transition-all"
                        >
                          Remove Address
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <p className="font-bold text-foreground text-base tracking-tight">{address.name}</p>
                </div>
                
                <div className="space-y-1 pl-7 relative border-l border-border/50 ml-2">
                  <p className="text-sm text-foreground font-semibold leading-relaxed capitalize">
                    {address.street}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">
                    {address.city}, Kenya
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-bold tracking-tight text-foreground">{address.phone}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AddressModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        initialData={editingAddress}
        mode={modalMode}
      />

      <ConfirmationModal
        isOpen={!!addressToDeleteId}
        onClose={() => setAddressToDeleteId(null)}
        onConfirm={() => {
          if (addressToDeleteId) {
            deleteAddress.mutate(addressToDeleteId);
            setAddressToDeleteId(null);
          }
        }}
        title="Delete Address"
        description="Are you sure you want to remove this address? This action cannot be undone."
        confirmText="Remove"
        variant="danger"
        isLoading={deleteAddress.isPending}
      />
    </div>
  );
};
