/// <reference types="@types/google.maps" />
import { Component , OnInit, Inject, Injectable,  PLATFORM_ID, NgZone, ViewChild, ElementRef, Renderer2, QueryList, ViewChildren } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators'
import { HttpClient, } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { environment } from '../../environments/environment';
import { GoogleAuthService } from '../google-auth.service';



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
    @ViewChild('itemContainer', {static: true}) itemContainer!: ElementRef;
    @ViewChild('resForm') resForm= NgForm

    
    predictions: google.maps.places.AutocompletePrediction[] = [];

    apikey = environment.googleMaps_api_key;
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


    menueItem = {
      type: '',
      name: '',
      description: '',
      price: 0,
      halal: false,
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      lactoseFree: false,
      imgPath: "",
    };
    
    
    selectedFile: File | null = null;

    private credentialSubscription!: Subscription;

    

    constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private router: Router, private ngZone: NgZone, private renderer: Renderer2, private googleAuthService: GoogleAuthService) {}

    ngOnInit(): void {
      if (isPlatformBrowser(this.platformId)){
        (window as any)['handleFormSubmission'] = this.handleFormSubmission.bind(this)
        
      }

      this.autocompleteService = new google.maps.places.AutocompleteService();

      this.googleAuthService.initilizeGoogleAuth();
      this.googleAuthService.renderGoogleBtn('googlebtn');

      this.credentialSubscription = this.googleAuthService
     .getCredentialResponse()
     .subscribe((response) => {
      if (response) {
        console.log('Received credentiuals in the ccomponent:', response);
        this.handleFormSubmission(response);
      }
     })

    }

    ngOnDestroy(): void {
      if (this.credentialSubscription) {
          this.credentialSubscription.unsubscribe();
      }
  }

    onFileSelected(event: any) {
      this.selectedFile = event.target.files[0] as File;
    }


    
    handleFormSubmission(response: any): void {
      
      
      if (this.resInfo.halalRating > 5){
        const resInfoJSON = JSON.stringify(this.resInfo);
        

        const formData = new FormData();
        
        formData.append('auth_token', response.credential);
        formData.append('resInfo', resInfoJSON);
        formData.append('image', this.selectedFile!, this.selectedFile!.name);
        formData.append('type', 'main');
        formData.append('relItem', '');
        





        this.http.post('http://localhost:3000/listRestaurant', formData, {withCredentials: true})

        .subscribe({
          next: (data:any) =>{
            if(data.success){
              alert(data.message);
              //show the user the menu form!!!

              const rurl = `${data.redirectUrl}?userId=${data.userId}`;
              this.router.navigateByUrl(rurl);

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

    
 



    updateHalalRating(event: any) {
    if (event.target.checked){
      this.resInfo.halalRating++;
      

    }else{
      this.resInfo.halalRating--;
    }
    
    }

    

    
    
    
  }
    
