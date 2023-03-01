import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from 'src/environments/environment';
import { User } from "@app/utils/interfaces/user";
import { catchError, Observable, throwError } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    login(username: string, password: string): Observable<{user: User}> {
        return this.http.post<{user: User}>(`${this.baseUrl}/login`, { username, password }).pipe(catchError(this.handleError));
    }

    register(username: string, password: string, email: string, avatar: string): Observable<{user: User}> {
        return this.http.post<{user: User}>(`${this.baseUrl}/signup`, { username, password, email, avatar }).pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', error.error);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong.
          console.error(
            `Backend returned code ${error.status}, body was: `, error.error);
        }
        // Return an observable with a user-facing error message.
        return throwError(() => new Error('Something bad happened; please try again later.'));
      }
}