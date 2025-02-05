import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CampaignService } from '../../services/campaign.service';
import { Campaign } from '../../models/campaign.model';
import { Observable, map, startWith, first } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.css'],
  imports: [ReactiveFormsModule, MatAutocompleteModule, CommonModule],
  standalone: true
})
export class CampaignFormComponent implements OnInit {
  campaignForm: FormGroup;
  isEditMode = false;
  campaignId?: number;
  towns = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
  allKeywords = ['electronics', 'fashion', 'home', 'sports', 'books'];
  filteredKeywords!: Observable<string[]>;
  keywordsArray: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private campaignService: CampaignService
  ) {
    this.campaignForm = this.fb.group({
      name: ['', Validators.required],
      keywords: [''], // Usuwamy Validators.required stąd
      bidAmount: [null, [Validators.required, Validators.min(1)]],
      campaignFund: [null, [Validators.required, Validators.min(1)]],
      status: [true, Validators.required],
      town: ['', Validators.required],
      radius: [null, [Validators.required, Validators.min(0)]]
    }, { 
      validators: [() => this.keywordsArray.length === 0 ? { requiredKeywords: true } : null] 
    });
  }

  ngOnInit() {
    this.filteredKeywords = this.campaignForm.get('keywords')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterKeywords(value || ''))
    );

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.campaignId = +id;
      const campaign = this.campaignService.getCampaign(this.campaignId);
      if (campaign) {
        this.campaignForm.patchValue({
          ...campaign,
          status: campaign.status === 'true',
          keywords: campaign.keywords.join(', ')
        });
      }
    }

    if (this.campaignForm.value.keywords) {
      this.keywordsArray = this.campaignForm.value.keywords.split(',').map((k: string) => k.trim());
    }
  }

  private _filterKeywords(value: string): string[] {
    const parts = value.split(',');
    const lastPart = parts.pop()?.trim() || '';
    const filterValue = lastPart.toLowerCase();
    
    return this.allKeywords
      .filter(keyword => keyword.toLowerCase().startsWith(filterValue))
      .map(keyword => parts.concat(keyword).join(', '));
  }

  onSubmit() {
    this.campaignForm.markAllAsTouched();

    if (this.campaignForm.valid) {
      const formValue = {
        ...this.campaignForm.value,
        status: this.campaignForm.value.status.toString(),
        keywords: this.keywordsArray
      };
  
      if (this.isEditMode && this.campaignId) {
        const originalCampaign = this.campaignService.getCampaign(this.campaignId);
        if (originalCampaign) {
          this.campaignService.updateCampaign(this.campaignId, {
            ...formValue,
            id: this.campaignId,
            createdAt: originalCampaign.createdAt
          });
        }
      } else {
        const success = this.campaignService.createCampaign(formValue);
        if (!success) return;
      }

      this.campaignService.campaigns$.pipe(first()).subscribe(() => {
        this.router.navigate(['../'], { 
          relativeTo: this.route,
          replaceUrl: true
        });
      });
    }
  }

  onCancel() {
    this.router.navigate(['/campaigns']);
  }

  onKeywordSelected(event: any) {
    const newKeyword = event.option.value.trim();
    this.addKeyword(newKeyword);
  }

  addCustomKeyword() {
    const inputValue = this.campaignForm.get('keywords')?.value?.trim();
    if (inputValue && !this.keywordsArray.includes(inputValue)) {
      this.addKeyword(inputValue);
    }
  }

  private addKeyword(keyword: string) {
    if (keyword && !this.keywordsArray.includes(keyword)) {
      this.keywordsArray.push(keyword);
      this.campaignForm.get('keywords')?.setValue('');
    }
  }

  removeKeyword(keyword: string) {
    this.keywordsArray = this.keywordsArray.filter(k => k !== keyword);
    this.campaignForm.get('keywords')?.setValue('');
  }
}
