import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalViajeComponent } from 'src/app/components/modal-viaje/modal-viaje.component';
import { Viaje } from 'src/app/viaje-interface';

@Component({
  selector: 'app-viaje-actual',
  templateUrl: './viaje-actual.page.html',
  styleUrls: ['./viaje-actual.page.scss'],
})
export class ViajeActualPage implements OnInit {
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

  async openPassengerModal() {
    const modal = await this.modalController.create({
      component: ModalViajeComponent, // Reemplaza con el nombre de tu componente modal
      componentProps: {
        passengers: ['Juan Correa', 'Barney Gómez'], // Nombres de los pasajeros inventados
      },
    });

    return await modal.present();
  }
}