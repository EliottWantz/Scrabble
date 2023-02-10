import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { PlayerAbandonedComponent } from '@app/components/player-abandoned/player-abandoned.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { CountdownModule } from 'ngx-countdown';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { BoardComponent } from './components/board/board.component';
import { ChatBoxComponent } from './components/chat-box/chat-box.component';
import { ChatBoxPrototypeComponent } from './components/chat-box-prototype/chat-box-prototype.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { GameEaselComponent } from './components/game-easel/game-easel.component';
import { GameHistoryComponent } from './components/game-history/game-history.component';
import { HighscoresComponent } from './components/highscores/highscores.component';
import { ObjectivesComponent } from './components/objectives/objectives.component';
import { PanelInformationsComponent } from './components/panel-informations/panel-informations.component';
import { ParametersComponent } from './components/parameters/parameters.component';
import { PlayerPanelComponent } from './components/player-panel/player-panel.component';
import { QuitGameComponent } from './components/quit-game/quit-game.component';
import { TextSliderComponent } from './components/text-slider/text-slider.component';
import { WelcomeButtonComponent } from './components/welcome-button/welcome-button.component';
import { WinGameComponent } from './components/win-game/win-game.component';
import { AdminComponent } from './pages/admin/admin.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { TimerPipe } from './pipes/timer.pipe';
import { LoginComponent } from "./components/login-component/login.component";
import { MatButtonModule } from '@angular/material/button';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
  declarations: [
    WelcomeButtonComponent,
    ParametersComponent,
    WinGameComponent,
    TimerPipe,
    AppComponent,
    GamePageComponent,
    MainPageComponent,
    PlayAreaComponent,
    SidebarComponent,
    BoardComponent,
    QuitGameComponent,
    GameEaselComponent,
    PlayerPanelComponent,
    TextSliderComponent,
    ChatBoxComponent,
    HighscoresComponent,
    PanelInformationsComponent,
    AboutUsComponent,
    AdminComponent,
    ErrorPageComponent,
    GameHistoryComponent,
    PlayerAbandonedComponent,
    ObjectivesComponent,
    LoginComponent,
    ChatBoxPrototypeComponent,
  ],
  imports: [
    AppMaterialModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    ScrollingModule,
    AppMaterialModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CountdownModule,
    MatButtonModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
