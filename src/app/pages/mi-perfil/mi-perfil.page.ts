import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.page.html',
  styleUrls: ['./mi-perfil.page.scss'],
})
export class MiPerfilPage implements OnInit {
  usuario$: Observable<any> | undefined; // Observable para los datos del usuario

  constructor(
    private afAuth: AngularFireAuth, 
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        // Obtener datos del usuario de Firestore
        this.usuario$ = this.firestore.collection('usuarios').doc(user.uid).valueChanges();
      }
    });
  }
}
