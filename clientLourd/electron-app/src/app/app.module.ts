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
import { SocialPageComponent } from './pages/social-page/social-page.component';
import { RulesSliderPageComponent } from './pages/rules-slider-page/rules-slider-page.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { ParametersComponent } from './components/parameters/parameters.component';
import { MatCardModule } from '@angular/material/card';
import { AppMaterialModule } from "@app/modules/material.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RegisterComponent } from '@app/components/register/register.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '@app/services/auth-interceptor/auth-interceptor.service'
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { BoardComponent } from '@app/components/board/board.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RackComponent } from '@app/components/rack/rack.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RegisterPageComponent } from '@app/pages/register-page/register-page.component';
import { AvatarSelectionPageComponent } from '@app/pages/avatar-selection-page/avatar-selection-page.component';
import { AvatarSelectionComponent } from '@app/components/avatar-selection/avatar-selection.component';
import { DefaultAvatarSelectionComponent } from '@app/components/default-avatar-selection/default-avatar-selection.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { SocialComponent } from '@app/components/social/social.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WaitRoomPageComponent } from '@app/pages/waiting-room-page/waiting-room-page.component';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainPageComponent,
    LoginPageComponent,
    ProfilePageComponent,
    RulesSliderPageComponent,
    RegisterComponent,
    ChatBoxComponent,
    ParametersComponent,
    GamePageComponent,
    BoardComponent,
    TileComponent,
    RackComponent,
    SocialPageComponent,
    TimerComponent,
    SidebarComponent,
    RegisterPageComponent,
    AvatarSelectionPageComponent,
    AvatarSelectionComponent,
    DefaultAvatarSelectionComponent,
    SocialComponent,
    WaitRoomPageComponent
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
    MatDividerModule,
    DragDropModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    MatSelectModule
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
