import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CampaignService } from '../../services/campaign.service';
import { Observable } from 'rxjs';
import { Campaign } from '../../models/campaign.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { tap, shareReplay } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-campaign-list',
  templateUrl: './campaign-list.component.html',
  styleUrls: ['./campaign-list.component.css'],
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CampaignListComponent {
  campaigns$: Observable<Campaign[]>;
  originalStatus: { [key: number]: string } = {};

  constructor(
    private campaignService: CampaignService,
    private cdr: ChangeDetectorRef
  ) {
    this.campaigns$ = this.campaignService.campaigns$.pipe(
      tap(() => this.cdr.detectChanges()),
      shareReplay(1)
    );
  }

  ngOnInit() {
    this.campaigns$.subscribe(campaigns => {
      this.originalStatus = {};
      campaigns.forEach(c => this.originalStatus[c.id] = c.status);
      this.cdr.detectChanges();
    });
  }

  deleteCampaign(id: number) {
    if(confirm('Are you sure you want to delete this campaign?')) {
      this.campaignService.deleteCampaign(id);
    }
  }

  trackById(index: number, campaign: Campaign): number {
    return campaign.id;
  }
}
