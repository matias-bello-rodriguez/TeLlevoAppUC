import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { NombreDelModalComponent } from 'src/app/components/detalle-viaje/detalle-viaje.component';
import { Viaje } from 'src/app/viaje-interface';

@Component({
  selector: 'app-viajes',
  templateUrl: './viajes.page.html',
  styleUrls: ['./viajes.page.scss'],
})
export class ViajesPage implements OnInit {
  viajes!: Observable<Viaje[]>;

  constructor(
    private firestore: AngularFirestore,
    private modalController: ModalController,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {
    this.viajes = this.afAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          // Obtiene el correo electrónico del usuario autenticado
          const userEmail = user.email;

          // Consulta los viajes que no tienen el mismo correo electrónico que el usuario
          return this.firestore
            .collection<Viaje>('viajes', (ref) =>
              ref.where('email', '!=', userEmail)
            )
            .snapshotChanges()
            .pipe(
              map((actions) =>
                actions.map((a) => {
                  const data = a.payload.doc.data() as Viaje;
                  const id = a.payload.doc.id;
                  return { id, ...data };
                })
              )
            );
        } else {
          // Si no hay usuario autenticado, devuelve un Observable vacío
          return [];
        }
      })
    );
  }

  async abrirModal(viaje: Viaje) {
    const modal = await this.modalController.create({
      component: NombreDelModalComponent,
      componentProps: {
        viaje: viaje,
        viajeId: viaje.id,
      },
    });
    return await modal.present();
  }
}
