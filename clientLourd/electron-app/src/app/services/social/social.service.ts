import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SocialService {
    activeScreen = "En ligne";
    screens = ["En ligne", "Tous", "En attente", "Ajouter un ami"];
}