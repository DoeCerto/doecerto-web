import { api } from './api';


export interface AddressData {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OngUpdateData {
  description?: string;
  contactNumber?: string;
  websiteUrls?: string[];
  yearsOfOperation?: number;
  categoryIds?: number[];
  address?: AddressData; 
}

export const OngSetupService = {
  async getCategories() {
    const { data } = await api<any>('/categories?take=100');
    return data?.data || data || [];
  },

  async updateAddress(address: AddressData) {
    return api('/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address),
    });
  },

  async updateProfileData(data: OngUpdateData) {
    let url = (data.websiteUrls && data.websiteUrls.length > 0) 
      ? data.websiteUrls[0].trim() 
      : '';

    if (url && !url.startsWith('http')) {
      url = `https://${url}`;
    }

    
    const profilePayload = {
      description: data.description || '',
      contactNumber: data.contactNumber || '',
      website: url ? [url] : undefined,
      categoryIds: data.categoryIds ? data.categoryIds.map(Number) : [],
      yearsOfOperation: data.yearsOfOperation || null,
    };

    const profileResponse = await api('/ongs/me/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profilePayload),
    });

    
    if (data.address) {
      await this.updateAddress(data.address);
    }

    return profileResponse;
  },

  async updateProfileImages(
    avatar?: File | null, 
    banner?: File | null, 
    bannerCrop?: { x: number; y: number }
  ) {
    if (!avatar && !banner) return;
    const formData = new FormData();
    
    if (avatar instanceof File) formData.append('avatar', avatar);
    if (banner instanceof File) {
      formData.append('banner', banner);
      if (bannerCrop) {
        formData.append('bannerCropX', String(Math.round(bannerCrop.x)));
        formData.append('bannerCropY', String(Math.round(bannerCrop.y)));
      }
    }
    
    return api('/ongs/me/profile', { 
      method: 'POST', 
      body: formData 
    });
  },
};