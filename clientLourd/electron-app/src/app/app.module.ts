import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './modules/app-routing.module';
import { AppComponent } from './pages/app/app.component';
import { LoginComponent } from '@app/components/login/login.component';
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { MatCardModule } from '@angular/material/card';
import { AppMaterialModule } from "@app/modules/material.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RegisterComponent } from '@app/components/register/register.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/services/auth-interceptor/auth-interceptor.service'

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainPageComponent,
    LoginPageComponent,
    ProfilePageComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    FormsModule, 
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    AppMaterialModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatDividerModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
