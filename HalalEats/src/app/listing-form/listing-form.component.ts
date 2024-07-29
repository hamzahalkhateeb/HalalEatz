/// <reference types="@types/google.maps" />
import { Component , OnInit, Inject, Injectable,  PLATFORM_ID, NgZone, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
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
export class ListingFormComponent implements OnInit{

    @ViewChild('resLocationInput', {static: true}) resLocation!: ElementRef<HTMLInputElement>;
    @ViewChild('mealContainer', {static: false}) mealContainer!: ElementRef;
    @ViewChild('mealDiv', {static: true}) mealDiv!: ElementRef;

    predictions: google.maps.places.AutocompletePrediction[] = [];

    apikey = 'AIzaSyDbzLtJqttwnCZpCkzS7iaxLRN2kjcr8n8';
    private autocompleteService!: google.maps.places.AutocompleteService;
    

    halalQuestions: string[] = [
      'Is the chicken you sell halal?',
      'Is the chicken hand-slaughtered or factory-slaughtered?',
      'Is the beef you sell halal?',
      'Is the lamb you sell halal?',
      'Do you sell any pork or pork products?',
      'Do you sell any products that contain animal gelatin?',
      'Do you sell any alcohol or alcoholic beverages?',
      'Are your meat suppliers certified by a recognized halal certification body?',
      'Are all your ingredients sourced from halal-certified suppliers?',
      'Do you ensure that no alcohol or non-halal food products are used in your cooking process?'
    ];

    resInfo = {
      name: '', 
      location: '',
      lat: null as number | null,
      lon: null as number | null,
      photo: '',
      days: {
        monday: { open: false, openingHours: { start: '', end: '' } },
        tuesday: { open: false, openingHours: { start: '', end: '' } },
        wednesday: { open: false, openingHours: { start: '', end: '' } },
        thursday: { open: false, openingHours: { start: '', end: '' } },
        friday: { open: false, openingHours: { start: '', end: '' } },
        saturday: { open: false, openingHours: { start: '', end: '' } },
        sunday: { open: false, openingHours: { start: '', end: '' } }
      
      },
      halalRating: 0,
    };

    selectedFile: File | null = null;

    constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private router: Router, private ngZone: NgZone, private renderer: Renderer2) {}

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
      const placeId = prediction.place_id;
      
      if (placeId) {
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        service.getDetails({ placeId: placeId }, (place, status) => { 
          this.resInfo.location = place?.formatted_address || '';
          this.resInfo.lat = place?.geometry?.location?.lat() || null;
          this.resInfo.lon = place?.geometry?.location?.lng() || null;
        });
        console.log(this.resInfo);
      
      
      }
  }

    


    addMeal(){
      const clonedMeal = this.mealDiv.nativeElement.cloneNode(true);

      this.renderer.insertBefore(this.mealContainer.nativeElement, clonedMeal, this.mealContainer.nativeElement.lastChild);

      const deleteBtn = clonedMeal.querySelector('.deleteDivbtn');
      this.renderer.listen(deleteBtn, 'click', (event) => this.deleteDiv(event));


    }
    addDesert() {
      //add another div to add another meal
    }
    
    addDrink() {
      //add another div to add another meal
    }

    updateHalalRating(event: any) {
    if (event.target.checked){
      this.resInfo.halalRating++;
      

    }else{
      this.resInfo.halalRating--;
    }
    
    }


    deleteDiv(event: any) {
      const btn = event.target as HTMLButtonElement;
      const div = btn.parentElement as HTMLDivElement;
      div.remove();

    }
    
}
    
