
/// <reference types="@types/google.maps" />
import { Component , OnInit, AfterViewInit, Inject, Injectable,  PLATFORM_ID, NgZone, ViewChild, ElementRef, Renderer2, QueryList, ViewChildren, OnDestroy, viewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators'
import { HttpClient, } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { environment } from '../../environments/environment';
import { GoogleAuthService } from '../google-auth.service';
import { After } from 'v8';
import { setTimeout } from 'timers';
import { GoogleMapsService } from './../google-maps.service';

declare var google: any;


@Component({
  selector: 'app-listing-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './listing-form.component.html',
  styleUrl: './listing-form.component.css'
})


export class ListingFormComponent implements OnInit, AfterViewInit, OnDestroy{
    //view children for listing the restaurant!
    @ViewChild('resLocationInput', {static: true}) resLocation!: ElementRef<HTMLInputElement>;
    @ViewChild('itemContainer', {static: true}) itemContainer!: ElementRef;
    @ViewChild('resForm') resForm= NgForm
    @ViewChild('container1') container1Ref!: ElementRef;
    @ViewChild('container2') container2Ref!: ElementRef;
    @ViewChild('NameLocationImg') NameLocationImg!: ElementRef;
    @ViewChildren('quesBox') quesBoxes!: QueryList<ElementRef>;
    @ViewChildren('inputFields') inputFields!: QueryList<ElementRef>;
    

    
    predictions: google.maps.places.AutocompletePrediction[] = [];

    
    private autocompleteService!: google.maps.places.AutocompleteService;
    

    halalQuestions: string[] = [
      'My restaurant sells halal chicken.',
      'My restaurant sells hand-slaughtered chicken.',
      'My restaurant sells halal beef.',
      'My restaurant sells halal lamb.',
      'My restaurant DOES NOT sell pork products.',
      'My restaurant DOES NOT sell products that contain animal derived gelatin.',
      'My meat supplier is a recognised halal certified body.',
      'All my ingredients are sourced from halal-certified suppliers?',
      'My restaurant DOES NOT sells alcoholic beverages.',
      'My restaurant ensures that NO alcoholic products are used in the cooking process.',
      
      
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

    

    constructor(@Inject(PLATFORM_ID) private platformId: Object,
                private http: HttpClient, 
                private router: Router, 
                private ngZone: NgZone, 
                private renderer: Renderer2, 
                private googleAuthService: GoogleAuthService, 
                private googleMapsService: GoogleMapsService) {}

    ngOnInit(): void {
      if (isPlatformBrowser(this.platformId)){
        (window as any)['handleFormSubmission'] = this.handleFormSubmission.bind(this)
        
      }

      
      
      this.googleAuthService.initilizeGoogleAuth();
      this.googleAuthService.renderGoogleBtn('googlebtn');
      this.googleMapsService.loadGoogleMapsScript();
      this.autocompleteService = new google.maps.places.AutocompleteService();
      

      this.credentialSubscription = this.googleAuthService
     .getCredentialResponse()
     .subscribe((response) => {
      if (response) {
        console.log('Received credentiuals in the ccomponent:', response);
        this.handleFormSubmission(response);
      }
     })

    }
    
    ngAfterViewInit(): void {

      

      //fade in container 1
      const container1 = this.container1Ref.nativeElement;
      
      this.FadeInElement(container1)
      .then(async ()=> {
        const quesArray = this.quesBoxes.toArray();
        for(let i = 0; i < quesArray.length; i++){
          let element = quesArray[i].nativeElement;
          await this.FadeInElement(element);
          
        }
        
      });
      

      
      
     


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
      
      
      if (this.resInfo.halalRating >= 7){

        const valid = this.validateResInfo();
        if(valid){



        
          const resInfoJSON = JSON.stringify(this.resInfo);
          


          const formData = new FormData();
          
          formData.append('auth_token', response.credential);
          formData.append('resInfo', resInfoJSON);
          formData.append('image', this.selectedFile!, this.selectedFile!.name);
          formData.append('type', 'main');
          formData.append('relItem', '');
          





          this.http.post(`${environment.backendURL}/listRestaurant`, formData, {withCredentials: true})

          .subscribe({
            next: (data:any) =>{
              if(data.success){
                alert(data.message);
                
                
                this.router.navigateByUrl(data.redirectUrl);

              } else {
                console.log("unexpected json format! ", data.message);
              }
            },
            error: (error: any) => {
              console.error('Error: ', error);
            }
          });

        }
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
        service.getDetails({ placeId: placeId }, (place: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => { 
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

    nextSection(click: any){
      if (this.resInfo.halalRating < 7 ){
        alert("your restaurant does not qualify to be listed on this site!");
        this.router.navigateByUrl('/login');
        return;
      } else if (this.resInfo.halalRating  >= 7){

        console.log('event called');
        const container1 = this.container1Ref.nativeElement;
        const container2 = this.container2Ref.nativeElement;

        container1.classList.add('hidden');
        container2.classList.add('visible');
      }
      

    }

    previous(click: any){
      const container1 = this.container1Ref.nativeElement;
      const container2 = this.container2Ref.nativeElement;
      container2.classList.remove('visible');
      container1.classList.remove('hidden');
     


    }

    async FadeInElement(element: any): Promise<void> {
      let opacity = 0;
      

      return new Promise((resolve) => {
        const interval = setInterval(() => {
          opacity+= 0.1;
          element.style.opacity = opacity.toString();
  
          if (opacity >= 1) {
            clearInterval(interval);
            resolve();
          }
          
        }, 25);
      });
      
    }

    async FadeOutElement(element: any): Promise<void>{
      let opacity = 1;

      return new Promise((resolve) => {
        const interval = setInterval(() => {
          opacity -= 0.1;
          element.style.opacity = opacity.toString();
  
          if (opacity <= 0) {
            clearInterval(interval);
            resolve();
          }
          
        }, 25);
      });
    }
    

    validateResInfo(): boolean{
      const resInfo = this.resInfo;


    

      if(resInfo.name.length > 39 || resInfo.name.length < 3){
        let nameDiv = document.getElementById('resName');
        nameDiv!.style.borderColor = 'red';
        return false;
      }

      

      if(resInfo.location === '' || resInfo.lat === null || resInfo.lon === null){
        let locationDiv = document.getElementById('resLocation');
        locationDiv!.style.borderColor = 'red'; 
        return false
      };

      for(const day of Object.keys(resInfo.days)){
        
        const dayInfo = resInfo.days[day as keyof typeof resInfo.days];
        
        if(dayInfo.open === true){
          if(dayInfo.openingHours.start === '' || dayInfo.openingHours.end === ''){

            let timesDiv = document.getElementById('openingHeading');
            timesDiv!.style.color = 'red'; 
            console.log("timesdiv should be coloured");
            return false;
          } 

        }

      }


      return true;
      

       

    }
      

      
      
      


    
    
    
  }
    
