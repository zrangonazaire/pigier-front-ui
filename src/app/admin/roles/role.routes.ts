import { Route } from "@angular/router";
import { RoleAddComponent } from "./role-add/role-add.component";
import { RoleListComponent } from "./role-list/role-list.component";

export const ROLE_ROUTES: Route[] = [
    {path: '', redirectTo: 'role-list', pathMatch: 'full'},  
  { path: 'role-add', component: RoleAddComponent },
  { path: 'role-list', component: RoleListComponent },
];
