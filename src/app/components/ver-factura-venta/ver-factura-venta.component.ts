import { Component, OnInit } from '@angular/core';
import { FacturaVenta } from '../../models/factura-venta';
import { FacturasVentaService } from '../../services/facturas-venta.service';
import { ActivatedRoute } from '@angular/router';
import { FacturasService } from '../../services/facturas.service';
import { finalize } from 'rxjs/operators';
import { HelperService } from '../../services/helper.service';
import { saveAs } from 'file-saver';
import { combineLatest } from 'rxjs';
import { RenglonFactura } from '../../models/renglon-factura';
import { Location } from '@angular/common';
import { TipoDeComprobante } from '../../models/tipo-de-comprobante';

@Component({
  selector: 'app-ver-factura-venta',
  templateUrl: './ver-factura-venta.component.html',
  styleUrls: ['./ver-factura-venta.component.scss']
})
export class VerFacturaVentaComponent implements OnInit {
  factura: FacturaVenta = null;
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
              private facturasVentaService: FacturasVentaService,
              private location: Location) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    combineLatest([
      this.facturasService.getFactura(id),
      this.facturasService.getRenglonesDeFactura(id)
    ]).pipe(finalize(() => this.loading = false))
      .subscribe((data: [FacturaVenta, RenglonFactura[]]) => {
        this.factura = data[0];
        this.renglones = data[1]; console.log(this.renglones);
      })
    ;
  }

  volverAlListado() {
    this.location.back();
  }

  downloadFacturaPdf() {
    this.facturasVentaService.getFacturaPdf(this.factura).subscribe(
      (res) => {
        const file = new Blob([res], {type: 'application/pdf'});
        saveAs(file, `factura-venta.pdf`);
      }
    );
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

  getNombreCliente() {
    return this.factura && this.factura.idCliente
      ? `#${this.factura.nroDeCliente} - ${this.factura.nombreFiscalCliente}`
      : ''
    ;
  }
}
