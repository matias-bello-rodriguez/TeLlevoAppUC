import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Viaje } from 'src/app/viaje-interface';


@Component({
  selector: 'app-modal-viaje',
  templateUrl: './modal-viaje.component.html',
  styleUrls: ['./modal-viaje.component.scss'],
})
export class ModalViajeComponent implements OnInit {
  
  viajes!: Observable<Viaje[]>;


  constructor(
    public modalController: ModalController,
    public alertController: AlertController,
    private firestore:AngularFirestore
  ) {
    
  }

  ngOnInit() {
    this.viajes = this.firestore.collection<Viaje>('viajes').snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Viaje;
        const id = a.payload.doc.id;
        return { id, ...data }; // Combina el id con los datos del viaje
      }))
    );
  }

  closeModal() {
    this.modalController.dismiss();
  }

 

  async showTripCompletedAlert() {
    const alert = await this.alertController.create({
      header: 'Viaje Terminado',
      message: 'Todos los pasajeros han llegado a destino.',
      buttons: ['OK'],
    });

    await alert.present();
  }
}