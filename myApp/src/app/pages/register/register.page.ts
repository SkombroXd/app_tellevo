import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Usuario } from 'src/app/interfaces/usuario';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  usr:Usuario={
    id:Date.now().toString(),
    nombre:"",
    apellido:"",
    email:"",
    password:"",
  }


  constructor(private reg:AngularFireAuth,private firestore:AngularFirestore, private router:Router) { }

  ngOnInit() {
  }
  async registrarUsuario(usuario:any){
    return this.firestore.collection('usuarios').add(usuario);
  }
  async registrar(){
    const credencial=await this.reg.createUserWithEmailAndPassword(this.usr.email,this.usr.password)
    const userID=credencial.user?.uid;
    const datosUsuario:any={
      idUser:userID,
      nombre:this.usr.nombre,
      apellido:this.usr.apellido,
      email:this.usr.email,
    };
    await this.registrarUsuario(datosUsuario);
    console.log('Funka');
    this.router.navigateByUrl('/login')

  }

}
