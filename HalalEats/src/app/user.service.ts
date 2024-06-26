import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})


//the following defines a class named user service, and exports it to other files
export class UserService {

  //declare the base URL as url to your backend project, this might need to be changed -
  // -during hosting on the cloud
  private baseUrl = 'http:/localhost:3000';

  //the following allows class UserService to use http requests
  constructor(private http: HttpClient ) { }

  //defining a method that will submit user data to a specific url, and return observable emit data
  addUser(user: any): Observable<any>{
    return this.http.post(`${this.baseUrl}/user/adduser`, user);
  }
}
 