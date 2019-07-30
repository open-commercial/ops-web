import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {MessageService} from 'primeng/api';
import {Usuario} from "../../models/usuario";
import {finalize} from "rxjs/operators";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = false;

  constructor(private authService: AuthService,
              private fb: FormBuilder,
              private messageService: MessageService,
              private router: Router) { }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['']);
    }
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.form.valid) {
      const data = this.form.value;
      this.loading = true;
      this.form.disable();
      this.authService.login(data.username, data.password)
        .subscribe(
        () => {
          this.authService.getLoggedInUsuario()
            .pipe(
              finalize(() => { this.loading = false; this.form.enable(); })
            )
            .subscribe((usuario: Usuario) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Login',
                detail: `Bienvenido ${usuario.nombre} ${usuario.apellido}!`
              });
              this.router.navigate(['']);
            });
        },
        err => {
          console.log(err);
          this.loading = false;
          this.form.enable();
          this.messageService.add({ severity: 'error', summary: 'Login', detail: err });
        });
    }
  }
}
