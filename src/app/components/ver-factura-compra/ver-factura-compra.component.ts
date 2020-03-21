import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FacturasService } from '../../services/facturas.service';
import { Location } from '@angular/common';
import { FacturaCompra } from '../../models/factura-compra';
import { RenglonFactura } from '../../models/renglon-factura';
import { HelperService } from '../../services/helper.service';
import { combineLatest } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { TipoDeComprobante } from '../../models/tipo-de-comprobante';

@Component({
  selector: 'app-ver-factura-compra',
  templateUrl: './ver-factura-compra.component.html',
  styleUrls: ['./ver-factura-compra.component.scss']
})
export class VerFacturaCompraComponent implements OnInit {
  factura: FacturaCompra = null;
  renglones: RenglonFactura[]  = [];
  loading = false;
  helper = HelperService;

  tiposDeComprobante = [
    { val: TipoDeComprobante.FACTURA_A, text: 'Factura A' },
    { val: TipoDeComprobante.FACTURA_B, text: 'Factura B' },
    { val: TipoDeComprobante.FACTURA_X, text: 'Factura X' },
    { val: TipoDeComprobante.FACTURA_Y, text: 'Factura Y' },
    { val: TipoDeComprobante.PRESUPUESTO, text: 'Presupuesto' },
  ];

  constructor(private route: ActivatedRoute,
              private facturasService: FacturasService,
              private location: Location) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    combineLatest([
      this.facturasService.getFactura(id),
      this.facturasService.getRenglonesDeFactura(id)
    ]).pipe(finalize(() => this.loading = false))
      .subscribe((data: [FacturaCompra, RenglonFactura[]]) => {
        this.factura = data[0];
        this.renglones = data[1];
      })
    ;
  }

  volverAlListado() {
    this.location.back();
  }

  getNumeroDeComprobante() {
    if (this.factura) {
      return this.factura.cae
        ? HelperService.formatNumFactura(this.factura.numSerieAfip, this.factura.numFacturaAfip)
        : HelperService.formatNumFactura(this.factura.numSerie, this.factura.numFactura)
        ;
    }
    return '';
  }

  getTipoComprobante() {
    const tipoDeComprobante = this.factura && this.factura.tipoComprobante;
    if (tipoDeComprobante) {
      const aux = this.tiposDeComprobante.filter(tc => tc.val === tipoDeComprobante);
      return aux.length ? aux[0].text : '';
    }
    return '';
  }
}
