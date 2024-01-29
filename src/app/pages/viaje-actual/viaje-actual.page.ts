import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { RegistroUsuario } from 'src/app/interface';
import { Viaje } from 'src/app/viaje-interface';

@Component({
  selector: 'app-viaje-actual',
  templateUrl: './viaje-actual.page.html',
  styleUrls: ['./viaje-actual.page.scss'],
})
export class ViajeActualPage implements OnInit {
  viajes!: Observable<Viaje[]>;
  emailUsuarioActual: string | null = null;
  hayViajes: boolean = true; // Propiedad para controlar la visualización del mensaje

  constructor(
    private firestore: AngularFirestore, 
    private modalController: ModalController,
    private afAuth: AngularFireAuth,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.emailUsuarioActual = user.email;

        const viajesCreados = this.firestore.collection<Viaje>('viajes', ref => 
          ref.where('email', '==', user.email)
        ).snapshotChanges().pipe(
          map(actions => actions.map(a => {
            const data = a.payload.doc.data() as Viaje;
            const id = a.payload.doc.id;
            return { id, ...data };
          }))
        );

        const viajesSuscritos = this.firestore.collection<Viaje>('viajes', ref => 
          ref.where('suscriptores', 'array-contains', user.email)
        ).snapshotChanges().pipe(
          map(actions => actions.map(a => {
            const data = a.payload.doc.data() as Viaje;
            const id = a.payload.doc.id;
            return { id, ...data };
          }))
        );

        this.viajes = combineLatest([viajesCreados, viajesSuscritos]).pipe(
          map(([creados, suscritos]) => {
            return [...creados, ...suscritos].filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
          })
        );

        // Actualiza hayViajes basado en la cantidad de viajes
        this.viajes.subscribe(viajes => {
          this.hayViajes = viajes.length > 0;
        });
      }
    });
  }

  terminarViaje(viaje: Viaje) {
    if (viaje.id) {
      // Primero, guardar los datos del viaje en 'historial-viaje'
      this.firestore.collection('historial-viaje').add({...viaje})
        .then(() => {
          console.log("Viaje guardado en historial con éxito");

          // Después de guardar en el historial, eliminar el viaje de la colección 'viajes'
          this.firestore.collection('viajes').doc(viaje.id).delete()
            .then(() => {
              console.log("Viaje eliminado con éxito");
              this.mostrarAlertaYRedirigir();
              this.actualizarEstadoUsuarios(viaje.suscriptores);
              if (viaje.email) {
                this.actualizarEstadoConductor(viaje.email);
              }
            })
            .catch(error => {
              console.error("Error al eliminar el viaje: ", error);
            });
        })
        .catch(error => {
          console.error("Error al guardar el viaje en el historial: ", error);
        });
    } else {
      console.error("Error: el viaje no tiene un ID válido");
    }
  }


  async actualizarEstadoUsuarios(emails: string[] | null ) {
    if (emails && emails.length > 0) {
      emails.forEach(email => {
        this.firestore.collection<RegistroUsuario>('usuarios', ref => 
          ref.where('email', '==', email))
          .get()
          .subscribe(snapshot => {
            snapshot.forEach(doc => {
              if (doc.exists) {
                this.firestore.collection('usuarios').doc(doc.id).update({ estado: true });
              }
            });
          }, error => {
            console.error(`Error al actualizar el estado del usuario con email ${email}:`, error);
          });
      });
    }
  }

  actualizarEstadoUsuarioIndividual(emailUsuario: string, nuevoEstado: boolean) {
    this.firestore.collection<RegistroUsuario>('usuarios', ref => 
      ref.where('email', '==', emailUsuario))
      .get()
      .subscribe(snapshot => {
        snapshot.forEach(doc => {
          if (doc.exists) {
            this.firestore.collection('usuarios').doc(doc.id).update({ estado: nuevoEstado })
              .then(() => console.log(`Estado del usuario ${emailUsuario} actualizado a ${nuevoEstado}`))
              .catch(error => console.error(`Error al actualizar el estado del usuario: ${error}`));
          }
        });
      }, error => {
        console.error(`Error al actualizar el estado del usuario con email ${emailUsuario}:`, error);
      });
  }

  async actualizarEstadoConductor(emailConductor: string) {
    this.firestore.collection<RegistroUsuario>('usuarios', ref => 
      ref.where('email', '==', emailConductor))
      .get()
      .subscribe(snapshot => {
        snapshot.forEach(doc => {
          if (doc.exists) {
            this.firestore.collection('usuarios').doc(doc.id).update({ estado: true })
              .then(() => console.log(`Estado del conductor con email ${emailConductor} actualizado a true`))
              .catch(error => console.error(`Error al actualizar el estado del conductor: ${error}`));
          }
        });
      }, error => {
        console.error(`Error al actualizar el estado del conductor con email ${emailConductor}:`, error);
      });
  }

  async desuscribirseViaje(viaje: Viaje) {
    if (viaje.id && this.emailUsuarioActual) {
      const suscriptores = viaje.suscriptores || [];
      if (suscriptores.includes(this.emailUsuarioActual)) {
        const nuevosSuscriptores = suscriptores.filter(email => email !== this.emailUsuarioActual);

        // Actualiza la lista de suscriptores y decrementa los pasajeros actuales
        this.firestore.collection('viajes').doc(viaje.id).update({ 
          suscriptores: nuevosSuscriptores,
          pasajerosActuales: viaje.pasajerosActuales > 0 ? viaje.pasajerosActuales - 1 : 0
        })
        .then(() => {
          console.log("Usuario desuscrito del viaje");
          this.mostrarMensajeYRedirigir();
          if (this.emailUsuarioActual) {
            this.actualizarEstadoUsuarioIndividual(this.emailUsuarioActual, true);
          }
        })
        .catch(error => {
          console.error("Error al desuscribir al usuario del viaje: ", error);
        });
      }
    }
  }
  
  async mostrarAlertaYRedirigir() {
    const alert = await this.alertController.create({
      header: 'Viaje Terminado',
      message: 'Viaje terminado con éxito',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.router.navigate(['/viajes']); // Redirigir a 'reservar-viaje'
        }
      }]
    });

    await alert.present();
  }
  
  async mostrarMensajeYRedirigir() {
    const alert = await this.alertController.create({
      header: 'Desuscripción Exitosa',
      message: 'Usted se ha desuscrito del viaje',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.router.navigate(['/viajes']); // Redirigir a 'viajes'
        }
      }]
    });

    await alert.present();
  }

}