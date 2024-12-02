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

  mealsPackage: Array<{
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

  }> = [];


  selectedFile: File | null = null;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute ) {}
  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.currentuserId = params['userId']; });

      console.log(`${this.currentuserId} -------------------------------------------------------------------------------`);
    this.LoadRestaurantAdminPackage(this.currentuserId);
  }

  LoadRestaurantAdminPackage(userId:any)  {
    this.http.post('http://localhost:3000/LoadRestaurantAdminPackage', {userId : userId})
    .subscribe({
      next: (data: any) =>{
        if (data.success){
          alert(data.menue);
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
            this.router.navigateByUrl(data.redirectUrl);
          } else {
            console.log("unexpected error: ", data);
          }
        },
        error: (error: any) => {
          console.error('Error: ', error);
        }
      });
    
    
  } 

}
