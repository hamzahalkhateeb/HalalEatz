import { HttpClient } from '@angular/common/http';
import { Component, OnInit, PLATFORM_ID, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {io, Socket} from 'socket.io-client';




@Component({
  selector: 'app-restaurant-admin',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './restaurant-admin.component.html',
  styleUrl: './restaurant-admin.component.css'
})
export class RestaurantAdminComponent implements OnInit {

  @ViewChild('itemContainer', {static: true}) itemContainer!: ElementRef;

  
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

  ordersRetrieved: any[] = [];
  
  orderStatus = ['submitted, unpaid', 'paid', 'accepted & being prepared', 'ready to collect!'];

  private socket! : Socket;



  selectedFile: File | null = null;

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute, private cdr: ChangeDetectorRef ) {}
  ngOnInit(): void {

   

    
    this.LoadRestaurantAdminPackage();
    this.getOrders();
    

      
    const socket = io("http://localhost:3000");

    /*socket.on("connect", () =>{
      socket.emit('restaurantConnected', this.currentuserId);
      console.log("restaurant front end connected to back end");
    });*/

    socket.on('orderPaid&Placed', (data) => {
      console.log('New Order Placed:', data.orderJSON);
      alert(data.message);

      let orderReceived = JSON.parse(data.orderJSON);
      orderReceived.items = JSON.parse(orderReceived.items);
      
      const sameOrder = this.ordersRetrieved.find(order => order.id === orderReceived.id);

      if(sameOrder){
        console.log("order receiced via socket, however it is already in the orders array!");
      } else {
        this.ordersRetrieved = this.ordersRetrieved.concat(orderReceived);
        this.cdr.detectChanges();

      }

      

    

    });

    

  }

  

  




  LoadRestaurantAdminPackage(): void  {
    console.log('Cookies before request:', document.cookie);
    this.http.post('http://localhost:3000/LoadRestaurantAdminPackage', {userType: 'admin'}, {withCredentials: true})
    .subscribe({
      next: (data: any) =>{
        if (data.success){
          
          alert(`this session user id issssssssssssssssssssssssss: ${data.sessionUserId}`);

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

  getOrders(): void{
    

    this.http.post('http://localhost:3000/getOrders', {userId: 'variablePlaceHolder'}, {withCredentials: true})
    .subscribe({
      next: (data: any) =>{
        if (data.success){

          this.ordersRetrieved = data.orders;

          this.ordersRetrieved.forEach(order =>{
            order.items = JSON.parse(order.items);
          });



        } else {
          alert(data.message)
        }
      }, error: (error: any) =>{
        console.error('error: ', error);
      }
    });
  }

  advanceOrder(orderId: any): void{
    this.http.post('http://localhost:3000/advanceOrder', {orderId: orderId})
    .subscribe({
      next:(data: any) =>{
        if (data.success){
          const order = this.ordersRetrieved.find(order => order.id === orderId);
          for(let i = 0; i < this.orderStatus.length; i++){
            if (order.status === this.orderStatus[i] && i != this.orderStatus.length - 1){
               order.status = this.orderStatus[i + 1];
               break;
               
            }
          }
        } else {
          alert(data.message);
        }
      }, error: (error: any) => {
        console.error('error: ', error);
      }
    })

  }

  
}
