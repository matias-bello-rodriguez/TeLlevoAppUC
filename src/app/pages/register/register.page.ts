import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router'; // Importar Router
import { AlertController } from '@ionic/angular';
import { RegistroUsuario } from 'src/app/interface';



@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  registroUsuario: RegistroUsuario = {
    // Inicializa tus propiedades aquí
    email: '',
    phone: 0,
    firstName: '',
    lastName: '',
    address: '',
    password: '',
    confirmPassword: '',
    patente: '', 
    estado: true// O 'conductor', según tu lógica de negocio
  };

  patenteDisabled: boolean = false; // Asegúrate de que esta línea esté presente


  constructor(private alertController:AlertController, private router: Router,
    private afAuth: AngularFireAuth, private firestore: AngularFirestore ) { }
  

  onSubmit(): void {
    // Aquí es donde manejas el envío del formulario
    console.log('Formulario enviado', this.registroUsuario);

    const email = this.registroUsuario.email; // Extrae el email
    const password = this.registroUsuario.password;

    if (!this.emailValido(email)) {
      console.error('Error: Formato de email inválido.');
      this.mostrarAlerta("Por favor, ingresa un email válido.");
      return; // Detiene la ejecución si el email no es válido
    }

    if (!this.passwordValida(password)) {
      console.error('Error: Contraseña inválida.');
      this.mostrarAlerta("Su contraseña debe contener más de 6 caractéres.");
      return; // Detiene la ejecución si el email no es válido
    }

    if (password !== this.registroUsuario.confirmPassword) {
      console.error('Error: Las contraseñas no coinciden.');
      this.mostrarAlerta("Las contraseñas ingresadas no coinciden.");
      return; // Detiene la ejecución si las contraseñas no coinciden
    }
    

    
    if (!this.patenteDisabled && !this.patenteValida(this.registroUsuario.patente)) {
      console.error('Error: Formato de patente inválido.');
      this.mostrarAlerta("La patente debe tener 6 caracteres alfanuméricos.");
      return;
    }
    

    if (localStorage.getItem(email)) {
      // Maneja el caso en que el email ya esté registrado
      console.error('Error: El email ya está registrado.');
      this.mostrarAlerta("email ya ingresado");
      // Aquí podrías, por ejemplo, mostrar un mensaje de error al usuario
    } else {
      // Si el email no está registrado, procede a almacenar los datos
      localStorage.setItem(email, JSON.stringify(this.registroUsuario));
      this.mostrarAlerta("Usuario registrado con éxito.");
      this.registerFirebase(email, password);

      console.log('Usuario registrado con éxito.');
      this.router.navigateByUrl('/login');
     // Aquí podrías redirigir al usuario a otra página o mostrar un mensaje de éxito
    }


  }

  async mostrarAlerta(mensaje: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Registro',
      message: mensaje,
      buttons: ['OK']
    });

    await alert.present();
  }

  navegarALogin() {
    this.router.navigateByUrl('/login');
  }


  registerFirebase(email: string, password: string) {
    this.afAuth.createUserWithEmailAndPassword(email, password)
      .then((result) => {
        console.log("hola");
        this.guardarDatosUsuario(result.user);


      })
      .catch((error) => {
        // Aquí manejas los errores de Firebase
        console.error('Error al registrar en Firebase:', error);
        this.mostrarAlerta("Error en el registro: " + error.message);
      });
  }


  
  

  emailValido(email: string): boolean {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  }

  passwordValida(password: string): boolean {
    const minimoSeisCaracteres = password.length >= 6;
    // Aquí puedes agregar más reglas según tus necesidades
    return minimoSeisCaracteres;
  }

  patenteValida(patente: string): boolean {
    const patenteRegex = /^[A-Za-z0-9]{6}$/; // Expresión regular para validar la patente
    return patenteRegex.test(patente);
  }
  
  
  guardarDatosUsuario(user: any) {
    const usuarioData = {
      email: this.registroUsuario.email,
      password: this.registroUsuario.password,
      adress: this.registroUsuario.address,
      phone: this.registroUsuario.phone,
      firstname: this.registroUsuario.firstName,
      lastname: this.registroUsuario.lastName,
      patente: this.registroUsuario.patente,
      estado: this.registroUsuario.estado
      // otros datos del registroUsuario...
    };
  
    return this.firestore.collection('usuarios').doc(user.uid).set(usuarioData)
      .then(() => {
        console.log('Datos de usuario guardados en Firestore');
        this.router.navigateByUrl('/login');
      })
      .catch(error => {
        console.error('Error al guardar en Firestore:', error);
        this.mostrarAlerta("Error al guardar datos: " + error.message);
      });
  }
  
  togglePatente(event: any) {
    this.patenteDisabled = event.detail.checked;
    this.registroUsuario.patente = this.patenteDisabled ? '0' : '';
  }
  
  

}

