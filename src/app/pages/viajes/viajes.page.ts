import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NombreDelModalComponent } from 'src/app/components/detalle-viaje/detalle-viaje.component';
import { Viaje } from 'src/app/viaje-interface';

@Component({
  selector: 'app-viajes',
  templateUrl: './viajes.page.html',
  styleUrls: ['./viajes.page.scss'],
})
export class ViajesPage implements OnInit {
  viajes!: Observable<Viaje[]>;

  constructor(private firestore: AngularFirestore, private modalController: ModalController) {}

  ngOnInit() {
    this.viajes = this.firestore.collection<Viaje>('viajes').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Viaje;
        const id = a.payload.doc.id;
        return { id, ...data }; // Combina el id con los datos del viaje
      }))
    );
  }

  async abrirModal(viaje: Viaje) {
    const modal = await this.modalController.create({
      component: NombreDelModalComponent,
      componentProps: {
        viaje: viaje, // viaje ahora incluye el id
        viajeId: viaje.id // Pasa el id del viaje
      }
    });
    return await modal.present();
  }
}
