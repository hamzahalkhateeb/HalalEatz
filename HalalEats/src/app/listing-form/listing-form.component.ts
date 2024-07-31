/// <reference types="@types/google.maps" />
import { Component , OnInit, Inject, Injectable,  PLATFORM_ID, NgZone, ViewChild, ElementRef, Renderer2, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { HttpClient, } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';





@Component({
  selector: 'app-listing-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './listing-form.component.html',
  styleUrl: './listing-form.component.css'
})
export class ListingFormComponent implements OnInit{
    //view children for listing the restaurant!
    @ViewChild('resLocationInput', {static: true}) resLocation!: ElementRef<HTMLInputElement>;
    @ViewChild('mealContainer', {static: true}) mealContainer!: ElementRef;
    @ViewChild('mealDiv', {static: true}) mealDiv!: ElementRef;
    @ViewChild('desertContainer', {static: true}) desertContainer!: ElementRef;
    @ViewChild('desertDiv', {static: true}) desertDiv!: ElementRef;
    @ViewChild('drinkContainer', {static: true}) drinkContainer!: ElementRef;
    @ViewChild('drinkDiv', {static: true}) drinkDiv!: ElementRef;
    @ViewChild('resForm') resForm= NgForm

    //view children for adding the menue
    @ViewChildren('mealDiv') mealDivs!: QueryList<ElementRef>;
    @ViewChildren('desertDiv') desertDivs!: QueryList<ElementRef>;
    @ViewChildren('drinkDiv') drinkDivs!: QueryList<ElementRef>;

    predictions: google.maps.places.AutocompletePrediction[] = [];

    apikey = 'AIzaSyDbzLtJqttwnCZpCkzS7iaxLRN2kjcr8n8';
    private autocompleteService!: google.maps.places.AutocompleteService;
    

    halalQuestions: string[] = [
      'My restaurant sells halal chicken',
      'My restaurant sells hand-slaughtered chicken',
      'My restaurant sells halal beef',
      'My restaurant sells halal lamb',
      'My restaurant DOES NOT sell pork products',
      'My restaurant DOES NOT sell products that contain animal gelatin',
      'My restaurant DOES NOT sells alcoholic beverages',
      'My meat supplier is a recognised halal certified body',
      'All my ingredients are sourced from halal-certified suppliers?',
      'My restaurant ensures that NO alcoholic products are used in the cooking process'
      
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

    meals: Array<any> = [];
    deserts: Array<any> = [];
    drinks: Array<any> = [];

    selectedFile: File | null = null;

    constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private router: Router, private ngZone: NgZone, private renderer: Renderer2) {}

    ngOnInit(): void {
      if (isPlatformBrowser(this.platformId)){
        (window as any)['handleFormSubmission'] = this.handleFormSubmission.bind(this)
        
      }

      this.autocompleteService = new google.maps.places.AutocompleteService();
    }

    onFileSelected(event: any) {
      this.selectedFile = event.target.files[0] as File;
    }

    handleFormSubmission(response: any): void {
      
      
      if (this.resInfo.halalRating > 5){
        const resInfoJSON = JSON.stringify(this.resInfo);
        
        const idToken = response.credential;
        this.http.post('http://localhost:3000/listRestaurant', {id_token: idToken, resInfo: resInfoJSON})

        .subscribe({
          next: (data:any) =>{
            if(data.success){
              alert(data.message);
              //show the user the menu form!!!

            } else {
              console.log("unexpected json format! ", data.message);
            }
          },
          error: (error: any) => {
            console.error('Error: ', error);
          }
        });

      } else {
        alert("Your halal rating is less than the minimum allowed! your restaurant is not eligible to be on this website!");
        this.router.navigateByUrl("/login");
      }
      

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
        
      
      
      }
  }

    
    addMeal(){
      const clonedMeal = this.mealDiv.nativeElement.cloneNode(true);

      this.renderer.insertBefore(this.mealContainer.nativeElement, clonedMeal, this.mealContainer.nativeElement.lastChild);

      const deleteBtn = clonedMeal.querySelector('.deleteDivbtn');
      this.renderer.listen(deleteBtn, 'click', (event) => this.deleteDiv(event));


    }

    addDrink() {
      const clonedDrink = this.drinkDiv.nativeElement.cloneNode(true);

      this.renderer.insertBefore(this.drinkContainer.nativeElement, clonedDrink, this.drinkContainer.nativeElement.lastChild);

      const deleteBtn = clonedDrink.querySelector('.deleteDivbtn');
      this.renderer.listen(deleteBtn, 'click', (event) => this.deleteDiv(event));
    }
    
    addDesert() {
      const clonedDesert = this.desertDiv.nativeElement.cloneNode(true);

      this.renderer.insertBefore(this.desertContainer.nativeElement, clonedDesert, this.desertContainer.nativeElement.lastChild);

      const deleteBtn = clonedDesert.querySelector('.deleteDivbtn');
      this.renderer.listen(deleteBtn, 'click', (event) => this.deleteDiv(event));
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

    //changes to make:
    //make it so that added divs reflect at the query set!!!
    populateArray(array: any[], divsList: QueryList<ElementRef>, word: string) {
      array.length = 0;

      divsList.forEach(DivRef => {
        const itemDiv = DivRef.nativeElement;

        const itemDiq = {
          name: (itemDiv.querySelector(`input[name="${word}Name"]`) as HTMLInputElement).value,
          description: (itemDiv.querySelector(`input[name="${word}Description"]`) as HTMLInputElement).value,
          price: parseFloat((itemDiv.querySelector(`input[name="${word}Price"]`) as HTMLInputElement).value),
          halal: (itemDiv.querySelector('input[name="halal"]') as HTMLInputElement).checked,
          vegan: (itemDiv.querySelector('input[name="vegan"]') as HTMLInputElement).checked,
          vegetarian: (itemDiv.querySelector('input[name="vegetarian"]') as HTMLInputElement).checked,
          lactoseFree: (itemDiv.querySelector('input[name="lactoseFree"]') as HTMLInputElement).checked,
          glutenFree: (itemDiv.querySelector('input[name="glutenFree"]') as HTMLInputElement).checked,
          img: (itemDiv.querySelector(`input[name="${word}img"]`) as HTMLInputElement).value,
        }

        array.push(itemDiq);
      });

      //console.log(array);



    }

    submitMenue(event: any){
      this.populateArray(this.meals, this.mealDivs, 'meal');
      console.log(this.meals);
      this.populateArray(this.drinks, this.drinkDivs, 'drink');
      //console.log(this.deserts);
      this.populateArray(this.deserts, this.desertDivs, 'desert');
      //console.log(this.deserts);
    }
    
    
}
    
