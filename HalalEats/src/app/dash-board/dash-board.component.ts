import { CommonModule, isPlatformBrowser, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, PLATFORM_ID, OnInit, afterNextRender } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ListingFormComponent } from '../listing-form/listing-form.component';
import {io, Socket} from 'socket.io-client';
import { environment } from '../../environments/environment';

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
  
  
  
  cxOrders: any[] = [];

  private socket! : Socket;

  restaurantPackage: Array<{
       id: number;
       name: string;
       location: string;
       openingHours: string;
       halalRating: number;
       images: string;
       distance: number;

  }> = [];


  constructor(@Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private router: Router, private route: ActivatedRoute) {
    afterNextRender(() => {
      this.initilizeSockets();
    });
  }

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
            console.log('get closer restaurants caled in front end');
          }
        )
      } else {
        console.log('get restaurants request not sent');
      }


      this.getCloseRestaurants();
      console.log("about to call get cx orders");
      this.getCxOrders();

    }
    

    


  }

  initilizeSockets(){
    const socket = io(`${environment.backendURL}`, {
      withCredentials: true
    });


    // connect to backend >>>>
    socket.on("connect", () =>{
      socket.emit('customerConnected');
      console.log("cx front end connected to back end");
    });

    //listen for order updates from backend <<<
    socket.on('orderProgressed', (data) => {
      console.log(`order progressed!`);

      const order = this.cxOrders.find(order => order.id === data.orderId);

      order.status = data.orderStatus;
      

    })
  }

  


  logout(response: any): void{
    console.log("logout attempt initiated!");
    this.http.post(`${environment.backendURL}/logout`, { id_token: response.credential }, {withCredentials: true})
      .subscribe({
        next: (data: any) => {
          if(data.success){
            
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
    this.http.post(`${environment.backendURL}/getCloseRestaurants`, { long: this.longitude, lat: this.latitude }, {withCredentials: true})
    .subscribe({
      next: (data: any) => {
        if(data.success){
          

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


  restaurantPage(restaurantId: number, distance: number ): void {

    console.log("restaurantPage is being clicked___________________________________");
    this.router.navigate(['/restaurantPage', restaurantId], {
      queryParams: { restaurantId: restaurantId, distance: distance}
    });
  }

  getCxOrders(): void{
    console.log("inside get cx orders!");
    this.http.post(`${environment.backendURL}/getcxOrders`, {userId: 'variablePlaceHolder'}, {withCredentials: true})
    .subscribe({
      next: (data: any) => {
        if (data.success){
          this.cxOrders = data.orders;

          this.cxOrders.forEach(order => {
            order.items = JSON.parse(order.items);
          });

        } else {
          alert(data.message);
        }
      }, error: (error: any)=>{
        console.error('error: ', error);
      }
    });

  }
  
  
  }
