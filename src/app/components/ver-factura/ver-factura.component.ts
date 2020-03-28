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
import { FacturaCompra } from '../../models/factura-compra';
import { Factura } from '../../models/factura';
import { LoadingOverlayService } from '../../services/loading-overlay.service';

@Component({
  selector: 'app-ver-factura-venta',
  templateUrl: './ver-factura.component.html',
  styleUrls: ['./ver-factura.component.scss']
})
export class VerFacturaComponent implements OnInit {
  factura: Factura = null;
  renglones: RenglonFactura[]  = [];
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
              private location: Location,
              private loadingOverlayService: LoadingOverlayService) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadingOverlayService.activate();
    combineLatest([
      this.facturasService.getFactura(id),
      this.facturasService.getRenglonesDeFactura(id)
    ]).pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe((data: [FacturaVenta, RenglonFactura[]]) => {
        this.factura = data[0];
        this.renglones = data[1];
      })
    ;
  }

  volverAlListado() {
    this.location.back();
  }

  downloadFacturaPdf() {
    if (this.factura.type === 'FacturaCompra') { return; }
    this.loadingOverlayService.activate();
    this.facturasVentaService.getFacturaPdf(this.factura as FacturaVenta)
      .pipe(finalize(() => this.loadingOverlayService.deactivate()))
      .subscribe(
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
    if (!this.factura) { return ''; }
    if (this.factura.type === 'FacturaCompra') { return  ''; }
    const f: FacturaVenta = this.factura as FacturaVenta;
    return f && f.idCliente ? `#${f.nroDeCliente} - ${f.nombreFiscalCliente}` : '';
  }
}
