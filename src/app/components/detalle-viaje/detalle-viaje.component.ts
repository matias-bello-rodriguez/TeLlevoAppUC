import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AlertController, ModalController } from '@ionic/angular';
import { Viaje } from 'src/app/viaje-interface';

@Component({
  selector: 'app-detalle-viaje',
  templateUrl: './detalle-viaje.component.html',
  styleUrls: ['./detalle-viaje.component.scss'],
})
export class NombreDelModalComponent {
  viaje: Viaje = {
    destino: '',
    horaSalida: '',
    pasajerosMaximos: 0,
    tarifa: 0,
    fecha: new Date(),
    patente: '',
    conductor: '',
    email: '',
    suscriptores: []
  };

  viajeId!: string;

  constructor(
    private modalController: ModalController, 
    private alertController: AlertController, 
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth
  ) { }

  cerrarModal() {
    this.modalController.dismiss();
  }

  async reservarPasaje() {
    const user = await this.afAuth.currentUser;
    const userEmail = user?.email;

    if (!userEmail) {
      console.error('Error: No hay un usuario autenticado o el email no está disponible.');
      return;
    }

    try {
      await this.suscribirseAViaje(userEmail);

      const alert = await this.alertController.create({
        header: 'Reserva Confirmada',
        message: 'Viaje reservado exitosamente.',
        buttons: ['OK']
      });

      await alert.present();
      this.modalController.dismiss();
    } catch (error) {
      console.error('Error al reservar el pasaje:', error);
    }
  }
  
  async suscribirseAViaje(userEmail: string) {
    const viajeRef = this.firestore.collection('viajes').doc(this.viaje.id);
  
    return this.firestore.firestore.runTransaction(async (transaction) => {
      const viajeDoc = await transaction.get(viajeRef.ref);
      
      if (!viajeDoc.exists) {
        throw new Error('Viaje no encontrado');
      }
  
      const viaje = viajeDoc.data() as Viaje;
      const suscriptores = viaje.suscriptores || [];
      if (suscriptores.includes(userEmail)) {
        console.log('Usuario ya está suscrito a este viaje');
        return;
      }
  
      transaction.update(viajeRef.ref, {
        suscriptores: [...suscriptores, userEmail]
      });
    });
  }
}
