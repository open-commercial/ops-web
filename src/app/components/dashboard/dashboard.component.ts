import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Rol } from 'src/app/models/rol';
import { AuthService } from 'src/app/services/auth.service';
import { NgbAccordionConfig } from '@ng-bootstrap/ng-bootstrap';
import { SucursalesService } from 'src/app/services/sucursales.service';
import { Sucursal } from 'src/app/models/sucursal';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  rol = Rol;
  fechaSeleccionada: Date = new Date();
  selectedYear: number;
  selectedMonth: number;
  allowedRolesToView = [Rol.ADMINISTRADOR];
  sucursalSeleccionada: Sucursal = null;
  subscription: Subscription;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly sucursalesService: SucursalesService,

    accordionConfig: NgbAccordionConfig) {
    accordionConfig.type = 'dark';
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    if (!this.authService.userHasAnyOfTheseRoles(this.allowedRolesToView)) {
      this.router.navigate(['pedidos']);
    }
     this.subscription.add(
      this.sucursalesService.sucursal$.subscribe((sucursal: Sucursal) => {
      this.sucursalSeleccionada = sucursal;
      this.resetData();
      this.cdr.detectChanges()
    })
   )

  }

  updateData(): void {
    this.fechaSeleccionada = new Date();
  }
  
  resetData(): void {
    this.updateData();
    this.selectedYear = this.fechaSeleccionada.getFullYear();
    this.selectedMonth = this.fechaSeleccionada.getMonth() + 1;
  }

  ngOnDestroy(): void {
      this.subscription.unsubscribe();
    }
}
