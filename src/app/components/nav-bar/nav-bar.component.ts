import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Usuario } from '../../models/usuario';
import { AuthService } from '../../services/auth.service';
import { SucursalesService } from '../../services/sucursales.service';
import { Sucursal } from '../../models/sucursal';
import { UsuariosService } from '../../services/usuarios.service';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {

  private pSideNavOpened = false;
  @Input() set sindeNavOpened(value: boolean) { this.pSideNavOpened = value; }
  get sideNavOpened(): boolean { return this.pSideNavOpened; }
  @Output() menuButtonClick = new EventEmitter<void>();
  isCollapsed = true;
  usuario: Usuario = null;
  sucursales: Sucursal[] = [];
  sucursalSeleccionada: Sucursal = null;
  subscription: Subscription;

  constructor(public authService: AuthService,
    public sucursalesService: SucursalesService,
    public usuariosService: UsuariosService) {
    this.subscription = new Subscription();
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.subscription.add(
        combineLatest([
          this.authService.getLoggedInUsuario(),
          this.sucursalesService.getSucursales()
        ]).subscribe((v: [Usuario, Sucursal[]]) => {
          this.usuario = v[0];
          this.sucursales = v[1];
          this.refreshSucursalSeleccionada();
        })
      );
      this.subscription.add(this.sucursalesService.sucursalSeleccionada$.subscribe(() => this.refreshSucursalSeleccionada()));
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  logout() {
    this.authService.logout();
  }

  menuBtnClick() {
    this.menuButtonClick.emit();
  }

  refreshSucursalSeleccionada() {
    const idSucSeleccionada = Number(this.sucursalesService.getIdSucursal());
    const aux = this.sucursales.filter((s: Sucursal) => s.idSucursal === idSucSeleccionada);
    this.sucursalSeleccionada = aux.length ? aux[0] : null;
  }

  seleccionarSucursal(s: Sucursal) {
    if (s && this.sucursalSeleccionada && s.idSucursal === this.sucursalSeleccionada.idSucursal) { return; }
    this.sucursalesService.seleccionarSucursal(s);
    if (this.usuario) {
      this.usuariosService.setSucursalPredeterminadaDeUsuario(this.usuario.idUsuario, s.idSucursal).subscribe();
    }
  }

  get logo(): string {
    return this.sucursalSeleccionada?.logo ? this.sucursalSeleccionada.logo : 'assets/logo-opensource.png';
  }
}
