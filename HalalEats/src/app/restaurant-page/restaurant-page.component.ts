import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-restaurant-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './restaurant-page.component.html',
  styleUrl: './restaurant-page.component.css'
})
export class RestaurantPageComponent implements OnInit {

  restaurantId!: number;
  currentUserId!: number;
  menue!: any;
  menueId!: any;
  mealsArray: any;
  drinksArray: any;
  desertsArray: any;

  orderArray: Array<{
    itemName: '',
    itemDescription: '',
    itemPrice: 0;
  }> = [];

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.restaurantId = params['restaurantId'];
      this.currentUserId = params['currentUserId'];
    });


    this.LoadRestaurantPackage(this.restaurantId);

  }

  LoadRestaurantPackage(restaurantId: any){
    this.http.post('http://localhost:3000/LoadRestaurantAdminPackage', {Id : restaurantId, userType: 'consumer'})
    .subscribe({
      next:(data: any)=>{
        if (data.success){
          this.menue = JSON.parse(data.menue);
          this.mealsArray  = this.menue.meals.map((mealString: string) => JSON.parse(mealString));
          this.drinksArray  = this.menue.drinks.map((drinkString: string) => JSON.parse(drinkString));
          this.desertsArray  = this.menue.deserts.map((desertString: string)=> JSON.parse(desertString));

        } else {
          alert(data.message);
        }
      }, 
      error: (error: any) =>{
        console.error('error: ', error);
      }

    });
  }

  addToCart(itemName: any, itemDescription: any,  itemPrice: any){


    this.orderArray.push({
      itemName: itemName,
      itemDescription: itemDescription,
      itemPrice: itemPrice
    })

  }

  dlt(itemName: any, itemPrice: any){
    for (let i = 0; i < this.orderArray.length; i++){
      if (this.orderArray[i].itemName == itemName && this.orderArray[i].itemPrice == itemPrice){
        this.orderArray.splice(i, 1);
        break;
      }
    }

  }

  getTotal(): number{
    return this.orderArray.reduce((total, item) => total + item.itemPrice, 0);
  }

  checkout(totalPrice: number){

    console.log(`user id: ${this.currentUserId}`);
    console.log(`restaurant id: ${this.restaurantId}`);
    console.log(JSON.stringify(this.orderArray));

    this.http.post(`http://localhost:3000/placeOrder`, {userId: this.currentUserId, restaurantId: this.restaurantId, status: 'submitted', orderArray: JSON.stringify(this.orderArray)})
    .subscribe({
      next:(data: any)=>{
        if (data.success){
          //
        } else {
          //
        }
      }, error : (error: any) =>{
        console.error('error: ', error);
      }
    });

    
    }
  



}
