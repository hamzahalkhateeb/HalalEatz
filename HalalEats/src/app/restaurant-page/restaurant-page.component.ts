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
  //currentUserId!: number;
  menue!: any;
  menueId!: any;
  mealsArray: any;
  drinksArray: any;
  desertsArray: any;

  orderArray: Array<{
    name: string,
    description: string,
    quantity: any,
    unit_amount: {
      currency_code : string,
      value: any,
    }
    
  }> = [];

  constructor(private route: ActivatedRoute, private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.restaurantId = params['restaurantId'];
      //this.currentUserId = params['currentUserId'];
    });


    this.LoadRestaurantPackage(this.restaurantId);

  }

  LoadRestaurantPackage(restaurantId: any){
    this.http.post('http://localhost:3000/LoadRestaurantAdminPackage', {Id : restaurantId, userType: 'consumer'}, {withCredentials: true})
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


    for (let i = 0; i < this.orderArray.length; i++) {
      if(this.orderArray[i].name == itemName &&
        this.orderArray[i].unit_amount.value == itemPrice && 
        this.orderArray[i].description == itemDescription){
           
        this.orderArray[i].quantity++;
        return;
      }
    }


    this.orderArray.push({
      name: itemName,
      description: itemDescription,
      quantity: 1,
      unit_amount: {
        currency_code: 'AUD',
        value: itemPrice
      }
        
    })

  }

  dlt(itemName: any, itemDescription: any, itemPrice: any){
    for (let i = 0; i < this.orderArray.length; i++){
      if (this.orderArray[i].name == itemName &&
          this.orderArray[i].unit_amount.value == itemPrice &&
          this.orderArray[i].description == itemDescription){
            if (this.orderArray[i].quantity > 1){
              this.orderArray[i].quantity--;
              break;
            } else {
              this.orderArray.splice(i, 1);
              break;
            }
      }
    }

  }

  getTotal(): number{
    let total = 0;

    for(let i = 0; i < this.orderArray.length; i++){
      total += this.orderArray[i].quantity * this.orderArray[i].unit_amount.value;
    }

    return total;
    
  }


  checkout(totalPrice: number){

    //console.log(`user id: ${this.currentUserId}`);
    console.log(`restaurant id: ${this.restaurantId}`);
    console.log(JSON.stringify(this.orderArray));

    this.orderArray.forEach(item => {
      
      item.quantity = item.quantity.toString();
      if(typeof(item.unit_amount.value) == 'string'){

      } else { item.unit_amount.value = (item.unit_amount.value.toFixed(2)).toString(); }
      
      

    });
    console.log(totalPrice.toFixed(2));
    console.log(this.orderArray);

    this.http.post(`http://localhost:3000/placeOrder`, {/*userId: this.currentUserId,*/ restaurantId: this.restaurantId, status: 'submitted, unpaid', orderArray: JSON.stringify(this.orderArray), totalPrice: totalPrice.toFixed(2)}, {withCredentials: true})
    .subscribe({
      next:(data: any)=>{
        if (data.success && data.redirectUrl){
          window.location.href = data.redirectUrl;
        } else {
          //
        }
      }, error : (error: any) =>{
        console.error('error: ', error);
      }
    });

  }

    

    
}
  




