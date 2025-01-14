import { CommonModule, isPlatformBrowser, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ListingFormComponent } from '../listing-form/listing-form.component';

@Component({
  selector: 'app-dash-board',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './dash-board.component.html',
  styleUrl: './dash-board.component.css'
})
export class DashBoardComponent implements OnInit {

  longitude = 0;
  latitude = 0;
  
  currentUserId!: number;
  
  cxOrders: any[] = [];

  restaurantPackage: Array<{
       id: number;
       name: string;
       location: string;
       openingHours: string;
       halalRating: number;
       images: string;
       distance: number;

  }> = [];


  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    if(isPlatformBrowser(this.platformId)){
      (window as any)['logout'] = this.logout.bind(this);
      
      this.currentUserId = Number(this.route.snapshot.queryParamMap.get('userId'));
      console.log(`current userID: ${this.currentUserId}`);

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


    this.getCxOrders();




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
          alert(data.restaurantPackage);

          let recievedData = JSON.parse(data.restaurantPackage);
          this.restaurantPackage = [];

          for (let i = 0; i < recievedData.length; i++){

            const restaurant = recievedData[i];

            this.restaurantPackage.push({
              id: restaurant.id ,
              name: restaurant.name ,
              location: restaurant.location ,
              openingHours: restaurant.openingHours ,
              halalRating: restaurant.halalRating ,
              images: restaurant.images ,
              distance: restaurant.DISTANCE 

            })

          }

          console.log(this.restaurantPackage);
        } else {
          alert(data.message);
        }
      },
      error: (error: any) => {
        
        console.error('Error: ', error);
      }
    });}


  restaurantPage(restaurantId: number, currentUserId: number): void {

    console.log("restaurantPage is being clicked___________________________________");
    this.router.navigate(['/restaurantPage', restaurantId], {
      queryParams: { restaurantId: restaurantId, currentUserId: currentUserId}
    });
  }

  getCxOrders(): void{
    this.http.post('http://localhost:3000/getcxOrders', {userId: this.currentUserId})
    .subscribe({
      next: (data: any) => {
        if (data.success){
          this.cxOrders = data.orders;

          this.cxOrders.forEach(order => {
            order.items = JSON.parse(order.items);
          });

        } else {
          alert(data.message)
        }
      }, error: (error: any)=>{
        console.error('error: ', error);
      }
    });

  }
  
  
  }
