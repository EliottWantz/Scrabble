import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ProfilePageComponent } from '@app/pages/profile-page/profile-page.component';
import { RulesSliderPageComponent } from '@app/pages/rules-slider-page/rules-slider-page.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: MainPageComponent },
  { path: 'profile', component: ProfilePageComponent },
  { path: 'rules-slider', component: RulesSliderPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'game', component: GamePageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
