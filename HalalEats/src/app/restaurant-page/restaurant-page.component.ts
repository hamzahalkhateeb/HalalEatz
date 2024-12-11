import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

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

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

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

  addToCart(input: any){

  }



}
