"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Camera, MapPin, Trash2, ShieldCheck, Mail, Phone, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [stateStr, setStateStr] = useState('');
  const [country, setCountry] = useState('');
  const [zipCode, setZipCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/profile');
        const profile = res.data.data.user;
        setName(profile.name || '');
        setPhone(profile.phone || '');
        setBio(profile.bio || '');
        setAvatar(profile.avatar || '');
        setAddresses(profile.addresses || []);
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.patch('/users/profile', { name, phone, bio });
      toast.success('Profile updated successfully');
      if (user) setUser({ ...user, name });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('avatar', file);

    setUploadingAvatar(true);

    try {
      const res = await api.patch('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newAvatar = res.data.data.user.avatar;
      setAvatar(newAvatar);
      if (user) setUser({ ...user, avatar: newAvatar });
      toast.success('Avatar uploaded successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/users/address', { street, city, state: stateStr, country, zipCode });
      setAddresses(res.data.data.addresses);
      setStreet('');
      setCity('');
      setStateStr('');
      setCountry('');
      setZipCode('');
      toast.success('Address added successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await api.delete(`/users/address/${id}`);
      setAddresses(res.data.data.addresses);
    } catch (err) {
      console.error(err);
    }
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 py-8 px-4 sm:px-6 lg:px-8 pb-16">
      {/* Header Banner */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <Card className="overflow-hidden border-none shadow-sm rounded-2xl bg-gradient-to-br from-[#166534] to-[#0f4624] text-white">
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative z-10">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 overflow-hidden bg-white/10 shadow-xl flex items-center justify-center relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-bold text-white">{name?.charAt(0).toUpperCase() || 'U'}</span>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-sm">
                  <Camera size={24} className="mb-2" />
                  <span className="text-xs font-semibold uppercase tracking-wider">{uploadingAvatar ? 'Uploading...' : 'Change'}</span>
                </div>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleAvatarChange}
              />
            </div>
            
            {/* User Info Section */}
            <div className="text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold mb-3 backdrop-blur-sm uppercase tracking-wider">
                <ShieldCheck size={14} className="text-[#E08A3E]" />
                {user?.role || 'User'} Profile
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2 text-white">
                {name || 'Your Profile'}
              </h1>
              <p className="text-white/80 text-lg flex items-center justify-center md:justify-start gap-2">
                <Mail size={16} /> {user?.email}
              </p>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <UserIcon size={300} className="transform rotate-12 translate-x-20 -translate-y-20" />
          </div>
        </Card>
      </motion.div>



      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Information Form */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden h-full">
            <CardHeader className="bg-[#FAF8F2] border-b border-border/40 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#166534]">
                <UserIcon size={20} /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Full Name" 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    className="bg-muted/30 border-border/60 focus-visible:ring-[#166534]"
                  />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <div className="flex h-9 w-full rounded-md border border-input bg-muted/50 px-3 py-1 text-sm shadow-sm text-muted-foreground items-center cursor-not-allowed">
                      {user?.email}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Phone size={14} className="text-muted-foreground" /> Phone Number
                  </label>
                  <Input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="+1 (555) 000-0000"
                    className="bg-muted/30 border-border/60 focus-visible:ring-[#166534]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Bio / About Me</label>
                  <textarea 
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#166534] transition-colors resize-none" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    placeholder="Tell us a little bit about yourself..."
                  />
                </div>

                <div className="pt-4 border-t border-border/50">
                  <Button type="submit" className="w-full bg-[#166534] hover:bg-[#14532D] text-white shadow-sm font-semibold h-11 rounded-xl">
                    {loading ? 'Saving Changes...' : 'Save Profile Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Address Book */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <div className="space-y-8 h-full flex flex-col">
            {/* Saved Addresses */}
            <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden flex-1">
              <CardHeader className="bg-[#FAF8F2] border-b border-border/40 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#E08A3E]">
                  <MapPin size={20} /> Address Book
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {addresses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/20 rounded-xl border border-dashed border-border">
                    <MapPin size={32} className="text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground font-medium">No saved addresses yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {addresses.map((addr) => (
                      <div key={addr._id} className="p-4 bg-white border border-border/60 rounded-xl flex justify-between items-start hover:shadow-sm transition-shadow group relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E08A3E] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="space-y-1">
                          <p className="font-bold text-foreground flex items-center gap-2">
                            {addr.street}
                            {addr.isDefault && <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#166534]/10 text-[#166534] rounded-full">Default</span>}
                          </p>
                          <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.zipCode}</p>
                          <p className="text-sm text-muted-foreground font-medium">{addr.country}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteAddress(addr._id)} className="text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add New Address */}
            <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/20 border-b border-border/40 pb-4">
                <CardTitle className="text-base font-bold">Add New Address</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <Input 
                    label="Street Address" 
                    value={street} 
                    onChange={(e) => setStreet(e.target.value)} 
                    required 
                    className="bg-white"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required className="bg-white" />
                    <Input label="State/Province" value={stateStr} onChange={(e) => setStateStr(e.target.value)} required className="bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Zip Code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} required className="bg-white" />
                    <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} required className="bg-white" />
                  </div>
                  <Button type="submit" variant="outline" className="w-full font-semibold border-border/80 hover:bg-[#FAF8F2] hover:text-[#E08A3E]">
                    {loading ? 'Adding...' : 'Add Address'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
