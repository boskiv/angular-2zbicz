import { Injectable, OnDestroy } from '@angular/core';
import { doc, Firestore, setDoc } from '@angular/fire/firestore';
import { AuthState } from '@app/auth/+state/auth.state';
import { IDashboardStateModel } from '@app/dashboard/+state/dashboard.state';
import { User } from '@firebase/auth';
import { Select } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayoutService implements OnDestroy {
  @Select(AuthState.user)
  private user$!: Observable<User>;
  uid!: string;
  private subscriptions: Subscription[] = [];
  constructor(private firestore: Firestore) {
    this.subscriptions.push(
      this.user$.subscribe((user) => {
        if (user) {
          this.uid = user.uid;
        }
      })
    );
  }

  syncDashboard(dashboard: IDashboardStateModel) {
    if (!this.uid) return;
    const layoutsRef = doc(this.firestore, 'dashboards', this.uid);
    return setDoc(layoutsRef, dashboard);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
