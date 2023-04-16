import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '@app/utils/interfaces/user';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-friend-stats',
  templateUrl: './friend-stats.component.html',
  styleUrls: ['./friend-stats.component.scss']
})
export class FriendStatsComponent implements OnInit {
  user!: BehaviorSubject<User>;
  constructor(private route: ActivatedRoute) { }
  ngOnInit() {
    const data = JSON.parse(this.route.snapshot.queryParamMap.get('data') as string);
    console.log("data is here", data);
    this.user = new BehaviorSubject<User>(data);
    this.user.subscribe();
  }

}
