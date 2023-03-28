import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ProfilePageComponent } from '@app/pages/profile-page/profile-page.component';
import { RulesSliderPageComponent } from '@app/pages/rules-slider-page/rules-slider-page.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { SocialPageComponent } from '@app/pages/social-page/social-page.component';
import { RegisterPageComponent } from '@app/pages/register-page/register-page.component';
import { AvatarSelectionPageComponent } from '@app/pages/avatar-selection-page/avatar-selection-page.component';
import { WaitRoomPageComponent } from '@app/pages/waiting-room-page/waiting-room-page.component';
import { FindGamePageComponent } from '@app/pages/find-game-page/find-game-page.component';
import { ChatBoxComponent } from '@app/components/chat-box/chat-box.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: MainPageComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: 'rules-slider', component: RulesSliderPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'avatar', component: AvatarSelectionPageComponent },
  { path: 'game', component: GamePageComponent },
  { path: 'social', component: SocialPageComponent },
  { path: 'waitingRoom', component: WaitRoomPageComponent },
  { path: 'find-game', component: FindGamePageComponent },
  { path: 'chatbox', component: ChatBoxComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
