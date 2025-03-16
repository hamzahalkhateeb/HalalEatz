import { HttpClient } from '@angular/common/http';
import { Component, OnInit, PLATFORM_ID, ViewChild, ViewChildren, ElementRef, OnDestroy, ChangeDetectorRef, Renderer2, QueryList } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule,  } from '@angular/common';
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
  @ViewChildren('collapsables') collapsables!: QueryList<ElementRef>;
  @ViewChildren('menueBox') menueBoxes!: QueryList<ElementRef>;
  @ViewChildren('menueTab') MenueTabs!: QueryList<ElementRef>;
  @ViewChildren('tabs') tabs!: QueryList<ElementRef>;

  
  

 

  mealsArray!: any;
  drinksArray!: any;
  desertsArray!: any;
  menue2!: any;
  menueId!: any;

  restaurantName!: any;

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
  
  orderStatus = ['Submitted, Unpaid', 'paid', 'Accepted & being prepared', 'Ready to collect!', 'Collected'];

  private socket! : Socket;



  selectedFile: File | null = null;

  constructor(private http: HttpClient, 
    private router: Router, 
    private route: ActivatedRoute, 
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private el: ElementRef
    ) {}
  ngOnInit(): void {

   

    
    this.LoadRestaurantAdminPackage();
    this.getOrders();
    

    
    const socket = io("http://localhost:3000", {
      withCredentials: true,
    });

    //connect to socket in back end  >>>

    socket.on("connect", () =>{
      //somehow include current cookies with the request
      socket.emit('restaurantConnected');
      console.log("restaurant front end connected to back end");
    });


    //listen for orders from back end   <<<<<<

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
    
    this.http.post('http://localhost:3000/LoadRestaurantAdminPackage', {userType: 'admin'}, {withCredentials: true})
    .subscribe({
      next: (data: any) =>{
        if (data.success){
          
          this.restaurantName= data.restaurantName || null;
          
          
          

          this.menue2 = JSON.parse(data.menue) || null;
          
          this.mealsArray  = this.menue2.meals.map((mealString: string) => JSON.parse(mealString)) || null;
          this.drinksArray  = this.menue2.drinks.map((drinkString: string) => JSON.parse(drinkString)) || null;
          this.desertsArray  = this.menue2.deserts.map((desertString: string)=> JSON.parse(desertString)) || null;

          

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
    this.menueItem.name= (itemDiv.querySelector(`[name='itemName']`) as HTMLInputElement).value; //39
    this.menueItem.price= parseFloat((itemDiv.querySelector(`[name='itemPrice']`) as HTMLInputElement).value); //cant be float
    this.menueItem.halal= (itemDiv.querySelector(`[name='halal']`) as HTMLInputElement).checked;
    this.menueItem.vegan= (itemDiv.querySelector(`[name='vegan']`) as HTMLInputElement).checked;
    this.menueItem.vegetarian= (itemDiv.querySelector(`[name='vegetarian']`) as HTMLInputElement).checked;
    this.menueItem.glutenFree= (itemDiv.querySelector(`[name='glutenFree']`) as HTMLInputElement).checked;
    this.menueItem.lactoseFree= (itemDiv.querySelector(`[name='lactoseFree']`) as HTMLInputElement).checked;
    this.menueItem.description= (itemDiv.querySelector(`[name='itemDescription']`) as HTMLInputElement).value; //250
 
    
    //declare an empty formdata variable
    const menueitemFormData = new FormData();

    //append all the needed data to said variable
    menueitemFormData.append("menueItem", JSON.stringify(this.menueItem));
    menueitemFormData.append("image", this.selectedFile!, this.selectedFile!.name);
    


    if(this.validate()){
      this.http.post('http://localhost:3000/submitMenue', menueitemFormData, {withCredentials: true})
      .subscribe({
        next: (data: any) => {
          if (data.success){
            alert(data.message);
            
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

  deleteItem(name: String, description: String, type: String): void {
    console.log(`name: ${name}, description: ${description}, and menue id in question ${this.menue2.id}`);
    this.http.post('http://localhost:3000/deleteItem', {menueId: this.menue2.id, itemName: name, itemDescription: description, type: type}, {withCredentials: true})
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
    this.http.post('http://localhost:3000/deleteRestaurant', {userId: 'variablePlaceHolder'}, {withCredentials: true})
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
    console.log('advance order called!');

    this.http.post('http://localhost:3000/advanceOrder', {orderId: orderId}, {withCredentials: true})
    .subscribe({
      next:(data: any) =>{
        if (data.success){
          console.log("order status updates successfully in the back end");
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


  showDiv(DivId: any, tabId: any){

    this.collapsables.forEach((div)=>{
      div.nativeElement.style.display = 'none';
    });

    let displayDiv = document.getElementById(DivId);

    if(displayDiv){
      displayDiv.style.display = 'flex';

    } else {
      console.log('there is no div with that id');
    }


    this.tabs.forEach((tab)=>{
      tab.nativeElement.style.backgroundColor ='#bcd9ab';
      tab.nativeElement.style.boxShadow = '';
      
    });

    let displayTab = document.getElementById(tabId);

    if(displayTab){
      displayTab.style.boxShadow = '15px 15px 8px 0 rgba(0, 0, 0, 0.2)';
      displayTab.style.backgroundColor = '#9ebb8d';

    } else {
      console.log('there is no div with that id');
    }



    
  }

  showMenueBox(menueBoxId: any, tabId: any){

    console.log("received box id and tab id: ", menueBoxId, tabId);

    this.menueBoxes.forEach((box)=>{
      box.nativeElement.style.display = 'none';
    });

    this.MenueTabs.forEach((tab) =>{
      tab.nativeElement.style.backgroundColor = '#bcd9ab';
      tab.nativeElement.style.boxShadow = 'none';
      tab.nativeElement.style.height = '50%';
    });

    console.log("looped through boxes and closed all of them");

    let displayBox = document.getElementById(menueBoxId);
    let tab = document.getElementById(tabId);

    console.log("here is display box element: ", displayBox);
    console.log("here is tab element: ", tab);

    if(displayBox && tab){
      displayBox.style.display = 'flex';
      tab.style.backgroundColor = '#9ebb8d';
      tab.style.boxShadow = '15px 15px 8px 0 rgba(0, 0, 0, 0.2)';
      tab.style.height = '70%';
      
    } else {
      console.log('error displaying requested menue box and changing tab style');
    }

  }


  validate(): boolean{

    if(this.menueItem.name.length > 35 || this.menueItem.name.length <3){
    
      let label = document.getElementById('nameLabel');

      label!.style.color = 'red';
      
      console.log(this.menueItem.name);
      console.log('name is now red');

      return false;
    }

    if(this.menueItem.description.length > 250){

      let label = document.getElementById('desLabel');

      label!.style.color = 'red';

      console.log('description is now red');

      return false
    }


    if(typeof this.menueItem.price !== 'number' || this.menueItem.price < 0){

      let label = document.getElementById('priceLabel');

      label!.style.color = 'red';

      console.log('price is now red');

      return false
    }

    
    return true;
  }



  
}
