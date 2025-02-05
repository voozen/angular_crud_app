import { Injectable } from '@angular/core';
import { Campaign } from '../models/campaign.model';
import { BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {
  private campaigns: Campaign[] = [];
  private balance = 10000; // Początkowy stan konta
  private campaignsSubject = new BehaviorSubject<Campaign[]>([]);
  private balanceSubject = new BehaviorSubject<number>(this.balance);
  private storageKey = 'campaignData';

  campaigns$ = this.campaignsSubject.asObservable();
  balance$ = this.balanceSubject.asObservable();

  constructor() {
    const savedData = localStorage.getItem(this.storageKey);
    if (savedData) {
      const data = JSON.parse(savedData);
      this.campaigns = data.campaigns || [];
      this.balance = data.balance || 10000;
    }
    this.updateSubjects();
  }

  getBalance() {
    return this.balance;
  }

  getCampaigns() {
    return this.campaigns$;
  }

  getCampaign(id: number) {
    const campaign = this.campaigns.find(c => c.id === id);
    if (campaign) {
      return {...campaign};
    } else {
      console.error(`Campaign with id ${id} not found`);
      return null;
    }
  }
  
  createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt'>) {
    if (campaign.campaignFund > this.balance) {
      alert('Insufficient funds to create this campaign!');
      return false;
    }
    
    const newCampaign = {
      ...campaign,
      id: Date.now(),
      createdAt: new Date()
    };
    this.balance -= campaign.campaignFund;
    this.campaigns.push(newCampaign);
    this.updateSubjects();
    return true;
  }

  updateCampaign(id: number, updatedCampaign: Campaign) {
    const index = this.campaigns.findIndex(c => c.id === id);
    if (index > -1) {
      const originalCampaign = this.campaigns[index];
      const fundDifference = originalCampaign.campaignFund - updatedCampaign.campaignFund;
      
      if (this.balance + fundDifference >= 0) {
        this.balance += fundDifference;
        const updatedCampaigns = this.campaigns.map(c => 
          c.id === id ? {...c, ...updatedCampaign} : {...c}
        );
        this.campaigns = updatedCampaigns;
        this.updateSubjects();
      } else {
        alert('Insufficient funds for this update!');
      }
    }
  }

  deleteCampaign(id: number) {
    const index = this.campaigns.findIndex(c => c.id === id);
    if (index > -1) {
      this.balance += this.campaigns[index].campaignFund;
      this.campaigns.splice(index, 1);
      this.updateSubjects();
    }
  }

  private updateSubjects(force = false) {
    this.campaignsSubject.next([...this.campaigns]);
    this.balanceSubject.next(this.balance);
    localStorage.setItem(this.storageKey, 
      JSON.stringify({
        campaigns: this.campaigns,
        balance: this.balance
      })
    );
  }
}
