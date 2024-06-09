//Import the UserService class from the user.service
import { UserService } from './../user.service';
//import the componenet class
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-user',
  standalone: true,
  imports: [],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})


export class UserComponent implements OnInit {  

  userData: any = {}

  constructor(private UserService: UserService) {  }

  ngOnInit(): void {
      console.log('User component initialized!');
  }

  onSubmit() : void {
    this.UserService.addUser(this.userData).subscribe(
      response => {
        console.log('User added successfully: ', response)
      },
      error => {
        console.error("Error Adding User:, ", error);
      }
    )
  }

}
