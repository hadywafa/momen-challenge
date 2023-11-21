import { LoginLayoutComponent } from "./components/login-layout/login-layout.component";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { StepperComponent } from "./components/login-layout/content/stepper/stepper.component";
import { FooterComponent } from "./components/login-layout/footer/footer.component";
import { HeaderComponent } from "./components/login-layout/header/header.component";
import { VerifyMailComponent } from "./components/login-layout/content/verify-mail/verify-mail.component";
import { SignUpFormComponent } from "./components/login-layout/content/sign-up-form/sign-up-form.component";
import { MailVerificationMessageComponent } from "./components/login-layout/content/mail-verification-message/mail-verification-message.component";
import { ContentComponent } from "./components/login-layout/content/content.component";
import { FloorPlanComponent } from "./components/floor-plan/floor-plan.component";
import { MapService, NgxMapLibreGLModule } from "@maplibre/ngx-maplibre-gl";
import { MaterialModule } from "./modules/ng-material";

@NgModule({
  declarations: [
    AppComponent,
    FloorPlanComponent,
    HeaderComponent,
    SignUpFormComponent,
    MailVerificationMessageComponent,
    ContentComponent,
    VerifyMailComponent,
    LoginLayoutComponent,
    StepperComponent,
    FooterComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule,MaterialModule, NgxMapLibreGLModule],
  providers: [MapService],
  bootstrap: [AppComponent],
})
export class AppModule {}
