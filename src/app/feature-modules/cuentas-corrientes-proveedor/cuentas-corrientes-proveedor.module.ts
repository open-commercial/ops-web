import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CuentasCorrientesProveedorRoutingModule } from './cuentas-corrientes-proveedor-routing.module';
import { CuentasCorrientesProveedorComponent } from './components/cuentas-corrientes-proveedor/cuentas-corrientes-proveedor.component';
import { ShareModule } from '../../modules/share.module';
import { CuentaCorrienteProveedorComponent } from './components/cuenta-corriente-proveedor/cuenta-corriente-proveedor.component';
import { ProveedorDetalleComponent } from './components/proveedor-detalle/proveedor-detalle.component';
import { ProveedorComponent } from './components/proveedor/proveedor.component';
import { NotaCreditoCompraSinFacturaModalComponent } from './components/nota-credito-compra-sin-factura-modal/nota-credito-compra-sin-factura-modal.component';
import { NotaCreditoCompraDetalleSinFacturaModalComponent } from './components/nota-credito-compra-detalle-sin-factura-modal/nota-credito-compra-detalle -sin-factura-modal.component';
import { NotaDebitoCompraSinReciboModalComponent } from './components/nota-debito-compra-sin-recibo-modal/nota-debito-compra-sin-recibo-modal.component';
import { NotaDebitoCompraDetalleSinReciboModalComponent } from './components/nota-debito-compra-detalle-sin-recibo-modal/nota-debito-compra-detalle-sin-recibo-modal.component';
import { NotaCreditoCompraFacturaModalComponent } from './components/nota-credito-compra-factura-modal/nota-credito-compra-factura-modal.component';
import { NotaCreditoCompraDetalleFacturaModalComponent } from './components/nota-credito-compra-detalle-factura-modal/nota-credito-compra-detalle-factura-modal.component';
import { NotaDebitoCompraReciboModalComponent } from './components/nota-debito-compra-recibo-modal/nota-debito-compra-recibo-modal.component';
import { NotaDebitoCompraDetalleReciboModalComponent } from './components/nota-debito-compra-detalle-recibo-modal/nota-debito-compra-detalle-recibo-modal.component';

@NgModule({
    declarations: [
        CuentasCorrientesProveedorComponent,
        CuentaCorrienteProveedorComponent,
        ProveedorDetalleComponent,
        ProveedorComponent,
        NotaCreditoCompraSinFacturaModalComponent,
        NotaCreditoCompraDetalleSinFacturaModalComponent,
        NotaDebitoCompraSinReciboModalComponent,
        NotaDebitoCompraDetalleSinReciboModalComponent,
        NotaCreditoCompraFacturaModalComponent,
        NotaCreditoCompraDetalleFacturaModalComponent,
        NotaDebitoCompraReciboModalComponent,
        NotaDebitoCompraDetalleReciboModalComponent,
    ],
    imports: [
        CommonModule,
        ShareModule,
        CuentasCorrientesProveedorRoutingModule,
    ]
})
export class CuentasCorrientesProveedorModule { }
