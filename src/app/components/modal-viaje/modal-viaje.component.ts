import { Component } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Viaje } from 'src/app/viaje-interface';

@Component({
  selector: 'app-modal-viaje',
  templateUrl: './modal-viaje.component.html',
  styleUrls: ['./modal-viaje.component.scss'],
})
export class ModalViajeComponent {
  
  viajes!: Observable<Viaje[]>;

  constructor(
    public modalController: ModalController,
    public alertController: AlertController
  ) {
    
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