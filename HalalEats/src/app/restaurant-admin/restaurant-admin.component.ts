import { HttpClient } from '@angular/common/http';
import { Component, OnInit, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';




@Component({
  selector: 'app-restaurant-admin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './restaurant-admin.component.html',
  styleUrl: './restaurant-admin.component.css'
})
export class RestaurantAdminComponent implements OnInit {

  @ViewChild('itemContainer', {static: true}) itemContainer!: ElementRef;



  //declare all data variable that you need!
  //a list of orders
  //a list meals, drinks and deserts
  currentuserId = -1;

  mealsArray: any;
  drinksArray: any;
  desertsArray: any;
  menue2: any;
  menueId: any;

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

  /*mealsPackage: Array<{
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

  }> = [];

  drinksPackage: Array<{
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

  }> = [];

  desertsPackage: Array<{
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

  }> = []; */


  selectedFile: File | null = null;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute ) {}
  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.currentuserId = params['userId']; });

      console.log(`${this.currentuserId} -------------------------------------------------------------------------------`);
    this.LoadRestaurantAdminPackage(this.currentuserId);
  }

  LoadRestaurantAdminPackage(userId:any)  {
    this.http.post('http://localhost:3000/LoadRestaurantAdminPackage', {Id : userId, userType: 'admin'})
    .subscribe({
      next: (data: any) =>{
        if (data.success){
          
          this.menue2 = JSON.parse(data.menue);
          
          this.mealsArray  = this.menue2.meals.map((mealString: string) => JSON.parse(mealString));
          this.drinksArray  = this.menue2.drinks.map((drinkString: string) => JSON.parse(drinkString));
          this.desertsArray  = this.menue2.deserts.map((desertString: string)=> JSON.parse(desertString));

          
          

        } else {
          alert(data.message);
        }
      },
      error: (error: any) =>{
        console.error('error: ', error);
      }
    });
  }


  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

  submitMenueItem(response: any): void{
      
    //get a reference for the div that has all the input fields needed
    const itemDiv = this.itemContainer.nativeElement;

    //assign the values in html input fields into menuitem object fields
    this.menueItem.type= (itemDiv.querySelector(`[name='itemType']`) as HTMLInputElement).value;
    this.menueItem.name= (itemDiv.querySelector(`[name='itemName']`) as HTMLInputElement).value;
    this.menueItem.price= parseFloat((itemDiv.querySelector(`[name='itemPrice']`) as HTMLInputElement).value);
    this.menueItem.halal= (itemDiv.querySelector(`[name='halal']`) as HTMLInputElement).checked;
    this.menueItem.vegan= (itemDiv.querySelector(`[name='vegan']`) as HTMLInputElement).checked;
    this.menueItem.vegetarian= (itemDiv.querySelector(`[name='vegetarian']`) as HTMLInputElement).checked;
    this.menueItem.glutenFree= (itemDiv.querySelector(`[name='glutenFree']`) as HTMLInputElement).checked;
    this.menueItem.lactoseFree= (itemDiv.querySelector(`[name='lactoseFree']`) as HTMLInputElement).checked;
    this.menueItem.description= (itemDiv.querySelector(`[name='itemDescription']`) as HTMLInputElement).value;
 
    
    //declare an empty formdata variable
    const menueitemFormData = new FormData();

    //append all the needed data to said variable
    menueitemFormData.append("menueItem", JSON.stringify(this.menueItem));
    menueitemFormData.append("image", this.selectedFile!, this.selectedFile!.name);
    menueitemFormData.append("userId", this.currentuserId.toString());
    


    this.http.post('http://localhost:3000/submitMenue', menueitemFormData)
      .subscribe({
        next: (data: any) => {
          if (data.success){
            alert(data.message);
            //this.router.navigateByUrl(data.redirectUrl);
          } else {
            console.log("unexpected error: ", data);
          }
        },
        error: (error: any) => {
          console.error('Error: ', error);
        }
      });
    
    
  } 

  deleteItem(name: String, description: String, type: String): void {
    console.log(`name: ${name}, description: ${description}, and menue id in question ${this.menue2.id}`);
    this.http.post('http://localhost:3000/deleteItem', {menueId: this.menue2.id, itemName: name, itemDescription: description, type: type})
    .subscribe({
      next: (data: any) =>{
        if (data.success){
          alert('item deleted from menue successfully');
        } else {
          alert(data.message);
        }
      }, error: (error: any)=>{
        console.error('error: ', error); 
      }
    });
  }

  deleteRestaurant(): void{
    console.log(this.currentuserId);
    this.http.post('http://localhost:3000/deleteRestaurant', {userId: this.currentuserId})
    .subscribe({
      next: (data: any) =>{
        if (data.success){
          alert('restaurant deleted successfully');
          this.router.navigateByUrl(data.redirectUrl);
        } else {
          alert(data.message);
        }
      }, error: (error: any)=>{
        console.error('error: ', error); 
      }
    });
    
  }

}
