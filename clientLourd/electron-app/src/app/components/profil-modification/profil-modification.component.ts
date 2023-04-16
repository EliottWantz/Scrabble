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

    this.userSvc.tempAvatar.subscribe((formData) => {
      if (formData.has("avatarUrl")) {
        document.getElementById('avatar')?.setAttribute('src', formData.get("avatarUrl") as string);
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
    document.getElementById('avatar')?.setAttribute('src', URL.createObjectURL(this.selectedFile));
    if (this.userSvc.tempAvatar.value.has("avatarUrl")) {
      const newAvatar = this.userSvc.tempAvatar.value;
      newAvatar.delete("avatarUrl");
      this.userSvc.tempAvatar.next(newAvatar);
    }
      
    if (this.userSvc.tempAvatar.value.has("fileId")) {
      const newAvatar = this.userSvc.tempAvatar.value;
      newAvatar.delete("fileId");
      this.userSvc.tempAvatar.next(newAvatar);
    }

    if (this.selectedFile['type'] != "image/png" && this.selectedFile['type'] != "image/jpeg" && this.selectedFile['type'] != "image/jpg") {
      console.log("wrong type");
    } else {
      const newAvatar = this.userSvc.tempAvatar.value;
      newAvatar.set("avatar", this.selectedFile);
      this.userSvc.tempAvatar.next(newAvatar);
    }
  }

  submitAvatar(): void {
    if (this.userSvc.tempAvatar.value.has("avatar") || this.userSvc.tempAvatar.value.has("avatarUrl")) {
      this.comSvc
        .requestUploadAvatar(this.userSvc.subjectUser.value.id, this.userSvc.tempAvatar.value)
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
