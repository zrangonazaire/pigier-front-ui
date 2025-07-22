
import { Route } from "@angular/router";
import { UserListComponent } from "./user-list/user-list.component";


export const ROLE_ROUTES: Route[] = [
    {path: '', redirectTo: 'user-list', pathMatch: 'full'},  
  { path: 'user-list', component: UserListComponent },
];
