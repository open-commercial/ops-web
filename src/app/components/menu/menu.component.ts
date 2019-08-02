import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  display = false;
  menubarItems: MenuItem[];
  menuItems: MenuItem[];

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.getMenubarItems();
    this.getSidebarItems();
  }

  getMenubarItems() {
    this.menubarItems = [
      {
        label: 'Globo de Oro',
        icon: 'pi pi-fw pi-bars',
        command: () => { this.display = true; }
      },
    ];
  }

  getSidebarItems() {
    this.menuItems = [
      {
        label: 'Stock',
        items: [
          {label: 'Productos', icon: 'pi pi-fw pi-plus'},
        ]
      },
      {
        label: '',
        items: [
          { label: 'Cerrar sesión', icon: 'pi pi-fw pi-sign-out', command: () => this.logout() },
        ]

      }
    ];
  }

  logout() {
    this.authService.logout();
    this.display = false;
  }
}
