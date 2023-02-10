import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ErrorPageComponent } from "@app/components/error-page/error-page.component";
import { GamePageGuard } from "@app/guards/game-page.guard";
import { AdminComponent } from "@app/pages/admin/admin.component";
import { GamePageComponent } from "@app/pages/game-page/game-page.component";
import { MainPageComponent } from "@app/pages/main-page/main-page.component";
import { ConnectionResolver } from "@app/services/connection-resolvers/connection-resolver.service";

export const routes: Routes = [
  { path: "", redirectTo: "/home", pathMatch: "full" },
  { path: "home", component: MainPageComponent },
  {
    path: "game",
    component: GamePageComponent,
    resolve: { connectionResolver: ConnectionResolver },
    canActivate: [GamePageGuard],
  },
  { path: "admin", component: AdminComponent },
  { path: "errorPage", component: ErrorPageComponent },

  { path: "**", redirectTo: "/home" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
