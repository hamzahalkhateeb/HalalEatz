import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewChildren, ElementRef, QueryList } from '@angular/core';

@Component({
  selector: 'app-restaurant-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './restaurant-page.component.html',
  styleUrl: './restaurant-page.component.css'
})
export class RestaurantPageComponent implements OnInit {

  @ViewChildren('menueBox') menueContainer!: QueryList<ElementRef>;
  @ViewChildren('tabs') tabs!: QueryList<ElementRef>;

  restaurantId!: number;
  
  menue!: any;
  menueId!: any;
  mealsArray: any;
  drinksArray: any;
  desertsArray: any;

  restaurant!:{
    name: string;
    location: string;
    lat: number;
    lon: number;
    openingHours: string;
    halalRating: number;
    images: string;
    open: boolean;

  }

  distance!: number;

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
      this.distance = params['distance'];
      
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


          let parsedRest = data.restaurant;

          this.restaurant = {...parsedRest};

          
          


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


    console.log(itemName);

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

  logout(response: any): void{
    console.log("logout attempt initiated!");
    this.http.post('http://localhost:3000/logout', { id_token: response.credential }, {withCredentials: true})
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


  checkout(totalPrice: number){

    
    console.log(`restaurant id: ${this.restaurantId}`);
    console.log(JSON.stringify(this.orderArray));

    this.orderArray.forEach(item => {
      
      item.quantity = item.quantity.toString();
      if(typeof(item.unit_amount.value) == 'string'){

      } else { item.unit_amount.value = (item.unit_amount.value.toFixed(2)).toString(); }
      
      

    });
    console.log(totalPrice.toFixed(2));
    console.log(this.orderArray);

    this.http.post(`http://localhost:3000/placeOrder`, { restaurantId: this.restaurantId, status: 'submitted, unpaid', orderArray: JSON.stringify(this.orderArray), totalPrice: totalPrice.toFixed(2)}, {withCredentials: true})
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

    
  showDiv(divId: any, tabId: any){

    this.menueContainer.forEach((div)=>{
      div.nativeElement.style.display = 'none';
    });

    let displayDiv = document.getElementById(divId);

    if(displayDiv){
      displayDiv.style.display = 'flex';

    } else {
      console.log('there is no div with that id');
    }

    this.tabs.forEach((tab)=>{
      tab.nativeElement.style.backgroundColor = '#bcd9ab';
      
    })

    let displayTab = document.getElementById(tabId);

    if(displayTab){
      
      displayTab.style.backgroundColor = '#9ebb8d';

    } else {
      console.log('there is no div with that id');
    }


  }

  ShowCart(cartId: any){

    let cart = document.getElementById(cartId);

    if(cart){
      cart.style.opacity = '1';
      cart.style.display = 'flex';
    } else{
      console.error;
    }

  }

  closeCart(cartId: any){

    let cart = document.getElementById(cartId);

    if(cart){
      cart.style.opacity = '0';
      cart.style.display = 'none';
    } else{
      console.error;
    }

  }
  
    
}
  




