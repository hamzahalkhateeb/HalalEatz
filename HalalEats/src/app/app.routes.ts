import { ErrorComponent } from './error/error.component';
import { LogInComponent } from './log-in/log-in.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { DashBoardComponent } from './dash-board/dash-board.component';
import { ListingFormComponent } from './listing-form/listing-form.component';
import { RestaurantAdminComponent } from './restaurant-admin/restaurant-admin.component';
import { RestaurantPageComponent } from './restaurant-page/restaurant-page.component';


export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'login', component: LogInComponent},
    {path: 'dashboard', component: DashBoardComponent},
    {path: 'listing-form', component: ListingFormComponent},
    {path: 'error', component: ErrorComponent},
    {path: 'restaurantAdmin', component: RestaurantAdminComponent},
    {path: 'restaurantPage/:id', component: RestaurantPageComponent},

    
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports:[RouterModule]
})

export class AppRoutingModule{}

