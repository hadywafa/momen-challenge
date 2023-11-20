import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginLayoutComponent } from "./components/login-layout/login-layout.component";
import { FloorPlanComponent } from "./components/floor-plan/floor-plan.component";

const routes: Routes = [
  {
    path: "",
    component: FloorPlanComponent,
    // component: LoginLayoutComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
