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
  returnUrl = '';

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
    this.errors.subscribe((message) => this.errorMessage = message);
    this.errors
      .pipe(debounceTime(3000))
      .subscribe(() => this.errorMessage = null);

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['']);
    } else {
      this.route.queryParamMap.subscribe(params => {
        if (params.has('return')) { this.returnUrl = params.get('return'); }
      });
    }

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
      this.loadingOverlayService.activate();
      this.form.disable();
      this.authService.login(data.username, data.password)
        .subscribe(
        () => {
          this.authService.getLoggedInUsuario()
            .subscribe(
              (usuario: Usuario) => {
                if (!this.tienePermisos(usuario)) {
                  this.showErrorMessage('No posee permisos para ingresar.');
                  this.loadingOverlayService.deactivate();
                  this.form.enable();
                  this.authService.logout();
                  return;
                }

                this.sucursalesService.getSucursales()
                  .pipe(
                    finalize(() => {
                      this.loadingOverlayService.deactivate();
                      this.form.enable();
                    })
                  )
                  .subscribe(
                    sucs => {
                      this.loadingOverlayService.deactivate();
                      if (sucs.length)  {
                        const aux = sucs.filter((s: Sucursal) => s.idSucursal === usuario.idSucursalPredeterminada);
                        if (aux.length) {
                          this.sucursalesService.seleccionarSucursal(aux[0]);
                        } else {
                          this.sucursalesService.seleccionarSucursal(sucs[0]);
                        }
                        if (this.returnUrl) {
                          this.router.navigateByUrl(this.returnUrl);
                        } else {
                          this.router.navigate(['']);
                        }
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
                this.loadingOverlayService.deactivate();
                this.form.enable();
              }
            );
        },
        err => {
          this.showErrorMessage(err);
          this.loadingOverlayService.deactivate();
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
