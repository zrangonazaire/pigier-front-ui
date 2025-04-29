import { Route } from "@angular/router"; // Ensure the correct Route type is imported
import { AddPreinscriptionComponent } from "./add-preinscription/add-preinscription.component";
import { ListPreinscriptionComponent } from "./list-preinscription/list-preinscription.component";



export const PREINSCRIPTION_ROUTES: Route[] = [
  {path: '', redirectTo: 'list-preins', pathMatch: 'full'},  
  {path: 'add-preins', component:AddPreinscriptionComponent},
  {path:'list-preins',component:ListPreinscriptionComponent},
];