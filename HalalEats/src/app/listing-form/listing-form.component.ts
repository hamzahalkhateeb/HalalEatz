import { Component , OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-listing-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './listing-form.component.html',
  styleUrl: './listing-form.component.css'
})
export class ListingFormComponent {

    resInfo = {
      name: '', 
      location: '',
      photo: '',
      days: {
        monday: { open: false, openingHours: { start: '', end: '' } },
        tuesday: { open: false, openingHours: { start: '', end: '' } },
        wednesday: { open: false, openingHours: { start: '', end: '' } },
        thursday: { open: false, openingHours: { start: '', end: '' } },
        friday: { open: false, openingHours: { start: '', end: '' } },
        saturday: { open: false, openingHours: { start: '', end: '' } },
        sunday: { open: false, openingHours: { start: '', end: '' } }
      
      }
    };

    selectedFile: File | null = null;

    constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private router: Router) {}

    ngOnInit(): void {
      if (isPlatformBrowser(this.platformId)){
        (window as any)['submitForm'] = this.submitForm.bind(this)
        
      }
    }

    onFileSelected(event: any) {
      this.selectedFile = event.target.files[0] as File;
    }

    submitForm(data: any) {
      console.log(this.resInfo);
    }
}
