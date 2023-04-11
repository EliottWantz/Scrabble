import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CommunicationService } from '@app/services/communication/communication.service';
import { UserService } from '@app/services/user/user.service';
import { User } from '@app/utils/interfaces/user';
import { BehaviorSubject } from 'rxjs';
import { CustomizeAvatarComponent } from '../customize-avatar/customize-avatar.component';

@Component({
  selector: 'app-profil-modification',
  templateUrl: './profil-modification.component.html',
  styleUrls: ['./profil-modification.component.scss'],
})
export class ProfilModificationComponent implements OnInit {
  user!: BehaviorSubject<User>;
  username = '';
  selectedFile: File = new File([], '');

  constructor(
    private userSvc: UserService,
    private comSvc: CommunicationService,
    public dialog: MatDialog
  ) {
    this.user = this.userSvc.subjectUser;
  }

  ngOnInit() {
    this.user.subscribe(() => {
      this.user = this.userSvc.subjectUser;
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
    document.getElementById('avatar')?.setAttribute('src', URL.createObjectURL(this.selectedFile));
  }

  submitAvatar(): void {
    if (this.selectedFile.name != '') {
      this.comSvc
        .requestUploadAvatar(this.selectedFile)
        .subscribe((res) => {
          this.userSvc.subjectUser.next({
            ...this.userSvc.subjectUser.value,
            avatar: res,
          });
          document.getElementById('avatar')?.setAttribute('src', res.url);
        });
    }
  }
  submitUsername(): void {
    if (this.username != '') {
      this.comSvc
        .requestUpdateUsername(this.userSvc.currentUserValue.id, this.username)
        .subscribe(() => {
          console.log("we subminited names", this.username)
          this.userSvc.subjectUser.next({
            ...this.userSvc.subjectUser.value,
            username: this.username,
          });
          this.username = ''
        });
    }
  }

  openDialogPersonalizedAvatar(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    this.dialog.open(CustomizeAvatarComponent, {
      width: '75%',
      minHeight: '75vh',
      height: '75vh',
    });
  }
}
