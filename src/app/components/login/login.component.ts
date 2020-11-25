import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuario';
import { debounceTime, finalize } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { SucursalesService } from '../../services/sucursales.service';
import { Sucursal } from '../../models/sucursal';
import { Rol } from '../../models/rol';
import { LoadingOverlayService } from '../../services/loading-overlay.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  loading = false;
  submitted = false;

  allowedRoles: Rol[] = [
    Rol.ADMINISTRADOR,
    Rol.ENCARGADO,
    Rol.VENDEDOR,
    Rol.VIAJANTE,
  ];

  private errors = new Subject<string>();
  errorMessage: string;

  constructor(private authService: AuthService,
              private fb: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private sucursalesService: SucursalesService,
              private loadingOverlayService: LoadingOverlayService) { }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['']);
    }

    this.errors.subscribe((message) => this.errorMessage = message);
    this.errors
      .pipe(debounceTime(3000))
      .subscribe(() => this.errorMessage = null);

    this.createForm();
  }

  get f() { return this.form.controls; }

  createForm() {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login() {
    this.submitted = true;
    if (this.form.valid) {
      const data = this.form.value;
      this.form.disable();
      this.loadingOverlayService.activate();
      this.authService.login(data.username, data.password)
        .pipe(finalize(() => this.loadingOverlayService.deactivate()))
        .subscribe(
        () => {
          this.loadingOverlayService.activate();
          this.authService.getLoggedInUsuario()
            .pipe(finalize(() => this.loadingOverlayService.deactivate()))
            .subscribe(
              (usuario: Usuario) => {
                if (!this.tienePermisos(usuario)) {
                  this.showErrorMessage('No posee permisos para ingresar.');
                  this.form.enable();
                  this.authService.logout();
                  return;
                }

                this.loadingOverlayService.activate();
                this.sucursalesService.getSucursales()
                  .pipe(
                    finalize(() => {
                      this.loadingOverlayService.deactivate();
                      this.form.enable();
                    })
                  )
                  .subscribe(
                    sucs => {
                      if (sucs.length)  {
                        const aux = sucs.filter((s: Sucursal) => s.idSucursal === usuario.idSucursalPredeterminada);
                        if (aux.length) {
                          this.sucursalesService.seleccionarSucursal(aux[0]);
                        } else {
                          this.sucursalesService.seleccionarSucursal(sucs[0]);
                        }
                        this.router.navigate(['']);
                      } else {
                        this.showErrorMessage('No se pudieron obtener sucursales.');
                        this.authService.logout();
                      }
                    },
                    err => this.showErrorMessage(err)
                  )
                ;
              },
              err => {
                this.showErrorMessage(err);
                this.form.enable();
              }
            );
        },
        err => {
          this.showErrorMessage(err);
          this.form.enable();
        })
      ;
    }
  }

  tienePermisos(u: Usuario) {
    const intersect = u.roles.filter(x => this.allowedRoles.includes(x));
    return intersect.length > 0;
  }

  showErrorMessage(message: string) {
    this.errors.next(message);
  }
}
