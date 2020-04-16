import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  constructor(private route: ActivatedRoute,
              private productosService: ProductosService,
              private sucursalesService: SucursalesService,
              private location: Location,
              private loadingOverlayService: LoadingOverlayService,
              private mensajeService: MensajeService) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadingOverlayService.activate();
    this.productosService.getProducto(id)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
        (p: Producto) => this.producto = p,
        err => {
          this.mensajeService.msg(err.error, MensajeModalType.ERROR);
          this.volverAlListado();
        }
      )
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
}
