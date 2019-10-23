import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Usuario } from '../../models/usuario';
import { AuthService } from '../../services/auth.service';
import { SucursalesService } from '../../services/sucursales.service';
import { Sucursal } from '../../models/sucursal';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {
  @Output() menuButtonClick = new EventEmitter<void>();

  isCollapsed = true;
  usuario: Usuario = null;

  sucursales: Sucursal[] = [];
  sucursalSeleccionada: Sucursal = null;

  constructor(public authService: AuthService,
              public sucursalesService: SucursalesService) { }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.authService.getLoggedInUsuario().subscribe((u: Usuario) => this.usuario = u);
      this.sucursalesService.getSucursales().subscribe((sucs: Sucursal[]) => {
        this.sucursales = sucs;
        this.refreshSucursalSeleccionada();
      });
      this.sucursalesService.sucursal$.subscribe((s: Sucursal) => this.refreshSucursalSeleccionada());
    }
  }

  logout() {
    this.authService.logout();
    // this.toggleMenu();
  }

  menuBtnClick() {
    this.menuButtonClick.emit();
  }

  getSucursalesSinSeleccionada() {
    const idSucSeleccionada = Number(SucursalesService.getIdSucursal());
    return this.sucursales.filter((s: Sucursal) => s.idSucursal !== idSucSeleccionada);
  }

  refreshSucursalSeleccionada() {
    const idSucSeleccionada = Number(SucursalesService.getIdSucursal());
    const aux = this.sucursales.filter((s: Sucursal) => {
      console.log(s.idSucursal + ' === ' + idSucSeleccionada)
      return s.idSucursal === idSucSeleccionada;
    });
    this.sucursalSeleccionada = aux.length ? aux[0] : null;
  }

  seleccionarSucursal(s: Sucursal) {
    this.sucursalesService.seleccionarSucursal(s);
  }
}
