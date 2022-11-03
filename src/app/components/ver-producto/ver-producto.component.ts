import { AuthService } from './../../services/auth.service';
import { Rol } from './../../models/rol';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { Location } from '@angular/common';
import { LoadingOverlayService } from '../../services/loading-overlay.service';
import { Producto } from '../../models/producto';
import { finalize } from 'rxjs/operators';
import { MensajeService } from '../../services/mensaje.service';
import { MensajeModalType } from '../mensaje-modal/mensaje-modal.component';
import { CantidadEnSucursal } from '../../models/cantidad-en-sucursal';
import { SucursalesService } from '../../services/sucursales.service';

@Component({
  selector: 'app-ver-producto',
  templateUrl: './ver-producto.component.html',
  styleUrls: ['./ver-producto.component.scss']
})
export class VerProductoComponent implements OnInit {
  producto: Producto;

  allowedRolesToDelete: Rol[] = [ Rol.ADMINISTRADOR ];
  hasRoleToDelete = false;

  allowedRolesToEdit: Rol[] = [Rol.ADMINISTRADOR, Rol.ENCARGADO];
  hasRoleToEdit = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private productosService: ProductosService,
              private sucursalesService: SucursalesService,
              private location: Location,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService,
              private authService: AuthService) { }

  ngOnInit() {
    this.hasRoleToDelete = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToDelete);
    this.hasRoleToEdit = this.authService.userHasAnyOfTheseRoles(this.allowedRolesToEdit);

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadingOverlayService.activate();
    this.productosService.getProducto(id)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe({
        next: (p: Producto) => this.producto = p,
        error: err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.volverAlListado();
        }
      })
    ;
  }

  volverAlListado() {
    this.location.back();
  }

  getCantidadEnSucursal() {
    const aux: Array<CantidadEnSucursal> = this.producto.cantidadEnSucursales.filter(
      c => c.idSucursal === Number(this.sucursalesService.getIdSucursal())
    );
    return aux.length ? aux[0].cantidad : 0;
  }

  getCantOtrasSucursales() {
    const aux: Array<CantidadEnSucursal> = this.producto.cantidadEnSucursales.filter(
      c => c.idSucursal !== Number(this.sucursalesService.getIdSucursal())
    );
    let cant = 0;
    aux.forEach((ces: CantidadEnSucursal) => cant += ces.cantidad);
    return cant;
  }

  editar() {
    if (!this.hasRoleToEdit) {
      this.mensajeService.msg('No posee permiso para editar productos.', MensajeModalType.ERROR);
      return;
    }

    this.router.navigate(['/productos/editar', this.producto.idProducto]);
  }

  eliminar() {
    if (!this.hasRoleToDelete) {
      this.mensajeService.msg('No posee permiso para eliminar productos.', MensajeModalType.ERROR);
      return;
    }

    const msg = `¿Desea eliminar "${this.producto.descripcion}"?`;
    this.mensajeService.msg(msg, MensajeModalType.CONFIRM).then((result) => {
      if (result) {
        this.loadingOverlayService.activate();
        this.productosService.eliminarProductos([this.producto.idProducto])
          .pipe(finalize(() => this.loadingOverlayService.deactivate()))
          .subscribe({
            next: () => this.volverAlListado(),
            error: err => this.mensajeService.msg(err.error, MensajeModalType.ERROR)
          })
        ;
      }
    });
  }
}
