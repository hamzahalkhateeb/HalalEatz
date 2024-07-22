import { Component , OnInit, Inject, Injectable,  PLATFORM_ID, NgZone, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { HttpClient, } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


//AIzaSyDbzLtJqttwnCZpCkzS7iaxLRN2kjcr8n8

@Component({
  selector: 'app-listing-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './listing-form.component.html',
  styleUrl: './listing-form.component.css'
})
export class ListingFormComponent implements OnInit{

    @ViewChild('resLocationInput', {static: true}) resLocation!: ElementRef<HTMLInputElement>;
    predictions: google.maps.places.AutocompletePrediction[] = [];

    private autocompleteService!: google.maps.places.AutocompleteService;
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

    constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private router: Router, private ngZone: NgZone) {}

    ngOnInit(): void {
      if (isPlatformBrowser(this.platformId)){
        (window as any)['submitForm'] = this.submitForm.bind(this)
        
      }

      this.autocompleteService = new google.maps.places.AutocompleteService();
    }

    onFileSelected(event: any) {
      this.selectedFile = event.target.files[0] as File;
    }

    submitForm(data: any) {
      console.log(this.resInfo);
    }

    onLocationChange(event : Event): void {
      const input = event.target as HTMLInputElement;
      if (input) {
        const query = input.value;
        if (query) {
          this.autocompleteService.getPlacePredictions({ input: query }, (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              this.ngZone.run(() => {
                this.predictions = predictions;
              });
            } else {
              this.ngZone.run(() => {
                this.predictions = [];
              });
            }
          });
        } else {
          this.predictions = [];
        }
      }
    }

    selectPrediction(prediction: google.maps.places.AutocompletePrediction): void {
      this.resInfo.location = prediction.description;
      this.predictions = [];
    }
    
}
