import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ListingFormComponent } from '../listing-form/listing-form.component';

@Component({
  selector: 'app-dash-board',
  standalone: true,
  imports: [ListingFormComponent],
  templateUrl: './dash-board.component.html',
  styleUrl: './dash-board.component.css'
})
export class DashBoardComponent implements OnInit {

  longitude = 0;
  latitude = 0;

  restaurantPackage = {};


  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    if(isPlatformBrowser(this.platformId)){
      (window as any)['logout'] = this.logout.bind(this);
      
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
             this.latitude = position.coords.latitude;
             this.longitude = position.coords.longitude;
            console.log(`lat: ${this.latitude}, long: ${this.longitude}`);
            this.getCloseRestaurants();
          }
        )



      }

    }
  }


  logout(response: any): void{
    console.log("logout attempt initiated!");
    this.http.post('http://localhost:3000/logout', { id_token: response.credential })
      .subscribe({
        next: (data: any) => {
          if(data.success){
            alert(data.message);
            this.router.navigateByUrl(data.redirectUrl);
          } else {
            console.log("unexpected json format! ", data);
          }
        },
        error: (error: any) => {
          console.error('Error: ', error);
        }
});}


  getCloseRestaurants(): void{
    console.log(`get close restauratns function called, it sent the following data: lat: ${this.latitude}, long: ${this.longitude} `);
    this.http.post('http://localhost:3000/getCloseRestaurants', { long: this.longitude, lat: this.latitude })
    .subscribe({
      next: (data: any) => {
        if(data.success){
          alert(data.message);
          this.restaurantPackage = data.restaurantPackage;
        } else {
          alert(data.message);
        }
      },
      error: (error: any) => {
        
        console.error('Error: ', error);
      }
    });}
  
  
  }
