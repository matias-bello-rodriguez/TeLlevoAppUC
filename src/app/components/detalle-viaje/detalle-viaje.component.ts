import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { RegistroUsuario } from 'src/app/interface';
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
    suscriptores: [],
    pasajerosActuales: 0
  };

  viajeId!: string;


  constructor(
    private modalController: ModalController, 
    private alertController: AlertController, 
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router:Router
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

    // Verificar el estado del usuario antes de permitir la reserva
    const puedeReservar = await this.verificarEstadoUsuario(user.uid);
    if (!puedeReservar) {
      const alert = await this.alertController.create({
        header: 'Reserva Denegada',
        message: 'No puedes reservar este viaje debido a tu estado actual.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    try {
      await this.suscribirseAViaje(userEmail);
      
      // Actualiza el estado del usuario
      await this.actualizarEstadoUsuario(userEmail);

      const alert = await this.alertController.create({
        header: 'Reserva Confirmada',
        message: 'Viaje reservado exitosamente. Estado del usuario actualizado.',
        buttons: ['OK']
      });

      await alert.present();
      this.router.navigateByUrl('/viaje-actual'); // Navegar a 'viaje-actual'

      this.modalController.dismiss();
    } catch (error) {
      console.error('Error al reservar el pasaje:', error);
    }
  }

  async verificarEstadoUsuario(uid: string): Promise<boolean> {
    try {
      const userRef = this.firestore.collection('usuarios').doc(uid);
      const docSnapshot = await userRef.get().toPromise();
  
      if (!docSnapshot || !docSnapshot.exists) {
        console.error('Error: Usuario no encontrado o docSnapshot es indefinido.');
        return false;
      }
  
      const userData = docSnapshot.data() as RegistroUsuario; // Usa la interfaz RegistroUsuario aquí
      return userData && userData.estado !== false;
    } catch (error) {
      console.error('Error al verificar el estado del usuario:', error);
      return false;
    }
  }
  
  
  
  
  

  async suscribirseAViaje(userEmail: string) {
    const viajeRef = this.firestore.collection<Viaje>('viajes').doc(this.viajeId);
  
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
  
      if (viaje.pasajerosActuales >= viaje.pasajerosMaximos) {
        const alert = await this.alertController.create({
          header: 'No hay asientos disponibles',
          message: 'No puedes reservar este viaje porque no hay asientos disponibles.',
          buttons: ['OK']
        });
        await alert.present();
        return;
      }
  
      // Incrementa pasajerosActuales por 1
      viaje.pasajerosActuales += 1;
  
      transaction.update(viajeRef.ref, {
        suscriptores: [...suscriptores, userEmail],
        pasajerosActuales: viaje.pasajerosActuales
      });
    });
  }

  async actualizarEstadoUsuario(userEmail: string) {
    try {
      const user = await this.afAuth.currentUser;
  
      if (!user) {
        console.error('Error: No hay un usuario autenticado.');
        return;
      }
  
      const uid = user.uid;
      const userRef = this.firestore.collection('usuarios').doc(uid);
  
      const docSnapshot = await userRef.get().toPromise();
  
      // Verificar si docSnapshot está definido
      if (docSnapshot && docSnapshot.exists) {
        await userRef.update({ estado: false });
        console.log('Estado del usuario actualizado');
      } else {
        console.error('Error: No hay un documento para actualizar.');
        // Opcional: Crear un documento para el usuario si es necesario
        // await userRef.set({ /* datos del usuario */ });
      }
    } catch (error) {
      console.error('Error al actualizar el estado del usuario:', error);
    }
  }
}
