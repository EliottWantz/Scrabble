import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { AuthenticationService } from '@app/services/authentication/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements AfterViewInit {
  username = '';
  password = '';
  isLoginFailed = false;
  isAlreadyConnected = false;
  @ViewChild('usernameInput')
  private usernameInput!: ElementRef;

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.usernameInput.nativeElement.focus();
    });
  }

  async onSubmit() {
    if (this.username == '' || this.password == '') return;
    const res = await this.authService.login(this.username, this.password);
    console.log(res);
    if (res.success) {
      this.router.navigate(['/home']);
    } else {
      if (res.statusCode == 403) {
        this.isAlreadyConnected = true;
      } else this.isLoginFailed = true;
    }
  }
}
