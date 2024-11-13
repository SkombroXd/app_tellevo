import { Component, OnInit } from '@angular/core';
import { Usuario } from 'src/app/interfaces/usuario';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  usr:Usuario={
    id:Date.now().toString(),
    nombre:"",
    email:"",
    password:"",
  }

  constructor(private auths:AuthService) { }

  ngOnInit() {
  }
  login(){
    this.auths.login(this.usr.email, this.usr.password)
    .then(()=>{
      console.log('Usuario Logeado')
    })
    .catch((e)=>{
      console.log('No se pudo iniciar session',e)
    })
  }
}
