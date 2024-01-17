// auth.service.ts
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isAuthenticated$: Observable<boolean>;

  constructor(private afAuth: AngularFireAuth) {
    this.isAuthenticated$ = this.afAuth.authState.pipe(
      map(user => !!user)
    );
  }
}
