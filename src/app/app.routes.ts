import { Routes } from '@angular/router';
import { CampaignListComponent } from './components/campaign-list/campaign-list.component';
import { CampaignFormComponent } from './components/campaign-form/campaign-form.component';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'campaigns', component: CampaignListComponent },
      { path: 'campaigns/new', component: CampaignFormComponent },
      { path: 'campaigns/edit/:id', component: CampaignFormComponent },
      { path: '', redirectTo: 'campaigns', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'campaigns' }
];
