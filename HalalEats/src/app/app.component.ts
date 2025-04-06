import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { LogInComponent } from './log-in/log-in.component';
import { error } from 'console';
import { ErrorComponent } from './error/error.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    
    //other components
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})


export class AppComponent {
 
}

