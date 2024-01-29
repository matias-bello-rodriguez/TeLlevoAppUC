import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { RegistroUsuario } from 'src/app/interface';
import { Viaje } from 'src/app/viaje-interface';


@Component({
  selector: 'app-historial-viajes',
  templateUrl: './historial-viajes.page.html',
  styleUrls: ['./historial-viajes.page.scss'],
})
export class HistorialViajesPage implements OnInit {

  viajes!: Observable<Viaje[]>;
  emailUsuarioActual: string | null = null;

  constructor(
    private firestore: AngularFirestore, 
    private modalController: ModalController,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.emailUsuarioActual = user.email;
        const viajesCreados = this.firestore.collection<Viaje>('historial-viaje', ref => 
          ref.where('email', '==', user.email)
        ).snapshotChanges().pipe(
          map(actions => actions.map(a => {
            const data = a.payload.doc.data() as Viaje;
            const id = a.payload.doc.id;
            return { id, ...data };
          }))
        );

        const viajesSuscritos = this.firestore.collection<Viaje>('historial-viaje', ref => 
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
            const todosViajes = [...creados, ...suscritos];
            return todosViajes.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
          })
        );
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
          this.firestore.collection('historial-viaje').doc(viaje.id).delete()
            .then(() => {
              console.log("Viaje eliminado con éxito");
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


  async actualizarEstadoUsuarios(emails: string[] | null) {
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
}
