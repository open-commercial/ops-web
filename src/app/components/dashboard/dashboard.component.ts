import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Rol } from 'src/app/models/rol';
import { AuthService } from 'src/app/services/auth.service';
import { ChartService } from 'src/app/services/chart.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  loadingData = true;
  rol = Rol;
  allowedRolesToView = [Rol.ADMINISTRADOR, Rol.ENCARGADO];

  constructor(private authService: AuthService,
              private router: Router,
              private cdr: ChangeDetectorRef,
              private chartService: ChartService) { }

  ngOnInit(): void {
    if (!this.authService.userHasAnyOfTheseRoles(this.allowedRolesToView)) {
      this.router.navigate(['/pedidos']);
    }
    else {
      this.loadingData = true;
      this.cdr.detectChanges();

      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const componentPromises = [
        lastValueFrom(this.chartService.getChartDataAnnual()),
        lastValueFrom(this.chartService.getChartDataAnnualSupplier(currentYear)),
        lastValueFrom(this.chartService.getChartDataMonth(currentYear)),
        lastValueFrom(this.chartService.getChartDataMonthSupplier(currentYear, currentMonth))
      ];

      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      Promise.all(componentPromises).then(() => {
        return delay(1000);
      }).then(() => {
        this.loadingData = false;
        this.cdr.detectChanges();
      }).catch(error => {
        console.error('Error loading data:', error);
        this.loadingData = false;
        this.cdr.detectChanges();
      });
    }
  }

}
