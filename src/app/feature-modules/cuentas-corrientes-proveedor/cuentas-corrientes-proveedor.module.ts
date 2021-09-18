import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CuentasCorrientesProveedorRoutingModule } from './cuentas-corrientes-proveedor-routing.module';
import { CuentasCorrientesProveedorComponent } from './components/cuentas-corrientes-proveedor/cuentas-corrientes-proveedor.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgBoostrapModule } from '../../modules/ng-boostrap.module';
import { ShareModule } from '../../modules/share.module';
import { CuentaCorrienteProveedorComponent } from './components/cuenta-corriente-proveedor/cuenta-corriente-proveedor.component';
import { ProveedorDetalleComponent } from './components/proveedor-detalle/proveedor-detalle.component';
import { ProveedorComponent } from './components/proveedor/proveedor.component';
import { NotaCreditoCompraSinFacturaModalComponent } from './components/nota-credito-compra-sin-factura-modal/nota-credito-compra-sin-factura-modal.component';
import { NotaCreditoCompraDetalleSinFacturaModalComponent } from './components/nota-credito-compra-detalle-sin-factura-modal/nota-credito-compra-detalle -sin-factura-modal.component';
import { NotaDebitoCompraSinReciboModalComponent } from './components/nota-debito-compra-sin-recibo-modal/nota-debito-compra-sin-recibo-modal.component';

@NgModule({
  declarations: [
    CuentasCorrientesProveedorComponent,
    CuentaCorrienteProveedorComponent,
    ProveedorDetalleComponent,
    ProveedorComponent,
    NotaCreditoCompraSinFacturaModalComponent,
    NotaCreditoCompraDetalleSinFacturaModalComponent,
    NotaDebitoCompraSinReciboModalComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    NgBoostrapModule,
    CuentasCorrientesProveedorRoutingModule,
    ShareModule
  ],
  entryComponents: [
    NotaCreditoCompraSinFacturaModalComponent,
    NotaCreditoCompraDetalleSinFacturaModalComponent,
    NotaDebitoCompraSinReciboModalComponent,
  ],
})
export class CuentasCorrientesProveedorModule { }
