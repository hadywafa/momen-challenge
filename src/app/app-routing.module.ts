import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { LoginLayoutComponent } from "./components/login-layout/login-layout.component";

const routes: Routes = [
  {
    path: "",
    component: LoginLayoutComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
